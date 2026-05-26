import { useState, useEffect, useRef } from 'react'
import ExerciseSparkline from './ExerciseSparkline'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const XIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const inputCls = 'bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm text-center py-1.5 rounded-lg focus:outline-none focus:border-blue-500 transition-colors placeholder:text-zinc-600'

function bestFromMap(lastSets) {
  if (!lastSets) return null
  const entries = Object.values(lastSets)
  if (!entries.length) return null
  return entries.reduce((b, s) => (Number(s.weight_kg) || 0) > (Number(b.weight_kg) || 0) ? s : b, entries[0])
}

export function bestFromForm(sets) {
  const filled = sets.filter((s) => s.weight_kg !== '' && Number(s.weight_kg) > 0)
  if (!filled.length) return null
  return filled.reduce((b, s) => (Number(s.weight_kg) || 0) > (Number(b.weight_kg) || 0) ? s : b, filled[0])
}

function calcTrend(curBest, lastBest) {
  if (!curBest || !lastBest) return null
  const lW = Number(lastBest.weight_kg) || 0, lR = Number(lastBest.reps) || 0
  const cW = Number(curBest.weight_kg)  || 0, cR = Number(curBest.reps)  || 0
  if (lW > 0 && cW > 0) {
    return cW > lW ? 'up' : cW < lW ? 'down' : cR > lR ? 'up' : cR < lR ? 'down' : 'same'
  }
  if (lR > 0 && cR > 0) return cR > lR ? 'up' : cR < lR ? 'down' : 'same'
  return null
}

function calcSetIndicator(set, lastSet, pbWeight, pbReps, hasHistory) {
  const w = Number(set.weight_kg) || 0
  const r = Number(set.reps) || 0
  if (!w && !r) return null
  if (!hasHistory) return 'new'
  const isPBWeight = pbWeight && w > 0 && w > (Number(pbWeight.weight_kg) || 0)
  const isPBReps   = pbReps   && r > 0 && r > (Number(pbReps.reps)       || 0)
  if (isPBWeight || isPBReps) return 'pb'
  const lW = Number(lastSet?.weight_kg) || 0
  const lR = Number(lastSet?.reps)      || 0
  if (lW > 0 && w > 0) return w > lW ? 'up' : w < lW ? 'down' : r > lR ? 'up' : r < lR ? 'down' : 'same'
  if (lR > 0 && r > 0) return r > lR ? 'up' : r < lR ? 'down' : 'same'
  return null
}

const TREND_MAP = {
  up:   { label: '↑',   cls: 'text-green-400  bg-green-400/10'   },
  down: { label: '↓',   cls: 'text-red-400    bg-red-400/10'     },
  same: { label: '→',   cls: 'text-yellow-400 bg-yellow-400/10'  },
  new:  { label: 'NEW', cls: 'text-blue-400   bg-blue-400/10'    },
}
const SET_IND_MAP = {
  pb:   { label: '🏆', cls: '' },
  up:   { label: '↑',  cls: 'text-green-400' },
  down: { label: '↓',  cls: 'text-red-400'   },
  same: { label: '→',  cls: 'text-zinc-600'  },
  new:  { label: '✦',  cls: 'text-blue-400'  },
}

function TrendBadge({ trend }) {
  if (!trend || !TREND_MAP[trend]) return null
  const { label, cls } = TREND_MAP[trend]
  return <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md shrink-0 ${cls}`}>{label}</span>
}

function SetRow({ setNum, set, lastSet, pbWeight, pbReps, hasHistory, onChange }) {
  const prevReps = lastSet?.reps      != null ? lastSet.reps      : null
  const prevWt   = lastSet?.weight_kg != null ? lastSet.weight_kg : null
  const hint = (prevWt || prevReps)
    ? `prev: ${prevReps ?? '?'} × ${prevWt ? prevWt + 'kg' : '—'}`
    : null
  const ind = calcSetIndicator(set, lastSet, pbWeight, pbReps, hasHistory)
  const indMeta = ind ? SET_IND_MAP[ind] : null
  return (
    <div className="flex items-center gap-2 py-1.5">
      <span className="text-xs text-zinc-600 w-6 shrink-0 tabular-nums">S{setNum}</span>
      <input type="number" min="0" value={set.reps}
        onChange={(e) => onChange({ ...set, reps: e.target.value })}
        placeholder="—" className={`w-12 px-1 ${inputCls}`} />
      <span className="text-xs text-zinc-600">×</span>
      <input type="number" min="0" step="0.5" value={set.weight_kg}
        onChange={(e) => onChange({ ...set, weight_kg: e.target.value })}
        placeholder="—" className={`w-16 px-1 ${inputCls}`} />
      <span className="text-xs text-zinc-600">kg</span>
      {indMeta && <span className={`text-xs shrink-0 ${indMeta.cls}`}>{indMeta.label}</span>}
      {hint && <span className="text-xs text-zinc-700 tabular-nums ml-0.5">{hint}</span>}
    </div>
  )
}

function ExerciseCard({ ex, index, lastSets, propHistory, onChange, onRemove }) {
  const [fetchedHistory, setFetchedHistory] = useState(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    const name = ex.name.trim()
    if (!name || propHistory !== undefined) return
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const r = await fetch(`${API_URL}/api/fitness/history/${encodeURIComponent(name)}`)
        if (r.ok) setFetchedHistory(await r.json())
      } catch {}
    }, 500)
    return () => clearTimeout(debounceRef.current)
  }, [ex.name, propHistory])

  const history    = propHistory ?? fetchedHistory
  const sessions   = history?.sessions   ?? null
  const pbWeight   = history?.pbWeight   ?? null
  const pbReps     = history?.pbReps     ?? null
  // For custom exercises fetched via debounce, we also get lastSession per-set data
  const effectiveLastSets = lastSets ?? history?.lastSession ?? null

  const lastBest = bestFromMap(effectiveLastSets)
    ?? (sessions?.[0]?.best_weight ? { weight_kg: sessions[0].best_weight, reps: sessions[0].best_reps } : null)
  const curBest    = bestFromForm(ex.sets)
  const hasHistory = !!(lastBest || sessions?.length || pbWeight || pbReps)
  const trend      = !hasHistory ? 'new' : calcTrend(curBest, lastBest)

  const lastLabel = lastBest?.weight_kg
    ? `Last: ${lastBest.weight_kg}kg × ${lastBest.reps ?? '?'}` : null

  let pbLabel = null
  if (pbWeight || pbReps) {
    const parts = []
    if (pbWeight) parts.push(`PB: ${pbWeight.weight_kg}kg × ${pbWeight.reps ?? '?'}`)
    if (pbReps && (!pbWeight || pbReps.reps !== pbWeight.reps || pbReps.weight_kg !== pbWeight.weight_kg)) {
      parts.push(`Best reps: ${pbReps.reps} × ${pbReps.weight_kg ? pbReps.weight_kg + 'kg' : '—'}`)
    }
    pbLabel = parts.join('  |  ')
  }

  function updateSet(si, upd) { onChange(index, { ...ex, sets: ex.sets.map((s, j) => j === si ? upd : s) }) }
  function addSet() {
    const prev = ex.sets[ex.sets.length - 1] || { reps: '', weight_kg: '' }
    onChange(index, { ...ex, sets: [...ex.sets, { reps: prev.reps, weight_kg: '' }] })
  }
  function removeSet() {
    if (ex.sets.length <= 1) return
    onChange(index, { ...ex, sets: ex.sets.slice(0, -1) })
  }

  return (
    <div className="bg-zinc-800/60 rounded-xl p-3 space-y-1">
      <div className="flex items-center gap-2 mb-0.5">
        <input type="text" value={ex.name}
          onChange={(e) => onChange(index, { ...ex, name: e.target.value })}
          placeholder="Exercise name"
          className="flex-1 bg-zinc-800 border-2 border-zinc-700 text-zinc-100 placeholder:text-zinc-600
            px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:border-blue-500 transition-colors" />
        <TrendBadge trend={trend} />
        <button type="button" onClick={() => onRemove(index)}
          className="text-zinc-600 hover:text-red-500 transition-colors p-1 shrink-0">
          <XIcon />
        </button>
      </div>

      <div className="ml-1 mb-1 min-h-[18px] space-y-0.5">
        {lastLabel
          ? <p className="text-xs text-zinc-500">{lastLabel}</p>
          : (!hasHistory && ex.name.trim())
            ? <p className="text-xs text-zinc-700">First time — no history</p>
            : null}
        {pbLabel && <p className="text-xs text-amber-500/80">{pbLabel}</p>}
        {sessions?.length >= 2 && <ExerciseSparkline sessions={sessions} />}
      </div>

      <div className="ml-1">
        {ex.sets.map((set, si) => (
          <SetRow key={si} setNum={si + 1} set={set}
            lastSet={effectiveLastSets?.[si + 1]}
            pbWeight={pbWeight} pbReps={pbReps} hasHistory={hasHistory}
            onChange={(upd) => updateSet(si, upd)} />
        ))}
      </div>

      <div className="flex gap-4 pt-1 ml-1">
        <button type="button" onClick={addSet}
          className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors">+ Set</button>
        {ex.sets.length > 1 && (
          <button type="button" onClick={removeSet}
            className="text-xs font-semibold text-zinc-600 hover:text-red-400 transition-colors">− Set</button>
        )}
      </div>
    </div>
  )
}

export default function ExerciseList({ exercises, onChange, lastSession = {}, exerciseHistory = {} }) {
  const EMPTY = { name: '', sets: [{ reps: '', weight_kg: '' }] }
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Exercises</p>
        <button type="button"
          onClick={() => onChange([...exercises, { ...EMPTY, sets: [{ reps: '', weight_kg: '' }] }])}
          className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors">+ Add</button>
      </div>
      {exercises.length === 0 && (
        <p className="text-sm text-zinc-600 text-center py-3">No exercises — tap + Add</p>
      )}
      <div className="space-y-2">
        {exercises.map((ex, i) => (
          <ExerciseCard key={i} ex={ex} index={i}
            lastSets={lastSession[ex.name]}
            propHistory={exerciseHistory[ex.name]}
            onChange={(idx, upd) => onChange(exercises.map((e, j) => j === idx ? upd : e))}
            onRemove={(idx) => onChange(exercises.filter((_, j) => j !== idx))} />
        ))}
      </div>
    </div>
  )
}
