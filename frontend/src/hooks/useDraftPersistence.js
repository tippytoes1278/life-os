import { useState, useCallback } from 'react'

const todayStr = () => new Date().toISOString().split('T')[0]

/**
 * useDraftPersistence(key, initialState)
 *
 * Handles all three draft-persistence steps so forms don't duplicate the logic:
 *   1. Mount   — reads localStorage[key]; returns saved values if they're from today,
 *                otherwise falls back to initialState.
 *   2. Change  — call save(currentValues) inside a useEffect watching form fields.
 *   3. Submit  — call clear() after a successful submission.
 *
 * All drafts are date-stamped (_date key). A draft from a previous day is
 * silently discarded so stale state never pre-fills a new day's form.
 *
 * Returns { draft, save, clear }
 *   draft  — plain object; use as useState initial values: useState(draft.field ?? fallback)
 *   save   — save(values: object) → void
 *   clear  — clear() → void
 */
export function useDraftPersistence(key, initialState = {}) {
  // Computed once at mount via lazy initializer — no re-reads on re-render
  const [draft] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) return initialState
      const saved = JSON.parse(raw)
      // Discard drafts from a previous day
      if (saved._date && saved._date !== todayStr()) return initialState
      // Strip the internal _date field before handing values to the form
      const { _date, ...rest } = saved
      return rest
    } catch {
      return initialState
    }
  })

  // Stable references — key is always a string literal, never changes
  const save = useCallback((values) => {
    try {
      localStorage.setItem(key, JSON.stringify({ ...values, _date: todayStr() }))
    } catch {}
  }, [key])

  const clear = useCallback(() => {
    localStorage.removeItem(key)
  }, [key])

  return { draft, save, clear }
}
