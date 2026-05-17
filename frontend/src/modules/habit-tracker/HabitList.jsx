import HabitRow from './HabitRow'

export default function HabitList({ habits, onToggle, onDelete }) {
  if (habits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-6">
        <span className="text-5xl mb-4">🌱</span>
        <h2 className="text-base font-semibold text-zinc-300">No habits yet</h2>
        <p className="text-zinc-600 text-sm mt-1">Add your first habit above.</p>
      </div>
    )
  }

  const today     = new Date().toISOString().split('T')[0]
  const doneCount = habits.filter((h) => h.completedDates.includes(today)).length

  return (
    <div className="px-4 space-y-2">
      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3 px-1">
        {doneCount}/{habits.length} done today
      </p>
      {habits.map((habit) => (
        <HabitRow key={habit.id} habit={habit} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </div>
  )
}
