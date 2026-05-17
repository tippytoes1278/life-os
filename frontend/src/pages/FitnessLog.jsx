import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import WorkoutForm from '../modules/fitness-log/WorkoutForm'
import WorkoutHistory from '../modules/fitness-log/WorkoutHistory'

function toEntryShape(row) {
  return {
    ...row,
    duration:          row.duration_minutes,
    weight:            row.body_weight_kg,
    date:              row.logged_at,
    workout_exercises: (row.workout_exercises || []).sort((a, b) => a.order_index - b.order_index),
  }
}

export default function FitnessLog() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('fitness_logs')
      .select('*, workout_exercises(*)')
      .order('logged_at', { ascending: false })
      .then(({ data }) => {
        setEntries((data || []).map(toEntryShape))
        setLoading(false)
      })
  }, [])

  async function handleSubmit(entry) {
    const { data, error } = await supabase
      .from('fitness_logs')
      .insert({ type: entry.type, duration_minutes: entry.duration ?? null,
        body_weight_kg: entry.weight ?? null, notes: entry.notes ?? null })
      .select().single()
    if (error) return
    if (entry.exercises?.length) {
      await supabase.from('workout_exercises').insert(
        entry.exercises.map((ex, i) => ({
          fitness_log_id: data.id,
          name: ex.name.trim(),
          sets: ex.sets ? Number(ex.sets) : null,
          reps: ex.reps ? Number(ex.reps) : null,
          weight_kg: ex.weight_kg ? Number(ex.weight_kg) : null,
          order_index: i,
        }))
      )
    }
    setEntries((prev) => [toEntryShape({ ...data, workout_exercises: entry.exercises || [] }), ...prev])
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="min-h-screen bg-zinc-950 max-w-md mx-auto">
      <div className="px-5 pt-14 pb-6">
        <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-1">Fitness Log</p>
        <h1 className="text-3xl font-bold text-zinc-50 tracking-tight">{today}</h1>
      </div>

      <div className="mx-4 bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden mb-4">
        <WorkoutForm onSubmit={handleSubmit} />
      </div>

      <div className="pb-6">
        {loading
          ? <p className="text-center text-sm text-zinc-600 py-10">Loading…</p>
          : <WorkoutHistory entries={entries} />
        }
      </div>
    </div>
  )
}
