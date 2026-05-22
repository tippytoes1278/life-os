const { supabase } = require('../lib/supabase')

function todayRange() {
  const start = new Date(); start.setHours(0, 0, 0, 0)
  const end   = new Date(); end.setHours(23, 59, 59, 999)
  return { start: start.toISOString(), end: end.toISOString() }
}

async function list(req, res) {
  const { data, error } = await supabase
    .from('checkins')
    .select('*')
    .order('logged_at', { ascending: false })
    .limit(90) // last ~30 days of morning+evening
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
}

async function getTodayMorning(req, res) {
  const { start, end } = todayRange()
  const { data, error } = await supabase
    .from('checkins').select('*')
    .eq('log_type', 'morning')
    .gte('logged_at', start).lte('logged_at', end)
    .maybeSingle()
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
}

async function getTodayEvening(req, res) {
  const { start, end } = todayRange()
  const { data, error } = await supabase
    .from('checkins').select('*')
    .eq('log_type', 'evening')
    .gte('logged_at', start).lte('logged_at', end)
    .maybeSingle()
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
}

async function createMorning(req, res) {
  const { mood, energy, todos, weight_kg } = req.body
  if (!mood || !energy) return res.status(400).json({ error: 'mood and energy are required' })
  const { data, error } = await supabase
    .from('checkins')
    .insert({ mood, energy, todos: todos || [], weight_kg: weight_kg || null, log_type: 'morning' })
    .select().single()
  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json(data)
}

async function createEvening(req, res) {
  const { todos, wins, day_rating, improvement } = req.body
  const { data, error } = await supabase
    .from('checkins')
    .insert({
      todos:       todos      || [],
      wins:        wins       || [],
      day_rating:  day_rating || null,
      improvement: improvement || null,
      log_type: 'evening',
    })
    .select().single()
  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json(data)
}

module.exports = { list, getTodayMorning, getTodayEvening, createMorning, createEvening }
