const MOOD_EMOJI   = ['', '😞', '😕', '😐', '🙂', '😄']
const ENERGY_EMOJI = ['', '🪫', '😴', '⚡', '🔥', '🚀']

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  })
}

function HistoryCard({ entry }) {
  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 mb-3">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
          {formatDate(entry.date)}
        </span>
        <div className="flex gap-2 text-lg">
          <span title={`Mood ${entry.mood}/5`}>{MOOD_EMOJI[entry.mood]}</span>
          <span title={`Energy ${entry.energy}/5`}>{ENERGY_EMOJI[entry.energy]}</span>
        </div>
      </div>
      {entry.wins?.length > 0 && (
        <ul className="space-y-1.5">
          {entry.wins.map((win, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
              <span className="text-violet-500 mt-0.5 shrink-0">✓</span>
              <span>{win}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function CheckinHistory({ entries = [] }) {
  if (!entries.length) {
    return (
      <div className="text-center py-10 text-zinc-600 text-sm">
        No check-ins yet — fill in today's above.
      </div>
    )
  }
  return (
    <div className="px-4 pb-4">
      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3 px-1">History</p>
      {entries.map((entry, i) => <HistoryCard key={i} entry={entry} />)}
    </div>
  )
}
