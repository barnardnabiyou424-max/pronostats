// src/components/Header.jsx
import { timeAgo } from './ui';

export default function Header({ connected, lastTick, lastUpdate, refreshing, onRefresh }) {
  return (
    <div style={{
      borderBottom: '1px solid #131928',
      padding: '20px 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 12,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <h1 style={{
          fontSize: 26, fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 800, letterSpacing: 1, color: '#e8eaf0',
        }}>
          PRONO<span style={{ color: '#00e5a0' }}>STATS</span>
        </h1>
        <span style={{ fontSize: 11, color: '#3a4560', fontFamily: "'DM Mono', monospace" }}>
          Ligue 1 · Modèle Poisson v1
        </span>
      </div>

      {/* Contrôles droite */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Indicateur connexion SSE */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: connected ? '#00e5a0' : '#ff6b35',
            display: 'inline-block',
            animation: connected ? 'blink 2s infinite' : 'none',
          }} />
          <span style={{ fontSize: 11, color: '#3a4560', fontFamily: "'DM Mono', monospace" }}>
            {connected ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>

        {/* Dernière MAJ */}
        <span style={{ fontSize: 11, color: '#2a3050', fontFamily: "'DM Mono', monospace" }}>
          {lastUpdate ? timeAgo(lastUpdate) : lastTick.toLocaleTimeString('fr-FR')}
        </span>

        {/* Bouton refresh */}
        <button
          onClick={onRefresh}
          disabled={refreshing}
          style={{
            background: 'transparent',
            border: '1px solid #1e2535',
            borderRadius: 8,
            padding: '6px 14px',
            color: refreshing ? '#3a4560' : '#00e5a0',
            fontFamily: "'DM Mono', monospace",
            fontSize: 11,
            cursor: refreshing ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {refreshing ? '...' : '↻ REFRESH'}
        </button>
      </div>
    </div>
  );
}
