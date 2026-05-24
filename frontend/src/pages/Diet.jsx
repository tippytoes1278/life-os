import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import DailyProtein from '../modules/diet/DailyProtein'
import MealsByCategory from '../modules/diet/MealsByCategory'
import MealForm from '../modules/diet/MealForm'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const LIGHT_TYPES = new Set(['Cardio', 'Rest'])

const TARGETS = {
  training: { calories: 2400, protein: 150, carbs: 250, fat: 70 },
  light:    { calories: 2000, protein: 150, carbs: 250, fat: 70 },
}

function todayBounds() {
  const start = new Date(); start.setHours(0, 0, 0, 0)
  const end   = new Date(start); end.setDate(end.getDate() + 1)
  return { start: start.toISOString(), end: end.toISOString() }
}

function sum(meals, field) {
  return meals.reduce((s, m) => s + Number(m[field] || 0), 0)
}

export default function Diet() {
  const [meals, setMeals]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [isLight, setIsLight]   = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    const { start, end } = todayBounds()
    Promise.all([
      fetch(`${API_URL}/api/diet`).then((r) => r.json()),
      supabase.from('fitness_logs').select('type').gte('logged_at', start).lt('logged_at', end).limit(1).maybeSingle(),
    ]).then(([dietData, { data: wod }]) => {
      setMeals(Array.isArray(dietData) ? dietData : [])
      setIsLight(wod && LIGHT_TYPES.has(wod.type))
      setLoading(false)
    })
  }, [])

  function handleAdd(meal) {
    // MealForm has already POSTed and returns the persisted row
    setMeals((prev) => [...prev, meal])
    setShowForm(false)
  }

  async function handleDelete(id) {
    setMeals((prev) => prev.filter((m) => m.id !== id))
    await fetch(`${API_URL}/api/diet/${id}`, { method: 'DELETE' })
  }

  const targets = isLight ? TARGETS.light : TARGETS.training
  const totals  = {
    calories: sum(meals, 'calories'),
    protein:  sum(meals, 'protein_g'),
    carbs:    sum(meals, 'carbs_g'),
    fat:      sum(meals, 'fat_g'),
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="min-h-screen bg-zinc-950 max-w-md mx-auto pb-32">
      {/* Header */}
      <div className="px-5 pt-14 pb-4">
        <p className="text-xs font-semibold text-green-400 uppercase tracking-widest mb-1">Diet</p>
        <h1 className="text-3xl font-bold text-zinc-50 tracking-tight">{today}</h1>
        <p className="text-sm mt-1.5 font-medium text-zinc-400">
          {isLight ? '🚶 Light day — 2,000 kcal target' : '💪 Training day — 2,400 kcal target'}
        </p>
      </div>

      {loading
        ? <p className="text-center text-sm text-zinc-600 py-6">Loading…</p>
        : (
          <>
            <DailyProtein
              calorieTotal={totals.calories} calorieTarget={targets.calories}
              proteinTotal={totals.protein}  proteinTarget={targets.protein}
              carbsTotal={totals.carbs}      carbsTarget={targets.carbs}
              fatTotal={totals.fat}          fatTarget={targets.fat}
            />
            <MealsByCategory meals={meals} onDelete={handleDelete} />
          </>
        )
      }

      {/* Log Meal FAB */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="fixed bottom-24 right-5 flex items-center gap-2 bg-green-600 hover:bg-green-500 active:scale-95 text-white font-semibold text-sm px-5 py-3 rounded-2xl shadow-lg shadow-green-900/40 transition-all duration-150 z-10"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Log Meal
        </button>
      )}

      {/* Bottom sheet form */}
      {showForm && (
        <>
          <div className="fixed inset-0 bg-black/60 z-20" onClick={() => setShowForm(false)} />
          <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-zinc-900 border-t border-zinc-800 rounded-t-3xl z-30 pb-safe">
            <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mt-3 mb-1" />
            <MealForm onAdd={handleAdd} onClose={() => setShowForm(false)} />
          </div>
        </>
      )}
    </div>
  )
}
