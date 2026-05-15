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

module.exports = { initDB, sauvegarderPrediction, getHistorique, getTauxReussite };