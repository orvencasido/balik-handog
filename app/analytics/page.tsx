"use client";

import { useState } from "react";
import { useAuthGuard } from "../../src/lib/useAuthGuard";
import { useDonations } from "../../src/lib/useDonations";
import { WEEKDAYS } from "../../src/lib/constants";
import PageHeader from "../components/PageHeader";
import KpiCard from "../components/KpiCard";
import SectionHeader from "../components/SectionHeader";
import ProgressBar from "../components/ProgressBar";
import EmptyState from "../components/EmptyState";
import LoadingScreen from "../components/LoadingScreen";

export default function AnalyticsPage() {
  useAuthGuard();
  const { donations, loading } = useDonations({
    orderByField: "donationDate",
    direction: "asc",
  });

  const [selectedYear, setSelectedYear] = useState<string>("All");
  const [selectedDept, setSelectedDept] = useState<string>("All");

  /* ---------------------------------------------------------------- */
  /*  Filter options (derived from data)                               */
  /* ---------------------------------------------------------------- */
  const years = Array.from(
    new Set(donations.map((d) => new Date(d.donationDate).getFullYear().toString()))
  )
    .filter(Boolean)
    .sort((a, b) => b.localeCompare(a));

  const departments = Array.from(new Set(donations.map((d) => d.groupName)))
    .filter(Boolean)
    .sort();

  /* ---------------------------------------------------------------- */
  /*  Filtered dataset                                                 */
  /* ---------------------------------------------------------------- */
  const filtered = donations.filter((d) => {
    const year = new Date(d.donationDate).getFullYear().toString();
    const matchesYear = selectedYear === "All" || year === selectedYear;
    const matchesDept = selectedDept === "All" || d.groupName === selectedDept;
    return matchesYear && matchesDept;
  });

  /* ---------------------------------------------------------------- */
  /*  Aggregated statistics                                            */
  /* ---------------------------------------------------------------- */
  const totalAmount = filtered.reduce((acc, d) => acc + d.amount, 0);
  const avgDonation = filtered.length > 0 ? totalAmount / filtered.length : 0;

  // Monthly breakdown
  const monthlyData = filtered.reduce<Record<string, { name: string; total: number; count: number }>>(
    (acc, d) => {
      const date = new Date(d.donationDate);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const name = date.toLocaleString("default", { month: "short" });
      if (!acc[key]) acc[key] = { name, total: 0, count: 0 };
      acc[key].total += d.amount;
      acc[key].count += 1;
      return acc;
    },
    {}
  );

  const sortedMonths = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, data]) => ({ key, ...data }));

  const maxMonthTotal = Math.max(...sortedMonths.map((m) => m.total), 1);

  // Top contributors
  const contributorMap = filtered.reduce<Record<string, { name: string; total: number; count: number }>>(
    (acc, d) => {
      if (!acc[d.giverName]) acc[d.giverName] = { name: d.giverName, total: 0, count: 0 };
      acc[d.giverName].total += d.amount;
      acc[d.giverName].count += 1;
      return acc;
    },
    {}
  );

  const topContributors = Object.values(contributorMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Department performance
  const deptMap = filtered.reduce<Record<string, { name: string; total: number }>>(
    (acc, d) => {
      if (!acc[d.groupName]) acc[d.groupName] = { name: d.groupName, total: 0 };
      acc[d.groupName].total += d.amount;
      return acc;
    },
    {}
  );

  const deptRanking = Object.values(deptMap).sort((a, b) => b.total - a.total);

  // Day-of-week breakdown
  const dayMap = filtered.reduce<Record<string, number>>((acc, d) => {
    const day = new Date(d.donationDate).toLocaleDateString("en-US", { weekday: "long" });
    acc[day] = (acc[day] || 0) + d.amount;
    return acc;
  }, {});

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */
  if (loading) return <LoadingScreen message="Processing Intelligence..." />;

  const kpiCards = [
    { label: "Aggregate Value", val: `₱ ${totalAmount.toLocaleString()}` },
    { label: "Mean Contribution", val: `₱ ${avgDonation.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
    { label: "Ledger Entries", val: filtered.length },
    { label: "Active Donors", val: Object.keys(contributorMap).length },
  ];

  return (
    <div className="flex-1 space-y-6 font-sans w-full">
      {/* ---------- Header with filters ---------- */}
      <PageHeader title="Advanced Analytics" subtitle="Depth telemetry and performance audit">
        <div className="flex flex-wrap gap-3">
          <FilterSelect
            label="Year"
            value={selectedYear}
            onChange={setSelectedYear}
            options={years}
            allLabel="All Years"
          />
          <FilterSelect
            label="Dept"
            value={selectedDept}
            onChange={setSelectedDept}
            options={departments}
            allLabel="All Departments"
            className="max-w-[140px]"
          />
        </div>
      </PageHeader>

      {/* ---------- KPI Grid ---------- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpiCards.map((s, i) => (
          <KpiCard key={i} {...s} />
        ))}
      </div>

      {/* ---------- Monthly Trend + Top Contributors ---------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <SectionHeader title="Monthly Scaled Projection" />
          <div className="space-y-6 mt-6">
            {sortedMonths.map((m) => (
              <ProgressBar
                key={m.key}
                label={`${m.key} (${m.name})`}
                value={`₱ ${m.total.toLocaleString()}`}
                percentage={(m.total / maxMonthTotal) * 100}
                suffix={`${m.count}tx`}
              />
            ))}
            {sortedMonths.length === 0 && <EmptyState message="No monthly data mapped" />}
          </div>
        </div>

        {/* Top Contributors */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <SectionHeader title="Apex Contributors (Top 5)" />
          <div className="divide-y divide-gray-50 mt-6">
            {topContributors.map((c, i) => (
              <div key={c.name} className="py-5 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-black text-emerald-900/20 tabular-nums">
                    0{i + 1}
                  </span>
                  <div>
                    <p className="text-xs font-black text-emerald-950 uppercase tracking-tight group-hover:text-emerald-600 transition-colors">
                      {c.name}
                    </p>
                    <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">
                      {c.count} total contributions
                    </p>
                  </div>
                </div>
                <div className="text-sm font-black text-emerald-950 tabular-nums">
                  ₱ {c.total.toLocaleString()}
                </div>
              </div>
            ))}
            {topContributors.length === 0 && <EmptyState message="No contributor records found" />}
          </div>
        </div>
      </div>

      {/* ---------- Bottom row: Heatmap + Dept Ranking ---------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Heatmap */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-[10px] font-black text-emerald-950 uppercase tracking-widest mb-6">
            Weekly Heatmap
          </h2>
          <div className="space-y-4">
            {WEEKDAYS.map((day) => {
              const amount = dayMap[day] || 0;
              const pct = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
              return (
                <div key={day} className="space-y-1">
                  <div className="flex justify-between text-[9px] font-black text-emerald-900/40 uppercase tracking-widest">
                    <span>{day}</span>
                    <span>{amount > 0 ? `₱ ${amount.toLocaleString()}` : "--"}</span>
                  </div>
                  <div className="h-1 w-full bg-zinc-50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500/30 group-hover:bg-emerald-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Department Power Ranking */}
        <div className="lg:col-span-2 bg-emerald-900 p-6 rounded-2xl shadow-xl shadow-emerald-900/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <svg className="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.45 12.15l-1.45 1.45-1.45-1.45c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l2.15 2.15c.39.39 1.02.39 1.41 0l2.15-2.15c.39-.39.39-1.02 0-1.41-.39-.4-.1.39-1.4-.39z" />
            </svg>
          </div>
          <h2 className="text-[10px] font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
            <span className="h-4 w-1 bg-emerald-400 rounded-full" />
            Department Power Ranking
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {deptRanking.map((dept, i) => (
              <div
                key={dept.name}
                className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                    RANK 0{i + 1}
                  </span>
                  <div className="text-white font-black text-lg tabular-nums">
                    ₱ {dept.total.toLocaleString()}
                  </div>
                </div>
                <div className="text-white font-black text-xs uppercase tracking-tight mb-2">
                  {dept.name}
                </div>
                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400"
                    style={{ width: `${(dept.total / (deptRanking[0]?.total || 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {deptRanking.length === 0 && (
              <p className="text-white/40 italic text-xs">No sector telemetry recorded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-component: styled filter dropdown                              */
/* ------------------------------------------------------------------ */
function FilterSelect({
  label,
  value,
  onChange,
  options,
  allLabel,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  allLabel: string;
  className?: string;
}) {
  return (
    <div className="bg-zinc-50 px-3 py-1.5 rounded-lg border border-gray-100 flex items-center gap-2">
      <span className="text-[8px] font-black text-emerald-900/40 uppercase tracking-widest">
        {label} :
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`bg-transparent text-[10px] font-black text-emerald-950 outline-none ${className}`}
      >
        <option value="All">{allLabel}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}
