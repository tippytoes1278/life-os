import { useState } from 'react'

function CheckIcon() {
  return (
    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

function MealRow({ meal, done, protein, onToggle, onProteinChange, isLast }) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer active:bg-zinc-800/50 transition-colors ${isLast ? '' : 'border-b border-zinc-800'}`}
      onClick={onToggle}
    >
      <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
        done ? 'bg-green-500 border-green-500' : 'border-zinc-600'
      }`}>
        {done && <CheckIcon />}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs text-zinc-500 mb-0.5">{meal.time}</p>
        <p className={`text-sm font-medium leading-snug ${done ? 'text-zinc-600 line-through' : 'text-zinc-200'}`}>
          {meal.name}
        </p>
      </div>

      <div className="flex flex-col items-end gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-1">
          <input
            type="number" min="0" max="200" value={protein}
            onChange={(e) => onProteinChange(e.target.value)}
            className="w-10 bg-zinc-800 text-green-400 text-sm font-bold text-right rounded-lg px-1.5 py-1 border border-transparent focus:border-zinc-600 focus:outline-none tabular-nums"
          />
          <span className="text-xs text-zinc-600">g</span>
        </div>
        <span className="text-xs text-zinc-600 tabular-nums">{meal.calories} kcal</span>
      </div>
    </div>
  )
}

export default function MealPlanList({ meals, onTotalsChange }) {
  const [done, setDone]       = useState({})
  const [protein, setProtein] = useState(
    Object.fromEntries(meals.map((m) => [m.id, String(m.protein)]))
  )

  function recompute(nextDone, nextProtein) {
    const checked = meals.filter((m) => nextDone[m.id])
    onTotalsChange({
      protein:  checked.reduce((s, m) => s + Number(nextProtein[m.id] || 0), 0),
      calories: checked.reduce((s, m) => s + (m.calories || 0), 0),
    })
  }

  function toggle(id) {
    const next = { ...done, [id]: !done[id] }
    setDone(next)
    recompute(next, protein)
  }

  function updateProtein(id, val) {
    const next = { ...protein, [id]: val }
    setProtein(next)
    recompute(done, next)
  }

  return (
    <div className="px-4 pb-2">
      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2 px-1">Meal Plan</p>
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
        {meals.map((meal, i) => (
          <MealRow
            key={meal.id}
            meal={meal}
            done={done[meal.id] || false}
            protein={protein[meal.id]}
            onToggle={() => toggle(meal.id)}
            onProteinChange={(val) => updateProtein(meal.id, val)}
            isLast={i === meals.length - 1}
          />
        ))}
      </div>
    </div>
  )
}
