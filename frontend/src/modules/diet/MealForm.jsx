import { useState } from 'react'

export default function MealForm({ onAdd }) {
  const [name, setName]         = useState('')
  const [protein, setProtein]   = useState('')
  const [calories, setCalories] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const p = Number(protein)
    if (!name.trim() || !p || p <= 0) return
    onAdd({
      meal_name: name.trim(),
      protein_g: p,
      calories:  calories !== '' ? Number(calories) : null,
    })
    setName(''); setProtein(''); setCalories('')
  }

  const isValid = name.trim() && Number(protein) > 0
  const inputCls = 'bg-zinc-800 border-2 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 rounded-xl text-sm focus:outline-none focus:border-green-500 transition-colors'

  return (
    <form onSubmit={handleSubmit} className="mx-4 bg-zinc-900 rounded-2xl border border-zinc-800 px-4 py-4 mb-4">
      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">Log a Meal</p>
      <input
        type="text" value={name} onChange={(e) => setName(e.target.value)}
        placeholder="Meal name…"
        className={`w-full px-4 py-3 mb-2 ${inputCls}`}
      />
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <input
            type="number" min="0" max="300" step="0.5" value={protein}
            onChange={(e) => setProtein(e.target.value)} placeholder="Protein"
            className={`w-full px-3 pr-6 py-3 text-center ${inputCls}`}
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-500 pointer-events-none">g</span>
        </div>
        <div className="relative flex-1">
          <input
            type="number" min="0" max="2000" value={calories}
            onChange={(e) => setCalories(e.target.value)} placeholder="Calories"
            className={`w-full px-3 pr-10 py-3 text-center ${inputCls}`}
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-500 pointer-events-none">kcal</span>
        </div>
      </div>
      <button
        type="submit" disabled={!isValid}
        className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-150 ${
          isValid ? 'bg-green-600 text-white hover:bg-green-500 active:scale-95' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
        }`}
      >
        Add Meal
      </button>
    </form>
  )
}
