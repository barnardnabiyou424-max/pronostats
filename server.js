// server.js — version avec scheduler + SSE temps réel
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const { demarrerScheduler, getPredictionsCache } = require('./services/scheduler');
const { diffuserPredictions, diffuserValueBet, getNbClients } = require('./services/sseService');

const app = express();

// ── Middleware ──────────────────────────────
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// ── Routes API ───────────────────────────────
app.use('/api/matchs',  require('./routes/matchs'));
app.use('/api/equipes', require('./routes/equipes'));
app.use('/api/stream',  require('./routes/stream'));

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

// ── Build React (avant le 404) ───────────────
const clientBuild = path.join(__dirname, 'client', 'dist');
app.use(express.static(clientBuild));
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuild, 'index.html'));
});

// ── 404 (jamais atteint si React est servi) ──
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route non trouvée' });
});

// ── Démarrage ───────────────────────────────
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`\n🚀 Serveur sur http://localhost:${PORT}`);
  console.log(`📊 Mode : ${process.env.API_FOOTBALL_KEY ? 'API-Football' : 'Données mock'}\n`);
  demarrerScheduler();
});

// ── Scheduler → SSE ──────────────────────────
let dernierUpdate = null;
setInterval(() => {
  const cache = getPredictionsCache();
  if (cache.lastUpdate && cache.lastUpdate !== dernierUpdate) {
    dernierUpdate = cache.lastUpdate;
    diffuserPredictions(cache);
    cache.predictions.forEach(p => {
      if (p.prediction?.value_bet !== 'aucun') {
        diffuserValueBet(p, p.prediction);
      }
    });
  }
}, 2000);