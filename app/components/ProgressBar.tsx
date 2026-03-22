/** A horizontal progress bar with a label, value, and optional suffix. */
export default function ProgressBar({
  label,
  value,
  percentage,
  suffix,
  barColor = "bg-emerald-500",
}: {
  label: string;
  value: string;
  percentage: number;
  suffix?: string;
  barColor?: string;
}) {
  return (
    <div className="group">
      <div className="flex justify-between text-[10px] font-black text-emerald-900 uppercase tracking-tight mb-2">
        <span>{label}</span>
        <span className="tabular-nums">{value}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex-1 h-2 bg-zinc-50 rounded-full overflow-hidden">
          <div
            className={`h-full ${barColor} rounded-full transition-all duration-1000`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {suffix && (
          <span className="text-[9px] font-black text-zinc-300 w-8">{suffix}</span>
        )}
      </div>
    </div>
  );
}
