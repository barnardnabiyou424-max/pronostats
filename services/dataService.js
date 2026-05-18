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
    const LIGUES = [
      { id: 47, nom: 'Premier League', ligueId: '4328' },
      { id: 87, nom: 'La Liga',        ligueId: '4335' },
      { id: 54, nom: 'Bundesliga',     ligueId: '4331' },
      { id: 53, nom: 'Ligue 1',        ligueId: '4334' },
      { id: 55, nom: 'Serie A',        ligueId: '4332' },
    ];

    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const formeCache = new Map();

    async function getFormeAvecCache(equipeId, nomEquipe, leagueAvg) {
      if (formeCache.has(equipeId)) return formeCache.get(equipeId);
      await sleep(600);
      const forme = await getFormeReelle(equipeId, nomEquipe, leagueAvg);
      const resultat = forme || { ...getFormeParNom(nomEquipe), league_avg: leagueAvg };
      formeCache.set(equipeId, resultat);
      return resultat;
    }

    // Récupérer les matchs de chaque ligue
    const parLigue = await Promise.all(
      LIGUES.map(l =>
        axios.get('https://free-api-live-football-data.p.rapidapi.com/football-get-all-matches-by-league', {
          params: { leagueid: l.id },
          headers: {
            'x-rapidapi-host': 'free-api-live-football-data.p.rapidapi.com',
            'x-rapidapi-key': process.env.API_FOOTBALL_KEY,
          }
        }).catch(() => ({ data: { response: { matches: [] } } }))
      )
    );

    const dans14jours = new Date();
    dans14jours.setDate(dans14jours.getDate() + 14);

    const allMatches = [];
    parLigue.forEach((r, i) => {
      const ligue = LIGUES[i];
      const matchs = r.data?.response?.matches || [];
      matchs.forEach(m => {
        if (!m.status?.utcTime) return;
        if (m.status.finished) return;
        if (m.status.cancelled) return;
        const dateMatch = new Date(m.status.utcTime);
        if (dateMatch > dans14jours) return;
       const hierMinuit = new Date();
hierMinuit.setDate(hierMinuit.getDate() - 1);
hierMinuit.setHours(0, 0, 0, 0);
if (dateMatch < hierMinuit) return; // exclure matchs passés

        allMatches.push({
          eventData: m,
          ligue,
        });
      });
    });

    console.log(`📅 ${allMatches.length} matchs trouvés dans les 14 prochains jours`);

    const matchsAvecForme = [];
    for (const { eventData: e, ligue } of allMatches) {
      const leagueAvg = getLeagueAvg(parseInt(ligue.ligueId));

      // IDs équipes — utiliser home.id pour TheSportsDB forme
      const domId = e.home?.id;
      const extId = e.away?.id;
      const domNom = e.home?.name;
      const extNom = e.away?.name;

      const formeDom = await getFormeAvecCache(domId, domNom, leagueAvg);
      const formeExt = await getFormeAvecCache(extId, extNom, leagueAvg);

      matchsAvecForme.push({
        id:           e.id,
        ligue_id:     ligue.ligueId,
        journee:      e.tournament?.stage || '?',
        domicile_id:  domId,
        exterieur_id: extId,
        date_match:   e.status.utcTime,
        statut:       'planifie',
        domicile:     { id: domId, nom: domNom, logo_url: null },
        exterieur:    { id: extId, nom: extNom, logo_url: null },
        forme_dom:    formeDom,
        forme_ext:    formeExt,
        cotes:        null,
        absences:     { domicile: [], exterieur: [] },
      });
    }

    return matchsAvecForme;

  } catch (err) {
    console.error('Erreur API Football :', err.message);
    return [];
  }
}
// Cache global des IDs TheSportsDB par nom d'équipe
const theSportsDBIdCache = new Map();

async function getIdTheSportsDB(nomEquipe) {
  if (theSportsDBIdCache.has(nomEquipe)) return theSportsDBIdCache.get(nomEquipe);
  try {
    const res = await axios.get(
      'https://www.thesportsdb.com/api/v1/json/3/searchteams.php',
      { params: { t: nomEquipe }, timeout: 5000 }
    );
    const team = res.data?.teams?.[0];
    if (!team) return null;
    theSportsDBIdCache.set(nomEquipe, team.idTeam);
    return team.idTeam;
  } catch {
    return null;
  }
}

async function getFormeReelle(equipeId, nomEquipe, leagueAvg) {
  try {
    // Chercher l'ID TheSportsDB par nom
    const tsdbId = await getIdTheSportsDB(nomEquipe);
    if (!tsdbId) return null;

    const res = await axios.get(
      'https://www.thesportsdb.com/api/v1/json/3/eventslast.php',
      { params: { id: tsdbId }, timeout: 5000 }
    );

    const matchs = res.data?.results || [];
    const termines = matchs.filter(m => m.strStatus === 'Match Finished');
    if (termines.length < 3) return null;

    const domicile = termines.filter(m => m.idHomeTeam === tsdbId);
    const exterieur = termines.filter(m => m.idAwayTeam === tsdbId);

    let moy_buts_dom = null, moy_buts_enc_dom = null;
    if (domicile.length >= 2) {
      moy_buts_dom     = domicile.reduce((s, m) => s + (parseInt(m.intHomeScore) || 0), 0) / domicile.length;
      moy_buts_enc_dom = domicile.reduce((s, m) => s + (parseInt(m.intAwayScore) || 0), 0) / domicile.length;
    }

    let moy_buts_ext = null, moy_buts_enc_ext = null;
    if (exterieur.length >= 2) {
      moy_buts_ext     = exterieur.reduce((s, m) => s + (parseInt(m.intAwayScore) || 0), 0) / exterieur.length;
      moy_buts_enc_ext = exterieur.reduce((s, m) => s + (parseInt(m.intHomeScore) || 0), 0) / exterieur.length;
    }

    const fallback = getFormeParNom(nomEquipe);

    return {
      moy_buts_dom:     moy_buts_dom     ?? fallback.moy_buts_dom,
      moy_buts_enc_dom: moy_buts_enc_dom ?? fallback.moy_buts_enc_dom,
      moy_buts_ext:     moy_buts_ext     ?? fallback.moy_buts_ext,
      moy_buts_enc_ext: moy_buts_enc_ext ?? fallback.moy_buts_enc_ext,
      elo:              fallback.elo,
      league_avg:       leagueAvg,
      source:           'live',
    };
  } catch (err) {
    console.error(`Erreur forme réelle ${nomEquipe} :`, err.message);
    return null;
  }
}

module.exports = {
  getMatchsAVenir,
  getFormeEquipe: _getFormeEquipeDB,
  getEquipes,
  getFormeReelle,
  LEAGUE_AVG_GOALS,
  MOCK_EQUIPES,
  MOCK_FORME,
};