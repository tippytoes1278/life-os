import { useState, useRef, useEffect } from 'react'
import { useDraftPersistence } from '../../hooks/useDraftPersistence'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const CATEGORIES = ['Breakfast', 'Pre-Workout', 'Post-Workout', 'Lunch', 'Snack', 'Dinner']

const inputCls = 'bg-zinc-800 border-2 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 rounded-xl text-sm focus:outline-none focus:border-green-500 transition-colors'

function MacroInput({ value, onChange, placeholder, max, unit }) {
  return (
    <div className="relative flex-1">
      <input
        type="number" min="0" max={max} step="0.5" value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 ${unit.length > 2 ? 'pr-10' : 'pr-7'} py-3 text-center ${inputCls}`}
      />
      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-500 pointer-events-none">
        {unit}
      </span>
    </div>
  )
}

export default function MealForm({ onAdd, onClose }) {
  const { draft, save, clear } = useDraftPersistence('draft_meal', {
    name: '', category: CATEGORIES[0], protein: '', calories: '', carbs: '', fat: '',
  })

  const [name, setName]         = useState(draft.name)
  const [category, setCategory] = useState(draft.category || CATEGORIES[0])
  const [protein, setProtein]   = useState(draft.protein)
  const [calories, setCalories] = useState(draft.calories)
  const [carbs, setCarbs]       = useState(draft.carbs)
  const [fat, setFat]           = useState(draft.fat)
  const [scanning, setScanning] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]       = useState('')
  const fileRef = useRef(null)

  useEffect(() => {
    save({ name, category, protein, calories, carbs, fat })
  }, [name, category, protein, calories, carbs, fat]) // eslint-disable-line

  async function handleScan(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setScanning(true); setError('')
    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const [meta, base64] = ev.target.result.split(',')
        const media_type = meta.match(/data:(.*);base64/)?.[1] || 'image/jpeg'
        const res = await fetch(`${API_URL}/api/diet/scan-photo`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64, media_type }),
        })
        if (!res.ok) throw new Error(`Scan error ${res.status}`)
        const result = await res.json()
        if (result.error) throw new Error(result.error)
        setName(result.meal_name    || '')
        setProtein(String(result.protein_g  ?? ''))
        setCalories(String(result.calories  ?? ''))
        setCarbs(String(result.carbs_g      ?? ''))
        setFat(String(result.fat_g          ?? ''))
      } catch (err) {
        setError(err.message || 'Scan failed')
      } finally {
        setScanning(false)
        if (fileRef.current) fileRef.current.value = ''
      }
    }
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const p = Number(protein)
    if (!name.trim() || !p || p <= 0) return
    setSubmitting(true); setError('')
    try {
      const res = await fetch(`${API_URL}/api/diet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meal_name: name.trim(),
          category,
          protein_g: p,
          calories:  calories !== '' ? Number(calories) : null,
          carbs_g:   carbs    !== '' ? Number(carbs)    : null,
          fat_g:     fat      !== '' ? Number(fat)      : null,
        }),
      })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      clear()
      onAdd(data)
      // onAdd also calls setShowForm(false) in parent, but onClose clears form state
    } catch (err) {
      setError(err.message || 'Failed to save meal')
    } finally {
      setSubmitting(false)
    }
  }

  const isValid = name.trim() && Number(protein) > 0

  return (
    <form onSubmit={handleSubmit} className="px-4 py-4">
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-zinc-300">Log a Meal</p>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => fileRef.current?.click()} disabled={scanning || submitting}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              scanning ? 'text-zinc-600 bg-zinc-800 cursor-wait' : 'text-green-400 bg-zinc-800 hover:bg-zinc-700'
            }`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
            </svg>
            {scanning ? 'Scanning…' : 'Scan Photo'}
          </button>
          {onClose && (
            <button type="button" onClick={onClose}
              className="text-zinc-500 hover:text-zinc-300 transition-colors p-1">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" capture="environment"
          className="hidden" onChange={handleScan} />
      </div>

      {error && <p className="text-xs text-red-400 mb-2">{error}</p>}

      {/* Meal name */}
      <input type="text" value={name} onChange={(e) => setName(e.target.value)}
        placeholder="Meal name…" className={`w-full px-4 py-3 mb-2 ${inputCls}`} />

      {/* Category */}
      <select value={category} onChange={(e) => setCategory(e.target.value)}
        className={`w-full px-4 py-3 mb-2 ${inputCls} appearance-none`}>
        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>

      {/* Macros row 1: calories + protein */}
      <div className="flex gap-2 mb-2">
        <MacroInput value={calories} onChange={setCalories} placeholder="Calories" max={2000} unit="kcal" />
        <MacroInput value={protein}  onChange={setProtein}  placeholder="Protein"  max={300}  unit="g" />
      </div>
      {/* Macros row 2: carbs + fat */}
      <div className="flex gap-2 mb-3">
        <MacroInput value={carbs} onChange={setCarbs} placeholder="Carbs" max={500} unit="g" />
        <MacroInput value={fat}   onChange={setFat}   placeholder="Fat"   max={200} unit="g" />
      </div>

      <button type="submit" disabled={!isValid || submitting}
        className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-150 ${
          isValid && !submitting
            ? 'bg-green-600 text-white hover:bg-green-500 active:scale-95'
            : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
        }`}>
        {submitting ? 'Saving…' : 'Add Meal'}
      </button>
    </form>
  )
}
