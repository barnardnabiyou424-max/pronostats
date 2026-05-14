// routes/stream.js
const express = require('express');
const router  = express.Router();
const { abonnerClient }       = require('../services/sseService');
const { getPredictionsCache, forcerMiseAJour } = require('../services/scheduler');

// GET /api/stream
// Le frontend s'abonne ici pour recevoir les mises à jour en temps réel
router.get('/', (req, res) => {
  abonnerClient(req, res);
});

// GET /api/stream/snapshot
// Retourne l'état actuel du cache (utile au premier chargement)
router.get('/snapshot', (req, res) => {
  const data = getPredictionsCache();
  res.json({ success: true, data });
});

// POST /api/stream/refresh
// Force une mise à jour immédiate (bouton "Actualiser" dans le dashboard)
router.post('/refresh', async (req, res) => {
  try {
    const data = await forcerMiseAJour();
    res.json({ success: true, message: 'Mise à jour effectuée', data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
