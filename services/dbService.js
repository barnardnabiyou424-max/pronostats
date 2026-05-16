// services/dbService.js
const db = require('../config/db');

async function initDB() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS predictions_historique (
      id              SERIAL PRIMARY KEY,
      match_id        VARCHAR(50) NOT NULL,
      ligue_id        VARCHAR(10),
      domicile        VARCHAR(100),
      exterieur       VARCHAR(100),
      date_match      TIMESTAMP,
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
      resultat_correct SMALLINT DEFAULT NULL,
      created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ Table predictions_historique prête');
}

async function sauvegarderPrediction(data) {
  const {
    match_id, ligue_id, domicile, exterieur,
    date_match, journee, prediction
  } = data;

  const existing = await db.query(
    'SELECT id FROM predictions_historique WHERE match_id = $1',
    [match_id]
  );
  if (existing.rows.length > 0) return;

  await db.query(`
    INSERT INTO predictions_historique
    (match_id, ligue_id, domicile, exterieur, date_match, journee,
     score_predit_dom, score_predit_ext, proba_p1, proba_pn, proba_p2,
     confiance, value_bet)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
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
  const result = await db.query(`
    SELECT * FROM predictions_historique
    ORDER BY date_match DESC
    LIMIT 100
  `);
  return result.rows;
}

async function getTauxReussite() {
  const result = await db.query(`
    SELECT
      COUNT(*) as total,
      SUM(resultat_correct) as corrects,
      ROUND(SUM(resultat_correct)::numeric / COUNT(*) * 100, 1) as taux
    FROM predictions_historique
    WHERE resultat_correct IS NOT NULL
  `);
  return result.rows[0];
}

async function mettreAJourResultats() {
  const result = await db.query(`
    SELECT id, match_id, score_predit_dom, score_predit_ext
    FROM predictions_historique
    WHERE score_reel_dom IS NULL
      AND date_match < NOW()
    LIMIT 20
  `);

  const rows = result.rows;
  if (rows.length === 0) return;

  const axios = require('axios');

  for (const row of rows) {
    try {
      const res = await axios.get(
        'https://www.thesportsdb.com/api/v1/json/3/lookupevent.php',
        { params: { id: row.match_id } }
      );

      const event = res.data?.events?.[0];
      if (!event) continue;
      if (event.strStatus !== 'Match Finished') continue;

      const scoreRealDom = parseInt(event.intHomeScore);
      const scoreRealExt = parseInt(event.intAwayScore);
      if (isNaN(scoreRealDom) || isNaN(scoreRealExt)) continue;

      const correct = (scoreRealDom === row.score_predit_dom && scoreRealExt === row.score_predit_ext) ? 1 : 0;

      await db.query(`
        UPDATE predictions_historique
        SET score_reel_dom = $1, score_reel_ext = $2, resultat_correct = $3
        WHERE id = $4
      `, [scoreRealDom, scoreRealExt, correct, row.id]);

      console.log(`✅ Score mis à jour : match ${row.match_id} → ${scoreRealDom}-${scoreRealExt} (${correct ? 'correct' : 'raté'})`);
    } catch (err) {
      console.error(`❌ Erreur score match ${row.match_id} :`, err.message);
    }
  }
}

module.exports = { initDB, sauvegarderPrediction, getHistorique, getTauxReussite, mettreAJourResultats };