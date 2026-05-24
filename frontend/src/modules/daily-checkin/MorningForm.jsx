import { useState, useEffect } from 'react'

const DRAFT_KEY = 'draft_morning_checkin'
function loadDraft() {
  try {
    const s = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null')
    if (!s) return null
    const today = new Date().toISOString().split('T')[0]
    return s.date === today ? s : null // discard yesterday's draft
  } catch { return null }
}

const MOOD_E   = ['😞', '😕', '😐', '🙂', '😄']
const ENERGY_E = ['🪫', '😴', '⚡', '🔥', '🚀']
const sel = 'border-violet-500 bg-violet-500/10 scale-105'
const unsel = 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
const inputCls = 'w-full bg-zinc-800 border-2 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-violet-500 transition-colors'
const label = 'text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-2'

function ScalePicker({ title, emojis, value, onChange }) {
  return (
    <div className="mb-5">
      <p className={label}>{title}</p>
      <div className="flex gap-2">
        {emojis.map((emoji, i) => {
          const score = i + 1
          return (
            <button key={score} type="button" onClick={() => onChange(score)}
              className={`flex-1 flex flex-col items-center py-3 rounded-xl border-2 transition-all duration-150 ${value === score ? sel : unsel}`}>
              <span className="text-2xl">{emoji}</span>
              <span className={`text-xs mt-1 font-semibold ${value === score ? 'text-violet-400' : 'text-zinc-600'}`}>{score}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function TodosInput({ todos, onChange }) {
  return (
    <div className="mb-5">
      <p className={label}>Today's To-Dos</p>
      <div className="space-y-2">
        {todos.map((todo, i) => (
          <div key={i} className="flex gap-2">
            <input type="text" value={todo} placeholder={`To-do ${i + 1}…`}
              onChange={(e) => { const t = [...todos]; t[i] = e.target.value; onChange(t) }}
              className="flex-1 bg-zinc-800 border-2 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-violet-500 transition-colors" />
            {todos.length > 1 && (
              <button type="button" onClick={() => onChange(todos.filter((_, j) => j !== i))}
                className="text-zinc-600 hover:text-red-500 px-2 transition-colors text-lg leading-none">×</button>
            )}
          </div>
        ))}
      </div>
      <button type="button" onClick={() => onChange([...todos, ''])}
        className="mt-2 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors">
        + Add to-do
      </button>
    </div>
  )
}

export default function MorningForm({ onSubmit, alreadyDone }) {
  const draft = !alreadyDone ? loadDraft() : null
  const [mood, setMood]     = useState(draft?.mood   ?? null)
  const [energy, setEnergy] = useState(draft?.energy ?? null)
  const [todos, setTodos]   = useState(draft?.todos  ?? ['', '', ''])
  const [weight, setWeight] = useState(draft?.weight ?? '')

  // Persist draft to localStorage as user types
  useEffect(() => {
    if (alreadyDone) return
    const today = new Date().toISOString().split('T')[0]
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ date: today, mood, energy, todos, weight }))
  }, [mood, energy, todos, weight, alreadyDone])

  if (alreadyDone) {
    return (
      <div className="px-5 py-6 text-center">
        <span className="text-4xl">🌅</span>
        <p className="text-base font-bold text-zinc-100 mt-3">Morning logged!</p>
        <div className="flex justify-center gap-4 mt-2">
          <span className="text-2xl">{MOOD_E[alreadyDone.mood - 1]}</span>
          <span className="text-2xl">{ENERGY_E[alreadyDone.energy - 1]}</span>
          {alreadyDone.weight_kg && <span className="text-sm text-violet-400 font-semibold self-center">{alreadyDone.weight_kg} kg</span>}
        </div>
        {alreadyDone.todos?.filter(Boolean).length > 0 && (
          <ul className="mt-3 text-sm text-zinc-400 space-y-1 text-left max-w-xs mx-auto">
            {alreadyDone.todos.filter(Boolean).map((t, i) => <li key={i} className="flex gap-2"><span className="text-violet-500">○</span>{t}</li>)}
          </ul>
        )}
      </div>
    )
  }

  const isValid = mood !== null && energy !== null
  function handleSubmit(e) {
    e.preventDefault()
    if (!isValid) return
    localStorage.removeItem(DRAFT_KEY)
    onSubmit({ mood, energy, todos: todos.filter((t) => t.trim()), weight_kg: weight || null })
  }

  return (
    <form onSubmit={handleSubmit} className="px-5 pt-5 pb-6">
      <ScalePicker title="Mood" emojis={MOOD_E} value={mood} onChange={setMood} />
      <ScalePicker title="Energy" emojis={ENERGY_E} value={energy} onChange={setEnergy} />
      <TodosInput todos={todos} onChange={setTodos} />
      <div className="mb-6">
        <p className={label}>Body Weight <span className="normal-case font-normal text-zinc-600">kg — optional</span></p>
        <input type="number" min="20" max="300" step="0.1" value={weight}
          onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 75.5" className={inputCls} />
      </div>
      <button type="submit" disabled={!isValid}
        className={`w-full py-4 rounded-2xl font-semibold text-base transition-all duration-150 ${
          isValid ? 'bg-violet-600 text-white hover:bg-violet-500 active:scale-95' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
        }`}>
        Save Morning Check-in
      </button>
    </form>
  )
}
