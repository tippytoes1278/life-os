const CATEGORIES = ['Breakfast', 'Pre-Workout', 'Post-Workout', 'Lunch', 'Snack', 'Dinner']

function fmt(n) {
  if (n == null || n === '') return null
  const v = Number(n)
  return isNaN(v) ? null : v % 1 === 0 ? String(v) : v.toFixed(1)
}

function MacroPill({ value, unit, color }) {
  if (value == null) return null
  return (
    <span className={`text-xs font-semibold tabular-nums ${color}`}>
      {value}{unit}
    </span>
  )
}

function MealCard({ meal, onDelete }) {
  const protein = fmt(meal.protein_g)
  const cals    = fmt(meal.calories)
  const carbs   = fmt(meal.carbs_g)
  const fat     = fmt(meal.fat_g)

  return (
    <div className="flex items-start gap-3 py-3 border-b border-zinc-800 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-200 truncate">{meal.meal_name}</p>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
          {protein != null && <MacroPill value={protein} unit="g protein" color="text-green-400" />}
          {cals    != null && <MacroPill value={cals}    unit=" kcal"     color="text-orange-400" />}
          {carbs   != null && <MacroPill value={carbs}   unit="g carbs"   color="text-blue-400" />}
          {fat     != null && <MacroPill value={fat}     unit="g fat"     color="text-yellow-400" />}
        </div>
      </div>
      <button
        onClick={() => onDelete(meal.id)}
        className="text-zinc-700 hover:text-red-500 transition-colors p-1 shrink-0 mt-0.5"
        aria-label="Remove"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

export default function MealsByCategory({ meals, onDelete }) {
  if (!meals.length) return null

  // Group by category; meals without a category fall under 'Other'
  const grouped = {}
  meals.forEach((m) => {
    const cat = m.category || 'Other'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(m)
  })

  // Render in canonical order, then any extras alphabetically
  const order = [...CATEGORIES, 'Other']
  const keys  = order.filter((c) => grouped[c])

  return (
    <div className="px-4 space-y-3 mt-3">
      {keys.map((cat) => (
        <div key={cat} className="bg-zinc-900 rounded-2xl border border-zinc-800 px-4 py-1">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest pt-3 pb-1">{cat}</p>
          {grouped[cat].map((meal) => (
            <MealCard key={meal.id} meal={meal} onDelete={onDelete} />
          ))}
        </div>
      ))}
    </div>
  )
}
