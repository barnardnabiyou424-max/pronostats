// server.js — version avec scheduler + SSE temps réel
require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const { demarrerScheduler, getPredictionsCache } = require('./services/scheduler');
const { diffuserPredictions, diffuserValueBet, getNbClients } = require('./services/sseService');

const app = express();

// ── Middleware ──────────────────────────────
app.use(cors());
app.use(express.json());

// Log simple des requêtes
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// ── Routes ──────────────────────────────────
app.use('/api/matchs',  require('./routes/matchs'));
app.use('/api/equipes', require('./routes/equipes'));
app.use('/api/stream',  require('./routes/stream'));

// Route de santé enrichie
app.get('/api/health', (req, res) => {
  const cache = getPredictionsCache();
  res.json({
    status:      'ok',
    timestamp:   new Date().toISOString(),
    mode:        process.env.API_FOOTBALL_KEY ? 'api-football' : 'mock',
    lastUpdate:  cache.lastUpdate,
    totalMatchs: cache.totalMatchs,
    valueBets:   cache.valueBets,
    sseClients:  getNbClients(),
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route non trouvée' });
});

// ── Démarrage ───────────────────────────────
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`\n🚀 Serveur sur http://localhost:${PORT}`);
  console.log(`📊 Mode : ${process.env.API_FOOTBALL_KEY ? 'API-Football' : 'Données mock'}\n`);

  // Démarrer le scheduler (1ère exécution immédiate)
  demarrerScheduler();
});

// ── Brancher scheduler → SSE ─────────────────
// Surveille le cache toutes les 2s et diffuse si changement
let dernierUpdate = null;
setInterval(() => {
  const cache = getPredictionsCache();
  if (cache.lastUpdate && cache.lastUpdate !== dernierUpdate) {
    dernierUpdate = cache.lastUpdate;
    diffuserPredictions(cache);
    // Alerter sur les value bets
    cache.predictions.forEach(p => {
      if (p.prediction?.value_bet !== 'aucun') {
        diffuserValueBet(p, p.prediction);
      }
    });
  }
}, 2000);

// ── Sert le build React en production ───────
const path = require('path');
const clientBuild = path.join(__dirname, 'client', 'dist');
app.use(require('express').static(clientBuild));
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuild, 'index.html'));
});
