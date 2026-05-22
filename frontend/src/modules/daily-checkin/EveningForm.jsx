import { useState } from 'react'

const label = 'text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-2'
const inputCls = 'w-full bg-zinc-800 border-2 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-violet-500 transition-colors'

function RatingPicker({ value, onChange }) {
  const color = (n) => n <= 3 ? 'bg-red-500 text-white' : n <= 6 ? 'bg-amber-500 text-zinc-900' : 'bg-green-500 text-white'
  return (
    <div className="mb-5">
      <p className={label}>Day Rating</p>
      <div className="flex gap-1.5">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button key={n} type="button" onClick={() => onChange(n)}
            className={`flex-1 h-9 rounded-lg text-sm font-bold transition-all duration-150 ${
              value === n ? color(n) + ' scale-110' : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
            }`}>
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}

function TodoCheckboxes({ todos, checked, onChange }) {
  if (!todos?.length) return (
    <p className="text-sm text-zinc-600 mb-5 italic">No morning to-dos logged.</p>
  )
  return (
    <div className="mb-5">
      <p className={label}>To-Dos</p>
      <div className="space-y-2">
        {todos.map((todo, i) => {
          const done = checked.includes(todo)
          return (
            <button key={i} type="button"
              onClick={() => onChange(done ? checked.filter((t) => t !== todo) : [...checked, todo])}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 text-left transition-all ${
                done ? 'border-violet-500/40 bg-violet-500/10' : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
              }`}>
              <span className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${done ? 'bg-violet-500 border-violet-500' : 'border-zinc-600'}`}>
                {done && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
              </span>
              <span className={`text-sm font-medium ${done ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>{todo}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function WinsInput({ wins, onChange }) {
  return (
    <div className="mb-5">
      <p className={label}>3 Wins</p>
      <div className="space-y-2">
        {wins.map((win, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-violet-500 font-bold text-sm w-5 shrink-0">{i + 1}.</span>
            <input type="text" value={win} placeholder={`Win #${i + 1}…`}
              onChange={(e) => { const w = [...wins]; w[i] = e.target.value; onChange(w) }}
              className="flex-1 bg-zinc-800 border-2 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-violet-500 transition-colors" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function EveningForm({ morningTodos, onSubmit, alreadyDone }) {
  const [checked, setChecked]       = useState([])
  const [wins, setWins]             = useState(['', '', ''])
  const [rating, setRating]         = useState(null)
  const [improvement, setImprovement] = useState('')

  if (alreadyDone) {
    const ratingColor = alreadyDone.day_rating <= 3 ? 'text-red-400' : alreadyDone.day_rating <= 6 ? 'text-amber-400' : 'text-green-400'
    return (
      <div className="px-5 py-6">
        <div className="text-center mb-4">
          <span className="text-4xl">🌙</span>
          <p className="text-base font-bold text-zinc-100 mt-2">Evening logged!</p>
          {alreadyDone.day_rating && <p className={`text-3xl font-bold tabular-nums mt-1 ${ratingColor}`}>{alreadyDone.day_rating}<span className="text-base font-normal text-zinc-500">/10</span></p>}
        </div>
        {alreadyDone.wins?.filter(Boolean).length > 0 && (
          <ul className="space-y-1.5 mb-3">
            {alreadyDone.wins.filter(Boolean).map((w, i) => (
              <li key={i} className="flex gap-2 text-sm text-zinc-300"><span className="text-violet-500 shrink-0">✓</span>{w}</li>
            ))}
          </ul>
        )}
        {alreadyDone.improvement && <p className="text-xs text-zinc-500 italic mt-2">"{alreadyDone.improvement}"</p>}
      </div>
    )
  }

  const isValid = wins.some((w) => w.trim()) && rating !== null
  function handleSubmit(e) {
    e.preventDefault()
    if (!isValid) return
    onSubmit({ todos: checked, wins: wins.filter((w) => w.trim()), day_rating: rating, improvement: improvement.trim() || null })
  }

  return (
    <form onSubmit={handleSubmit} className="px-5 pt-5 pb-6">
      <TodoCheckboxes todos={morningTodos} checked={checked} onChange={setChecked} />
      <WinsInput wins={wins} onChange={setWins} />
      <RatingPicker value={rating} onChange={setRating} />
      <div className="mb-6">
        <p className={label}>What could've been better? <span className="normal-case font-normal text-zinc-600">— optional</span></p>
        <textarea value={improvement} onChange={(e) => setImprovement(e.target.value)} rows={2}
          placeholder="One thing to improve tomorrow…" className={inputCls + ' resize-none'} />
      </div>
      <button type="submit" disabled={!isValid}
        className={`w-full py-4 rounded-2xl font-semibold text-base transition-all duration-150 ${
          isValid ? 'bg-violet-600 text-white hover:bg-violet-500 active:scale-95' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
        }`}>
        Save Evening Check-in
      </button>
    </form>
  )
}
