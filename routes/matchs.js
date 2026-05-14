// routes/matchs.js
const express = require('express');
const router  = express.Router();
const { getMatchsAVenir, getEquipes } = require('../services/dataService');
const { predireMatch }                = require('../services/predictionService');

// GET /api/matchs
// Retourne tous les prochains matchs avec leurs prédictions
router.get('/', async (req, res) => {
  try {
    const matchs = await getMatchsAVenir();
    const resultats = matchs.map(match => {
      const prediction = predireMatch(match);
      return {
        id:        match.id,
        journee:   match.journee,
        date:      match.date_match,
        statut:    match.statut,
        domicile:  match.domicile,
        exterieur: match.exterieur,
        cotes:     match.cotes,
        absences:  match.absences,
        prediction,
      };
    });
    res.json({ success: true, count: resultats.length, data: resultats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/matchs/:id
// Retourne un match précis avec prédiction détaillée
router.get('/:id', async (req, res) => {
  try {
    const matchs  = await getMatchsAVenir();
    const match   = matchs.find(m => m.id === parseInt(req.params.id));
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match non trouvé' });
    }
    const prediction = predireMatch(match);
    res.json({ success: true, data: { ...match, prediction } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/matchs/:id/prediction
// Juste la prédiction brute (utile pour le frontend)
router.get('/:id/prediction', async (req, res) => {
  try {
    const matchs  = await getMatchsAVenir();
    const match   = matchs.find(m => m.id === parseInt(req.params.id));
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match non trouvé' });
    }
    const prediction = predireMatch(match);
    res.json({ success: true, data: prediction });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
