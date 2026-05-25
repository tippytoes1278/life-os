// Inline SVG sparkline — last 5 sessions, oldest → newest (left → right)
// sessions: [{best_weight, best_reps, date}] descending (we reverse internally)

export default function ExerciseSparkline({ sessions }) {
  if (!sessions || sessions.length < 2) return null

  const vals = [...sessions]
    .reverse()
    .map((s) => Number(s.best_weight) || 0)
    .filter(Boolean)
  if (vals.length < 2) return null

  const W = 52, H = 14
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const range = max - min || 1

  const px = (i) => ((i / (vals.length - 1)) * W).toFixed(1)
  const py = (v)  => (H - ((v - min) / range) * (H - 3) - 1.5).toFixed(1)

  const points = vals.map((v, i) => `${px(i)},${py(v)}`).join(' ')
  const last   = vals[vals.length - 1]
  const prev   = vals[vals.length - 2]
  const color  = last > prev ? '#4ade80' : last < prev ? '#f87171' : '#facc15'

  return (
    <svg
      width={W} height={H + 2}
      viewBox={`0 0 ${W} ${H + 2}`}
      className="shrink-0 opacity-75"
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={px(vals.length - 1)} cy={py(last)} r="2" fill={color} />
    </svg>
  )
}
