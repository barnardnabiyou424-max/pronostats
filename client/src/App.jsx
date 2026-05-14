// src/App.jsx
import { useState }      from 'react';
import { usePronostics } from './hooks/usePronostics';
import Header            from './components/Header';
import MatchCard         from './components/MatchCard';
import { ValueBadge }    from './components/ui';

// Mapping idLeague → nom court
const LIGUES = {
  '4334': 'Ligue 1',
  '4328': 'Premier League',
  '4335': 'La Liga',
  '4332': 'Serie A',
  '4331': 'Bundesliga',
};

export default function App() {
  const { data, connected, newIds, lastTick, refreshing, refresh } = usePronostics();
  const [ligueActive, setLigueActive] = useState('toutes');

  if (!data) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#3a4560', fontFamily: "'DM Mono', monospace", fontSize: 13 }}>
        Chargement...
      </div>
    );
  }

  // Filtrer les prédictions selon la ligue sélectionnée
  const predictionsFiltrees = ligueActive === 'toutes'
    ? data.predictions
    : data.predictions.filter(p => p.ligue_id === ligueActive);

  const valueBets = predictionsFiltrees.filter(p => p.prediction.value_bet !== 'aucun');

  // Ligues présentes dans les données actuelles
  const liguesDispo = ['toutes', ...new Set(
    data.predictions.map(p => p.ligue_id).filter(Boolean)
  )];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&family=DM+Mono:wght@400;500&family=Barlow:wght@400;500;600&display=swap');
        @keyframes pulse-border { 0%{border-color:#00e5a0;box-shadow:0 0 0 0 #00e5a030} 50%{box-shadow:0 0 0 8px #00e5a000} 100%{border-color:#1e2535} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .filtre-btn { background: none; border: 1px solid #1e2535; border-radius: 20px; color: #3a4560; font-family: 'DM Mono', monospace; font-size: 11px; padding: 5px 14px; cursor: pointer; transition: all 0.15s; letter-spacing: 0.5px; }
        .filtre-btn:hover { border-color: #3a4560; color: #e8eaf0; }
        .filtre-btn.actif { border-color: #00e5a0; color: #00e5a0; background: #00e5a010; }
      `}</style>
      <div style={{ minHeight: '100vh', background: '#0a0e1a', fontFamily: "'Barlow', sans-serif", color: '#e8eaf0' }}>
        <Header connected={connected} lastTick={lastTick} lastUpdate={data.lastUpdate} refreshing={refreshing} onRefresh={refresh} />

        {/* Stats globales */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, borderBottom: '1px solid #131928', background: '#131928' }}>
          {[
            { label: 'Matchs analysés',     val: data.totalMatchs },
            { label: 'Value bets détectés', val: data.valueBets, accent: '#00e5a0' },
            { label: 'Dernière MAJ', val: new Date(data.lastUpdate).toLocaleTimeString('fr-FR'), mono: true },
          ].map(({ label, val, accent, mono }) => (
            <div key={label} style={{ background: '#0a0e1a', padding: '14px 28px' }}>
              <p style={{ fontSize: 10, color: '#3a4560', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>{label}</p>
              <p style={{ fontSize: 22, fontFamily: mono ? "'DM Mono', monospace" : "'Barlow Condensed', sans-serif", fontWeight: 700, color: accent || '#e8eaf0' }}>{val}</p>
            </div>
          ))}
        </div>

        <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 16px' }}>

          {/* Filtres ligues */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            {liguesDispo.map(id => (
              <button
                key={id}
                className={`filtre-btn${ligueActive === id ? ' actif' : ''}`}
                onClick={() => setLigueActive(id)}
              >
                {id === 'toutes' ? 'Toutes' : (LIGUES[id] || id)}
              </button>
            ))}
          </div>

          {/* Value bets */}
          {valueBets.length > 0 && (
            <div style={{ background: '#00e5a008', border: '1px solid #00e5a020', borderRadius: 12, padding: '14px 20px', marginBottom: 20 }}>
              <p style={{ fontSize: 11, color: '#00e5a0', fontFamily: "'DM Mono', monospace", letterSpacing: 1, marginBottom: 10 }}>◆ VALUE BETS DÉTECTÉS ({valueBets.length})</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {valueBets.map(p => (
                  <div key={p.match_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <span style={{ fontSize: 13, color: '#e8eaf0', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}>{p.domicile} vs {p.exterieur}</span>
                    <ValueBadge vb={p.prediction.value_bet} edge={p.prediction.value_edge} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Liste matchs */}
          {predictionsFiltrees.length === 0 ? (
            <p style={{ textAlign: 'center', fontSize: 12, color: '#3a4560', fontFamily: "'DM Mono', monospace", padding: '40px 0' }}>
              Aucun match pour cette ligue
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {predictionsFiltrees.map(p => (
                <MatchCard key={p.match_id} data={p} isNew={newIds.has(p.match_id)} />
              ))}
            </div>
          )}

          <p style={{ textAlign: 'center', fontSize: 10, color: '#1e2535', marginTop: 32, fontFamily: "'DM Mono', monospace" }}>PRONOSTATS · Modèle Poisson v1</p>
        </div>
      </div>
    </>
  );
}