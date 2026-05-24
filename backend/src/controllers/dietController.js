const Anthropic = require('@anthropic-ai/sdk')
const { supabase } = require('../lib/supabase')

async function list(req, res) {
  // Default to today in UTC; optionally pass ?date=YYYY-MM-DD
  const date  = req.query.date || new Date().toISOString().split('T')[0]
  const start = `${date}T00:00:00.000Z`
  const end   = `${date}T23:59:59.999Z`

  const { data, error } = await supabase
    .from('diet_logs')
    .select('*')
    .gte('logged_at', start)
    .lte('logged_at', end)
    .order('logged_at', { ascending: true })
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
}

async function create(req, res) {
  const { meal_name, protein_g, calories, carbs_g, fat_g, category } = req.body
  if (!meal_name?.trim()) return res.status(400).json({ error: 'meal_name is required' })
  if (protein_g == null || Number(protein_g) < 0) return res.status(400).json({ error: 'protein_g must be >= 0' })

  const { data, error } = await supabase
    .from('diet_logs')
    .insert({
      meal_name: meal_name.trim(),
      protein_g: Number(protein_g),
      calories:  calories  != null ? Number(calories)  : null,
      carbs_g:   carbs_g   != null ? Number(carbs_g)   : null,
      fat_g:     fat_g     != null ? Number(fat_g)     : null,
      category:  category  || null,
    })
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
            text: 'Analyze this food photo. Identify the meal and estimate all macros. Respond ONLY with a single JSON object, no markdown or extra text: {"meal_name":"...","calories":0,"protein_g":0,"carbs_g":0,"fat_g":0}',
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
