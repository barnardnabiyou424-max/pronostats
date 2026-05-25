// services/teamStats.js
// Vraies moyennes de buts saison 2025-2026 — 5 grandes ligues
// Sources : Footmercato, Sport-Histoire, Sofascore (mai 2026)
// Structure : { nomEquipe: { moy_buts_dom, moy_buts_enc_dom, moy_buts_ext, moy_buts_enc_ext, elo } }

// ─────────────────────────────────────────────
// MOYENNES LIGUE PAR LIGUE (utilisées par Poisson)
// ─────────────────────────────────────────────
const LEAGUE_AVG = {
  ligue1:      1.40,
  premier:     1.40,
  laliga:      1.30,
  seriea:      1.20,
  bundesliga:  1.60,
  worldcup: 1.35,
};

// ─────────────────────────────────────────────
// LIGUE 1 — France 2025-2026
// ─────────────────────────────────────────────
const LIGUE1 = {
  'Paris Saint-Germain': { moy_buts_dom: 2.6, moy_buts_enc_dom: 0.6, moy_buts_ext: 1.8, moy_buts_enc_ext: 0.9, elo: 1900 },
  'PSG':                 { moy_buts_dom: 2.6, moy_buts_enc_dom: 0.6, moy_buts_ext: 1.8, moy_buts_enc_ext: 0.9, elo: 1900 },
  'Lens':                { moy_buts_dom: 2.2, moy_buts_enc_dom: 0.9, moy_buts_ext: 1.6, moy_buts_enc_ext: 1.1, elo: 1750 },
  'Racing Club de Lens': { moy_buts_dom: 2.2, moy_buts_enc_dom: 0.9, moy_buts_ext: 1.6, moy_buts_enc_ext: 1.1, elo: 1750 },
  'Marseille':           { moy_buts_dom: 2.1, moy_buts_enc_dom: 1.0, moy_buts_ext: 1.5, moy_buts_enc_ext: 1.2, elo: 1700 },
  'Olympique de Marseille': { moy_buts_dom: 2.1, moy_buts_enc_dom: 1.0, moy_buts_ext: 1.5, moy_buts_enc_ext: 1.2, elo: 1700 },
  'Rennes':              { moy_buts_dom: 2.0, moy_buts_enc_dom: 1.1, moy_buts_ext: 1.4, moy_buts_enc_ext: 1.3, elo: 1650 },
  'Stade Rennais':       { moy_buts_dom: 2.0, moy_buts_enc_dom: 1.1, moy_buts_ext: 1.4, moy_buts_enc_ext: 1.3, elo: 1650 },
  'Lyon':                { moy_buts_dom: 1.9, moy_buts_enc_dom: 1.1, moy_buts_ext: 1.3, moy_buts_enc_ext: 1.3, elo: 1640 },
  'Olympique Lyonnais':  { moy_buts_dom: 1.9, moy_buts_enc_dom: 1.1, moy_buts_ext: 1.3, moy_buts_enc_ext: 1.3, elo: 1640 },
  'Monaco':              { moy_buts_dom: 1.9, moy_buts_enc_dom: 1.2, moy_buts_ext: 1.4, moy_buts_enc_ext: 1.3, elo: 1660 },
  'AS Monaco':           { moy_buts_dom: 1.9, moy_buts_enc_dom: 1.2, moy_buts_ext: 1.4, moy_buts_enc_ext: 1.3, elo: 1660 },
  'Lille':               { moy_buts_dom: 1.8, moy_buts_enc_dom: 0.9, moy_buts_ext: 1.2, moy_buts_enc_ext: 1.1, elo: 1670 },
  'LOSC':                { moy_buts_dom: 1.8, moy_buts_enc_dom: 0.9, moy_buts_ext: 1.2, moy_buts_enc_ext: 1.1, elo: 1670 },
  'Strasbourg':          { moy_buts_dom: 1.7, moy_buts_enc_dom: 1.2, moy_buts_ext: 1.2, moy_buts_enc_ext: 1.4, elo: 1600 },
  'RC Strasbourg':       { moy_buts_dom: 1.7, moy_buts_enc_dom: 1.2, moy_buts_ext: 1.2, moy_buts_enc_ext: 1.4, elo: 1600 },
  'Nice':                { moy_buts_dom: 1.6, moy_buts_enc_dom: 1.4, moy_buts_ext: 1.1, moy_buts_enc_ext: 1.5, elo: 1580 },
  'OGC Nice':            { moy_buts_dom: 1.6, moy_buts_enc_dom: 1.4, moy_buts_ext: 1.1, moy_buts_enc_ext: 1.5, elo: 1580 },
  'Brest':               { moy_buts_dom: 1.5, moy_buts_enc_dom: 1.5, moy_buts_ext: 1.1, moy_buts_enc_ext: 1.6, elo: 1560 },
  'Stade Brestois':      { moy_buts_dom: 1.5, moy_buts_enc_dom: 1.5, moy_buts_ext: 1.1, moy_buts_enc_ext: 1.6, elo: 1560 },
  'Toulouse':            { moy_buts_dom: 1.5, moy_buts_enc_dom: 1.3, moy_buts_ext: 1.0, moy_buts_enc_ext: 1.4, elo: 1550 },
  'Toulouse FC':         { moy_buts_dom: 1.5, moy_buts_enc_dom: 1.3, moy_buts_ext: 1.0, moy_buts_enc_ext: 1.4, elo: 1550 },
  'Nantes':              { moy_buts_dom: 1.4, moy_buts_enc_dom: 1.5, moy_buts_ext: 1.0, moy_buts_enc_ext: 1.6, elo: 1520 },
  'FC Nantes':           { moy_buts_dom: 1.4, moy_buts_enc_dom: 1.5, moy_buts_ext: 1.0, moy_buts_enc_ext: 1.6, elo: 1520 },
  'Le Havre':            { moy_buts_dom: 1.3, moy_buts_enc_dom: 1.4, moy_buts_ext: 0.9, moy_buts_enc_ext: 1.5, elo: 1500 },
  'HAC':                 { moy_buts_dom: 1.3, moy_buts_enc_dom: 1.4, moy_buts_ext: 0.9, moy_buts_enc_ext: 1.5, elo: 1500 },
  'Auxerre':             { moy_buts_dom: 1.4, moy_buts_enc_dom: 1.4, moy_buts_ext: 1.0, moy_buts_enc_ext: 1.5, elo: 1510 },
  'AJ Auxerre':          { moy_buts_dom: 1.4, moy_buts_enc_dom: 1.4, moy_buts_ext: 1.0, moy_buts_enc_ext: 1.5, elo: 1510 },
  'St Etienne':          { moy_buts_dom: 1.2, moy_buts_enc_dom: 1.6, moy_buts_ext: 0.8, moy_buts_enc_ext: 1.8, elo: 1460 },
  'Saint-Etienne':       { moy_buts_dom: 1.2, moy_buts_enc_dom: 1.6, moy_buts_ext: 0.8, moy_buts_enc_ext: 1.8, elo: 1460 },
  'Metz':                { moy_buts_dom: 1.1, moy_buts_enc_dom: 2.0, moy_buts_ext: 0.8, moy_buts_enc_ext: 2.2, elo: 1420 },
  'FC Metz':             { moy_buts_dom: 1.1, moy_buts_enc_dom: 2.0, moy_buts_ext: 0.8, moy_buts_enc_ext: 2.2, elo: 1420 },
  'Rodez AF':            { moy_buts_dom: 1.2, moy_buts_enc_dom: 1.5, moy_buts_ext: 0.9, moy_buts_enc_ext: 1.7, elo: 1450 },
};

// ─────────────────────────────────────────────
// PREMIER LEAGUE — Angleterre 2025-2026
// ─────────────────────────────────────────────
const PREMIER = {
  'Man City':            { moy_buts_dom: 2.5, moy_buts_enc_dom: 0.8, moy_buts_ext: 1.8, moy_buts_enc_ext: 1.0, elo: 1880 },
  'Manchester City':     { moy_buts_dom: 2.5, moy_buts_enc_dom: 0.8, moy_buts_ext: 1.8, moy_buts_enc_ext: 1.0, elo: 1880 },
  'Arsenal':             { moy_buts_dom: 2.2, moy_buts_enc_dom: 0.9, moy_buts_ext: 1.6, moy_buts_enc_ext: 1.1, elo: 1820 },
  'Man United':          { moy_buts_dom: 2.1, moy_buts_enc_dom: 1.1, moy_buts_ext: 1.5, moy_buts_enc_ext: 1.3, elo: 1760 },
  'Manchester United':   { moy_buts_dom: 2.1, moy_buts_enc_dom: 1.1, moy_buts_ext: 1.5, moy_buts_enc_ext: 1.3, elo: 1760 },
  'Liverpool':           { moy_buts_dom: 2.0, moy_buts_enc_dom: 1.0, moy_buts_ext: 1.5, moy_buts_enc_ext: 1.1, elo: 1800 },
  'Chelsea':             { moy_buts_dom: 1.9, moy_buts_enc_dom: 1.2, moy_buts_ext: 1.4, moy_buts_enc_ext: 1.3, elo: 1720 },
  'Tottenham':           { moy_buts_dom: 1.8, moy_buts_enc_dom: 1.4, moy_buts_ext: 1.3, moy_buts_enc_ext: 1.5, elo: 1680 },
  'Tottenham Hotspur':   { moy_buts_dom: 1.8, moy_buts_enc_dom: 1.4, moy_buts_ext: 1.3, moy_buts_enc_ext: 1.5, elo: 1680 },
  'Newcastle':           { moy_buts_dom: 1.8, moy_buts_enc_dom: 1.1, moy_buts_ext: 1.3, moy_buts_enc_ext: 1.3, elo: 1700 },
  'Newcastle United':    { moy_buts_dom: 1.8, moy_buts_enc_dom: 1.1, moy_buts_ext: 1.3, moy_buts_enc_ext: 1.3, elo: 1700 },
  'Aston Villa':         { moy_buts_dom: 1.7, moy_buts_enc_dom: 1.2, moy_buts_ext: 1.3, moy_buts_enc_ext: 1.4, elo: 1680 },
  'Brighton':            { moy_buts_dom: 1.6, moy_buts_enc_dom: 1.3, moy_buts_ext: 1.2, moy_buts_enc_ext: 1.4, elo: 1640 },
  'West Ham':            { moy_buts_dom: 1.4, moy_buts_enc_dom: 1.6, moy_buts_ext: 1.0, moy_buts_enc_ext: 1.7, elo: 1560 },
  'Wolverhampton':       { moy_buts_dom: 1.3, moy_buts_enc_dom: 1.7, moy_buts_ext: 1.0, moy_buts_enc_ext: 1.8, elo: 1520 },
  'Wolves':              { moy_buts_dom: 1.3, moy_buts_enc_dom: 1.7, moy_buts_ext: 1.0, moy_buts_enc_ext: 1.8, elo: 1520 },
  'Burnley':             { moy_buts_dom: 1.2, moy_buts_enc_dom: 1.9, moy_buts_ext: 0.9, moy_buts_enc_ext: 2.0, elo: 1480 },
  'Leeds':               { moy_buts_dom: 1.5, moy_buts_enc_dom: 1.3, moy_buts_ext: 1.1, moy_buts_enc_ext: 1.4, elo: 1580 },
  'Leeds United':        { moy_buts_dom: 1.5, moy_buts_enc_dom: 1.3, moy_buts_ext: 1.1, moy_buts_enc_ext: 1.4, elo: 1580 },
};

// ─────────────────────────────────────────────
// LA LIGA — Espagne 2025-2026
// ─────────────────────────────────────────────
const LALIGA = {
  'Barcelone':           { moy_buts_dom: 3.0, moy_buts_enc_dom: 0.8, moy_buts_ext: 2.2, moy_buts_enc_ext: 1.0, elo: 1920 },
  'Barcelona':           { moy_buts_dom: 3.0, moy_buts_enc_dom: 0.8, moy_buts_ext: 2.2, moy_buts_enc_ext: 1.0, elo: 1920 },
  'Real Madrid':         { moy_buts_dom: 2.4, moy_buts_enc_dom: 0.9, moy_buts_ext: 1.7, moy_buts_enc_ext: 1.1, elo: 1880 },
  'Villarreal':          { moy_buts_dom: 2.2, moy_buts_enc_dom: 1.2, moy_buts_ext: 1.6, moy_buts_enc_ext: 1.3, elo: 1700 },
  'Atlético':            { moy_buts_dom: 2.0, moy_buts_enc_dom: 1.0, moy_buts_ext: 1.4, moy_buts_enc_ext: 1.2, elo: 1780 },
  'Atletico Madrid':     { moy_buts_dom: 2.0, moy_buts_enc_dom: 1.0, moy_buts_ext: 1.4, moy_buts_enc_ext: 1.2, elo: 1780 },
  'Betis':               { moy_buts_dom: 1.7, moy_buts_enc_dom: 1.2, moy_buts_ext: 1.2, moy_buts_enc_ext: 1.4, elo: 1640 },
  'Real Betis':          { moy_buts_dom: 1.7, moy_buts_enc_dom: 1.2, moy_buts_ext: 1.2, moy_buts_enc_ext: 1.4, elo: 1640 },
  'Séville':             { moy_buts_dom: 1.5, moy_buts_enc_dom: 1.5, moy_buts_ext: 1.1, moy_buts_enc_ext: 1.6, elo: 1600 },
  'Sevilla':             { moy_buts_dom: 1.5, moy_buts_enc_dom: 1.5, moy_buts_ext: 1.1, moy_buts_enc_ext: 1.6, elo: 1600 },
  'Girona':              { moy_buts_dom: 1.6, moy_buts_enc_dom: 1.3, moy_buts_ext: 1.2, moy_buts_enc_ext: 1.4, elo: 1620 },
  'Real Sociedad':       { moy_buts_dom: 1.5, moy_buts_enc_dom: 1.5, moy_buts_ext: 1.1, moy_buts_enc_ext: 1.6, elo: 1610 },
  'Getafe':              { moy_buts_dom: 1.2, moy_buts_enc_dom: 1.3, moy_buts_ext: 0.9, moy_buts_enc_ext: 1.5, elo: 1530 },
  'Osasuna':             { moy_buts_dom: 1.3, moy_buts_enc_dom: 1.4, moy_buts_ext: 1.0, moy_buts_enc_ext: 1.5, elo: 1540 },
  'Levante':             { moy_buts_dom: 1.3, moy_buts_enc_dom: 1.5, moy_buts_ext: 0.9, moy_buts_enc_ext: 1.6, elo: 1500 },
  'Elche':               { moy_buts_dom: 1.2, moy_buts_enc_dom: 1.5, moy_buts_ext: 0.9, moy_buts_enc_ext: 1.6, elo: 1490 },
  'Alavés':              { moy_buts_dom: 1.2, moy_buts_enc_dom: 1.5, moy_buts_ext: 0.8, moy_buts_enc_ext: 1.7, elo: 1480 },
};

// ─────────────────────────────────────────────
// SERIE A — Italie 2025-2026
// ─────────────────────────────────────────────
const SERIEA = {
  'Inter Milan':         { moy_buts_dom: 2.8, moy_buts_enc_dom: 0.7, moy_buts_ext: 2.0, moy_buts_enc_ext: 0.9, elo: 1860 },
  'Inter':               { moy_buts_dom: 2.8, moy_buts_enc_dom: 0.7, moy_buts_ext: 2.0, moy_buts_enc_ext: 0.9, elo: 1860 },
  'Côme':                { moy_buts_dom: 2.0, moy_buts_enc_dom: 1.3, moy_buts_ext: 1.4, moy_buts_enc_ext: 1.4, elo: 1640 },
  'Como':                { moy_buts_dom: 2.0, moy_buts_enc_dom: 1.3, moy_buts_ext: 1.4, moy_buts_enc_ext: 1.4, elo: 1640 },
  'Juventus':            { moy_buts_dom: 1.9, moy_buts_enc_dom: 1.0, moy_buts_ext: 1.4, moy_buts_enc_ext: 1.2, elo: 1780 },
  'Rome':                { moy_buts_dom: 1.8, moy_buts_enc_dom: 1.2, moy_buts_ext: 1.3, moy_buts_enc_ext: 1.3, elo: 1680 },
  'Roma':                { moy_buts_dom: 1.8, moy_buts_enc_dom: 1.2, moy_buts_ext: 1.3, moy_buts_enc_ext: 1.3, elo: 1680 },
  'Atalanta':            { moy_buts_dom: 1.8, moy_buts_enc_dom: 1.1, moy_buts_ext: 1.4, moy_buts_enc_ext: 1.2, elo: 1720 },
  'Naples':              { moy_buts_dom: 1.7, moy_buts_enc_dom: 1.1, moy_buts_ext: 1.3, moy_buts_enc_ext: 1.3, elo: 1700 },
  'Napoli':              { moy_buts_dom: 1.7, moy_buts_enc_dom: 1.1, moy_buts_ext: 1.3, moy_buts_enc_ext: 1.3, elo: 1700 },
  'Milan':               { moy_buts_dom: 1.7, moy_buts_enc_dom: 1.2, moy_buts_ext: 1.2, moy_buts_enc_ext: 1.3, elo: 1690 },
  'AC Milan':            { moy_buts_dom: 1.7, moy_buts_enc_dom: 1.2, moy_buts_ext: 1.2, moy_buts_enc_ext: 1.3, elo: 1690 },
  'Fiorentina':          { moy_buts_dom: 1.6, moy_buts_enc_dom: 1.2, moy_buts_ext: 1.2, moy_buts_enc_ext: 1.3, elo: 1640 },
  'Bologne':             { moy_buts_dom: 1.5, moy_buts_enc_dom: 1.2, moy_buts_ext: 1.1, moy_buts_enc_ext: 1.3, elo: 1620 },
  'Bologna':             { moy_buts_dom: 1.5, moy_buts_enc_dom: 1.2, moy_buts_ext: 1.1, moy_buts_enc_ext: 1.3, elo: 1620 },
  'Torino':              { moy_buts_dom: 1.3, moy_buts_enc_dom: 1.5, moy_buts_ext: 1.0, moy_buts_enc_ext: 1.6, elo: 1540 },
  'Hellas':              { moy_buts_dom: 1.3, moy_buts_enc_dom: 1.5, moy_buts_ext: 1.0, moy_buts_enc_ext: 1.6, elo: 1530 },
  'Hellas Verona':       { moy_buts_dom: 1.3, moy_buts_enc_dom: 1.5, moy_buts_ext: 1.0, moy_buts_enc_ext: 1.6, elo: 1530 },
  'Lecce':               { moy_buts_dom: 1.2, moy_buts_enc_dom: 1.5, moy_buts_ext: 0.9, moy_buts_enc_ext: 1.6, elo: 1500 },
  'Pise':                { moy_buts_dom: 1.2, moy_buts_enc_dom: 1.7, moy_buts_ext: 0.9, moy_buts_enc_ext: 1.8, elo: 1480 },
};

// ─────────────────────────────────────────────
// BUNDESLIGA — Allemagne 2025-2026
// ─────────────────────────────────────────────
const BUNDESLIGA = {
  'Bayern Munich':       { moy_buts_dom: 4.2, moy_buts_enc_dom: 1.0, moy_buts_ext: 3.0, moy_buts_enc_ext: 1.2, elo: 1950 },
  'FC Bayern München':   { moy_buts_dom: 4.2, moy_buts_enc_dom: 1.0, moy_buts_ext: 3.0, moy_buts_enc_ext: 1.2, elo: 1950 },
  'Bayern München':      { moy_buts_dom: 4.2, moy_buts_enc_dom: 1.0, moy_buts_ext: 3.0, moy_buts_enc_ext: 1.2, elo: 1950 },
  'Dortmund':            { moy_buts_dom: 2.5, moy_buts_enc_dom: 1.0, moy_buts_ext: 1.8, moy_buts_enc_ext: 1.1, elo: 1780 },
  'Borussia Dortmund':   { moy_buts_dom: 2.5, moy_buts_enc_dom: 1.0, moy_buts_ext: 1.8, moy_buts_enc_ext: 1.1, elo: 1780 },
  'Stuttgart':           { moy_buts_dom: 2.5, moy_buts_enc_dom: 1.3, moy_buts_ext: 1.8, moy_buts_enc_ext: 1.4, elo: 1740 },
  'VfB Stuttgart':       { moy_buts_dom: 2.5, moy_buts_enc_dom: 1.3, moy_buts_ext: 1.8, moy_buts_enc_ext: 1.4, elo: 1740 },
  'Leverkusen':          { moy_buts_dom: 2.4, moy_buts_enc_dom: 1.1, moy_buts_ext: 1.7, moy_buts_enc_ext: 1.2, elo: 1800 },
  'Bayer Leverkusen':    { moy_buts_dom: 2.4, moy_buts_enc_dom: 1.1, moy_buts_ext: 1.7, moy_buts_enc_ext: 1.2, elo: 1800 },
  'Leipzig':             { moy_buts_dom: 2.2, moy_buts_enc_dom: 1.2, moy_buts_ext: 1.6, moy_buts_enc_ext: 1.3, elo: 1760 },
  'RB Leipzig':          { moy_buts_dom: 2.2, moy_buts_enc_dom: 1.2, moy_buts_ext: 1.6, moy_buts_enc_ext: 1.3, elo: 1760 },
  'Francfort':           { moy_buts_dom: 1.8, moy_buts_enc_dom: 1.8, moy_buts_ext: 1.4, moy_buts_enc_ext: 1.9, elo: 1640 },
  'Eintracht Frankfurt': { moy_buts_dom: 1.8, moy_buts_enc_dom: 1.8, moy_buts_ext: 1.4, moy_buts_enc_ext: 1.9, elo: 1640 },
  'Mayence':             { moy_buts_dom: 1.7, moy_buts_enc_dom: 1.4, moy_buts_ext: 1.3, moy_buts_enc_ext: 1.5, elo: 1600 },
  'Fribourg':            { moy_buts_dom: 1.6, moy_buts_enc_dom: 1.3, moy_buts_ext: 1.2, moy_buts_enc_ext: 1.4, elo: 1600 },
  'SC Freiburg':         { moy_buts_dom: 1.6, moy_buts_enc_dom: 1.3, moy_buts_ext: 1.2, moy_buts_enc_ext: 1.4, elo: 1600 },
  'Wolfsbourg':          { moy_buts_dom: 1.4, moy_buts_enc_dom: 2.0, moy_buts_ext: 1.1, moy_buts_enc_ext: 2.1, elo: 1520 },
  'Wolfsburg':           { moy_buts_dom: 1.4, moy_buts_enc_dom: 2.0, moy_buts_ext: 1.1, moy_buts_enc_ext: 2.1, elo: 1520 },
  'Heidenheim':          { moy_buts_dom: 1.3, moy_buts_enc_dom: 2.0, moy_buts_ext: 1.0, moy_buts_enc_ext: 2.1, elo: 1490 },
  'Union Berlin':        { moy_buts_dom: 1.3, moy_buts_enc_dom: 1.6, moy_buts_ext: 1.0, moy_buts_enc_ext: 1.7, elo: 1510 },
  'Hambourg':            { moy_buts_dom: 1.4, moy_buts_enc_dom: 1.5, moy_buts_ext: 1.1, moy_buts_enc_ext: 1.6, elo: 1530 },
  'Hamburger SV':        { moy_buts_dom: 1.4, moy_buts_enc_dom: 1.5, moy_buts_ext: 1.1, moy_buts_enc_ext: 1.6, elo: 1530 },
  'Cologne':             { moy_buts_dom: 1.3, moy_buts_enc_dom: 1.7, moy_buts_ext: 1.0, moy_buts_enc_ext: 1.8, elo: 1490 },
};
// ─────────────────────────────────────────────
// FIFA WORLD CUP 2026 — Sélections nationales
// Sources : FIFA Rankings + stats qualifications 2024-2025
// ─────────────────────────────────────────────
const WORLD_CUP = {
  // ── TOPS FAVORIS ──
  'France':           { moy_buts_dom: 2.1, moy_buts_enc_dom: 0.8, moy_buts_ext: 1.8, moy_buts_enc_ext: 1.0, elo: 1950 },
  'Brazil':           { moy_buts_dom: 2.0, moy_buts_enc_dom: 0.7, moy_buts_ext: 1.7, moy_buts_enc_ext: 0.9, elo: 1940 },
  'England':          { moy_buts_dom: 2.0, moy_buts_enc_dom: 0.9, moy_buts_ext: 1.6, moy_buts_enc_ext: 1.0, elo: 1900 },
  'Argentina':        { moy_buts_dom: 2.2, moy_buts_enc_dom: 0.8, moy_buts_ext: 1.8, moy_buts_enc_ext: 1.0, elo: 1960 },
  'Spain':            { moy_buts_dom: 2.1, moy_buts_enc_dom: 0.7, moy_buts_ext: 1.8, moy_buts_enc_ext: 0.9, elo: 1950 },
  'Germany':          { moy_buts_dom: 2.2, moy_buts_enc_dom: 1.0, moy_buts_ext: 1.8, moy_buts_enc_ext: 1.1, elo: 1890 },
  'Portugal':         { moy_buts_dom: 2.3, moy_buts_enc_dom: 0.9, moy_buts_ext: 1.9, moy_buts_enc_ext: 1.0, elo: 1880 },
  'Netherlands':      { moy_buts_dom: 2.0, moy_buts_enc_dom: 1.0, moy_buts_ext: 1.6, moy_buts_enc_ext: 1.1, elo: 1860 },
  'Belgium':          { moy_buts_dom: 1.9, moy_buts_enc_dom: 0.9, moy_buts_ext: 1.5, moy_buts_enc_ext: 1.1, elo: 1830 },

  // ── NIVEAU 2 ──
  'Morocco':          { moy_buts_dom: 1.6, moy_buts_enc_dom: 0.7, moy_buts_ext: 1.3, moy_buts_enc_ext: 0.9, elo: 1780 },
  'Croatia':          { moy_buts_dom: 1.7, moy_buts_enc_dom: 0.9, moy_buts_ext: 1.4, moy_buts_enc_ext: 1.1, elo: 1760 },
  'Colombia':         { moy_buts_dom: 1.8, moy_buts_enc_dom: 1.0, moy_buts_ext: 1.4, moy_buts_enc_ext: 1.1, elo: 1750 },
  'Uruguay':          { moy_buts_dom: 1.7, moy_buts_enc_dom: 0.9, moy_buts_ext: 1.4, moy_buts_enc_ext: 1.1, elo: 1750 },
  'Japan':            { moy_buts_dom: 1.8, moy_buts_enc_dom: 0.8, moy_buts_ext: 1.5, moy_buts_enc_ext: 1.0, elo: 1740 },
  'USA':              { moy_buts_dom: 1.7, moy_buts_enc_dom: 1.0, moy_buts_ext: 1.4, moy_buts_enc_ext: 1.2, elo: 1720 },
  'Mexico':           { moy_buts_dom: 1.8, moy_buts_enc_dom: 1.0, moy_buts_ext: 1.4, moy_buts_enc_ext: 1.2, elo: 1710 },
  'Senegal':          { moy_buts_dom: 1.6, moy_buts_enc_dom: 0.9, moy_buts_ext: 1.3, moy_buts_enc_ext: 1.1, elo: 1700 },
  'Switzerland':      { moy_buts_dom: 1.7, moy_buts_enc_dom: 1.0, moy_buts_ext: 1.4, moy_buts_enc_ext: 1.1, elo: 1700 },
  'Austria':          { moy_buts_dom: 1.7, moy_buts_enc_dom: 1.1, moy_buts_ext: 1.4, moy_buts_enc_ext: 1.2, elo: 1690 },
  'Turkey':           { moy_buts_dom: 1.7, moy_buts_enc_dom: 1.1, moy_buts_ext: 1.4, moy_buts_enc_ext: 1.2, elo: 1690 },
  'Ecuador':          { moy_buts_dom: 1.6, moy_buts_enc_dom: 1.1, moy_buts_ext: 1.3, moy_buts_enc_ext: 1.2, elo: 1670 },
  'South Korea':      { moy_buts_dom: 1.7, moy_buts_enc_dom: 1.1, moy_buts_ext: 1.4, moy_buts_enc_ext: 1.2, elo: 1670 },
  'Australia':        { moy_buts_dom: 1.5, moy_buts_enc_dom: 1.2, moy_buts_ext: 1.2, moy_buts_enc_ext: 1.3, elo: 1640 },
  'Norway':           { moy_buts_dom: 2.0, moy_buts_enc_dom: 1.1, moy_buts_ext: 1.6, moy_buts_enc_ext: 1.2, elo: 1680 },
  'Sweden':           { moy_buts_dom: 1.6, moy_buts_enc_dom: 1.1, moy_buts_ext: 1.3, moy_buts_enc_ext: 1.2, elo: 1650 },
  'Iran':             { moy_buts_dom: 1.5, moy_buts_enc_dom: 1.0, moy_buts_ext: 1.2, moy_buts_enc_ext: 1.2, elo: 1630 },
  'Czech Republic':   { moy_buts_dom: 1.6, moy_buts_enc_dom: 1.2, moy_buts_ext: 1.3, moy_buts_enc_ext: 1.3, elo: 1630 },

  // ── NIVEAU 3 ──
  'Algeria':          { moy_buts_dom: 1.5, moy_buts_enc_dom: 1.1, moy_buts_ext: 1.2, moy_buts_enc_ext: 1.2, elo: 1620 },
  'Ghana':            { moy_buts_dom: 1.5, moy_buts_enc_dom: 1.2, moy_buts_ext: 1.2, moy_buts_enc_ext: 1.3, elo: 1600 },
  'Saudi Arabia':     { moy_buts_dom: 1.4, moy_buts_enc_dom: 1.2, moy_buts_ext: 1.1, moy_buts_enc_ext: 1.3, elo: 1580 },
  'Canada':           { moy_buts_dom: 1.5, moy_buts_enc_dom: 1.2, moy_buts_ext: 1.2, moy_buts_enc_ext: 1.3, elo: 1600 },
  'Ivory Coast':      { moy_buts_dom: 1.5, moy_buts_enc_dom: 1.2, moy_buts_ext: 1.2, moy_buts_enc_ext: 1.3, elo: 1600 },
  'Tunisia':          { moy_buts_dom: 1.4, moy_buts_enc_dom: 1.1, moy_buts_ext: 1.1, moy_buts_enc_ext: 1.2, elo: 1580 },
  'Qatar':            { moy_buts_dom: 1.4, moy_buts_enc_dom: 1.3, moy_buts_ext: 1.1, moy_buts_enc_ext: 1.4, elo: 1560 },
  'Bosnia-Herzegovina': { moy_buts_dom: 1.4, moy_buts_enc_dom: 1.3, moy_buts_ext: 1.1, moy_buts_enc_ext: 1.4, elo: 1560 },
  'Paraguay':         { moy_buts_dom: 1.3, moy_buts_enc_dom: 1.2, moy_buts_ext: 1.1, moy_buts_enc_ext: 1.3, elo: 1550 },
  'Scotland':         { moy_buts_dom: 1.5, moy_buts_enc_dom: 1.2, moy_buts_ext: 1.2, moy_buts_enc_ext: 1.3, elo: 1580 },
  'DR Congo':         { moy_buts_dom: 1.4, moy_buts_enc_dom: 1.2, moy_buts_ext: 1.1, moy_buts_enc_ext: 1.3, elo: 1560 },
  'Egypt':            { moy_buts_dom: 1.4, moy_buts_enc_dom: 1.1, moy_buts_ext: 1.1, moy_buts_enc_ext: 1.2, elo: 1570 },
  'Panama':           { moy_buts_dom: 1.2, moy_buts_enc_dom: 1.3, moy_buts_ext: 1.0, moy_buts_enc_ext: 1.4, elo: 1530 },
  'New Zealand':      { moy_buts_dom: 1.2, moy_buts_enc_dom: 1.4, moy_buts_ext: 1.0, moy_buts_enc_ext: 1.5, elo: 1510 },
  'South Africa':     { moy_buts_dom: 1.3, moy_buts_enc_dom: 1.3, moy_buts_ext: 1.0, moy_buts_enc_ext: 1.4, elo: 1540 },
  'Jordan':           { moy_buts_dom: 1.3, moy_buts_enc_dom: 1.2, moy_buts_ext: 1.0, moy_buts_enc_ext: 1.3, elo: 1530 },
  'Iraq':             { moy_buts_dom: 1.3, moy_buts_enc_dom: 1.2, moy_buts_ext: 1.0, moy_buts_enc_ext: 1.3, elo: 1530 },
  'Uzbekistan':       { moy_buts_dom: 1.3, moy_buts_enc_dom: 1.2, moy_buts_ext: 1.0, moy_buts_enc_ext: 1.3, elo: 1520 },
  'Cape Verde':       { moy_buts_dom: 1.3, moy_buts_enc_dom: 1.2, moy_buts_ext: 1.0, moy_buts_enc_ext: 1.3, elo: 1520 },
  'Haiti':            { moy_buts_dom: 1.1, moy_buts_enc_dom: 1.5, moy_buts_ext: 0.9, moy_buts_enc_ext: 1.6, elo: 1470 },
  'Curaçao':          { moy_buts_dom: 1.0, moy_buts_enc_dom: 1.6, moy_buts_ext: 0.8, moy_buts_enc_ext: 1.7, elo: 1440 },
};
// ─────────────────────────────────────────────
// FORME PAR DÉFAUT (équipe inconnue)
// ─────────────────────────────────────────────
const DEFAULT_FORME = {
  moy_buts_dom: 1.4,
  moy_buts_enc_dom: 1.4,
  moy_buts_ext: 1.0,
  moy_buts_enc_ext: 1.4,
  elo: 1500,
};

// ─────────────────────────────────────────────
// FONCTION PRINCIPALE
// Cherche les stats d'une équipe dans toutes les ligues
// ─────────────────────────────────────────────
function getFormeEquipe(nomEquipe) {
  const toutes = { ...LIGUE1, ...PREMIER, ...LALIGA, ...SERIEA, ...BUNDESLIGA };

  // Recherche exacte
  if (toutes[nomEquipe]) return toutes[nomEquipe];

  // Recherche partielle (insensible à la casse)
  const nomLower = nomEquipe.toLowerCase();
  const cle = Object.keys(toutes).find(k =>
    k.toLowerCase().includes(nomLower) ||
    nomLower.includes(k.toLowerCase())
  );

  return cle ? toutes[cle] : { ...DEFAULT_FORME };
}

function getLeagueAvg(leagueId) {
  // IDs TheSportsDB
  const map = {
    4334: LEAGUE_AVG.ligue1,     // Ligue 1
    4328: LEAGUE_AVG.premier,    // Premier League
    4335: LEAGUE_AVG.laliga,     // La Liga
    4332: LEAGUE_AVG.seriea,     // Serie A
    4331: LEAGUE_AVG.bundesliga, // Bundesliga
    4429: 1.35, // FIFA World Cup
  };
  return map[leagueId] || 1.35;
}

module.exports = { getFormeEquipe, getLeagueAvg, LEAGUE_AVG };
