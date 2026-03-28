"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "../../src/lib/firebase/client";

interface Donation {
  id: string;
  giverName: string;
  amount: number;
  groupName: string;
  donationDate: string;
  monthKey: string;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  // Advanced Filters
  const [selectedYear, setSelectedYear] = useState<string>("All");
  const [selectedDept, setSelectedDept] = useState<string>("All");

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) router.push("/");
      else setUser(currentUser);
    });

    const donationsQuery = query(
      collection(db, "donations"),
      orderBy("donationDate", "asc")
    );

    const unsubscribeDonations = onSnapshot(donationsQuery, (snapshot) => {
      const donationData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Donation[];
      setDonations(donationData);
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeDonations();
    };
  }, [router]);

  // Derived Options
  const years = Array.from(new Set(donations.map(d => new Date(d.donationDate).getFullYear().toString()))).filter(Boolean).sort((a, b) => b.localeCompare(a));
  const departments = Array.from(new Set(donations.map(d => d.groupName))).filter(Boolean).sort();

  // Filter Data
  const filteredDonations = donations.filter(d => {
    const year = new Date(d.donationDate).getFullYear().toString();
    const matchesYear = selectedYear === "All" || year === selectedYear;
    const matchesDept = selectedDept === "All" || d.groupName === selectedDept;
    return matchesYear && matchesDept;
  });

  // Calculate Aggregates
  const totalAmount = filteredDonations.reduce((acc, curr) => acc + curr.amount, 0);
  const avgDonation = filteredDonations.length > 0 ? totalAmount / filteredDonations.length : 0;

  // Monthly Breakdown
  const monthlyData = filteredDonations.reduce((acc: Record<string, { name: string, total: number, count: number }>, curr) => {
    const date = new Date(curr.donationDate);
    const mKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const mName = date.toLocaleString('default', { month: 'short' });
    if (!acc[mKey]) acc[mKey] = { name: mName, total: 0, count: 0 };
    acc[mKey].total += curr.amount;
    acc[mKey].count += 1;
    return acc;
  }, {});

  const sortedMonths = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, data]) => ({ key, ...data }));

  const maxMonthTotal = Math.max(...sortedMonths.map(m => m.total), 1);

  // Top Contributors
  const contributorMap = filteredDonations.reduce((acc: Record<string, { name: string, total: number, count: number }>, curr) => {
    if (!acc[curr.giverName]) acc[curr.giverName] = { name: curr.giverName, total: 0, count: 0 };
    acc[curr.giverName].total += curr.amount;
    acc[curr.giverName].count += 1;
    return acc;
  }, {});

  const topContributors = Object.values(contributorMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Department Performance
  const deptMap = filteredDonations.reduce((acc: Record<string, { name: string, total: number }>, curr) => {
    const deptName = curr.groupName || "General";
    if (!acc[deptName]) acc[deptName] = { name: deptName, total: 0 };
    acc[deptName].total += curr.amount;
    return acc;
  }, {});

  const deptRanking = Object.values(deptMap)
    .sort((a, b) => b.total - a.total);

  // Stats by Day of Week
  const dayMap = filteredDonations.reduce((acc: Record<string, number>, curr) => {
    const day = new Date(curr.donationDate).toLocaleDateString('en-US', { weekday: 'long' });
    acc[day] = (acc[day] || 0) + curr.amount;
    return acc;
  }, {});
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  if (loading) return <div className="flex-1 flex items-center justify-center text-emerald-900 font-bold">Processing Intelligence...</div>;

  return (
    <div className="flex-1 space-y-6 font-sans w-full">
      {/* Dynamic Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white px-6 py-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-lg font-black text-emerald-950 tracking-tight leading-none uppercase">Advanced Analytics</h1>
          <p className="text-emerald-700/60 font-bold text-[8px] uppercase tracking-widest mt-1">Depth telemetry and performance audit</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="bg-zinc-50 px-3 py-1.5 rounded-lg border border-gray-100 flex items-center gap-2">
            <span className="text-[8px] font-black text-emerald-900/40 uppercase tracking-widest">Year :</span>
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="bg-transparent text-[10px] font-black text-emerald-950 outline-none">
              <option value="All">All Years</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <div className="bg-zinc-50 px-3 py-1.5 rounded-lg border border-gray-100 flex items-center gap-2">
            <span className="text-[8px] font-black text-emerald-900/40 uppercase tracking-widest">Dept :</span>
            <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className="bg-transparent text-[10px] font-black text-emerald-950 outline-none max-w-[140px]">
              <option value="All">All Departments</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
      </header>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Aggregate Value", val: `₱ ${totalAmount.toLocaleString()}` },
          { label: "Mean Contribution", val: `₱ ${avgDonation.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
          { label: "Ledger Entries", val: filteredDonations.length },
          { label: "Active Donors", val: Object.keys(contributorMap).length }
        ].map((s, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm group hover:border-emerald-200 transition-all">
            <h3 className="text-[8px] font-black text-emerald-900/40 uppercase tracking-widest leading-none mb-1">{s.label}</h3>
            <p className="text-xl font-black text-emerald-950 tabular-nums group-hover:text-emerald-600 transition-colors whitespace-nowrap">{s.val}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend Detailed */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-[10px] font-black text-emerald-950 uppercase tracking-widest mb-6 flex items-center gap-3">
            <span className="h-4 w-1 bg-emerald-600 rounded-full"></span>
            Monthly Scaled Projection
          </h2>
          <div className="space-y-6">
            {sortedMonths.map((m) => (
              <div key={m.key} className="group">
                <div className="flex justify-between text-[10px] font-black text-emerald-900 uppercase tracking-tight mb-2">
                  <span>{m.key} ({m.name})</span>
                  <span className="tabular-nums whitespace-nowrap">₱{m.total.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-2 bg-zinc-50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                      style={{ width: `${(m.total / maxMonthTotal) * 100}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-black text-zinc-300 w-8">{m.count}tx</span>
                </div>
              </div>
            ))}
            {sortedMonths.length === 0 && <p className="text-center py-10 text-[10px] font-black italic text-zinc-300 uppercase">No monthly data mapped</p>}
          </div>
        </div>

        {/* Top Givers Audit */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-[10px] font-black text-emerald-950 uppercase tracking-widest mb-6 flex items-center gap-3">
            <span className="h-4 w-1 bg-emerald-600 rounded-full"></span>
            Apex Contributors (Top 5)
          </h2>
          <div className="divide-y divide-gray-50">
            {topContributors.map((c, i) => (
              <div key={c.name} className="py-5 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-black text-emerald-900/20 tabular-nums">0{i + 1}</span>
                  <div>
                    <p className="text-xs font-black text-emerald-950 uppercase tracking-tight group-hover:text-emerald-600 transition-colors">{c.name}</p>
                    <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">{c.count} total contributions</p>
                  </div>
                </div>
                <div className="text-sm font-black text-emerald-950 tabular-nums whitespace-nowrap">₱{c.total.toLocaleString()}</div>
              </div>
            ))}
            {topContributors.length === 0 && <p className="text-center py-10 text-[10px] font-black italic text-zinc-300 uppercase">No contributor records found</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Day of Week Analysis */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-[10px] font-black text-emerald-950 uppercase tracking-widest mb-6">Weekly Heatmap</h2>
          <div className="space-y-4">
            {days.map(day => {
              const amount = dayMap[day] || 0;
              const perc = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
              return (
                <div key={day} className="space-y-1">
                  <div className="flex justify-between text-[9px] font-black text-emerald-900/40 uppercase tracking-widest">
                    <span>{day}</span>
                    <span>{amount > 0 ? <span className="whitespace-nowrap">₱{amount.toLocaleString()}</span> : '--'}</span>
                  </div>
                  <div className="h-1 w-full bg-zinc-50 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500/30 group-hover:bg-emerald-500 transition-all" style={{ width: `${perc}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sector Ranking */}
        <div className="lg:col-span-2 bg-emerald-900 p-6 rounded-2xl shadow-xl shadow-emerald-900/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <svg className="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.45 12.15l-1.45 1.45-1.45-1.45c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l2.15 2.15c.39.39 1.02.39 1.41 0l2.15-2.15c.39-.39.39-1.02 0-1.41-.39-.4-.1.39-1.4-.39z" />
            </svg>
          </div>
          <h2 className="text-[10px] font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
            <span className="h-4 w-1 bg-emerald-400 rounded-full"></span>
            Department Power Ranking
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {deptRanking.map((dept, i) => (
              <div key={dept.name} className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">RANK 0{i + 1}</span>
                  <div className="text-white font-black text-lg tabular-nums whitespace-nowrap">₱{dept.total.toLocaleString()}</div>
                </div>
                <div className="text-white font-black text-xs uppercase tracking-tight mb-2">{dept.name}</div>
                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400" style={{ width: `${(dept.total / (deptRanking[0]?.total || 1)) * 100}%` }} />
                </div>
              </div>
            ))}
            {deptRanking.length === 0 && <p className="text-white/40 italic text-xs">No sector telemetry recorded.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
