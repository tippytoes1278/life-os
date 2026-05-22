const { supabase } = require('../lib/supabase')

async function list(req, res) {
  const { data, error } = await supabase
    .from('checkins')
    .select('*')
    .order('logged_at', { ascending: false })
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
}

async function create(req, res) {
  const { mood, energy, wins } = req.body
  if (!mood || !energy) return res.status(400).json({ error: 'mood and energy are required' })
  const { data, error } = await supabase
    .from('checkins')
    .insert({ mood, energy, wins: wins || [] })
    .select()
    .single()
  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json(data)
}

module.exports = { list, create }
