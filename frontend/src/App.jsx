import { useState } from 'react'
import DailyCheckin from './pages/DailyCheckin'
import HabitTracker from './pages/HabitTracker'
import FitnessLog from './pages/FitnessLog'
import Diet from './pages/Diet'
import WeeklyReview from './pages/WeeklyReview'

const TABS = [
  { id: 'checkin', label: 'Check-in', icon: '📋', activeColor: 'text-violet-400' },
  { id: 'habits',  label: 'Habits',   icon: '✅', activeColor: 'text-emerald-400' },
  { id: 'fitness', label: 'Fitness',  icon: '💪', activeColor: 'text-blue-400'   },
  { id: 'diet',    label: 'Diet',     icon: '🥗', activeColor: 'text-green-400'  },
  { id: 'review',  label: 'Review',   icon: '📊', activeColor: 'text-amber-400'  },
]

export default function App() {
  const [tab, setTab] = useState('checkin')
  const activeColor = TABS.find((t) => t.id === tab)?.activeColor ?? 'text-zinc-100'

  return (
    <div className="pb-20 bg-zinc-950 min-h-screen">
      {tab === 'checkin' && <DailyCheckin />}
      {tab === 'habits'  && <HabitTracker />}
      {tab === 'fitness' && <FitnessLog />}
      {tab === 'diet'    && <Diet />}
      {tab === 'review'  && <WeeklyReview />}

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-zinc-950 border-t border-zinc-800 flex">
        {TABS.map((t) => {
          const isActive = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors ${
                isActive ? t.activeColor : 'text-zinc-600 hover:text-zinc-400'
              }`}
            >
              <span className="text-lg">{t.icon}</span>
              <span className="text-[10px] font-semibold tracking-wide">{t.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
