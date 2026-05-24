const Anthropic = require('@anthropic-ai/sdk')
const { supabase } = require('../lib/supabase')

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('[reviewController] WARNING: ANTHROPIC_API_KEY is not set')
}
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function sevenDaysAgo() {
  const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString()
}
function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

// Build prompt from split morning/evening data
function buildPrompt(mornings, evenings, habits, completions, fitness, weekLabel) {
  const lines = [`Weekly data for ${weekLabel}:\n`]

  // Morning check-ins: mood, energy, optional weight
  if (mornings.length) {
    lines.push('MORNING CHECK-INS (mood 1–5, energy 1–5):')
    mornings.forEach((c) => {
      const wt = c.weight_kg ? ` | ${c.weight_kg} kg` : ''
      lines.push(`  ${formatDate(c.logged_at)}: Mood ${c.mood}/5, Energy ${c.energy}/5${wt}`)
    })
  } else {
    lines.push('MORNING CHECK-INS: none this week')
  }

  lines.push('')

  // Evening check-ins: day rating, wins, improvement note
  if (evenings.length) {
    lines.push('EVENING CHECK-INS (day rating 1–10):')
    evenings.forEach((c) => {
      const rating  = c.day_rating != null ? ` ${c.day_rating}/10` : ''
      const wins    = c.wins?.filter(Boolean).length
        ? ` | Wins: ${c.wins.filter(Boolean).join(', ')}`
        : ''
      const improve = c.improvement ? ` | "${c.improvement}"` : ''
      lines.push(`  ${formatDate(c.logged_at)}:${rating}${wins}${improve}`)
    })
  } else {
    lines.push('EVENING CHECK-INS: none this week')
  }

  lines.push('')

  // Habits
  if (habits.length) {
    lines.push('HABITS:')
    habits.forEach((h) => {
      const count = completions.filter((c) => c.habit_id === h.id).length
      lines.push(`  ${h.name}: ${count}/7 days`)
    })
  } else {
    lines.push('HABITS: none tracked')
  }

  lines.push('')

  // Fitness
  const workouts = fitness.filter((f) => f.type !== 'Rest')
  const restDays = fitness.filter((f) => f.type === 'Rest').length
  if (workouts.length) {
    lines.push('WORKOUTS:')
    workouts.forEach((w) => {
      const dur = w.duration_minutes ? ` — ${w.duration_minutes} min` : ''
      const wt  = w.body_weight_kg   ? ` (${w.body_weight_kg} kg)` : ''
      lines.push(`  ${formatDate(w.logged_at)}: ${w.type}${dur}${wt}`)
    })
    if (restDays) lines.push(`  Rest days: ${restDays}`)
  } else {
    lines.push('WORKOUTS: none logged')
  }

  lines.push(`
Write a warm, personal weekly review in 3 short paragraphs:
1. Overall feel of the week — mood/energy trends, day ratings, any standout wins
2. Habit and fitness progress — patterns, consistency, what they're building
3. One specific, actionable encouragement for next week

Be conversational and specific to their actual data. No bullet points — flowing prose. No intro like "Here is your review" — just start the review.`)

  return lines.join('\n')
}

async function fetchWeekData() {
  const since     = sevenDaysAgo()
  const now       = new Date().toISOString()
  const weekLabel = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  // Query morning and evening check-ins separately — they have different fields
  const [mornings, evenings, h, co, f] = await Promise.all([
    supabase
      .from('checkins')
      .select('mood, energy, weight_kg, logged_at')
      .eq('log_type', 'morning')
      .gte('logged_at', since).lte('logged_at', now)
      .order('logged_at'),
    supabase
      .from('checkins')
      .select('wins, day_rating, improvement, logged_at')
      .eq('log_type', 'evening')
      .gte('logged_at', since).lte('logged_at', now)
      .order('logged_at'),
    supabase.from('habits').select('id, name'),
    supabase
      .from('habit_completions')
      .select('habit_id, completed_date')
      .gte('completed_date', since.split('T')[0]),
    supabase
      .from('fitness_logs')
      .select('type, duration_minutes, body_weight_kg, logged_at')
      .gte('logged_at', since).lte('logged_at', now)
      .order('logged_at'),
  ])

  const dbError = mornings.error || evenings.error || h.error || co.error || f.error
  if (dbError) throw new Error(dbError.message)

  return {
    mornings:    mornings.data    || [],
    evenings:    evenings.data    || [],
    habits:      h.data           || [],
    completions: co.data          || [],
    fitness:     f.data           || [],
    weekLabel,
  }
}

async function generateReviewText() {
  const { mornings, evenings, habits, completions, fitness, weekLabel } = await fetchWeekData()
  const prompt  = buildPrompt(mornings, evenings, habits, completions, fitness, weekLabel)
  const message = await anthropic.messages.create({
    model:      'claude-haiku-4-5-20251001',
    max_tokens: 600,
    system:     "You are a warm, insightful personal coach writing a weekly review based on someone's health and productivity data.",
    messages:   [{ role: 'user', content: prompt }],
  })
  return message.content[0].text
}

async function generate(req, res) {
  try {
    const review = await generateReviewText()
    res.json({ review })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

async function sendWhatsApp(req, res) {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM, USER_WHATSAPP_NUMBER } = process.env

  if (!TWILIO_ACCOUNT_SID || TWILIO_ACCOUNT_SID.startsWith('YOUR_')) {
    return res.status(503).json({ error: 'Twilio credentials not configured. Add them to backend/.env' })
  }

  try {
    const review = await generateReviewText()
    const body   = new URLSearchParams({
      From: TWILIO_WHATSAPP_FROM,
      To:   USER_WHATSAPP_NUMBER,
      Body: `🏋️ *Weekly Life OS Review*\n\n${review}`,
    })
    const twilio = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method:  'POST',
        headers: {
          Authorization:  'Basic ' + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      }
    )
    if (!twilio.ok) {
      const err = await twilio.json()
      return res.status(502).json({ error: err.message || 'Twilio error' })
    }
    res.json({ success: true, message: 'Review sent to WhatsApp!' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = { generate, sendWhatsApp }
