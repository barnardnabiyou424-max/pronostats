// services/scheduler.js
const { sauvegarderPrediction, mettreAJourResultats } = require('./dbService');
const cron = require('node-cron');
const { getMatchsAVenir } = require('./dataService');
const { predireMatch }    = require('./predictionService');

const cache = {
  predictions: {},
  lastFullUpdate: null,
  isRunning: false,
};

async function rafraichirPredictions() {
  if (cache.isRunning) {
    console.log('⏳ Mise à jour déjà en cours, ignorée');
    return;
  }

  cache.isRunning = true;
  const debut = Date.now();
  console.log(`\n🔄 [${new Date().toLocaleTimeString()}] Mise à jour des prédictions...`);

  try {
    // getMatchsAVenir appelle déjà getFormeReelle pour chaque équipe
    const matchs = await getMatchsAVenir();
    let mises_a_jour = 0;

    const matchsATraiter = matchs.slice(0, 20);

    for (const match of matchsATraiter) {
      try {
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
          ligue_id:   match.ligue_id,
          prediction,
          updatedAt:  new Date().toISOString(),
          changed:    aChange,
        };

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

    // Mettre à jour les vrais scores des matchs terminés
    mettreAJourResultats().catch(err => console.error('❌ Erreur MAJ résultats :', err.message));

    cache.lastFullUpdate = new Date().toISOString();
    const duree = Date.now() - debut;
    console.log(`  ✅ ${matchs.length} matchs traités, ${mises_a_jour} changements (${duree}ms)`);

  } catch (err) {
    console.error('  ❌ Erreur scheduler :', err.message);
  } finally {
    cache.isRunning = false;
  }
}

function demarrerScheduler() {
  console.log('⏰ Scheduler de prédictions démarré');

  rafraichirPredictions();

  cron.schedule('0 * * * *', () => {
    console.log('⏰ [cron] Mise à jour horaire');
    rafraichirPredictions();
  });

  cron.schedule('*/15 10-23 * * *', () => {
    rafraichirPredictions();
  });

  cron.schedule('*/5 14-22 * * 6,0', () => {
    rafraichirPredictions();
  });
}

function getPredictionsCache() {
  return {
    predictions:  Object.values(cache.predictions),
    lastUpdate:   cache.lastFullUpdate,
    totalMatchs:  Object.keys(cache.predictions).length,
    valueBets:    Object.values(cache.predictions)
                    .filter(p => p.prediction?.value_bet !== 'aucun').length,
  };
}

function getPredictionCacheById(matchId) {
  return cache.predictions[matchId] || null;
}

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