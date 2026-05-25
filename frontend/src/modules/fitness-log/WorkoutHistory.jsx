import ExerciseSparkline from './ExerciseSparkline'

const TYPE_EMOJI = { Push: '💪', Pull: '🏋️', Legs: '🦵', Cardio: '🏃', Rest: '😴' }
const TYPE_BADGE = {
  Push:   'bg-blue-500/15 text-blue-300',
  Pull:   'bg-purple-500/15 text-purple-300',
  Legs:   'bg-orange-500/15 text-orange-300',
  Cardio: 'bg-rose-500/15 text-rose-300',
  Rest:   'bg-zinc-700 text-zinc-400',
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function WorkoutCard({ entry, exerciseHistory }) {
  const exercises = entry.workout_exercises || []
  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{TYPE_EMOJI[entry.type]}</span>
          <div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_BADGE[entry.type]}`}>
              {entry.type}
            </span>
            <p className="text-xs text-zinc-500 mt-1">{formatDate(entry.date)}</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          {entry.duration != null && <p className="text-sm font-semibold text-zinc-200">{entry.duration} min</p>}
          {entry.weight   != null && <p className="text-xs text-zinc-500 mt-0.5">{entry.weight} kg</p>}
        </div>
      </div>

      {exercises.length > 0 && (
        <ul className="mt-3 space-y-1.5 border-t border-zinc-800 pt-3">
          {exercises.map((ex, i) => {
            const parts = []
            if (ex.sets && ex.reps) parts.push(`${ex.sets}×${ex.reps}`)
            if (ex.weight_kg)        parts.push(`${ex.weight_kg} kg`)
            const history = exerciseHistory?.[ex.name]
            return (
              <li key={i} className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0 text-xs">
                  <span className="font-medium text-zinc-300">{ex.name}</span>
                  {parts.length > 0 && (
                    <span className="text-zinc-500"> — {parts.join(' @ ')}</span>
                  )}
                </div>
                <ExerciseSparkline sessions={history} />
              </li>
            )
          })}
        </ul>
      )}

      {entry.notes && (
        <p className="mt-2.5 text-xs text-zinc-500 italic border-t border-zinc-800 pt-2.5">{entry.notes}</p>
      )}
    </div>
  )
}

export default function WorkoutHistory({ entries = [], exerciseHistory = {} }) {
  if (!entries.length) {
    return <div className="text-center py-10 text-zinc-600 text-sm">No workouts logged yet.</div>
  }
  return (
    <div className="px-4 pb-4">
      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3 px-1">Past Workouts</p>
      <div className="space-y-3">
        {entries.map((entry, i) => (
          <WorkoutCard key={i} entry={entry} exerciseHistory={exerciseHistory} />
        ))}
      </div>
    </div>
  )
}
