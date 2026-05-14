// src/components/ui.jsx
// Petits composants réutilisables dans tout le dashboard

export const VB_COLOR = { '1': '#00e5a0', 'N': '#f5c518', '2': '#ff6b35' };
export const VB_LABEL = { '1': 'DOM', 'N': 'NUL', '2': 'EXT' };

export const fmtDate = iso => {
  if (!iso) return 'Date inconnue';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return 'Date inconnue';
  return d.toLocaleDateString('fr-FR', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit',
  });
};

export const timeAgo = iso => {
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (s < 60)   return `il y a ${s}s`;
  if (s < 3600) return `il y a ${Math.floor(s / 60)}min`;
  return `il y a ${Math.floor(s / 3600)}h`;
};

// Barre de probabilités 1 / N / 2
export function ProbaBar({ p1, pN, p2 }) {
  return (
    <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', height: 10, gap: 2 }}>
      <div style={{ width: `${p1}%`, background: '#00e5a0', transition: 'width 0.6s ease' }} />
      <div style={{ width: `${pN}%`, background: '#f5c518', transition: 'width 0.6s ease' }} />
      <div style={{ width: `${p2}%`, background: '#ff6b35', transition: 'width 0.6s ease' }} />
    </div>
  );
}

// Anneau de confiance SVG
export function ConfidenceRing({ value }) {
  const r = 22, cx = 28, cy = 28;
  const circ = 2 * Math.PI * r;
  const dash  = (value / 100) * circ;
  const color = value >= 80 ? '#00e5a0' : value >= 60 ? '#f5c518' : '#ff6b35';
  return (
    <svg width={56} height={56}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e2535" strokeWidth={5} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dasharray 0.8s ease' }} />
      <text x={cx} y={cy + 5} textAnchor="middle" fill={color}
        style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>
        {value}
      </text>
    </svg>
  );
}

// Badge value bet
export function ValueBadge({ vb, edge }) {
  if (!vb || vb === 'aucun') return null;
  const color = VB_COLOR[vb];
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: `${color}18`, border: `1px solid ${color}55`,
      borderRadius: 6, padding: '3px 10px',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, display: 'inline-block' }} />
      <span style={{ color, fontSize: 11, fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>
        VALUE {VB_LABEL[vb]} +{edge}%
      </span>
    </div>
  );
}

// Pastille score
export function ScoreTag({ s }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      background: '#1e2535', borderRadius: 8, padding: '6px 12px', minWidth: 52,
    }}>
      <span style={{ fontSize: 15, fontFamily: "'DM Mono', monospace", color: '#e8eaf0', fontWeight: 700 }}>{s.score}</span>
      <span style={{ fontSize: 10, color: '#5a6480', marginTop: 2 }}>{s.probabilite}%</span>
    </div>
  );
}
