// services/sseService.js
// Server-Sent Events — envoie les mises à jour au frontend en temps réel
// Plus léger que WebSocket, parfait pour du flux unidirectionnel (serveur → client)

const clients = new Set();

/**
 * Abonne un client SSE
 * Appelé depuis la route GET /api/stream
 */
function abonnerClient(req, res) {
  // Headers SSE obligatoires
  res.setHeader('Content-Type',  'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection',    'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // important pour nginx/Railway
  res.flushHeaders();

  // Envoyer un ping immédiat pour confirmer la connexion
  res.write('event: connected\ndata: {"status":"ok"}\n\n');

  // Ajouter le client à la liste
  clients.add(res);
  console.log(`📡 Client SSE connecté (total: ${clients.size})`);

  // Supprimer le client quand il se déconnecte
  req.on('close', () => {
    clients.delete(res);
    console.log(`📡 Client SSE déconnecté (total: ${clients.size})`);
  });
}

/**
 * Diffuse une mise à jour à tous les clients connectés
 * @param {string} event - nom de l'événement ('predictions_update', 'value_bet_alerte', etc.)
 * @param {Object} data  - données à envoyer
 */
function diffuser(event, data) {
  if (clients.size === 0) return;

  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  const morts   = [];

  for (const client of clients) {
    try {
      client.write(payload);
    } catch {
      morts.push(client);
    }
  }

  // Nettoyer les connexions mortes
  morts.forEach(c => clients.delete(c));

  if (clients.size > 0) {
    console.log(`📡 Diffusé "${event}" → ${clients.size} client(s)`);
  }
}

/**
 * Diffuse une mise à jour complète des prédictions
 */
function diffuserPredictions(predictionsCache) {
  diffuser('predictions_update', {
    timestamp:   new Date().toISOString(),
    lastUpdate:  predictionsCache.lastUpdate,
    totalMatchs: predictionsCache.totalMatchs,
    valueBets:   predictionsCache.valueBets,
    predictions: predictionsCache.predictions,
  });
}

/**
 * Diffuse une alerte value bet (mise en avant côté frontend)
 */
function diffuserValueBet(matchInfo, prediction) {
  diffuser('value_bet_alerte', {
    timestamp:  new Date().toISOString(),
    match:      `${matchInfo.domicile} vs ${matchInfo.exterieur}`,
    value_bet:  prediction.value_bet,
    edge:       prediction.value_edge,
    confiance:  prediction.confiance,
  });
}

function getNbClients() {
  return clients.size;
}

module.exports = {
  abonnerClient,
  diffuser,
  diffuserPredictions,
  diffuserValueBet,
  getNbClients,
};
