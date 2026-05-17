import { useState } from 'react'

export default function MealForm({ onAdd }) {
  const [name, setName]       = useState('')
  const [protein, setProtein] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const p = Number(protein)
    if (!name.trim() || !p || p <= 0) return
    onAdd({ meal_name: name.trim(), protein_g: p })
    setName('')
    setProtein('')
  }

  const isValid = name.trim() && Number(protein) > 0

  return (
    <form onSubmit={handleSubmit} className="mx-4 bg-zinc-900 rounded-2xl border border-zinc-800 px-4 py-4 mb-4">
      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">Log a Meal</p>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Meal name…"
          className="flex-1 bg-zinc-800 border-2 border-zinc-700 text-zinc-100 placeholder:text-zinc-600
            px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-green-500 transition-colors"
        />
        <div className="relative w-24 shrink-0">
          <input
            type="number" min="0" max="300" step="0.5"
            value={protein} onChange={(e) => setProtein(e.target.value)}
            placeholder="0"
            className="w-full bg-zinc-800 border-2 border-zinc-700 text-zinc-100 placeholder:text-zinc-600
              px-3 pr-7 py-3 rounded-xl text-sm text-center focus:outline-none focus:border-green-500 transition-colors"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 pointer-events-none">g</span>
        </div>
      </div>
      <button
        type="submit" disabled={!isValid}
        className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-150 ${
          isValid
            ? 'bg-green-600 text-white hover:bg-green-500 active:scale-95'
            : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
        }`}
      >
        Add Meal
      </button>
    </form>
  )
}
