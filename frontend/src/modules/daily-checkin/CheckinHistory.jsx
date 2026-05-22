import WeightGraph from './WeightGraph'

const MOOD_E   = ['', '😞', '😕', '😐', '🙂', '😄']
const ENERGY_E = ['', '🪫', '😴', '⚡', '🔥', '🚀']

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function ratingColor(n) {
  return n <= 3 ? 'text-red-400' : n <= 6 ? 'text-amber-400' : 'text-green-400'
}

function DayCard({ morning, evening }) {
  const entry   = morning || evening
  const dateStr = entry ? formatDate(entry.logged_at) : ''
  const isLegacy = entry?.log_type === 'legacy' || (!entry?.log_type)

  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 mb-3">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">{dateStr}</span>
        <div className="flex items-center gap-2">
          {morning?.weight_kg && <span className="text-xs font-semibold text-violet-400 tabular-nums">{morning.weight_kg} kg</span>}
          {morning && !isLegacy && <span className="text-lg">{MOOD_E[morning.mood]}{ENERGY_E[morning.energy]}</span>}
          {evening?.day_rating && <span className={`text-sm font-bold tabular-nums ${ratingColor(evening.day_rating)}`}>{evening.day_rating}/10</span>}
        </div>
      </div>

      {/* Legacy format */}
      {isLegacy && entry && (
        <>
          <div className="flex gap-2 text-lg mb-2">{MOOD_E[entry.mood]}{ENERGY_E[entry.energy]}</div>
          {entry.wins?.filter(Boolean).map((w, i) => (
            <p key={i} className="flex gap-2 text-sm text-zinc-300"><span className="text-violet-500">✓</span>{w}</p>
          ))}
        </>
      )}

      {/* New format: morning */}
      {morning && !isLegacy && morning.todos?.filter(Boolean).length > 0 && (
        <div className="mb-2">
          <p className="text-xs text-zinc-600 uppercase tracking-widest mb-1">🌅 To-dos</p>
          {morning.todos.filter(Boolean).map((t, i) => {
            const done = evening?.todos?.includes(t)
            return (
              <p key={i} className={`text-sm flex gap-2 ${done ? 'text-zinc-600 line-through' : 'text-zinc-300'}`}>
                <span>{done ? '✓' : '○'}</span>{t}
              </p>
            )
          })}
        </div>
      )}

      {/* New format: evening wins */}
      {evening && !isLegacy && evening.wins?.filter(Boolean).length > 0 && (
        <div className="mt-2 pt-2 border-t border-zinc-800">
          <p className="text-xs text-zinc-600 uppercase tracking-widest mb-1">🌙 Wins</p>
          {evening.wins.filter(Boolean).map((w, i) => (
            <p key={i} className="flex gap-2 text-sm text-zinc-300"><span className="text-violet-500">✓</span>{w}</p>
          ))}
          {evening.improvement && <p className="text-xs text-zinc-500 italic mt-1.5">"{evening.improvement}"</p>}
        </div>
      )}
    </div>
  )
}

function groupByDate(entries) {
  const map = {}
  for (const e of entries) {
    const key = e.logged_at.split('T')[0]
    if (!map[key]) map[key] = {}
    if (e.log_type === 'morning')                       map[key].morning = e
    else if (e.log_type === 'evening')                  map[key].evening = e
    else                                                map[key].morning = e // legacy → treat as morning
  }
  return Object.entries(map)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([, v]) => v)
}

export default function CheckinHistory({ entries = [] }) {
  if (!entries.length) return (
    <p className="text-center py-10 text-zinc-600 text-sm">No check-ins yet — fill in today's above.</p>
  )

  const days      = groupByDate(entries)
  const mornings  = entries.filter((e) => e.log_type === 'morning' || e.log_type === 'legacy')
  const hasWeight = mornings.some((e) => e.weight_kg != null)

  return (
    <div className="px-4 pb-4">
      {hasWeight && (
        <>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2 px-1">Weight</p>
          <WeightGraph entries={mornings} />
        </>
      )}
      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3 px-1">History</p>
      {days.map((day, i) => <DayCard key={i} morning={day.morning} evening={day.evening} />)}
    </div>
  )
}
