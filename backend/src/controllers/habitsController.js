const { supabase } = require('../lib/supabase')

async function list(req, res) {
  const { data, error } = await supabase
    .from('habits')
    .select('*, habit_completions(completed_date)')
    .order('created_at', { ascending: true })
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
}

async function create(req, res) {
  const { name } = req.body
  if (!name?.trim()) return res.status(400).json({ error: 'name is required' })
  const { data, error } = await supabase
    .from('habits')
    .insert({ name: name.trim() })
    .select()
    .single()
  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json(data)
}

async function remove(req, res) {
  const { id } = req.params
  const { error } = await supabase.from('habits').delete().eq('id', id)
  if (error) return res.status(500).json({ error: error.message })
  res.status(204).send()
}

async function addCompletion(req, res) {
  const { id } = req.params
  const { date } = req.body
  if (!date) return res.status(400).json({ error: 'date is required' })
  const { data, error } = await supabase
    .from('habit_completions')
    .insert({ habit_id: id, completed_date: date })
    .select()
    .single()
  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json(data)
}

async function removeCompletion(req, res) {
  const { id, date } = req.params
  const { error } = await supabase
    .from('habit_completions')
    .delete()
    .eq('habit_id', id)
    .eq('completed_date', date)
  if (error) return res.status(500).json({ error: error.message })
  res.status(204).send()
}

module.exports = { list, create, remove, addCompletion, removeCompletion }
