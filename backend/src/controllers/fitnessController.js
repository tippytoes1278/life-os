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

// { [fitness_log_id]: { date, sets: [{weight_kg, reps}] } }
function groupBySession(rows) {
  const map = {}
  for (const row of (rows || [])) {
    if (!map[row.fitness_log_id]) map[row.fitness_log_id] = { date: row.created_at, sets: [] }
    map[row.fitness_log_id].sets.push({ weight_kg: row.weight_kg, reps: row.reps })
  }
  return map
}

// [{date, best_weight, best_reps}] last 5 desc
function toSessionSummaries(sessionMap) {
  return Object.values(sessionMap)
    .map((s) => {
      const best = s.sets.reduce(
        (b, cur) => (Number(cur.weight_kg) || 0) > (Number(b.weight_kg) || 0) ? cur : b,
        s.sets[0] || {}
      )
      return { date: s.date, best_weight: Number(best.weight_kg) || null, best_reps: Number(best.reps) || null }
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)
}

// Compute all-time PBs from raw rows
// pbWeight = heaviest set ever  |  pbReps = most reps ever
function computePBs(rows) {
  let pbWeight = null
  let pbReps   = null
  for (const row of (rows || [])) {
    const w = Number(row.weight_kg) || 0
    const r = Number(row.reps)      || 0
    if (w > 0 && (!pbWeight || w > Number(pbWeight.weight_kg))) {
      pbWeight = { weight_kg: w, reps: r || null, date: row.created_at }
    }
    if (r > 0 && (!pbReps || r > Number(pbReps.reps))) {
      pbReps = { reps: r, weight_kg: w || null, date: row.created_at }
    }
  }
  return { pbWeight, pbReps }
}

// GET /api/fitness/history — { exerciseName: { sessions, pbWeight, pbReps } }
async function allHistory(req, res) {
  const { data, error } = await supabase
    .from('workout_sets')
    .select('exercise_name, weight_kg, reps, created_at, fitness_log_id')
    .order('created_at', { ascending: false })
    .limit(1000)
  if (error) return res.status(500).json({ error: error.message })

  const byExercise = {}
  for (const row of (data || [])) {
    if (!byExercise[row.exercise_name]) byExercise[row.exercise_name] = { sessionMap: {}, rows: [] }
    const e = byExercise[row.exercise_name]
    e.rows.push(row)
    if (!e.sessionMap[row.fitness_log_id])
      e.sessionMap[row.fitness_log_id] = { date: row.created_at, sets: [] }
    e.sessionMap[row.fitness_log_id].sets.push({ weight_kg: row.weight_kg, reps: row.reps })
  }

  const result = {}
  for (const [name, { sessionMap, rows }] of Object.entries(byExercise)) {
    const { pbWeight, pbReps } = computePBs(rows)
    result[name] = { sessions: toSessionSummaries(sessionMap), pbWeight, pbReps }
  }
  res.json(result)
}

// GET /api/fitness/history/:exerciseName — { sessions, pbWeight, pbReps, lastSession }
async function exerciseHistory(req, res) {
  const name = decodeURIComponent(req.params.exerciseName)
  const { data, error } = await supabase
    .from('workout_sets')
    .select('exercise_name, set_number, weight_kg, reps, created_at, fitness_log_id')
    .eq('exercise_name', name)
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) return res.status(500).json({ error: error.message })

  const rows = data || []
  const { pbWeight, pbReps } = computePBs(rows)
  const sessions = toSessionSummaries(groupBySession(rows))

  // Build lastSession: { setNumber: { weight_kg, reps } } from most recent log
  let lastSession = null
  if (rows.length) {
    const latestId = rows[0].fitness_log_id
    lastSession = {}
    for (const row of rows) {
      if (row.fitness_log_id !== latestId) break
      if (row.set_number != null)
        lastSession[row.set_number] = { weight_kg: row.weight_kg, reps: row.reps }
    }
  }

  res.json({ sessions, pbWeight, pbReps, lastSession })
}

module.exports = { list, create, allHistory, exerciseHistory }
