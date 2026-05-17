function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function computeStreak(completedDates) {
  const today = todayStr()
  const set = new Set(completedDates)
  const d = new Date()
  if (!set.has(today)) d.setDate(d.getDate() - 1)
  let streak = 0
  while (set.has(d.toISOString().split('T')[0])) {
    streak++
    d.setDate(d.getDate() - 1)
  }
  return streak
}

export default function HabitRow({ habit, onToggle, onDelete }) {
  const today  = todayStr()
  const done   = habit.completedDates.includes(today)
  const streak = computeStreak(habit.completedDates)

  return (
    <div className={`rounded-2xl border px-4 py-4 flex items-center gap-4 transition-all duration-200 ${
      done ? 'bg-emerald-500/10 border-emerald-500/25' : 'bg-zinc-900 border-zinc-800'
    }`}>
      <button
        onClick={() => onToggle(habit.id)}
        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
          done ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-600 hover:border-emerald-500'
        }`}
      >
        {done && (
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <span className={`flex-1 text-sm font-medium transition-colors ${
        done ? 'text-emerald-300 line-through decoration-emerald-600' : 'text-zinc-100'
      }`}>
        {habit.name}
      </span>

      {streak > 0 && (
        <span className="flex items-center gap-1 text-xs font-bold text-orange-400 shrink-0">
          🔥 {streak}
        </span>
      )}

      <button
        onClick={() => onDelete(habit.id)}
        aria-label="Delete habit"
        className="text-zinc-700 hover:text-red-500 transition-colors shrink-0"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
