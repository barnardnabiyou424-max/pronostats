// services/dataService.js
// Collecte de données : mock par défaut, API-Football si clé présente

const { getFormeEquipe: getFormeParNom, getLeagueAvg } = require('./teamStats');
const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.API_FOOTBALL_KEY;
const API_URL = process.env.API_FOOTBALL_URL || 'https://v3.football.api-sports.io';
console.log('🔑 Clé API:', API_KEY ? 'TROUVÉE' : 'ABSENTE');
// ─────────────────────────────────────────────
// DONNÉES MOCK (utilisées si pas de clé API)
// ─────────────────────────────────────────────
const MOCK_EQUIPES = [
  { id: 1, api_id: 85,  nom: 'Paris Saint-Germain', pays: 'France' },
  { id: 2, api_id: 80,  nom: 'Lyon',                pays: 'France' },
  { id: 3, api_id: 81,  nom: 'Marseille',           pays: 'France' },
  { id: 4, api_id: 82,  nom: 'Monaco',              pays: 'France' },
  { id: 5, api_id: 84,  nom: 'Lille',               pays: 'France' },
  { id: 6, api_id: 83,  nom: 'Nice',                pays: 'France' },
  { id: 7, api_id: 91,  nom: 'Rennes',              pays: 'France' },
  { id: 8, api_id: 93,  nom: 'Lens',                pays: 'France' },
];

const MOCK_FORME = {
  1: { // PSG
    moy_buts_dom: 2.8, moy_buts_enc_dom: 0.6,
    moy_buts_ext: 2.2, moy_buts_enc_ext: 0.9,
    forme_5m_pts: 13, xg_moy: 2.45, xga_moy: 0.72,
    elo: 1820, jours_repos: 6,
  },
  2: { // Lyon
    moy_buts_dom: 1.9, moy_buts_enc_dom: 1.1,
    moy_buts_ext: 1.3, moy_buts_enc_ext: 1.4,
    forme_5m_pts: 8, xg_moy: 1.62, xga_moy: 1.18,
    elo: 1610, jours_repos: 7,
  },
  3: { // Marseille
    moy_buts_dom: 2.1, moy_buts_enc_dom: 1.0,
    moy_buts_ext: 1.4, moy_buts_enc_ext: 1.5,
    forme_5m_pts: 9, xg_moy: 1.75, xga_moy: 1.10,
    elo: 1650, jours_repos: 5,
  },
  4: { // Monaco
    moy_buts_dom: 2.3, moy_buts_enc_dom: 1.2,
    moy_buts_ext: 1.6, moy_buts_enc_ext: 1.3,
    forme_5m_pts: 10, xg_moy: 1.90, xga_moy: 1.05,
    elo: 1680, jours_repos: 8,
  },
  5: { // Lille
    moy_buts_dom: 1.8, moy_buts_enc_dom: 0.9,
    moy_buts_ext: 1.2, moy_buts_enc_ext: 1.2,
    forme_5m_pts: 9, xg_moy: 1.55, xga_moy: 0.98,
    elo: 1620, jours_repos: 6,
  },
  6: { // Nice
    moy_buts_dom: 1.6, moy_buts_enc_dom: 0.9,
    moy_buts_ext: 1.1, moy_buts_enc_ext: 1.3,
    forme_5m_pts: 8, xg_moy: 1.42, xga_moy: 1.02,
    elo: 1590, jours_repos: 7,
  },
  7: { // Rennes
    moy_buts_dom: 1.7, moy_buts_enc_dom: 1.0,
    moy_buts_ext: 1.1, moy_buts_enc_ext: 1.4,
    forme_5m_pts: 7, xg_moy: 1.48, xga_moy: 1.12,
    elo: 1570, jours_repos: 5,
  },
  8: { // Lens
    moy_buts_dom: 1.9, moy_buts_enc_dom: 1.1,
    moy_buts_ext: 1.3, moy_buts_enc_ext: 1.5,
    forme_5m_pts: 8, xg_moy: 1.60, xga_moy: 1.20,
    elo: 1600, jours_repos: 6,
  },
};

const MOCK_MATCHS = [
  {
    id: 1, journee: 28,
    domicile_id: 1, exterieur_id: 3,
    date_match: new Date(Date.now() + 2 * 86400000).toISOString(),
    statut: 'planifie',
    cotes: { bookmaker: 'pinnacle', cote_1: 1.38, cote_n: 4.80, cote_2: 8.50 },
    absences: {
      domicile:   [{ joueur: 'Hakimi',    raison: 'blessure',    importance: 8 }],
      exterieur:  [{ joueur: 'Aubameyang', raison: 'suspension', importance: 9 }],
    },
  },
  {
    id: 2, journee: 28,
    domicile_id: 4, exterieur_id: 2,
    date_match: new Date(Date.now() + 3 * 86400000).toISOString(),
    statut: 'planifie',
    cotes: { bookmaker: 'pinnacle', cote_1: 2.10, cote_n: 3.40, cote_2: 3.20 },
    absences: { domicile: [], exterieur: [] },
  },
  {
    id: 3, journee: 28,
    domicile_id: 5, exterieur_id: 6,
    date_match: new Date(Date.now() + 4 * 86400000).toISOString(),
    statut: 'planifie',
    cotes: { bookmaker: 'pinnacle', cote_1: 2.35, cote_n: 3.20, cote_2: 3.10 },
    absences: { domicile: [], exterieur: [] },
  },
  {
    id: 4, journee: 28,
    domicile_id: 7, exterieur_id: 8,
    date_match: new Date(Date.now() + 5 * 86400000).toISOString(),
    statut: 'planifie',
    cotes: { bookmaker: 'pinnacle', cote_1: 2.50, cote_n: 3.10, cote_2: 2.95 },
    absences: { domicile: [], exterieur: [] },
  },
];

// Moyenne de buts Ligue 1 (sert de référence pour Poisson)
const LEAGUE_AVG_GOALS = 1.35;

// ─────────────────────────────────────────────
// FONCTIONS PUBLIQUES
// ─────────────────────────────────────────────

/**
 * Récupère les prochains matchs avec toutes les données utiles
 */
async function getMatchsAVenir() {
  // Si clé API dispo → appel réel (à implémenter)
  if (API_KEY) {
    return await _fetchMatchsAPI();
  }
  // Sinon → mock enrichi
  return MOCK_MATCHS.map(m => ({
    ...m,
    domicile:   MOCK_EQUIPES.find(e => e.id === m.domicile_id),
    exterieur:  MOCK_EQUIPES.find(e => e.id === m.exterieur_id),
    forme_dom:  MOCK_FORME[m.domicile_id],
    forme_ext:  MOCK_FORME[m.exterieur_id],
  }));
}

/**
 * Récupère la forme d'une équipe (5 derniers matchs)
 */
async function _getFormeEquipeDB(equipeId) {
  if (API_KEY) return await _fetchFormeAPI(equipeId);
  return MOCK_FORME[equipeId] || null;
}

/**
 * Récupère les équipes disponibles
 */
async function getEquipes() {
  if (API_KEY) return await _fetchEquipesAPI();
  return MOCK_EQUIPES;
}

// ─────────────────────────────────────────────
// APPELS API-FOOTBALL (activés avec la clé)
// ─────────────────────────────────────────────


async function _fetchMatchsAPI() {
  try {
    // Générer les 7 prochains jours
    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return d.toISOString().split('T')[0];
    });

    // Récupérer tous les matchs de foot sur 7 jours
    const responses = await Promise.all(
      dates.map(d =>
        axios.get('https://www.thesportsdb.com/api/v1/json/3/eventsday.php', {
          params: { d, s: 'Soccer' }
        })
      )
    );

    const GRANDES_LIGUES = ['4334', '4328', '4335', '4332', '4331'];

    const allMatches = responses
      .flatMap(res => res.data?.events || [])
      .filter(e =>
        e.strStatus === 'Not Started' &&
        GRANDES_LIGUES.includes(e.idLeague)
      );

    return allMatches.map(e => ({
      id:           e.idEvent,
      journee:      e.intRound || '?',
      domicile_id:  e.idHomeTeam,
      exterieur_id: e.idAwayTeam,
     date_match: e.strTimestamp ? e.strTimestamp + 'Z' : null,
      statut:       'planifie',
      domicile:     { id: e.idHomeTeam, nom: e.strHomeTeam, logo_url: e.strHomeTeamBadge },
      exterieur:    { id: e.idAwayTeam, nom: e.strAwayTeam, logo_url: e.strAwayTeamBadge },
     forme_dom:    { ...getFormeParNom(e.strHomeTeam), league_avg: getLeagueAvg(parseInt(e.idLeague)) },
forme_ext:    { ...getFormeParNom(e.strAwayTeam), league_avg: getLeagueAvg(parseInt(e.idLeague)) },
      cotes:        null,
      absences:     { domicile: [], exterieur: [] },
    }));
  } catch (err) {
    console.error('Erreur TheSportsDB :', err.message);
    return [];
  }
}

async function _fetchFormeAPI(equipeId) {
  try {
    const res = await apiClient.get('/teams/statistics', {
      params: { league: 61, season: 2024, team: equipeId },
    });
    const s = res.data.response;
    return {
      moy_buts_dom:     s.goals.for.average.home,
      moy_buts_enc_dom: s.goals.against.average.home,
      moy_buts_ext:     s.goals.for.average.away,
      moy_buts_enc_ext: s.goals.against.average.away,
      forme_5m_pts:     null, // calculé côté service
      elo:              1500, // calculé localement
      jours_repos:      null,
    };
  } catch (err) {
    console.error('Erreur API-Football stats :', err.message);
    return null;
  }
}

async function _fetchEquipesAPI() {
  try {
    const res = await apiClient.get('/teams', {
      params: { league: 61, season: 2024 },
    });
    return res.data.response.map(t => ({
      id:       t.team.id,
      api_id:   t.team.id,
      nom:      t.team.name,
      pays:     t.team.country,
      logo_url: t.team.logo,
    }));
  } catch (err) {
    console.error('Erreur API-Football équipes :', err.message);
    return [];
  }
}

async function getFormeRecente(equipeId, nomEquipe) {
  try {
    const res = await axios.get(
      'https://www.thesportsdb.com/api/v1/json/3/eventslast.php',
      { params: { id: equipeId } }
    );

    const matchs = res.data?.results || [];
    if (matchs.length === 0) return null;

    const termines = matchs
      .filter(m => m.strStatus === 'Match Finished')
      .slice(0, 5);

    if (termines.length === 0) return null;

    let butsMarques = 0, butsEncaisses = 0;

    termines.forEach(m => {
      const estDomicile = m.idHomeTeam === equipeId;
      const bm = parseInt(estDomicile ? m.intHomeScore : m.intAwayScore) || 0;
      const be = parseInt(estDomicile ? m.intAwayScore : m.intHomeScore) || 0;
      butsMarques   += bm;
      butsEncaisses += be;
    });

    return {
      moy_buts_marques:   butsMarques   / termines.length,
      moy_buts_encaisses: butsEncaisses / termines.length,
      nb_matchs:          termines.length,
    };
  } catch (err) {
    console.error(`Erreur forme récente ${nomEquipe} :`, err.message);
    return null;
  }
}

module.exports = {
  getMatchsAVenir,
  getFormeEquipe: _getFormeEquipeDB,
  getEquipes,
  getFormeRecente,   // ← ajouter cette ligne
  LEAGUE_AVG_GOALS,
  MOCK_EQUIPES,
  MOCK_FORME,
};
