// services/predictionService.js
// Modèle de Poisson + ajustements + détection value bet

const LEAGUE_AVG_GOALS = 1.35; // fallback uniquement

// ─────────────────────────────────────────────
// DISTRIBUTION DE POISSON
// P(X=k) = (lambda^k * e^-lambda) / k!
// ─────────────────────────────────────────────
function poisson(lambda, k) {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  let result = Math.exp(-lambda);
  for (let i = 1; i <= k; i++) {
    result *= lambda / i;
  }
  return result;
}

/**
 * Calcule la matrice de scores (jusqu'à maxGoals buts par équipe)
 * Retourne une matrice [dom][ext] de probabilités
 */
function matriceScores(lambdaDom, lambdaExt, maxGoals = 8) {
  const matrice = [];
  for (let d = 0; d <= maxGoals; d++) {
    matrice[d] = [];
    for (let e = 0; e <= maxGoals; e++) {
      matrice[d][e] = poisson(lambdaDom, d) * poisson(lambdaExt, e);
    }
  }
  return matrice;
}

/**
 * Calcule les probabilités 1/N/2 depuis la matrice
 */
function probas1N2(matrice) {
  let p1 = 0, pN = 0, p2 = 0;
  for (let d = 0; d < matrice.length; d++) {
    for (let e = 0; e < matrice[d].length; e++) {
      if (d > e)       p1 += matrice[d][e];
      else if (d === e) pN += matrice[d][e];
      else              p2 += matrice[d][e];
    }
  }
  // Normalisation (la somme peut légèrement différer de 1)
  const total = p1 + pN + p2;
  return {
    p1: p1 / total,
    pN: pN / total,
    p2: p2 / total,
  };
}

/**
 * Score le plus probable depuis la matrice
 */
function scoreLePlusProbable(matrice) {
  let maxProb = 0, scoreDom = 0, scoreExt = 0;
  for (let d = 0; d < matrice.length; d++) {
    for (let e = 0; e < matrice[d].length; e++) {
      if (matrice[d][e] > maxProb) {
        maxProb = matrice[d][e];
        scoreDom = d;
        scoreExt = e;
      }
    }
  }
  return { scoreDom, scoreExt, probabilite: maxProb };
}

/**
 * Facteur d'ajustement selon les absences
 * Chaque absence réduit l'attaque ou renforce la défense adverse
 */
function facteurAbsences(absences) {
  let malus = 0;
  for (const a of absences) {
    // importance 1-10 → malus 0.5% à 5% sur les buts attendus
    malus += (a.importance / 10) * 0.05;
  }
  return Math.max(0.75, 1 - malus); // jamais en dessous de 75%
}

/**
 * Facteur de fatigue selon les jours de repos
 * Moins de 4 jours → équipe fatiguée
 */
function facteurRepos(joursRepos) {
  if (!joursRepos) return 1;
  if (joursRepos <= 2) return 0.85;
  if (joursRepos <= 4) return 0.93;
  return 1;
}

/**
 * Facteur ELO : écart de niveau entre les deux équipes
 * Basé sur la probabilité ELO standard
 */
function facteurElo(eloDom, eloExt) {
  const diff = eloDom - eloExt;
  const probElo = 1 / (1 + Math.pow(10, -diff / 400));
  // On ramène ça à un multiplicateur autour de 1 (±15% max)
  return 0.85 + probElo * 0.30;
}

/**
 * Détection value bet
 * Un value bet existe quand notre proba > proba implicite du bookmaker
 * Edge minimum de 3% pour considérer la valeur
 */
function detecterValueBet(probas, cotes) {
  if (!cotes || !cotes.cote_1) return { valueBet: 'aucun', edge: 0 };

  const marge      = 1 / cotes.cote_1 + 1 / cotes.cote_n + 1 / cotes.cote_2;
  const probaImpl1 = (1 / cotes.cote_1) / marge;
  const probaImplN = (1 / cotes.cote_n) / marge;
  const probaImpl2 = (1 / cotes.cote_2) / marge;

  const edge1 = probas.p1 - probaImpl1;
  const edgeN = probas.pN - probaImplN;
  const edge2 = probas.p2 - probaImpl2;

  const MIN_EDGE = 0.03; // 3% minimum

  if (edge1 > MIN_EDGE && edge1 >= edgeN && edge1 >= edge2)
    return { valueBet: '1', edge: edge1 };
  if (edgeN > MIN_EDGE && edgeN >= edge1 && edgeN >= edge2)
    return { valueBet: 'N', edge: edgeN };
  if (edge2 > MIN_EDGE && edge2 >= edge1 && edge2 >= edgeN)
    return { valueBet: '2', edge: edge2 };

  return { valueBet: 'aucun', edge: 0 };
}

/**
 * Score de confiance global (0-100)
 * Basé sur la clarté des probas et la qualité des données
 */
function scoreConfiance(probas, aDesAbsences, aDesCotes) {
  let confiance = 50;

  // Plus la probabilité dominante est forte, plus on est confiant
  const maxProba = Math.max(probas.p1, probas.pN, probas.p2);
  confiance += (maxProba - 0.33) * 100; // +0 si équilibré, +30 si dominant

  // Bonus si on a des cotes (données de marché = info supplémentaire)
  if (aDesCotes) confiance += 10;

  // Malus si des joueurs importants sont absents (incertitude)
  if (aDesAbsences) confiance -= 8;

  return Math.round(Math.min(95, Math.max(30, confiance)));
}

// ─────────────────────────────────────────────
// FONCTION PRINCIPALE
// ─────────────────────────────────────────────

/**
 * Génère une prédiction complète pour un match
 * @param {Object} match - Données du match avec forme_dom, forme_ext, absences, cotes
 */
function predireMatch(match) {
  const { forme_dom, forme_ext, absences, cotes } = match;

  if (!forme_dom || !forme_ext) {
    return { erreur: 'Données de forme manquantes' };
  }

  // 1. Lambdas de base (modèle de Poisson Dixon-Coles simplifié)
  //    lambda = att_equipe × def_adverse / moyenne_ligue
const attDom = forme_dom.moy_buts_dom;      // buts marqués DOM à domicile
const defDom = forme_dom.moy_buts_enc_dom;  // buts encaissés DOM à domicile
const attExt = forme_ext.moy_buts_ext;      // buts marqués EXT à l'extérieur
const defExt = forme_ext.moy_buts_enc_ext;  // buts encaissés EXT à l'extérieur

// Moyenne offensive/défensive de la ligue (contexte domicile/extérieur)
const avgAttDom = forme_dom.league_avg || LEAGUE_AVG_GOALS;
const avgAttExt = forme_ext.league_avg || LEAGUE_AVG_GOALS;

// Dixon-Coles : att_dom × def_ext / avg_ligue
let lambdaDom = (attDom * defExt) / avgAttDom;
let lambdaExt = (attExt * defDom) / avgAttExt;

  // 2. Avantage domicile (+8%)
  lambdaDom *= 1.08;
  lambdaExt *= 0.94;

  // 3. Ajustement ELO
  const eloFactDom = facteurElo(forme_dom.elo, forme_ext.elo);
  const eloFactExt = facteurElo(forme_ext.elo, forme_dom.elo);
  lambdaDom *= eloFactDom;
  lambdaExt *= eloFactExt;

  // 4. Ajustement repos/fatigue
  lambdaDom *= facteurRepos(forme_dom.jours_repos);
  lambdaExt *= facteurRepos(forme_ext.jours_repos);

  // 5. Ajustement absences
  const absencesDom = absences?.domicile || [];
  const absencesExt = absences?.exterieur || [];
  lambdaDom *= facteurAbsences(absencesDom);
  lambdaExt *= facteurAbsences(absencesExt);

  // 6. Ajustement xG (pondération 30%)
  if (forme_dom.xg_moy && forme_ext.xg_moy) {
    const xgLambdaDom = forme_dom.xg_moy * 0.9; // légère régression vers la moyenne
    const xgLambdaExt = forme_ext.xg_moy * 0.9;
    lambdaDom = lambdaDom * 0.70 + xgLambdaDom * 0.30;
    lambdaExt = lambdaExt * 0.70 + xgLambdaExt * 0.30;
  }

  // 7. Sécurité : lambdas raisonnables
  lambdaDom = Math.max(0.1, Math.min(5, lambdaDom));
  lambdaExt = Math.max(0.1, Math.min(5, lambdaExt));

  // 8. Calcul de la matrice et des probas
  const matrice  = matriceScores(lambdaDom, lambdaExt);
  const probas   = probas1N2(matrice);
  const scoreMP  = scoreLePlusProbable(matrice);

  // 9. Value bet
  const { valueBet, edge } = detecterValueBet(probas, cotes);

  // 10. Confiance
  const confiance = scoreConfiance(
    probas,
    absencesDom.length > 0 || absencesExt.length > 0,
    !!cotes
  );

  // 11. Top 5 scores les plus probables
  const topScores = [];
  for (let d = 0; d <= 8; d++) {
    for (let e = 0; e <=8; e++) {
      topScores.push({ dom: d, ext: e, prob: matrice[d][e] });
    }
  }
  topScores.sort((a, b) => b.prob - a.prob);

  return {
    modele: 'poisson_v1',
    lambdas: {
      dom: parseFloat(lambdaDom.toFixed(3)),
      ext: parseFloat(lambdaExt.toFixed(3)),
    },
    score_predit: {
      dom: scoreMP.scoreDom,
      ext: scoreMP.scoreExt,
      probabilite: parseFloat((scoreMP.probabilite * 100).toFixed(1)),
    },
    probas: {
      p1: parseFloat((probas.p1 * 100).toFixed(1)),
      pN: parseFloat((probas.pN * 100).toFixed(1)),
      p2: parseFloat((probas.p2 * 100).toFixed(1)),
    },
    top_scores: topScores.slice(0, 5).map(s => ({
      score: `${s.dom}-${s.ext}`,
      probabilite: parseFloat((s.prob * 100).toFixed(1)),
    })),
    value_bet: valueBet,
    value_edge: parseFloat((edge * 100).toFixed(2)),
    confiance,
    ajustements: {
      elo_dom:    parseFloat(eloFactDom.toFixed(3)),
      elo_ext:    parseFloat(eloFactExt.toFixed(3)),
      repos_dom:  facteurRepos(forme_dom.jours_repos),
      repos_ext:  facteurRepos(forme_ext.jours_repos),
      absences_dom: parseFloat(facteurAbsences(absencesDom).toFixed(3)),
      absences_ext: parseFloat(facteurAbsences(absencesExt).toFixed(3)),
    },
  };
}

module.exports = { predireMatch, poisson, matriceScores };
