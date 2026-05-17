const MOOD_EMOJI   = ['', '😞', '😕', '😐', '🙂', '😄']
const ENERGY_EMOJI = ['', '🪫', '😴', '⚡', '🔥', '🚀']
const TYPE_EMOJI   = { Push: '💪', Pull: '🏋️', Legs: '🦵', Cardio: '🏃' }

function StatCard({ label, value, sub, accent }) {
  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4">
      <p className={`text-xs font-semibold uppercase tracking-widest mb-2 ${accent}`}>{label}</p>
      <p className="text-2xl font-bold text-zinc-50 leading-none tabular-nums">{value}</p>
      {sub && <p className="text-xs text-zinc-500 mt-1.5">{sub}</p>}
    </div>
  )
}

function EmptyCard({ label }) {
  return (
    <div className="bg-zinc-900 rounded-2xl border border-dashed border-zinc-800 p-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600 mb-1">{label}</p>
      <p className="text-sm text-zinc-700 mt-1">No data this week</p>
    </div>
  )
}

export default function WeekSummary({ stats, weekLabel }) {
  const { avgMood, avgEnergy, checkinCount, habitRate, habitCount, workoutCount, workoutBreakdown } = stats

  return (
    <div className="px-4 pb-4 space-y-3">
      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest px-1">{weekLabel}</p>

      <div className="grid grid-cols-2 gap-3">
        {checkinCount > 0 ? (
          <>
            <StatCard label="Mood" accent="text-violet-400"
              value={`${MOOD_EMOJI[Math.round(avgMood)]} ${avgMood.toFixed(1)}`}
              sub={`${checkinCount} check-in${checkinCount !== 1 ? 's' : ''}`} />
            <StatCard label="Energy" accent="text-violet-400"
              value={`${ENERGY_EMOJI[Math.round(avgEnergy)]} ${avgEnergy.toFixed(1)}`}
              sub="out of 5" />
          </>
        ) : (
          <><EmptyCard label="Mood" /><EmptyCard label="Energy" /></>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {habitCount > 0 ? (
          <StatCard label="Habits" accent="text-emerald-400"
            value={`${Math.round(habitRate)}%`}
            sub={`${habitCount} habit${habitCount !== 1 ? 's' : ''} tracked`} />
        ) : <EmptyCard label="Habits" />}

        <StatCard label="Workouts" accent="text-blue-400"
          value={workoutCount}
          sub={workoutCount > 0 ? 'sessions this week' : 'none logged'} />
      </div>

      {workoutBreakdown.length > 0 && (
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Breakdown</p>
          <div className="space-y-2.5">
            {workoutBreakdown.map(({ type, count }) => (
              <div key={type} className="flex items-center gap-3">
                <span className="text-base w-5 text-center">{TYPE_EMOJI[type]}</span>
                <span className="flex-1 text-sm font-medium text-zinc-300">{type}</span>
                <span className="text-xs font-bold text-zinc-400 tabular-nums w-6 text-right">{count}×</span>
                <div className="w-20 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div className="h-full rounded-full bg-blue-500"
                    style={{ width: `${(count / workoutCount) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
