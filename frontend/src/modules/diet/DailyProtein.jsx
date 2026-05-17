const PROTEIN_TARGET = 150

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function ProgressBar({ value, target, color }) {
  const pct     = Math.min((value / target) * 100, 100)
  const reached = value >= target
  return (
    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${reached ? 'bg-amber-400' : color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
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
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-green-400 tabular-nums">{meal.protein_g}g</p>
        {meal.calories > 0 && (
          <p className="text-xs text-zinc-500 tabular-nums">{meal.calories} kcal</p>
        )}
      </div>
      <button onClick={() => onDelete(meal.id)}
        className="text-zinc-700 hover:text-red-500 transition-colors p-1 shrink-0" aria-label="Remove">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

export default function DailyProtein({ meals, onDelete, proteinTotal, calorieTotal, calorieTarget }) {
  const calReached  = calorieTotal  >= calorieTarget
  const protReached = proteinTotal  >= PROTEIN_TARGET

  return (
    <div className="px-4 space-y-3 pb-4">
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5 space-y-4">

        {/* Calories */}
        <div>
          <div className="flex items-end justify-between mb-2">
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-1">Calories</p>
              <p className="text-3xl font-bold text-zinc-50 tabular-nums leading-none">
                {calorieTotal}
                <span className="text-lg font-normal text-zinc-500 ml-1">kcal</span>
              </p>
            </div>
            <p className={`text-sm font-semibold ${calReached ? 'text-amber-400' : 'text-orange-400'}`}>
              {calReached ? '🎯 Hit!' : `${calorieTarget - calorieTotal} left`}
              <span className="block text-xs font-normal text-zinc-600">{calorieTarget} target</span>
            </p>
          </div>
          <ProgressBar value={calorieTotal} target={calorieTarget} color="bg-orange-500" />
        </div>

        <div className="border-t border-zinc-800" />

        {/* Protein */}
        <div>
          <div className="flex items-end justify-between mb-2">
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-1">Protein</p>
              <p className="text-3xl font-bold text-zinc-50 tabular-nums leading-none">
                {proteinTotal % 1 === 0 ? proteinTotal : proteinTotal.toFixed(1)}
                <span className="text-lg font-normal text-zinc-500 ml-1">g</span>
              </p>
            </div>
            <p className={`text-sm font-semibold ${protReached ? 'text-amber-400' : 'text-green-400'}`}>
              {protReached ? '🎯 Hit!' : `${PROTEIN_TARGET - proteinTotal}g left`}
              <span className="block text-xs font-normal text-zinc-600">{PROTEIN_TARGET}g target</span>
            </p>
          </div>
          <ProgressBar value={proteinTotal} target={PROTEIN_TARGET} color="bg-green-500" />
        </div>
      </div>

      {meals.length > 0 && (
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 px-4 py-1">
          {meals.map((meal) => <MealRow key={meal.id} meal={meal} onDelete={onDelete} />)}
        </div>
      )}
    </div>
  )
}
