const PROTEIN_TARGET = 150

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function MealRow({ meal, onDelete }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-zinc-800 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-200 truncate">{meal.meal_name}</p>
        {meal.logged_at && (
          <p className="text-xs text-zinc-600 mt-0.5">{formatTime(meal.logged_at)}</p>
        )}
      </div>
      <span className="text-sm font-bold text-green-400 shrink-0 tabular-nums">{meal.protein_g}g</span>
      <button onClick={() => onDelete(meal.id)}
        className="text-zinc-700 hover:text-red-500 transition-colors p-1 shrink-0" aria-label="Remove meal">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

export default function DailyProtein({ meals, onDelete, totalOverride }) {
  const customTotal = meals.reduce((sum, m) => sum + Number(m.protein_g), 0)
  const total       = totalOverride !== undefined ? totalOverride : customTotal
  const remaining = Math.max(PROTEIN_TARGET - total, 0)
  const pct       = Math.min((total / PROTEIN_TARGET) * 100, 100)
  const reached   = total >= PROTEIN_TARGET

  return (
    <div className="px-4 space-y-3 pb-4">
      {/* Protein summary card */}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5">
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-1">Today's Protein</p>
            <p className="text-4xl font-bold text-zinc-50 tabular-nums leading-none">
              {total % 1 === 0 ? total : total.toFixed(1)}
              <span className="text-xl font-normal text-zinc-500 ml-1">g</span>
            </p>
          </div>
          <div className="text-right">
            <p className={`text-sm font-semibold ${reached ? 'text-amber-400' : 'text-green-400'}`}>
              {reached ? '🎯 Goal hit!' : `${remaining}g to go`}
            </p>
            <p className="text-xs text-zinc-600 mt-0.5">{PROTEIN_TARGET}g target</p>
          </div>
        </div>
        <div className="h-2.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${reached ? 'bg-amber-400' : 'bg-green-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Meal list */}
      {meals.length > 0 ? (
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 px-4 py-1">
          {meals.map((meal) => <MealRow key={meal.id} meal={meal} onDelete={onDelete} />)}
        </div>
      ) : (
        <p className="text-center py-8 text-zinc-600 text-sm">No meals logged yet today.</p>
      )}
    </div>
  )
}
