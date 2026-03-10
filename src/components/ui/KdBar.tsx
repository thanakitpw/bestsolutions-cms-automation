export default function KdBar({ value }: { value: number }) {
  const color =
    value <= 30 ? 'bg-emerald-400' : value <= 60 ? 'bg-orange-400' : 'bg-red-400'
  const pct = Math.min(value, 100)
  return (
    <div className="flex items-center gap-2">
      <div className="w-12 bg-slate-100 h-1.5 rounded-full">
        <div className={`${color} h-full rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm text-slate-700">{value}</span>
    </div>
  )
}
