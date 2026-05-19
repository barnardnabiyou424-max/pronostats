// services/dataService.js
// Collecte de données via api-football-v1.p.rapidapi.com (plan gratuit)
// Fallback sur teamStats.js si l'API ne répond pas

const { getFormeEquipe: getFormeParNom, getLeagueAvg } = require('./teamStats');
const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.API_FOOTBALL_KEY;
console.log('🔑 Clé API:', API_KEY ? 'TROUVÉE' : 'ABSENTE');

// ─────────────────────────────────────────────
// CONFIG LIGUES — IDs api-football-v1 (v3)
// ─────────────────────────────────────────────
const LIGUES_CONFIG = [
  { apiId: 61,  ligueId: '4334', nom: 'Ligue 1',        saison: 2024 },
  { apiId: 39,  ligueId: '4328', nom: 'Premier League',  saison: 2024 },
  { apiId: 140, ligueId: '4335', nom: 'La Liga',         saison: 2024 },
  { apiId: 78,  ligueId: '4331', nom: 'Bundesliga',      saison: 2024 },
  { apiId: 135, ligueId: '4332', nom: 'Serie A',         saison: 2024 },
];

// ─────────────────────────────────────────────
// DONNÉES MOCK (fallback)
// ─────────────────────────────────────────────
const MOCK_EQUIPES = [
  { id: 1, nom: 'Paris Saint-Germain', pays: 'France' },
  { id: 2, nom: 'Lyon',                pays: 'France' },
  { id: 3, nom: 'Marseille',           pays: 'France' },
  { id: 4, nom: 'Monaco',              pays: 'France' },
  { id: 5, nom: 'Lille',               pays: 'France' },
  { id: 6, nom: 'Nice',                pays: 'France' },
  { id: 7, nom: 'Rennes',              pays: 'France' },
  { id: 8, nom: 'Lens',                pays: 'France' },
];

const MOCK_MATCHS = [
  { id: 1, journee: 32, domicile_id: 1, exterieur_id: 3, date_match: new Date(Date.now() + 2 * 86400000).toISOString(), cotes: { bookmaker: 'pinnacle', cote_1: 1.38, cote_n: 4.80, cote_2: 8.50 }, absences: { domicile: [{ joueur: 'Hakimi', raison: 'blessure', importance: 8 }], exterieur: [{ joueur: 'Aubameyang', raison: 'suspension', importance: 9 }] } },
  { id: 2, journee: 32, domicile_id: 4, exterieur_id: 2, date_match: new Date(Date.now() + 3 * 86400000).toISOString(), cotes: { bookmaker: 'pinnacle', cote_1: 2.10, cote_n: 3.40, cote_2: 3.20 }, absences: { domicile: [], exterieur: [] } },
  { id: 3, journee: 32, domicile_id: 5, exterieur_id: 6, date_match: new Date(Date.now() + 4 * 86400000).toISOString(), cotes: { bookmaker: 'pinnacle', cote_1: 2.35, cote_n: 3.20, cote_2: 3.10 }, absences: { domicile: [], exterieur: [] } },
  { id: 4, journee: 32, domicile_id: 7, exterieur_id: 8, date_match: new Date(Date.now() + 5 * 86400000).toISOString(), cotes: { bookmaker: 'pinnacle', cote_1: 2.50, cote_n: 3.10, cote_2: 2.95 }, absences: { domicile: [], exterieur: [] } },
];

const MOCK_FORME = {
  1: { moy_buts_dom: 2.8, moy_buts_enc_dom: 0.6, moy_buts_ext: 2.2, moy_buts_enc_ext: 0.9, elo: 1820, jours_repos: 6 },
  2: { moy_buts_dom: 1.9, moy_buts_enc_dom: 1.1, moy_buts_ext: 1.3, moy_buts_enc_ext: 1.4, elo: 1610, jours_repos: 7 },
  3: { moy_buts_dom: 2.1, moy_buts_enc_dom: 1.0, moy_buts_ext: 1.4, moy_buts_enc_ext: 1.5, elo: 1650, jours_repos: 5 },
  4: { moy_buts_dom: 2.3, moy_buts_enc_dom: 1.2, moy_buts_ext: 1.6, moy_buts_enc_ext: 1.3, elo: 1680, jours_repos: 8 },
  5: { moy_buts_dom: 1.8, moy_buts_enc_dom: 0.9, moy_buts_ext: 1.2, moy_buts_enc_ext: 1.2, elo: 1620, jours_repos: 6 },
  6: { moy_buts_dom: 1.6, moy_buts_enc_dom: 0.9, moy_buts_ext: 1.1, moy_buts_enc_ext: 1.3, elo: 1590, jours_repos: 7 },
  7: { moy_buts_dom: 1.7, moy_buts_enc_dom: 1.0, moy_buts_ext: 1.1, moy_buts_enc_ext: 1.4, elo: 1570, jours_repos: 5 },
  8: { moy_buts_dom: 1.9, moy_buts_enc_dom: 1.1, moy_buts_ext: 1.3, moy_buts_enc_ext: 1.5, elo: 1600, jours_repos: 6 },
};

const LEAGUE_AVG_GOALS = 1.35;

// ─────────────────────────────────────────────
// APPELS API-FOOTBALL V3 (api-football-v1.p.rapidapi.com)
// ─────────────────────────────────────────────

function apiHeaders() {
  return {
    'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
    'x-rapidapi-key':  f040ce868emshb39f60d02ad4e7bp15cf16jsn95674becc27e,
  };
}

async function _fetchFixtures(dateFrom, dateTo) {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const formeCache = new Map();
  const allMatchs  = [];

  for (const ligue of LIGUES_CONFIG) {
    try {
      await sleep(400);
      const res = await axios.get('https://api-football-v1.p.rapidapi.com/v3/fixtures', {
        params: { league: ligue.apiId, season: ligue.saison, from: dateFrom, to: dateTo, status: 'NS' },
        headers: apiHeaders(),
        timeout: 10000,
      });

      const fixtures = res.data?.response || [];
      console.log(`  ${ligue.nom}: ${fixtures.length} matchs`);

      for (const f of fixtures) {
        const domId   = f.teams?.home?.id;
        const extId   = f.teams?.away?.id;
        const domNom  = f.teams?.home?.name || '';
        const extNom  = f.teams?.away?.name || '';
        const leagueAvg = getLeagueAvg(parseInt(ligue.ligueId));

        // Forme depuis teamStats + injection league_avg pour le modèle Poisson
        if (!formeCache.has(domId)) {
          const f = getFormeParNom(domNom);
          formeCache.set(domId, { ...f, league_avg: leagueAvg });
        }
        if (!formeCache.has(extId)) {
          const f = getFormeParNom(extNom);
          formeCache.set(extId, { ...f, league_avg: leagueAvg });
        }

        allMatchs.push({
          id:           f.fixture?.id,
          ligue_id:     ligue.ligueId,
          journee:      f.league?.round || '?',
          domicile_id:  domId,
          exterieur_id: extId,
          date_match:   f.fixture?.date,
          statut:       'planifie',
          domicile:     { id: domId,  nom: domNom, logo_url: f.teams?.home?.logo },
          exterieur:    { id: extId,  nom: extNom, logo_url: f.teams?.away?.logo },
          forme_dom:    formeCache.get(domId),
          forme_ext:    formeCache.get(extId),
          cotes:        null,
          absences:     { domicile: [], exterieur: [] },
        });
      }

    } catch (err) {
      const status = err.response?.status;
      console.error(`  ❌ ${ligue.nom}: ${status || err.message}`);
      // 429 = rate limit atteint → on arrête
      if (status === 429) {
        console.warn('  ⛔ Rate limit atteint, arrêt des requêtes');
        break;
      }
    }
  }

  return allMatchs;
}

async function _fetchMatchsAPI() {
  const dateFrom = new Date().toISOString().slice(0, 10);

  // Essai 1 : 7 prochains jours
  let dateTo = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  console.log(`🔄 Récupération matchs ${dateFrom} → ${dateTo}`);
  let matchs = await _fetchFixtures(dateFrom, dateTo);

  // Essai 2 : 14 jours si vide
  if (matchs.length === 0) {
    console.warn('⚠️  0 matchs sur 7j, tentative sur 14 jours...');
    dateTo = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
    matchs = await _fetchFixtures(dateFrom, dateTo);
  }

  console.log(`📅 Total: ${matchs.length} matchs trouvés`);
  return matchs;
}

// ─────────────────────────────────────────────
// FONCTIONS PUBLIQUES
// ─────────────────────────────────────────────

async function getMatchsAVenir() {
  if (!API_KEY) {
    console.log('ℹ️  Pas de clé API → mode mock');
    return _getMockMatchs();
  }

  try {
    const matchs = await _fetchMatchsAPI();
    if (matchs.length === 0) {
      console.warn('⚠️  API retourne 0 matchs → mode mock');
      return _getMockMatchs();
    }
    return matchs;
  } catch (err) {
    console.error('❌ Erreur API → mode mock:', err.message);
    return _getMockMatchs();
  }
}

function _getMockMatchs() {
  return MOCK_MATCHS.map(m => ({
    ...m,
    domicile:  MOCK_EQUIPES.find(e => e.id === m.domicile_id),
    exterieur: MOCK_EQUIPES.find(e => e.id === m.exterieur_id),
    forme_dom: MOCK_FORME[m.domicile_id],
    forme_ext: MOCK_FORME[m.exterieur_id],
  }));
}

async function getEquipes() {
  return MOCK_EQUIPES;
}

module.exports = {
  getMatchsAVenir,
  getEquipes,
  LEAGUE_AVG_GOALS,
  MOCK_EQUIPES,
  MOCK_FORME,
};
