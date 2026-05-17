import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import CheckinForm from '../modules/daily-checkin/CheckinForm'
import CheckinHistory from '../modules/daily-checkin/CheckinHistory'

export default function DailyCheckin() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('checkins')
      .select('*')
      .order('logged_at', { ascending: false })
      .then(({ data }) => {
        setEntries((data || []).map((e) => ({ ...e, date: e.logged_at })))
        setLoading(false)
      })
  }, [])

  async function handleSubmit(entry) {
    const { data, error } = await supabase
      .from('checkins')
      .insert({ mood: entry.mood, energy: entry.energy, wins: entry.wins, weight_kg: entry.weight ?? null })
      .select()
      .single()
    if (!error) setEntries((prev) => [{ ...data, date: data.logged_at }, ...prev])
  }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-zinc-950 max-w-md mx-auto">
      <div className="px-5 pt-14 pb-6">
        <p className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-1">Daily Check-in</p>
        <h1 className="text-3xl font-bold text-zinc-50 tracking-tight">{today}</h1>
      </div>

      <div className="mx-4 bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden mb-4">
        <CheckinForm onSubmit={handleSubmit} />
      </div>

      <div className="pb-6">
        {loading
          ? <p className="text-center text-sm text-zinc-600 py-10">Loading…</p>
          : <CheckinHistory entries={entries} />
        }
      </div>
    </div>
  )
}
