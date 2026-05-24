// MacroSummary — 4 progress bars: calories, protein, carbs, fat

function MacroBar({ label, value, target, color, unit }) {
  const pct = Math.min((value / target) * 100, 100)
  const hit = value >= target
  const display = value % 1 === 0 ? value : value.toFixed(1)
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">{label}</span>
        <span className={`text-xs font-bold tabular-nums ${hit ? 'text-amber-400' : 'text-zinc-300'}`}>
          {display}{unit}
          <span className="text-zinc-600 font-normal"> / {target}{unit}</span>
        </span>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${hit ? 'bg-amber-400' : color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default function DailyProtein({
  calorieTotal, calorieTarget,
  proteinTotal, proteinTarget,
  carbsTotal,   carbsTarget,
  fatTotal,     fatTarget,
}) {
  return (
    <div className="mx-4 bg-zinc-900 rounded-2xl border border-zinc-800 p-5 space-y-4">
      <MacroBar label="Calories" value={calorieTotal} target={calorieTarget} color="bg-orange-500" unit=" kcal" />
      <MacroBar label="Protein"  value={proteinTotal} target={proteinTarget} color="bg-green-500"  unit="g" />
      <MacroBar label="Carbs"    value={carbsTotal}   target={carbsTarget}   color="bg-blue-500"   unit="g" />
      <MacroBar label="Fat"      value={fatTotal}     target={fatTarget}     color="bg-yellow-500" unit="g" />
    </div>
  )
}
