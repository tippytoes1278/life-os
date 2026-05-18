const Anthropic = require('@anthropic-ai/sdk')
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

async function scanPhoto(req, res) {
  const { image, media_type = 'image/jpeg' } = req.body
  if (!image) return res.status(400).json({ error: 'No image provided' })

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  try {
    const message = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type, data: image } },
          {
            type: 'text',
            text: 'Analyze this food photo. Identify the meal, estimate calories and protein. Respond ONLY in JSON with no extra text: {"meal_name":"...","calories":0,"protein_g":0,"notes":"..."}',
          },
        ],
      }],
    })
    const text  = message.content[0].text.trim()
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return res.status(500).json({ error: 'Could not parse AI response' })
    res.json(JSON.parse(match[0]))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = { list, create, remove, scanPhoto }
