// routes/equipes.js
const express = require('express');
const router  = express.Router();
const { getEquipes, getFormeEquipe } = require('../services/dataService');

// GET /api/equipes
router.get('/', async (req, res) => {
  try {
    const equipes = await getEquipes();
    res.json({ success: true, data: equipes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/equipes/:id/forme
router.get('/:id/forme', async (req, res) => {
  try {
    const forme = await getFormeEquipe(parseInt(req.params.id));
    if (!forme) {
      return res.status(404).json({ success: false, message: 'Équipe non trouvée' });
    }
    res.json({ success: true, data: forme });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
