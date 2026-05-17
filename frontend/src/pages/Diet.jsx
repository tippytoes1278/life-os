import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import MealForm from '../modules/diet/MealForm'
import DailyProtein from '../modules/diet/DailyProtein'
import MealPlanList from '../modules/diet/MealPlanList'
import { MEAL_PLAN, DAILY_TARGET } from '../data/mealTemplates'

function todayBounds() {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 1)
  return { start: start.toISOString(), end: end.toISOString() }
}

export default function Diet() {
  const [meals, setMeals]             = useState([])
  const [loading, setLoading]         = useState(true)
  const [templateTotal, setTemplateTotal] = useState(0)

  useEffect(() => {
    const { start, end } = todayBounds()
    supabase
      .from('diet_logs')
      .select('*')
      .gte('logged_at', start).lt('logged_at', end)
      .order('logged_at', { ascending: true })
      .then(({ data }) => { setMeals(data || []); setLoading(false) })
  }, [])

  async function handleAdd(meal) {
    const tempId = `temp-${Date.now()}`
    setMeals((prev) => [...prev, { ...meal, id: tempId, logged_at: new Date().toISOString() }])
    const { data, error } = await supabase.from('diet_logs').insert(meal).select().single()
    if (!error) {
      setMeals((prev) => prev.map((m) => m.id === tempId ? data : m))
    } else {
      setMeals((prev) => prev.filter((m) => m.id !== tempId))
    }
  }

  async function handleDelete(id) {
    setMeals((prev) => prev.filter((m) => m.id !== id))
    await supabase.from('diet_logs').delete().eq('id', id)
  }

  const customProtein = meals.reduce((sum, m) => sum + Number(m.protein_g), 0)
  const totalProtein  = templateTotal + customProtein
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="min-h-screen bg-zinc-950 max-w-md mx-auto">
      <div className="px-5 pt-14 pb-6">
        <p className="text-xs font-semibold text-green-400 uppercase tracking-widest mb-1">Diet</p>
        <h1 className="text-3xl font-bold text-zinc-50 tracking-tight">{today}</h1>
      </div>

      {/* Protein progress */}
      <div className="pb-4">
        {loading
          ? <p className="text-center text-sm text-zinc-600 py-6">Loading…</p>
          : <DailyProtein meals={meals} onDelete={handleDelete} totalOverride={totalProtein} />
        }
      </div>

      {/* Template meal plan */}
      <MealPlanList meals={MEAL_PLAN} onTotalChange={setTemplateTotal} />

      {/* Custom meal form */}
      <div className="px-4 pt-4 pb-2">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2 px-1">Add Extra Meal</p>
      </div>
      <MealForm onAdd={handleAdd} />
    </div>
  )
}
