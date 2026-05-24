import { useState, useEffect } from 'react'
import ExerciseList from './ExerciseList'
import { EXERCISES_BY_TYPE } from '../../data/workoutTemplates'
import { useDraftPersistence } from '../../hooks/useDraftPersistence'

const WORKOUT_TYPES = ['Push', 'Pull', 'Legs', 'Cardio', 'Rest']
const TYPE_META = {
  Push:   { emoji: '💪', sel: 'border-blue-500 bg-blue-500/10 text-blue-300'       },
  Pull:   { emoji: '🏋️', sel: 'border-purple-500 bg-purple-500/10 text-purple-300' },
  Legs:   { emoji: '🦵', sel: 'border-orange-500 bg-orange-500/10 text-orange-300' },
  Cardio: { emoji: '🏃', sel: 'border-rose-500 bg-rose-500/10 text-rose-300'       },
  Rest:   { emoji: '😴', sel: 'border-zinc-500 bg-zinc-700 text-zinc-400'          },
}
const SHOWS_EXERCISES = ['Push', 'Pull', 'Legs']

export default function WorkoutForm({
  onSubmit,
  defaultType      = '',
  defaultExercises = [],
  defaultDuration  = '',
  defaultNotes     = '',
  lastSession      = {},
}) {
  const { draft, save, clear } = useDraftPersistence('draft_workout', {
    type:      defaultType,
    duration:  defaultDuration,
    weight:    '',
    notes:     defaultNotes,
    exercises: defaultExercises,
  })

  const [type, setType]           = useState(draft.type)
  const [duration, setDuration]   = useState(draft.duration)
  const [weight, setWeight]       = useState(draft.weight)
  const [notes, setNotes]         = useState(draft.notes)
  const [exercises, setExercises] = useState(draft.exercises)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (submitted) return
    save({ type, duration, weight, notes, exercises })
  }, [type, duration, weight, notes, exercises, submitted]) // eslint-disable-line react-hooks/exhaustive-deps

  const isRest  = type === 'Rest'
  const showEx  = SHOWS_EXERCISES.includes(type)
  const isValid = type !== '' && (isRest || (duration !== '' && Number(duration) > 0))

  function handleSubmit(e) {
    e.preventDefault()
    if (!isValid) return
    clear()
    onSubmit({
      type,
      duration:  isRest ? null : Number(duration),
      weight:    weight !== '' ? Number(weight) : null,
      notes:     notes.trim() || null,
      exercises: exercises.filter((ex) => ex.name.trim()),
    })
    setSubmitted(true)
  }

  function reset() {
    clear()
    setType(defaultType); setDuration(defaultDuration); setWeight('')
    setNotes(defaultNotes); setExercises(defaultExercises); setSubmitted(false)
  }

  const inputCls = 'w-full bg-zinc-800 border-2 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-colors'
  const labelCls = 'text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-2'

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <span className="text-5xl mb-4">{TYPE_META[type]?.emoji}</span>
        <h2 className="text-xl font-bold text-zinc-100">Workout logged!</h2>
        <p className="text-zinc-500 mt-1 text-sm">Keep the momentum going.</p>
        <button onClick={reset} className="mt-6 text-sm text-blue-400 underline underline-offset-2">
          Log another
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="px-5 pt-5 pb-6">
      <p className={labelCls}>Workout Type</p>
      <div className="grid grid-cols-5 gap-2 mb-6">
        {WORKOUT_TYPES.map((t) => {
          const selected = type === t
          return (
            <button key={t} type="button"
              onClick={() => { setType(t); setExercises(EXERCISES_BY_TYPE[t] ?? []) }}
              className={`flex flex-col items-center py-3 rounded-xl border-2 transition-all duration-150 ${
                selected ? TYPE_META[t].sel + ' scale-105' : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
              }`}>
              <span className="text-xl">{TYPE_META[t].emoji}</span>
              <span className={`text-xs mt-1 font-semibold ${selected ? '' : 'text-zinc-600'}`}>{t}</span>
            </button>
          )
        })}
      </div>

      {showEx && <ExerciseList exercises={exercises} onChange={setExercises} lastSession={lastSession} />}

      {!isRest && (
        <div className="mb-4">
          <label className={labelCls}>Duration (min)</label>
          <input type="number" min="1" max="300" value={duration}
            onChange={(e) => setDuration(e.target.value)} placeholder="e.g. 45" className={inputCls} />
        </div>
      )}

      <div className="mb-4">
        <label className={labelCls}>Body Weight <span className="normal-case font-normal text-zinc-600">kg — optional</span></label>
        <input type="number" min="20" max="300" step="0.1" value={weight}
          onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 75.5" className={inputCls} />
      </div>

      <div className="mb-6">
        <label className={labelCls}>Notes <span className="normal-case font-normal text-zinc-600">— optional</span></label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
          placeholder="How did it feel?" className={inputCls + ' resize-none'} />
      </div>

      <button type="submit" disabled={!isValid}
        className={`w-full py-4 rounded-2xl font-semibold text-base transition-all duration-150 ${
          isValid ? 'bg-blue-600 text-white hover:bg-blue-500 active:scale-95' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
        }`}>
        Save Workout
      </button>
    </form>
  )
}
