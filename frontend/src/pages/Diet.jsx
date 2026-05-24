import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import MealForm from '../modules/diet/MealForm'
import DailyProtein from '../modules/diet/DailyProtein'
import MealPlanList from '../modules/diet/MealPlanList'
import { MEAL_PLAN } from '../data/mealTemplates'

const LIGHT_TYPES  = new Set(['Cardio', 'Rest'])
const CAL_TRAINING = 2400
const CAL_LIGHT    = 2050

function todayBounds() {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 1)
  return { start: start.toISOString(), end: end.toISOString() }
}

export default function Diet() {
  const [meals, setMeals]               = useState([])
  const [loading, setLoading]           = useState(true)
  const [templateTotals, setTemplateTotals] = useState({ protein: 0, calories: 0 })
  const [calorieTarget, setCalorieTarget]   = useState(CAL_TRAINING)

  useEffect(() => {
    const { start, end } = todayBounds()
    Promise.all([
      supabase.from('diet_logs').select('*').gte('logged_at', start).lt('logged_at', end).order('logged_at', { ascending: true }),
      supabase.from('fitness_logs').select('type').gte('logged_at', start).lt('logged_at', end).limit(1).maybeSingle(),
    ]).then(([{ data: dietData }, { data: wod }]) => {
      setMeals(dietData || [])
      setCalorieTarget(wod && LIGHT_TYPES.has(wod.type) ? CAL_LIGHT : CAL_TRAINING)
      setLoading(false)
    })
  }, [])

  async function handleAdd(meal) {
    const tempId = `temp-${Date.now()}`
    setMeals((prev) => [...prev, { ...meal, id: tempId, logged_at: new Date().toISOString() }])
    const { data, error } = await supabase.from('diet_logs').insert(meal).select().single()
    if (!error) setMeals((prev) => prev.map((m) => m.id === tempId ? data : m))
    else        setMeals((prev) => prev.filter((m) => m.id !== tempId))
  }

  async function handleDelete(id) {
    setMeals((prev) => prev.filter((m) => m.id !== id))
    await supabase.from('diet_logs').delete().eq('id', id)
  }

  const customProtein  = meals.reduce((s, m) => s + Number(m.protein_g || 0), 0)
  const customCalories = meals.reduce((s, m) => s + Number(m.calories  || 0), 0)
  const customCarbs    = meals.reduce((s, m) => s + Number(m.carbs_g   || 0), 0)
  const customFat      = meals.reduce((s, m) => s + Number(m.fat_g     || 0), 0)
  const proteinTotal   = templateTotals.protein  + customProtein
  const calorieTotal   = templateTotals.calories + customCalories
  const carbsTotal     = customCarbs   // template plan doesn't track carbs/fat
  const fatTotal       = customFat
  const isLight        = calorieTarget === CAL_LIGHT
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="min-h-screen bg-zinc-950 max-w-md mx-auto">
      <div className="px-5 pt-14 pb-4">
        <p className="text-xs font-semibold text-green-400 uppercase tracking-widest mb-1">Diet</p>
        <h1 className="text-3xl font-bold text-zinc-50 tracking-tight">{today}</h1>
        <p className="text-sm mt-1.5 font-medium text-zinc-400">
          {isLight ? '🚶 Light day — 2,050 kcal' : '💪 Training day — 2,400 kcal'}
        </p>
      </div>

      <div className="pb-2">
        {loading
          ? <p className="text-center text-sm text-zinc-600 py-6 px-4">Loading…</p>
          : <DailyProtein
              meals={meals}
              onDelete={handleDelete}
              proteinTotal={proteinTotal}
              calorieTotal={calorieTotal}
              calorieTarget={calorieTarget}
              carbsTotal={carbsTotal}
              fatTotal={fatTotal}
            />
        }
      </div>

      <MealPlanList meals={MEAL_PLAN} onTotalsChange={setTemplateTotals} />

      <div className="px-4 pt-4 pb-2">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2 px-1">Add Extra Meal</p>
      </div>
      <MealForm onAdd={handleAdd} />
    </div>
  )
}
