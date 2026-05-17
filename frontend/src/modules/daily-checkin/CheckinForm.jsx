import { useState } from 'react'

const EMOJI_SCALE = {
  mood:   ['😞', '😕', '😐', '🙂', '😄'],
  energy: ['🪫', '😴', '⚡', '🔥', '🚀'],
}

function ScalePicker({ label, type, value, onChange }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">{label}</p>
      <div className="flex gap-2">
        {EMOJI_SCALE[type].map((emoji, i) => {
          const score = i + 1
          const selected = value === score
          return (
            <button
              key={score}
              type="button"
              onClick={() => onChange(score)}
              className={`flex-1 flex flex-col items-center py-3 rounded-xl border-2 transition-all duration-150 ${
                selected
                  ? 'border-violet-500 bg-violet-500/10 scale-105'
                  : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
              }`}
            >
              <span className="text-2xl">{emoji}</span>
              <span className={`text-xs mt-1 font-semibold ${selected ? 'text-violet-400' : 'text-zinc-600'}`}>
                {score}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function WinsInput({ wins, onChange }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">3 Wins of the Day</p>
      <div className="space-y-2">
        {wins.map((win, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-violet-500 font-bold text-sm w-5 shrink-0">{i + 1}.</span>
            <input
              type="text"
              value={win}
              onChange={(e) => {
                const updated = [...wins]
                updated[i] = e.target.value
                onChange(updated)
              }}
              placeholder={`Win #${i + 1}…`}
              className="flex-1 bg-zinc-800 border-2 border-zinc-700 text-zinc-100 placeholder:text-zinc-600
                px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function CheckinForm({ onSubmit }) {
  const [mood, setMood]         = useState(null)
  const [energy, setEnergy]     = useState(null)
  const [wins, setWins]         = useState(['', '', ''])
  const [weight, setWeight]     = useState('')
  const [submitted, setSubmitted] = useState(false)

  const isValid = mood !== null && energy !== null && wins.some((w) => w.trim())

  function handleSubmit(e) {
    e.preventDefault()
    if (!isValid) return
    onSubmit?.({
      mood, energy,
      wins: wins.filter((w) => w.trim()),
      weight: weight !== '' ? Number(weight) : null,
      date: new Date().toISOString(),
    })
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <span className="text-5xl mb-4">🎉</span>
        <h2 className="text-xl font-bold text-zinc-100">Check-in complete!</h2>
        <p className="text-zinc-500 mt-1 text-sm">Great work logging today.</p>
        <button
          onClick={() => { setMood(null); setEnergy(null); setWins(['', '', '']); setWeight(''); setSubmitted(false) }}
          className="mt-6 text-sm text-violet-400 underline underline-offset-2"
        >
          Log another
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="px-5 pt-5 pb-6">
      <ScalePicker label="Mood" type="mood" value={mood} onChange={setMood} />
      <ScalePicker label="Energy" type="energy" value={energy} onChange={setEnergy} />
      <WinsInput wins={wins} onChange={setWins} />
      <div className="mb-6">
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">
          Body Weight <span className="normal-case font-normal text-zinc-600">kg — optional</span>
        </p>
        <input
          type="number" min="20" max="300" step="0.1" value={weight}
          onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 75.5"
          className="w-full bg-zinc-800 border-2 border-zinc-700 text-zinc-100 placeholder:text-zinc-600
            px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-violet-500 transition-colors"
        />
      </div>
      <button
        type="submit"
        disabled={!isValid}
        className={`w-full py-4 rounded-2xl font-semibold text-base transition-all duration-150 ${
          isValid
            ? 'bg-violet-600 text-white hover:bg-violet-500 active:scale-95'
            : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
        }`}
      >
        Save Check-in
      </button>
    </form>
  )
}
