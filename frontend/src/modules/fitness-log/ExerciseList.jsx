const EMPTY_EXERCISE = { name: '', sets: '', reps: '', weight_kg: '' }

function ExerciseRow({ ex, index, onChange, onRemove }) {
  function field(key) {
    return (e) => onChange(index, { ...ex, [key]: e.target.value })
  }
  return (
    <div className="bg-zinc-800/60 rounded-xl p-3 space-y-2">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={ex.name}
          onChange={field('name')}
          placeholder="Exercise name"
          className="flex-1 bg-zinc-800 border-2 border-zinc-700 text-zinc-100 placeholder:text-zinc-600
            px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors"
        />
        <button type="button" onClick={() => onRemove(index)}
          className="text-zinc-600 hover:text-red-500 transition-colors p-1 shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[['sets', 'Sets'], ['reps', 'Reps'], ['weight_kg', 'kg']].map(([key, label]) => (
          <div key={key}>
            <label className="text-xs text-zinc-500 font-medium block mb-1">{label}</label>
            <input
              type="number" min="0" step={key === 'weight_kg' ? '0.5' : '1'}
              value={ex[key]} onChange={field(key)} placeholder="—"
              className="w-full bg-zinc-800 border-2 border-zinc-700 text-zinc-100 placeholder:text-zinc-600
                px-2 py-2 rounded-lg text-sm text-center focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ExerciseList({ exercises, onChange }) {
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Exercises</p>
        <button type="button"
          onClick={() => onChange([...exercises, { ...EMPTY_EXERCISE }])}
          className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors">
          + Add
        </button>
      </div>
      {exercises.length === 0 && (
        <p className="text-sm text-zinc-600 text-center py-3">No exercises yet — tap + Add</p>
      )}
      <div className="space-y-2">
        {exercises.map((ex, i) => (
          <ExerciseRow key={i} ex={ex} index={i}
            onChange={(idx, updated) => onChange(exercises.map((e, j) => j === idx ? updated : e))}
            onRemove={(idx) => onChange(exercises.filter((_, j) => j !== idx))}
          />
        ))}
      </div>
    </div>
  )
}
