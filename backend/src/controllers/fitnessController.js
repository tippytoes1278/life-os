const { supabase } = require('../lib/supabase')

async function list(req, res) {
  const { data, error } = await supabase
    .from('fitness_logs')
    .select('*, workout_exercises(*)')
    .order('logged_at', { ascending: false })
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
}

async function create(req, res) {
  const { type, duration, weight, notes, exercises = [] } = req.body
  if (!type) return res.status(400).json({ error: 'type is required' })

  const { data, error } = await supabase
    .from('fitness_logs')
    .insert({ type, duration_minutes: duration ?? null, body_weight_kg: weight ?? null, notes: notes ?? null })
    .select()
    .single()
  if (error) return res.status(500).json({ error: error.message })

  if (exercises.length) {
    const rows = exercises.map((ex, i) => ({
      fitness_log_id: data.id,
      name:           ex.name,
      sets:           ex.sets      ?? null,
      reps:           ex.reps      ?? null,
      weight_kg:      ex.weight_kg ?? null,
      order_index:    i,
    }))
    const { error: exError } = await supabase.from('workout_exercises').insert(rows)
    if (exError) return res.status(500).json({ error: exError.message })
  }

  res.status(201).json(data)
}

// Shared helper: reduce a flat array of set rows into
// { [fitness_log_id]: { date, sets: [{weight_kg, reps}] } }
function groupBySession(rows) {
  const map = {}
  for (const row of (rows || [])) {
    if (!map[row.fitness_log_id]) map[row.fitness_log_id] = { date: row.created_at, sets: [] }
    map[row.fitness_log_id].sets.push({ weight_kg: row.weight_kg, reps: row.reps })
  }
  return map
}

// Reduce sessions to [{date, best_weight, best_reps}] last 5 desc
function toSessionSummaries(sessionMap) {
  return Object.values(sessionMap)
    .map((s) => {
      const best = s.sets.reduce(
        (b, cur) => (Number(cur.weight_kg) || 0) > (Number(b.weight_kg) || 0) ? cur : b,
        s.sets[0] || {}
      )
      return {
        date:        s.date,
        best_weight: Number(best.weight_kg) || null,
        best_reps:   Number(best.reps)      || null,
      }
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)
}

// GET /api/fitness/history — all exercises in one call
async function allHistory(req, res) {
  const { data, error } = await supabase
    .from('workout_sets')
    .select('exercise_name, weight_kg, reps, created_at, fitness_log_id')
    .order('created_at', { ascending: false })
    .limit(1000)
  if (error) return res.status(500).json({ error: error.message })

  const byExercise = {}
  for (const row of (data || [])) {
    if (!byExercise[row.exercise_name]) byExercise[row.exercise_name] = {}
    if (!byExercise[row.exercise_name][row.fitness_log_id])
      byExercise[row.exercise_name][row.fitness_log_id] = { date: row.created_at, sets: [] }
    byExercise[row.exercise_name][row.fitness_log_id].sets.push({
      weight_kg: row.weight_kg, reps: row.reps,
    })
  }

  const result = {}
  for (const [name, sessionMap] of Object.entries(byExercise)) {
    result[name] = toSessionSummaries(sessionMap)
  }
  res.json(result)
}

// GET /api/fitness/history/:exerciseName — single exercise
async function exerciseHistory(req, res) {
  const name = decodeURIComponent(req.params.exerciseName)
  const { data, error } = await supabase
    .from('workout_sets')
    .select('exercise_name, weight_kg, reps, created_at, fitness_log_id')
    .eq('exercise_name', name)
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) return res.status(500).json({ error: error.message })
  res.json(toSessionSummaries(groupBySession(data)))
}

module.exports = { list, create, allHistory, exerciseHistory }
