// src/components/MatchCard.jsx
import { useState } from 'react';
import { ProbaBar, ConfidenceRing, ValueBadge, ScoreTag, fmtDate, timeAgo } from './ui';

export default function MatchCard({ data, isNew }) {
  const [open, setOpen] = useState(false);
  const { prediction: pred, match, domicile, exterieur, updatedAt, date_match, journee } = data;
  const { probas, score_predit, top_scores, value_bet, value_edge, confiance, ajustements } = pred;
  const hasAbsDom = match?.absences?.domicile?.length > 0;
  const hasAbsExt = match?.absences?.exterieur?.length > 0;

  return (
    <div style={{
      background: '#131928',
      border: `1px solid ${isNew ? '#00e5a0' : '#1e2535'}`,
      borderRadius: 16,
      overflow: 'hidden',
      transition: 'border-color 0.4s ease',
      animation: isNew ? 'pulse-border 1.5s ease' : 'none',
    }}>
      {/* ── Header cliquable ── */}
      <div style={{ padding: '18px 22px 14px', cursor: 'pointer' }} onClick={() => setOpen(o => !o)}>
        {/* Ligne du haut : journée + date + confiance */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: '#3a4560', fontFamily: "'DM Mono', monospace" }}>J{journee || match?.journee}</span>
<span style={{ fontSize: 12, color: '#3a4560' }}>·</span>
<span style={{ fontSize: 12, color: '#3a4560' }}>{fmtDate(date_match || match?.date)}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#e8eaf0', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 0.5 }}>
                {domicile}
              </span>
              <span style={{ fontSize: 13, color: '#3a4560', fontFamily: "'DM Mono', monospace" }}>VS</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#e8eaf0', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 0.5 }}>
                {exterieur}
              </span>
            </div>
          </div>
          <ConfidenceRing value={confiance} />
        </div>

        {/* Barre probas */}
        <ProbaBar p1={probas.p1} pN={probas.pN} p2={probas.p2} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          {[
            { label: 'DOM', val: probas.p1, color: '#00e5a0' },
            { label: 'NUL', val: probas.pN, color: '#f5c518' },
            { label: 'EXT', val: probas.p2, color: '#ff6b35' },
          ].map(({ label, val, color }) => (
            <span key={label} style={{ fontSize: 11, color, fontFamily: "'DM Mono', monospace" }}>
              {label} {val}%
            </span>
          ))}
        </div>

        {/* Score prédit + value bet */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: '#3a4560' }}>Score prédit</span>
            <span style={{
              fontSize: 20, fontFamily: "'DM Mono', monospace", fontWeight: 700,
              color: '#e8eaf0', background: '#1e2535', padding: '2px 14px', borderRadius: 8,
            }}>
              {score_predit.dom} – {score_predit.ext}
            </span>
            <span style={{ fontSize: 10, color: '#3a4560' }}>{score_predit.probabilite}%</span>
          </div>
          <ValueBadge vb={value_bet} edge={value_edge} />
        </div>

        {/* Chevron */}
        <div style={{ textAlign: 'center', marginTop: 8, color: '#2a3050', fontSize: 12 }}>
          {open ? '▲ Masquer' : '▼ Détails'}
        </div>
      </div>

      {/* ── Détails dépliables ── */}
      {open && (
        <div style={{ borderTop: '1px solid #1e2535', padding: '16px 22px', background: '#0e1422' }}>

          {/* Cotes bookmaker */}
          {match?.cotes && (
            <div style={{ marginBottom: 18 }}>
              <p style={{ fontSize: 11, color: '#3a4560', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>Cotes Pinnacle</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { l: '1', v: match.cotes.cote_1 },
                  { l: 'N', v: match.cotes.cote_n },
                  { l: '2', v: match.cotes.cote_2 },
                ].map(({ l, v }) => (
                  <div key={l} style={{
                    flex: 1, background: '#131928', borderRadius: 8, padding: '8px 0',
                    textAlign: 'center', border: '1px solid #1e2535',
                  }}>
                    <div style={{ fontSize: 10, color: '#3a4560', marginBottom: 3 }}>{l}</div>
                    <div style={{ fontSize: 16, fontFamily: "'DM Mono', monospace", color: '#e8eaf0', fontWeight: 700 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top 5 scores */}
          <div style={{ marginBottom: 18 }}>
            <p style={{ fontSize: 11, color: '#3a4560', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>Top 5 scores</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {top_scores.map(s => <ScoreTag key={s.score} s={s} />)}
            </div>
          </div>

          {/* Absences */}
          {(hasAbsDom || hasAbsExt) && (
            <div style={{ marginBottom: 18 }}>
              <p style={{ fontSize: 11, color: '#3a4560', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>Absences</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {match.absences.domicile.map(a => (
                  <div key={a.joueur} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 10, color: '#00e5a0', fontFamily: "'DM Mono', monospace", minWidth: 30 }}>DOM</span>
                    <span style={{ fontSize: 12, color: '#e8eaf0' }}>{a.joueur}</span>
                    <span style={{ fontSize: 10, color: '#ff6b35', background: '#ff6b3515', padding: '1px 6px', borderRadius: 4 }}>{a.raison}</span>
                    <span style={{ fontSize: 10, color: '#3a4560' }}>importance {a.importance}/10</span>
                  </div>
                ))}
                {match.absences.exterieur.map(a => (
                  <div key={a.joueur} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 10, color: '#ff6b35', fontFamily: "'DM Mono', monospace", minWidth: 30 }}>EXT</span>
                    <span style={{ fontSize: 12, color: '#e8eaf0' }}>{a.joueur}</span>
                    <span style={{ fontSize: 10, color: '#ff6b35', background: '#ff6b3515', padding: '1px 6px', borderRadius: 4 }}>{a.raison}</span>
                    <span style={{ fontSize: 10, color: '#3a4560' }}>importance {a.importance}/10</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ajustements modèle */}
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 11, color: '#3a4560', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>Ajustements modèle</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              {Object.entries(ajustements).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                  <span style={{ fontSize: 10, color: '#3a4560' }}>{k.replace(/_/g, ' ')}</span>
                  <span style={{
                    fontSize: 10, fontFamily: "'DM Mono', monospace",
                    color: v < 1 ? '#ff6b35' : v > 1 ? '#00e5a0' : '#3a4560',
                  }}>
                    ×{typeof v === 'number' ? v.toFixed(2) : v}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p style={{ fontSize: 10, color: '#2a3050', textAlign: 'right', fontFamily: "'DM Mono', monospace" }}>
            Mis à jour {timeAgo(updatedAt)}
          </p>
        </div>
      )}
    </div>
  );
}
