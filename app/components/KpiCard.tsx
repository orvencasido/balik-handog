import type { KpiStat } from "../../src/lib/types";

/** A metric card displaying a label, value, and optional subtitle. */
export default function KpiCard({ label, val, subtitle }: KpiStat) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center group hover:border-emerald-200 transition-all">
      <span className="text-[8px] font-black text-emerald-900/40 uppercase tracking-widest mb-1">
        {label}
      </span>
      <div className="flex flex-col gap-1 overflow-hidden">
        <span className="text-xl font-black text-emerald-950 tabular-nums leading-none group-hover:text-emerald-600 transition-colors">
          {val}
        </span>
        <span
          className={`text-[8px] font-black text-emerald-600/60 uppercase tracking-widest truncate h-3 flex items-center ${
            subtitle ? "opacity-100" : "opacity-0"
          }`}
        >
          BY {subtitle || "N/A"}
        </span>
      </div>
    </div>
  );
}
