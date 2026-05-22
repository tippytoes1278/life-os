import { useState, useEffect } from 'react'
import MorningForm from '../modules/daily-checkin/MorningForm'
import EveningForm from '../modules/daily-checkin/EveningForm'
import CheckinHistory from '../modules/daily-checkin/CheckinHistory'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function DailyCheckin() {
  const [tab, setTab]               = useState('morning')
  const [todayMorning, setMorning]  = useState(null)
  const [todayEvening, setEvening]  = useState(null)
  const [entries, setEntries]       = useState([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/checkins/morning`).then((r) => r.json()),
      fetch(`${API}/api/checkins/evening`).then((r) => r.json()),
      fetch(`${API}/api/checkins`).then((r)         => r.json()),
    ]).then(([morning, evening, all]) => {
      setMorning(morning || null)
      setEvening(evening || null)
      setEntries(Array.isArray(all) ? all : [])
      // Auto-switch to evening after 5 pm if morning is done
      if (new Date().getHours() >= 17 && morning) setTab('evening')
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  async function handleMorning(data) {
    const res  = await fetch(`${API}/api/checkins/morning`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data),
    })
    if (!res.ok) return
    const saved = await res.json()
    setMorning(saved)
    setEntries((prev) => [saved, ...prev])
    // Auto-switch to evening after 5 pm
    if (new Date().getHours() >= 17) setTab('evening')
  }

  async function handleEvening(data) {
    const res  = await fetch(`${API}/api/checkins/evening`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data),
    })
    if (!res.ok) return
    const saved = await res.json()
    setEvening(saved)
    setEntries((prev) => [saved, ...prev])
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  const TABS = [
    { id: 'morning', label: '🌅 Morning', done: !!todayMorning },
    { id: 'evening', label: '🌙 Evening', done: !!todayEvening },
  ]

  return (
    <div className="min-h-screen bg-zinc-950 max-w-md mx-auto">
      <div className="px-5 pt-14 pb-5">
        <p className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-1">Daily Check-in</p>
        <h1 className="text-3xl font-bold text-zinc-50 tracking-tight">{today}</h1>
      </div>

      {/* Tab switcher */}
      <div className="px-4 mb-4">
        <div className="flex bg-zinc-900 rounded-2xl border border-zinc-800 p-1 gap-1">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                tab === t.id
                  ? 'bg-violet-600 text-white shadow'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}>
              {t.label}
              {t.done && <span className="text-xs opacity-80">✓</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Form card */}
      {loading ? (
        <p className="text-center text-sm text-zinc-600 py-10">Loading…</p>
      ) : (
        <div className="mx-4 bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden mb-4">
          {tab === 'morning' && (
            <MorningForm onSubmit={handleMorning} alreadyDone={todayMorning} />
          )}
          {tab === 'evening' && (
            <EveningForm
              onSubmit={handleEvening}
              alreadyDone={todayEvening}
              morningTodos={todayMorning?.todos?.filter(Boolean) || []}
            />
          )}
        </div>
      )}

      {/* History */}
      <CheckinHistory entries={entries} />
    </div>
  )
}
