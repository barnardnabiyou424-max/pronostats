// services/dbService.js
const db = require('../config/db');

async function initDB() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS predictions_historique (
      id              INT AUTO_INCREMENT PRIMARY KEY,
      match_id        VARCHAR(50) NOT NULL,
      ligue_id        VARCHAR(10),
      domicile        VARCHAR(100),
      exterieur       VARCHAR(100),
      date_match      DATETIME,
      journee         VARCHAR(10),
      score_predit_dom INT,
      score_predit_ext INT,
      proba_p1        FLOAT,
      proba_pn        FLOAT,
      proba_p2        FLOAT,
      confiance       INT,
      value_bet       VARCHAR(5),
      score_reel_dom  INT DEFAULT NULL,
      score_reel_ext  INT DEFAULT NULL,
      resultat_correct TINYINT DEFAULT NULL,
      created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ Table predictions_historique prête');
}

async function sauvegarderPrediction(data) {
  const {
    match_id, ligue_id, domicile, exterieur,
    date_match, journee, prediction
  } = data;

  // Vérifier si déjà sauvegardé
  const [rows] = await db.execute(
    'SELECT id FROM predictions_historique WHERE match_id = ?',
    [match_id]
  );
  if (rows.length > 0) return; // déjà en base

  await db.execute(`
    INSERT INTO predictions_historique
    (match_id, ligue_id, domicile, exterieur, date_match, journee,
     score_predit_dom, score_predit_ext, proba_p1, proba_pn, proba_p2,
     confiance, value_bet)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    match_id, ligue_id, domicile, exterieur,
    date_match ? new Date(date_match) : null,
    journee,
    prediction.score_predit.dom,
    prediction.score_predit.ext,
    prediction.probas.p1,
    prediction.probas.pN,
    prediction.probas.p2,
    prediction.confiance,
    prediction.value_bet,
  ]);
}

async function getHistorique() {
  const [rows] = await db.execute(`
    SELECT * FROM predictions_historique
    ORDER BY date_match DESC
    LIMIT 100
  `);
  return rows;
}

async function getTauxReussite() {
  const [rows] = await db.execute(`
    SELECT
      COUNT(*) as total,
      SUM(resultat_correct) as corrects,
      ROUND(SUM(resultat_correct) / COUNT(*) * 100, 1) as taux
    FROM predictions_historique
    WHERE resultat_correct IS NOT NULL
  `);
  return rows[0];
}
async function mettreAJourResultats() {
  // Récupérer les prédictions sans résultat réel dont la date est passée
  const [rows] = await db.execute(`
    SELECT id, match_id, score_predit_dom, score_predit_ext
    FROM predictions_historique
    WHERE score_reel_dom IS NULL
      AND date_match < NOW()
    LIMIT 20
  `);

  if (rows.length === 0) return;

  const axios = require('axios');

  for (const row of rows) {
    try {
      const res = await axios.get(
        `https://www.thesportsdb.com/api/v1/json/3/lookupevent.php`,
        { params: { id: row.match_id } }
      );

      const event = res.data?.events?.[0];
      if (!event) continue;

      // Match pas encore terminé
      if (event.strStatus !== 'Match Finished') continue;

      const scoreRealDom = parseInt(event.intHomeScore);
      const scoreRealExt = parseInt(event.intAwayScore);

      if (isNaN(scoreRealDom) || isNaN(scoreRealExt)) continue;

      // Comparer score exact prédit vs réel
      const correct = (scoreRealDom === row.score_predit_dom && scoreRealExt === row.score_predit_ext) ? 1 : 0;

      await db.execute(`
        UPDATE predictions_historique
        SET score_reel_dom = ?, score_reel_ext = ?, resultat_correct = ?
        WHERE id = ?
      `, [scoreRealDom, scoreRealExt, correct, row.id]);

      console.log(`✅ Score mis à jour : match ${row.match_id} → ${scoreRealDom}-${scoreRealExt} (${correct ? 'correct' : 'raté'})`);
    } catch (err) {
      console.error(`❌ Erreur score match ${row.match_id} :`, err.message);
    }
  }
}
module.exports = { initDB, sauvegarderPrediction, getHistorique, getTauxReussite, mettreAJourResultats };