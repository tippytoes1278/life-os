const Anthropic = require('@anthropic-ai/sdk')
const { supabase } = require('../lib/supabase')

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function sevenDaysAgo() {
  const d = new Date()
  d.setDate(d.getDate() - 7)
  return d.toISOString()
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function buildPrompt(checkins, habits, completions, fitness, weekLabel) {
  const lines = [`Weekly data for ${weekLabel}:\n`]

  if (checkins.length) {
    lines.push('MOOD & ENERGY CHECK-INS:')
    checkins.forEach((c) => {
      const wins = c.wins?.length ? ` Wins: ${c.wins.join(', ')}` : ''
      lines.push(`  ${formatDate(c.logged_at)}: Mood ${c.mood}/5, Energy ${c.energy}/5.${wins}`)
    })
  } else {
    lines.push('MOOD & ENERGY CHECK-INS: none this week')
  }

  lines.push('')

  if (habits.length) {
    lines.push('HABITS:')
    habits.forEach((h) => {
      const count = completions.filter((c) => c.habit_id === h.id).length
      lines.push(`  ${h.name}: completed ${count}/7 days`)
    })
  } else {
    lines.push('HABITS: none tracked')
  }

  lines.push('')

  const workouts = fitness.filter((f) => f.type !== 'Rest')
  const restDays  = fitness.filter((f) => f.type === 'Rest').length
  if (workouts.length) {
    lines.push('WORKOUTS:')
    workouts.forEach((w) => {
      const dur = w.duration_minutes ? ` — ${w.duration_minutes} min` : ''
      const wt  = w.body_weight_kg   ? ` (${w.body_weight_kg} kg)` : ''
      lines.push(`  ${formatDate(w.logged_at)}: ${w.type}${dur}${wt}`)
    })
    if (restDays) lines.push(`  Rest days logged: ${restDays}`)
  } else {
    lines.push('WORKOUTS: none logged')
  }

  lines.push(`
Write a warm, personal weekly review in 3 short paragraphs:
1. Overall feel of the week — mood/energy trends, any standout wins
2. Habit and fitness progress — patterns, consistency, what they're building
3. One specific, actionable encouragement for next week

Be conversational and specific to their actual data. No bullet points — flowing prose. No intro like "Here is your review" — just start the review.`)

  return lines.join('\n')
}

async function generate(req, res) {
  const since = sevenDaysAgo()
  const now   = new Date().toISOString()
  const weekLabel = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  const [checkinsRes, habitsRes, completionsRes, fitnessRes] = await Promise.all([
    supabase.from('checkins').select('mood, energy, wins, logged_at')
      .gte('logged_at', since).lte('logged_at', now).order('logged_at'),
    supabase.from('habits').select('id, name'),
    supabase.from('habit_completions').select('habit_id, completed_date')
      .gte('completed_date', since.split('T')[0]),
    supabase.from('fitness_logs').select('type, duration_minutes, body_weight_kg, logged_at')
      .gte('logged_at', since).lte('logged_at', now).order('logged_at'),
  ])

  const dbError = checkinsRes.error || habitsRes.error || completionsRes.error || fitnessRes.error
  if (dbError) return res.status(500).json({ error: dbError.message })

  const prompt = buildPrompt(
    checkinsRes.data    || [],
    habitsRes.data      || [],
    completionsRes.data || [],
    fitnessRes.data     || [],
    weekLabel,
  )

  const message = await anthropic.messages.create({
    model:      'claude-haiku-4-5-20251001',
    max_tokens: 600,
    system:     "You are a warm, insightful personal coach writing a weekly review based on someone's health and productivity data.",
    messages:   [{ role: 'user', content: prompt }],
  })

  res.json({ review: message.content[0].text })
}

module.exports = { generate }
