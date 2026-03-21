"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "../../src/lib/firebase/client";

interface Donation {
  id: string;
  giverName: string;
  amount: number;
  groupName: string;
  donationDate: string;
  createdAt: any;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const FULL_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const [activeYear, setActiveYear] = useState<string>(now.getFullYear().toString());
  const [activeMonth, setActiveMonth] = useState<number>(now.getMonth());

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) router.push("/");
      else setUser(currentUser);
    });

    // We keep a sufficient limit for recent contributions and filtering
    const donationsQuery = query(
      collection(db, "donations"),
      orderBy("donationDate", "desc"),
      limit(500)
    );

    const unsubscribeDonations = onSnapshot(donationsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Donation[];
      setDonations(data);
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeDonations();
    };
  }, [router]);

  // DERIVED DATA
  const monthFiltered = donations.filter(d => {
    const date = new Date(d.donationDate);
    return date.getFullYear().toString() === activeYear && date.getMonth() === activeMonth;
  });

  const yearFiltered = donations.filter(d => {
    return new Date(d.donationDate).getFullYear().toString() === activeYear;
  });

  const availableYears = Array.from(new Set(donations.map(d => new Date(d.donationDate).getFullYear().toString()))).filter(Boolean).sort((a, b) => b.localeCompare(a));

  const monthTotal = monthFiltered.reduce((acc, curr) => acc + curr.amount, 0);
  const monthGivers = new Set(monthFiltered.map(d => d.giverName)).size;
  const monthAvg = monthFiltered.length > 0 ? monthTotal / monthFiltered.length : 0;
  const monthLargest = monthFiltered.length > 0 ? [...monthFiltered].sort((a, b) => b.amount - a.amount)[0] : null;

  const monthlyStats = MONTHS.map((name, index) => {
    const total = yearFiltered.filter(d => new Date(d.donationDate).getMonth() === index)
      .reduce((acc, curr) => acc + curr.amount, 0);
    return { name, total };
  });

  const yearMax = Math.max(...monthlyStats.map(s => s.total), 1);

  const generatePath = () => {
    return monthlyStats.map((s, i) => {
      const x = (i / 11) * 600;
      const y = 160 - (s.total / yearMax) * 140;
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    }).join(" ");
  };

  const rankData = Array.from(new Set(monthFiltered.map(d => d.groupName)))
    .map(dept => {
      const total = monthFiltered.filter(d => d.groupName === dept).reduce((acc, curr) => acc + curr.amount, 0);
      return { name: dept, total };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  if (loading) return <div className="flex-1 flex items-center justify-center text-emerald-900 font-bold">Initializing Dashboard...</div>;

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden p-6 gap-6 font-sans max-w-[1600px] mx-auto bg-[#fafafa]">

      {/* 1. COMPACT HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm shrink-0">
        <div>
          <h1 className="text-xl font-black text-emerald-950 uppercase tracking-tight">Financial Dashboard</h1>
          <p className="text-emerald-700/60 font-bold text-[9px] uppercase tracking-widest mt-1">{FULL_MONTHS[activeMonth]} Activity • {activeYear}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-600 px-4 py-2 rounded-xl shadow-lg shadow-emerald-700/10">
            <span className="text-[9px] font-black text-white/50 uppercase">Month:</span>
            <select
              value={activeMonth}
              onChange={(e) => setActiveMonth(parseInt(e.target.value))}
              className="bg-transparent text-[11px] font-black text-white outline-none cursor-pointer"
            >
              {FULL_MONTHS.map((m, i) => <option key={m} value={i} className="text-emerald-950">{m}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-zinc-50 px-4 py-2 rounded-xl border border-gray-100">
            <select
              value={activeYear}
              onChange={(e) => setActiveYear(e.target.value)}
              className="bg-transparent text-[11px] font-black text-emerald-950 outline-none cursor-pointer"
            >
              {availableYears.length > 0 ? availableYears.map(y => <option key={y} value={y}>{y}</option>) : <option value={activeYear}>{activeYear}</option>}
            </select>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT GRID - SINGLE PAGE LAYOUT */}
      <div className="flex-1 min-h-0 grid grid-cols-12 grid-rows-6 gap-6">

        {/* KPI CARDS - Spanning Top row */}
        <div className="col-span-12 row-span-1 grid grid-cols-4 gap-4">
          {[
            { label: `${FULL_MONTHS[activeMonth]} Summary`, val: `₱ ${monthTotal.toLocaleString()}`, color: "emerald" },
            { label: "Contributors", val: monthGivers, color: "zinc" },
            { label: "Avg Contribution", val: `₱ ${monthAvg.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: "zinc" },
            { label: "Highest Single Gift", val: `₱ ${monthLargest?.amount.toLocaleString() || 0}`, color: "zinc" }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
              <span className="text-[8px] font-black text-emerald-900/40 uppercase tracking-widest mb-1">{stat.label}</span>
              <span className="text-xl font-black text-emerald-950 tabular-nums leading-none">{stat.val}</span>
            </div>
          ))}
        </div>

        {/* TREND GRAPH - Central Main Body */}
        <div className="col-span-8 row-span-5 bg-white p-10 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-10 shrink-0">
            <h2 className="text-[10px] font-black text-emerald-950 uppercase tracking-widest flex items-center gap-3">
              <span className="h-4 w-1 bg-emerald-600 rounded-full"></span>
              Donation Trend Analysis ({activeYear})
            </h2>
            <div className="text-[9px] font-black text-emerald-900/40 uppercase tabular-nums">Peak: ₱{yearMax.toLocaleString()}</div>
          </div>

          <div className="flex-1 relative min-h-0">
            {/* Y-Axis labels */}
            <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between items-end pr-3">
              {[1, 0.5, 0].map((p) => {
                const val = yearMax * p;
                return (
                  <span key={p} className="text-[8px] font-bold text-zinc-300 tabular-nums">
                    {val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val.toFixed(0)}
                  </span>
                );
              })}
            </div>

            {/* SVG Content */}
            <div className="absolute left-14 right-4 top-0 bottom-8">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 160">
                <line x1="0" y1="80" x2="600" y2="80" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="160" x2="600" y2="160" stroke="#f1f5f9" strokeWidth="1" />

                <path d={`${generatePath()} L600,160 L0,160 Z`} fill="url(#trend-grad-full)" opacity="0.03" />
                <path d={generatePath()} fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" />

                <defs>
                  <linearGradient id="trend-grad-full" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#059669" />
                    <stop offset="100%" stopColor="#ffffff" />
                  </linearGradient>
                </defs>

                {monthlyStats.map((s, i) => (
                  <circle
                    key={i}
                    cx={(i / 11) * 600}
                    cy={160 - (s.total / yearMax) * 140}
                    r={i === activeMonth ? "6" : "3"}
                    fill={i === activeMonth ? "#059669" : "#ffffff"}
                    stroke="#059669" strokeWidth={i === activeMonth ? "3" : "2"}
                  />
                ))}
              </svg>
            </div>

            {/* X-Axis labels */}
            <div className="absolute left-14 right-4 bottom-0 flex justify-between px-1">
              {MONTHS.map((name, i) => (
                <span key={i} className={`text-[9px] font-black uppercase ${i === activeMonth ? 'text-emerald-700 underline underline-offset-4 decoration-2' : 'text-zinc-300'}`}>
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* SIDEBAR STACK - Ranking & Activity */}
        <div className="col-span-4 row-span-5 flex flex-col gap-6 min-h-0 overflow-hidden">

          {/* Power Ranking */}
          <div className="flex-1 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col min-h-0 overflow-hidden">
            <h2 className="text-[10px] font-black text-emerald-950 uppercase tracking-widest mb-6 shrink-0">Department Power Ranking</h2>
            <div className="flex-1 space-y-4 overflow-hidden">
              {rankData.map((dept, i) => {
                const perc = monthTotal > 0 ? (dept.total / monthTotal) * 100 : 0;
                return (
                  <div key={dept.name} className="group">
                    <div className="flex justify-between items-end text-[10px] font-black text-emerald-950 uppercase tracking-tight mb-2 group-hover:text-emerald-600 transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] text-zinc-300 tabular-nums font-bold">0{i + 1}</span>
                        <span className="truncate max-w-[100px] uppercase tracking-tighter">{dept.name}</span>
                      </div>
                      <span className="tabular-nums">₱ {dept.total.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-50 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${perc}%` }}></div>
                    </div>
                  </div>
                );
              })}
              {rankData.length === 0 && <p className="text-center py-6 text-[8px] font-black italic text-zinc-300 uppercase">No Data</p>}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="flex-1 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col min-h-0 overflow-hidden">
            <h2 className="text-[10px] font-black text-emerald-950 uppercase tracking-widest mb-6 shrink-0">Recent Activity</h2>
            <div className="flex-1 space-y-3 overflow-hidden">
              {donations.slice(0, 5).map((d) => (
                <div key={d.id} className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0 group">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-emerald-950 group-hover:text-emerald-600 transition-colors uppercase tabular-nums truncate max-w-[130px]">{d.giverName}</span>
                    <span className="text-[8px] text-zinc-400 font-bold uppercase mt-0.5">{new Date(d.donationDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {d.groupName}</span>
                  </div>
                  <div className="text-[10px] font-black text-emerald-950 tabular-nums">₱ {d.amount.toLocaleString()}</div>
                </div>
              ))}
              {donations.length === 0 && <p className="text-center py-6 text-[8px] font-black italic text-zinc-300 uppercase">No Contributions</p>}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
