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

module.exports = { list, create }
