const { supabase } = require('../lib/supabase')

async function list(req, res) {
  const { data, error } = await supabase
    .from('diet_logs')
    .select('*')
    .order('logged_at', { ascending: false })
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
}

async function create(req, res) {
  const { meal_name, protein_g } = req.body
  if (!meal_name?.trim()) return res.status(400).json({ error: 'meal_name is required' })
  if (protein_g == null || Number(protein_g) < 0) return res.status(400).json({ error: 'protein_g must be >= 0' })

  const { data, error } = await supabase
    .from('diet_logs')
    .insert({ meal_name: meal_name.trim(), protein_g: Number(protein_g) })
    .select()
    .single()
  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json(data)
}

async function remove(req, res) {
  const { id } = req.params
  const { error } = await supabase.from('diet_logs').delete().eq('id', id)
  if (error) return res.status(500).json({ error: error.message })
  res.status(204).send()
}

module.exports = { list, create, remove }
