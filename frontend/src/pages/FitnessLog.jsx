import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import WorkoutForm from '../modules/fitness-log/WorkoutForm'
import WorkoutHistory from '../modules/fitness-log/WorkoutHistory'
import { getTodayTemplate } from '../data/workoutTemplates'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

function toEntryShape(row) {
  return {
    ...row,
    duration:          row.duration_minutes,
    weight:            row.body_weight_kg,
    date:              row.logged_at,
    workout_exercises: (row.workout_exercises || []).sort((a, b) => a.order_index - b.order_index),
  }
}

// Build lastSession map: { exerciseName: { setNumber: { weight_kg, reps } } }
function buildLastSession(rows) {
  const session = {}
  for (const row of rows) {
    if (!session[row.exercise_name]) session[row.exercise_name] = {}
    if (!session[row.exercise_name][row.set_number]) {
      session[row.exercise_name][row.set_number] = { weight_kg: row.weight_kg, reps: row.reps }
    }
  }
  return session
}

export default function FitnessLog() {
  const [entries, setEntries]               = useState([])
  const [loading, setLoading]               = useState(true)
  const [lastSession, setLastSession]       = useState({})
  const [exerciseHistory, setExerciseHistory] = useState({})
  const template = getTodayTemplate()

  useEffect(() => {
    const exerciseNames = template.exercises.map((e) => e.name)
    Promise.all([
      supabase.from('fitness_logs').select('*, workout_exercises(*)').order('logged_at', { ascending: false }),
      exerciseNames.length
        ? supabase.from('workout_sets')
            .select('exercise_name, set_number, weight_kg, reps, created_at')
            .in('exercise_name', exerciseNames)
            .order('created_at', { ascending: false })
            .limit(500)
        : Promise.resolve({ data: [] }),
      fetch(`${API_URL}/api/fitness/history`).then((r) => r.ok ? r.json() : {}),
    ]).then(([logsRes, setsRes, historyData]) => {
      setEntries((logsRes.data || []).map(toEntryShape))
      setLastSession(buildLastSession(setsRes.data || []))
      setExerciseHistory(historyData && typeof historyData === 'object' ? historyData : {})
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

    const validExercises = (entry.exercises || []).filter((ex) => ex.name.trim())

    // workout_exercises — backward-compat history display (max weight per exercise)
    if (validExercises.length) {
      await supabase.from('workout_exercises').insert(
        validExercises.map((ex, i) => {
          const weights = ex.sets.map((s) => Number(s.weight_kg) || 0).filter(Boolean)
          return {
            fitness_log_id: data.id,
            name:       ex.name.trim(),
            sets:       ex.sets.length,
            reps:       ex.sets[0]?.reps ? Number(ex.sets[0].reps) : null,
            weight_kg:  weights.length ? Math.max(...weights) : null,
            order_index: i,
          }
        })
      )
    }

    // workout_sets — per-set storage for last-session hints
    const setsToInsert = validExercises.flatMap((ex) =>
      ex.sets
        .map((s, idx) => ({
          fitness_log_id: data.id,
          exercise_name:  ex.name.trim(),
          set_number:     idx + 1,
          weight_kg:      s.weight_kg ? Number(s.weight_kg) : null,
          reps:           s.reps ? Number(s.reps) : null,
        }))
        .filter((s) => s.weight_kg || s.reps)
    )
    if (setsToInsert.length) await supabase.from('workout_sets').insert(setsToInsert)

    setEntries((prev) => [toEntryShape({ ...data, workout_exercises: [] }), ...prev])
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="min-h-screen bg-zinc-950 max-w-md mx-auto">
      <div className="px-5 pt-14 pb-4">
        <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-1">Fitness Log</p>
        <h1 className="text-3xl font-bold text-zinc-50 tracking-tight">{today}</h1>
        <p className="text-sm text-blue-300 mt-1.5 font-medium">Today: {template.label} Day</p>
      </div>

      <div className="mx-4 bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden mb-4">
        <WorkoutForm
          onSubmit={handleSubmit}
          defaultType={template.type}
          defaultExercises={template.exercises}
          defaultDuration={template.duration}
          defaultNotes={template.notes}
          lastSession={lastSession}
          exerciseHistory={exerciseHistory}
        />
      </div>

      <div className="pb-6">
        {loading
          ? <p className="text-center text-sm text-zinc-600 py-10">Loading…</p>
          : <WorkoutHistory entries={entries} exerciseHistory={exerciseHistory} />
        }
      </div>
    </div>
  )
}
