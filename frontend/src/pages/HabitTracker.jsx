import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import HabitList from '../modules/habit-tracker/HabitList'

function toHabitShape(row) {
  return {
    ...row,
    completedDates: (row.habit_completions || []).map((c) => c.completed_date),
  }
}

export default function HabitTracker() {
  const [habits, setHabits]   = useState([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')

  useEffect(() => {
    supabase
      .from('habits')
      .select('*, habit_completions(completed_date)')
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setHabits((data || []).map(toHabitShape))
        setLoading(false)
      })
  }, [])

  async function addHabit(e) {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    const { data, error } = await supabase.from('habits').insert({ name }).select().single()
    if (!error) setHabits((prev) => [...prev, toHabitShape(data)])
    setNewName('')
  }

  function toggleToday(id) {
    const today = new Date().toISOString().split('T')[0]
    const habit = habits.find((h) => h.id === id)
    const done  = habit.completedDates.includes(today)
    setHabits((prev) => prev.map((h) => h.id !== id ? h : {
      ...h,
      completedDates: done ? h.completedDates.filter((d) => d !== today) : [...h.completedDates, today],
    }))
    if (done) {
      supabase.from('habit_completions').delete().eq('habit_id', id).eq('completed_date', today)
    } else {
      supabase.from('habit_completions').insert({ habit_id: id, completed_date: today })
    }
  }

  async function deleteHabit(id) {
    setHabits((prev) => prev.filter((h) => h.id !== id))
    await supabase.from('habits').delete().eq('id', id)
  }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-zinc-950 max-w-md mx-auto">
      <div className="px-5 pt-14 pb-6">
        <p className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-1">Habit Tracker</p>
        <h1 className="text-3xl font-bold text-zinc-50 tracking-tight">{today}</h1>
      </div>

      <form onSubmit={addHabit} className="mx-4 mb-4 flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Add a new habit…"
          className="flex-1 bg-zinc-800 border-2 border-zinc-700 text-zinc-100 placeholder:text-zinc-600
            px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!newName.trim()}
          className={`px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-150 ${
            newName.trim()
              ? 'bg-emerald-600 text-white hover:bg-emerald-500 active:scale-95'
              : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
          }`}
        >
          Add
        </button>
      </form>

      <div className="pb-6">
        {loading
          ? <p className="text-center text-sm text-zinc-600 py-10">Loading…</p>
          : <HabitList habits={habits} onToggle={toggleToday} onDelete={deleteHabit} />
        }
      </div>
    </div>
  )
}
