const W = 320
const H = 100
const PAD = { top: 8, right: 10, bottom: 4, left: 36 }
const iW  = W - PAD.left - PAD.right
const iH  = H - PAD.top  - PAD.bottom

export default function WeightGraph({ entries }) {
  const pts = entries
    .filter((e) => e.weight_kg != null)
    .slice(0, 30)
    .reverse() // oldest → left

  if (pts.length < 2) {
    return (
      <p className="text-xs text-zinc-600 text-center py-4 italic">
        Log weight in at least 2 check-ins to see the trend.
      </p>
    )
  }

  const weights = pts.map((e) => Number(e.weight_kg))
  const minW    = Math.min(...weights)
  const maxW    = Math.max(...weights)
  const range   = maxW - minW || 0.5
  const latest  = weights[weights.length - 1]
  const delta   = latest - weights[0]

  const cx = (i) => PAD.left + (i / (pts.length - 1)) * iW
  const cy = (w) => PAD.top  + (1 - (w - minW) / range) * iH

  const linePts = pts.map((e, i) => `${cx(i)},${cy(Number(e.weight_kg))}`).join(' ')

  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 mb-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Weight Trend</p>
        <div className="text-right">
          <span className="text-sm font-bold text-violet-400 tabular-nums">{latest} kg</span>
          {delta !== 0 && (
            <span className={`text-xs ml-2 font-semibold tabular-nums ${delta > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {delta > 0 ? '+' : ''}{delta.toFixed(1)}
            </span>
          )}
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible">
        {/* Grid lines */}
        {[0, 0.5, 1].map((t) => (
          <line key={t}
            x1={PAD.left} x2={W - PAD.right}
            y1={PAD.top + t * iH} y2={PAD.top + t * iH}
            stroke="#3f3f46" strokeWidth="1"
          />
        ))}
        {/* Y-axis labels */}
        <text x={PAD.left - 4} y={PAD.top + 4}    textAnchor="end" fill="#71717a" fontSize="9">{maxW.toFixed(1)}</text>
        <text x={PAD.left - 4} y={PAD.top + iH + 4} textAnchor="end" fill="#71717a" fontSize="9">{minW.toFixed(1)}</text>
        {/* Line */}
        <polyline points={linePts} fill="none" stroke="#8b5cf6" strokeWidth="2"
          strokeLinejoin="round" strokeLinecap="round" />
        {/* Dots */}
        {pts.map((e, i) => (
          <circle key={i} cx={cx(i)} cy={cy(Number(e.weight_kg))} r="2.5" fill="#8b5cf6" />
        ))}
        {/* Latest dot highlight */}
        <circle cx={cx(pts.length - 1)} cy={cy(latest)} r="4.5" fill="#8b5cf6" />
        <circle cx={cx(pts.length - 1)} cy={cy(latest)} r="7" fill="#8b5cf6" fillOpacity="0.2" />
      </svg>

      <p className="text-xs text-zinc-600 text-right mt-1">{pts.length} entries</p>
    </div>
  )
}
