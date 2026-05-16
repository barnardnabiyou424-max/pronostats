// services/scheduler.js
// Rafraîchit les prédictions automatiquement selon un calendrier précis
const { sauvegarderPrediction, mettreAJourResultats } = require('./dbService');
const cron = require('node-cron');
const { getMatchsAVenir, getFormeRecente } = require('./dataService');
const { predireMatch }    = require('./predictionService');

// Cache en mémoire — partagé avec le reste de l'app
// Structure : { matchId: { prediction, updatedAt } }
const cache = {
  predictions: {},
  lastFullUpdate: null,
  isRunning: false,
};

// ─────────────────────────────────────────────
// FONCTION DE MISE À JOUR
// ─────────────────────────────────────────────
async function rafraichirPredictions() {
  if (cache.isRunning) {
    console.log('⏳ Mise à jour déjà en cours, ignorée');
    return;
  }

  cache.isRunning = true;
  const debut = Date.now();
  console.log(`\n🔄 [${new Date().toLocaleTimeString()}] Mise à jour des prédictions...`);

  try {
    const matchs = await getMatchsAVenir();
    let mises_a_jour = 0;
const matchsATraiter = matchs.slice(0, 5);
for (const match of matchsATraiter) {
  // Mettre à jour les vrais scores des matchs terminés
mettreAJourResultats().catch(err => console.error('❌ Erreur MAJ résultats :', err.message));
      try {
        // Récupérer la forme récente des deux équipes en parallèle
      // Récupérer la forme récente avec délai pour éviter le rate limit
const formeRecenteDom = await getFormeRecente(match.domicile_id, match.domicile?.nom);
await new Promise(r => setTimeout(r, 1000));
const formeRecenteExt = await getFormeRecente(match.exterieur_id, match.exterieur?.nom);
await new Promise(r => setTimeout(r, 1000));

        // Fusionner forme saison + forme récente (50/50)
       if (formeRecenteDom) {
  const poidsRecent = formeRecenteDom.nb_matchs >= 3 ? 0.5 : 0.2;
  const poidsSaison = 1 - poidsRecent;
  match.forme_dom = {
    ...match.forme_dom,
    moy_buts_dom:     (match.forme_dom.moy_buts_dom     * poidsSaison) + (formeRecenteDom.moy_buts_marques   * poidsRecent),
    moy_buts_enc_dom: (match.forme_dom.moy_buts_enc_dom * poidsSaison) + (formeRecenteDom.moy_buts_encaisses * poidsRecent),
    moy_buts_ext:     (match.forme_dom.moy_buts_ext     * poidsSaison) + (formeRecenteDom.moy_buts_marques   * poidsRecent),
    moy_buts_enc_ext: (match.forme_dom.moy_buts_enc_ext * poidsSaison) + (formeRecenteDom.moy_buts_encaisses * poidsRecent),
  };
}

      if (formeRecenteExt) {
  const poidsRecent = formeRecenteExt.nb_matchs >= 3 ? 0.5 : 0.2;
  const poidsSaison = 1 - poidsRecent;
  match.forme_ext = {
    ...match.forme_ext,
    moy_buts_dom:     (match.forme_ext.moy_buts_dom     * poidsSaison) + (formeRecenteExt.moy_buts_marques   * poidsRecent),
    moy_buts_enc_dom: (match.forme_ext.moy_buts_enc_dom * poidsSaison) + (formeRecenteExt.moy_buts_encaisses * poidsRecent),
    moy_buts_ext:     (match.forme_ext.moy_buts_ext     * poidsSaison) + (formeRecenteExt.moy_buts_marques   * poidsRecent),
    moy_buts_enc_ext: (match.forme_ext.moy_buts_enc_ext * poidsSaison) + (formeRecenteExt.moy_buts_encaisses * poidsRecent),
  };
}
        const prediction = predireMatch(match);
        const avant = cache.predictions[match.id];

        const aChange = !avant ||
          avant.prediction.probas.p1 !== prediction.probas.p1 ||
          avant.prediction.value_bet !== prediction.value_bet;

cache.predictions[match.id] = {
  match_id:   match.id,
  domicile:   match.domicile?.nom,
  exterieur:  match.exterieur?.nom,
  date_match: match.date_match,
  journee:    match.journee,
  ligue_id:   match.ligue_id,        // ← ajouter
  prediction,
  updatedAt:  new Date().toISOString(),
  changed:    aChange,
};
// Sauvegarder en base
sauvegarderPrediction({
  match_id:   match.id,
  ligue_id:   match.ligue_id,
  domicile:   match.domicile?.nom,
  exterieur:  match.exterieur?.nom,
  date_match: match.date_match,
  journee:    match.journee,
  prediction,
}).catch(err => console.error('❌ Erreur save prediction :', err.message));
        if (aChange) mises_a_jour++;
      } catch (err) {
        console.error(`  ❌ Erreur match ${match.id} :`, err.message);
      }
    }

    cache.lastFullUpdate = new Date().toISOString();
    const duree = Date.now() - debut;
    console.log(`  ✅ ${matchs.length} matchs traités, ${mises_a_jour} changements (${duree}ms)`);

  } catch (err) {
    console.error('  ❌ Erreur scheduler :', err.message);
  } finally {
    cache.isRunning = false;
  }
}

// ─────────────────────────────────────────────
// CALENDRIER DE MISE À JOUR
// ─────────────────────────────────────────────
function demarrerScheduler() {
  console.log('⏰ Scheduler de prédictions démarré');

  // 1. Mise à jour immédiate au démarrage
  rafraichirPredictions();

  // 2. Toutes les heures (données stables)
  cron.schedule('0 * * * *', () => {
    console.log('⏰ [cron] Mise à jour horaire');
    rafraichirPredictions();
  });

  // 3. Toutes les 15 min entre 10h et 23h (jours de matchs)
  cron.schedule('*/15 10-23 * * *', () => {
    rafraichirPredictions();
  });

  // 4. Toutes les 5 min le samedi et dimanche 14h-22h (pics de matchs)
  cron.schedule('*/5 14-22 * * 6,0', () => {
    rafraichirPredictions();
  });
}

// ─────────────────────────────────────────────
// GETTERS pour les routes
// ─────────────────────────────────────────────

function getPredictionsCache() {
  return {
    predictions:    Object.values(cache.predictions),
    lastUpdate:     cache.lastFullUpdate,
    totalMatchs:    Object.keys(cache.predictions).length,
    valueBets:      Object.values(cache.predictions)
                      .filter(p => p.prediction?.value_bet !== 'aucun').length,
  };
}

function getPredictionCacheById(matchId) {
  return cache.predictions[matchId] || null;
}

// Force une mise à jour manuelle (appelée depuis une route)
async function forcerMiseAJour() {
  await rafraichirPredictions();
  return getPredictionsCache();
}

module.exports = {
  demarrerScheduler,
  getPredictionsCache,
  getPredictionCacheById,
  forcerMiseAJour,
};
