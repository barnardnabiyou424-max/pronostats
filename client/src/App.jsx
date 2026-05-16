// src/App.jsx
import { useState, useEffect } from 'react';
import { usePronostics } from './hooks/usePronostics';
import Header            from './components/Header';
import MatchCard         from './components/MatchCard';
import { ValueBadge }    from './components/ui';

const LIGUES = {
  '4334': 'Ligue 1',
  '4328': 'Premier League',
  '4335': 'La Liga',
  '4332': 'Serie A',
  '4331': 'Bundesliga',
};

export default function App() {
  const { data, connected, newIds, lastTick, refreshing, refresh } = usePronostics();
  const [ligueActive, setLigueActive]   = useState('toutes');
  const [onglet, setOnglet]             = useState('dashboard'); // 'dashboard' | 'historique'
  const [historique, setHistorique]     = useState(null);
  const [loadingHisto, setLoadingHisto] = useState(false);

  // Charger l'historique quand on bascule sur l'onglet
  useEffect(() => {
    if (onglet !== 'historique') return;
    setLoadingHisto(true);
    fetch('/api/stream/historique')
      .then(r => r.json())
      .then(json => { if (json.success) setHistorique(json); })
      .catch(console.error)
      .finally(() => setLoadingHisto(false));
  }, [onglet]);

  if (!data) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#3a4560', fontFamily: "'DM Mono', monospace", fontSize: 13 }}>
        Chargement...
      </div>
    );
  }

  const predictionsFiltrees = ligueActive === 'toutes'
    ? data.predictions
    : data.predictions.filter(p => p.ligue_id === ligueActive);

  const valueBets    = predictionsFiltrees.filter(p => p.prediction.value_bet !== 'aucun');
  const liguesDispo  = ['toutes', ...new Set(data.predictions.map(p => p.ligue_id).filter(Boolean))];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&family=DM+Mono:wght@400;500&family=Barlow:wght@400;500;600&display=swap');
        @keyframes pulse-border { 0%{border-color:#00e5a0;box-shadow:0 0 0 0 #00e5a030} 50%{box-shadow:0 0 0 8px #00e5a000} 100%{border-color:#1e2535} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .filtre-btn { background: none; border: 1px solid #1e2535; border-radius: 20px; color: #3a4560; font-family: 'DM Mono', monospace; font-size: 11px; padding: 5px 14px; cursor: pointer; transition: all 0.15s; letter-spacing: 0.5px; }
        .filtre-btn:hover { border-color: #3a4560; color: #e8eaf0; }
        .filtre-btn.actif { border-color: #00e5a0; color: #00e5a0; background: #00e5a010; }
        .onglet-btn { background: none; border: none; border-bottom: 2px solid transparent; color: #3a4560; font-family: 'Barlow Condensed', sans-serif; font-size: 15px; font-weight: 700; letter-spacing: 1px; padding: 10px 20px; cursor: pointer; transition: all 0.15s; text-transform: uppercase; }
        .onglet-btn:hover { color: #e8eaf0; }
        .onglet-btn.actif { color: #00e5a0; border-bottom-color: #00e5a0; }
        .histo-table { width: 100%; border-collapse: collapse; font-size: 12px; }
        .histo-table th { text-align: left; color: #3a4560; font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; padding: 8px 12px; border-bottom: 1px solid #1e2535; }
        .histo-table td { padding: 10px 12px; border-bottom: 1px solid #0f1420; color: #e8eaf0; font-family: 'Barlow', sans-serif; }
        .histo-table tr:hover td { background: #131928; }
        .badge-correct { background: #00e5a020; color: #00e5a0; border: 1px solid #00e5a040; border-radius: 4px; padding: 2px 8px; font-size: 10px; font-family: 'DM Mono', monospace; }
        .badge-wrong   { background: #ff4d6620; color: #ff4d66; border: 1px solid #ff4d6640; border-radius: 4px; padding: 2px 8px; font-size: 10px; font-family: 'DM Mono', monospace; }
        .badge-pending { background: #3a456020; color: #3a4560; border: 1px solid #3a456040; border-radius: 4px; padding: 2px 8px; font-size: 10px; font-family: 'DM Mono', monospace; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#0a0e1a', fontFamily: "'Barlow', sans-serif", color: '#e8eaf0' }}>
        <Header connected={connected} lastTick={lastTick} lastUpdate={data.lastUpdate} refreshing={refreshing} onRefresh={refresh} />

        {/* Stats globales */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, borderBottom: '1px solid #131928', background: '#131928' }}>
          {[
            { label: 'Matchs analysés',     val: data.totalMatchs },
            { label: 'Value bets détectés', val: data.valueBets, accent: '#00e5a0' },
            { label: 'Dernière MAJ',        val: new Date(data.lastUpdate).toLocaleTimeString('fr-FR'), mono: true },
          ].map(({ label, val, accent, mono }) => (
            <div key={label} style={{ background: '#0a0e1a', padding: '14px 28px' }}>
              <p style={{ fontSize: 10, color: '#3a4560', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>{label}</p>
              <p style={{ fontSize: 22, fontFamily: mono ? "'DM Mono', monospace" : "'Barlow Condensed', sans-serif", fontWeight: 700, color: accent || '#e8eaf0' }}>{val}</p>
            </div>
          ))}
        </div>

        {/* Onglets */}
        <div style={{ borderBottom: '1px solid #1e2535', padding: '0 28px', background: '#0a0e1a' }}>
          <button className={`onglet-btn${onglet === 'dashboard'  ? ' actif' : ''}`} onClick={() => setOnglet('dashboard')}>Dashboard</button>
          <button className={`onglet-btn${onglet === 'historique' ? ' actif' : ''}`} onClick={() => setOnglet('historique')}>Historique</button>
        </div>

        <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>

          {/* ── ONGLET DASHBOARD ── */}
          {onglet === 'dashboard' && (
            <>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                {liguesDispo.map(id => (
                  <button key={id} className={`filtre-btn${ligueActive === id ? ' actif' : ''}`} onClick={() => setLigueActive(id)}>
                    {id === 'toutes' ? 'Toutes' : (LIGUES[id] || id)}
                  </button>
                ))}
              </div>

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

              {predictionsFiltrees.length === 0 ? (
                <p style={{ textAlign: 'center', fontSize: 12, color: '#3a4560', fontFamily: "'DM Mono', monospace", padding: '40px 0' }}>Aucun match pour cette ligue</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {predictionsFiltrees.map(p => (
                    <MatchCard key={p.match_id} data={p} isNew={newIds.has(p.match_id)} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── ONGLET HISTORIQUE ── */}
          {onglet === 'historique' && (
            <>
              {loadingHisto ? (
                <p style={{ textAlign: 'center', fontSize: 12, color: '#3a4560', fontFamily: "'DM Mono', monospace", padding: '40px 0' }}>Chargement...</p>
              ) : !historique ? (
                <p style={{ textAlign: 'center', fontSize: 12, color: '#3a4560', fontFamily: "'DM Mono', monospace", padding: '40px 0' }}>Aucune donnée</p>
              ) : (
                <>
                  {/* Taux de réussite */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
                    {[
                      { label: 'Prédictions sauvegardées', val: historique.stats?.total ?? '—' },
                      { label: 'Résultats vérifiés',       val: historique.stats?.corrects ?? '—' },
                      { label: 'Taux de réussite',         val: historique.stats?.taux ? `${historique.stats.taux}%` : '—', accent: '#00e5a0' },
                    ].map(({ label, val, accent }) => (
                      <div key={label} style={{ background: '#131928', borderRadius: 10, padding: '16px 20px', border: '1px solid #1e2535' }}>
                        <p style={{ fontSize: 10, color: '#3a4560', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>{label}</p>
                        <p style={{ fontSize: 26, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: accent || '#e8eaf0' }}>{val}</p>
                      </div>
                    ))}
                  </div>

                  {/* Tableau */}
                  {historique.historique?.length === 0 ? (
                    <p style={{ textAlign: 'center', fontSize: 12, color: '#3a4560', fontFamily: "'DM Mono', monospace", padding: '40px 0' }}>
                      Aucune prédiction sauvegardée pour l'instant
                    </p>
                  ) : (
                    <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid #1e2535' }}>
                      <table className="histo-table">
                        <thead>
                          <tr>
                            <th>Match</th>
                            <th>Ligue</th>
                            <th>Date</th>
                            <th>Prédit</th>
                            <th>Réel</th>
                            <th>Résultat</th>
                            <th>Confiance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {historique.historique.map(row => (
                            <tr key={row.id}>
                              <td style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 14 }}>
                                {row.domicile} vs {row.exterieur}
                              </td>
                              <td style={{ color: '#3a4560', fontSize: 11 }}>{LIGUES[row.ligue_id] || row.ligue_id || '—'}</td>
                              <td style={{ color: '#3a4560', fontFamily: "'DM Mono', monospace", fontSize: 11 }}>
                                {row.date_match ? new Date(row.date_match).toLocaleDateString('fr-FR') : '—'}
                              </td>
                              <td style={{ fontFamily: "'DM Mono', monospace", color: '#00e5a0' }}>
                                {row.score_predit_dom}-{row.score_predit_ext}
                              </td>
                              <td style={{ fontFamily: "'DM Mono', monospace" }}>
                                {row.score_reel_dom !== null ? `${row.score_reel_dom}-${row.score_reel_ext}` : '—'}
                              </td>
                              <td>
                                {row.resultat_correct === 1 && <span className="badge-correct">✓ Correct</span>}
                                {row.resultat_correct === 0 && <span className="badge-wrong">✗ Raté</span>}
                                {row.resultat_correct === null && <span className="badge-pending">En attente</span>}
                              </td>
                              <td style={{ fontFamily: "'DM Mono', monospace", color: row.confiance >= 80 ? '#00e5a0' : row.confiance >= 60 ? '#e8eaf0' : '#3a4560' }}>
                                {row.confiance}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          <p style={{ textAlign: 'center', fontSize: 10, color: '#1e2535', marginTop: 32, fontFamily: "'DM Mono', monospace" }}>PRONOSTATS · Modèle Poisson v1</p>
        </div>
      </div>
    </>
  );
}