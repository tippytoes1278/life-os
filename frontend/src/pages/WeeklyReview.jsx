import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import WeekSummary from '../modules/weekly-review/WeeklyReview'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

function getWeekBounds() {
  const today = new Date()
  const daysFromMonday = (today.getDay() + 6) % 7
  const monday = new Date(today)
  monday.setDate(today.getDate() - daysFromMonday)
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  return { monday, sunday }
}

function weekDateStrings(monday) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.toISOString().split('T')[0]
  })
}

function computeStats(checkins, habits, fitness) {
  const { monday } = getWeekBounds()
  const weekDates  = weekDateStrings(monday)
  const avgMood    = checkins.length ? checkins.reduce((s, e) => s + e.mood, 0)   / checkins.length : 0
  const avgEnergy  = checkins.length ? checkins.reduce((s, e) => s + e.energy, 0) / checkins.length : 0
  let habitRate = 0
  if (habits.length > 0) {
    const completed = habits.reduce((sum, h) => {
      const dates = (h.habit_completions || []).map((c) => c.completed_date)
      return sum + weekDates.filter((d) => dates.includes(d)).length
    }, 0)
    habitRate = (completed / (habits.length * 7)) * 100
  }
  const workouts        = fitness.filter((e) => e.type !== 'Rest')
  const workoutCount    = workouts.length
  const workoutBreakdown = ['Push', 'Pull', 'Legs', 'Cardio']
    .map((type) => ({ type, count: workouts.filter((e) => e.type === type).length }))
    .filter((x) => x.count > 0)
  return { avgMood, avgEnergy, checkinCount: checkins.length, habitRate, habitCount: habits.length, workoutCount, workoutBreakdown }
}

function formatWeekLabel(monday, sunday) {
  const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${fmt(monday)} – ${fmt(sunday)}, ${sunday.getFullYear()}`
}

export default function WeeklyReview() {
  const [rawData, setRawData]       = useState(null)
  const [review, setReview]         = useState('')
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError]     = useState('')

  useEffect(() => {
    const { monday, sunday } = getWeekBounds()
    const iso = (d) => d.toISOString()
    Promise.all([
      supabase.from('checkins').select('mood, energy').gte('logged_at', iso(monday)).lte('logged_at', iso(sunday)),
      supabase.from('habits').select('id, habit_completions(completed_date)'),
      supabase.from('fitness_logs').select('type').gte('logged_at', iso(monday)).lte('logged_at', iso(sunday)),
    ]).then(([c, h, f]) => {
      setRawData({ checkins: c.data || [], habits: h.data || [], fitness: f.data || [] })
    })
  }, [])

  async function handleGenerate() {
    setGenerating(true); setGenError(''); setReview('')
    try {
      const res = await fetch(`${API_URL}/api/review/generate`, { method: 'POST' })
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      const data = await res.json()
      setReview(data.review)
    } catch (err) {
      setGenError(err.message || 'Failed to generate')
    } finally {
      setGenerating(false)
    }
  }

  const { monday, sunday } = getWeekBounds()
  const weekLabel = formatWeekLabel(monday, sunday)

  return (
    <div className="min-h-screen bg-zinc-950 max-w-md mx-auto">
      <div className="px-5 pt-14 pb-6">
        <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-1">Weekly Review</p>
        <h1 className="text-3xl font-bold text-zinc-50 tracking-tight">This Week</h1>
      </div>

      <div className="pb-2">
        {rawData
          ? <WeekSummary stats={computeStats(rawData.checkins, rawData.habits, rawData.fitness)} weekLabel={weekLabel} />
          : <p className="text-center text-sm text-zinc-600 py-10">Loading…</p>
        }
      </div>

      {/* AI Review */}
      <div className="px-4 pb-10">
        {!review && (
          <button onClick={handleGenerate} disabled={generating}
            className={`w-full py-4 rounded-2xl font-semibold text-base transition-all duration-150 ${
              generating
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-amber-500 text-zinc-950 hover:bg-amber-400 active:scale-95'
            }`}>
            {generating ? 'Generating…' : '✨ Generate AI Review'}
          </button>
        )}
        {genError && <p className="text-center text-sm text-red-400 mt-3">{genError}</p>}
        {review && (
          <div className="bg-zinc-900 rounded-2xl border border-amber-500/20 p-5">
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-3">AI Review</p>
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{review}</p>
            <button onClick={handleGenerate} disabled={generating}
              className="mt-4 text-xs text-amber-500 underline underline-offset-2 disabled:opacity-40">
              {generating ? 'Regenerating…' : 'Regenerate'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
