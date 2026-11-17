'use client';
// Lightweight SVG charts (no dependencies).
export function LineChart({ data, color = '#2F5BFF', fmt = (n: number) => n.toLocaleString('en-IN'), height = 200, label }: { data: { x: string; y: number }[]; color?: string; fmt?: (n: number) => string; height?: number; label: string }) {
  const W = 640, H = height, P = { l: 48, r: 12, t: 12, b: 26 };
  if (!data.length) return <div className="empty small">No data yet.</div>;
  const max = Math.max(...data.map(d => d.y), 1) * 1.1; const xs = (i: number) => P.l + (data.length === 1 ? (W - P.l - P.r) / 2 : (i * (W - P.l - P.r)) / (data.length - 1)); const ys = (v: number) => P.t + (H - P.t - P.b) * (1 - v / max);
  const line = data.map((d, i) => `${i ? 'L' : 'M'}${xs(i).toFixed(1)} ${ys(d.y).toFixed(1)}`).join(' ');
  const ticks = [0, 0.5, 1].map(k => max * k / 1.1);
  return (<svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label={label}>
    <defs><linearGradient id={'lg' + color.slice(1)} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={color} stopOpacity=".25" /><stop offset="1" stopColor={color} stopOpacity="0" /></linearGradient></defs>
    {ticks.map(t => <g key={t}><line x1={P.l} x2={W - P.r} y1={ys(t)} y2={ys(t)} stroke="#E3E6EE" /><text x={P.l - 8} y={ys(t) + 4} textAnchor="end" fontSize="11" fill="#8A93A6">{fmt(Math.round(t))}</text></g>)}
    <path d={`${line} L${xs(data.length - 1)} ${H - P.b} L${xs(0)} ${H - P.b} Z`} fill={`url(#lg${color.slice(1)})`} />
    <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" className="chart-line" />
    {data.map((d, i) => <g key={i}><circle cx={xs(i)} cy={ys(d.y)} r="3.5" fill="#fff" stroke={color} strokeWidth="2"><title>{`${d.x}: ${fmt(d.y)}`}</title></circle>
      {(data.length < 12 || i % Math.ceil(data.length / 10) === 0) && <text x={xs(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="#8A93A6">{d.x}</text>}</g>)}
  </svg>);
}
export function Bars({ data, fmt = (n: number) => n.toLocaleString('en-IN') }: { data: { label: string; value: number; color: string; icon?: React.ReactNode }[]; fmt?: (n: number) => string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (<div className="hbars">{data.map(d => (<div key={d.label} className="hbar"><span className="row" style={{ gap: 6 }}>{d.icon}{d.label}</span><span className="bar"><span style={{ width: (d.value / max * 100) + '%', background: d.color, transform: 'scaleX(1)' }} /></span><b>{fmt(d.value)}</b></div>))}</div>);
}
