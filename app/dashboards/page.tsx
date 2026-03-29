"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../src/lib/firebase/client";
import {
  DONATION_CATEGORIES,
  MSK_DEPARTMENTS,
  RELIGIOUS_ORG_DEPARTMENTS,
  ALL_MINISTRIES
} from "../../src/lib/constants";

interface Donation {
  id: string;
  giverName: string;
  amount: number;
  groupName?: string;
  ministry?: string;
  donationDate: string;
  category?: string;
  department?: string;
  noOfGivers?: number;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const FULL_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-2.5 h-2.5 text-emerald-600 shrink-0">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

export default function Dashboard() {
  const router = useRouter();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const [activeYear, setActiveYear] = useState<string>(now.getFullYear().toString());
  const [activeMonth, setActiveMonth] = useState<number>(-1); // Default to All Months
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [activeDept, setActiveDept] = useState<string>("All");
  const [activeMinistry, setActiveMinistry] = useState<string>("All");
  const [quickSearch, setQuickSearch] = useState<string>("");
  const [isQuickSearchSelected, setIsQuickSearchSelected] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) router.push("/");
    });

    // We keep a sufficient limit for recent contributions and filtering
    const donationsQuery = query(
      collection(db, "donations"),
      orderBy("donationDate", "desc"),
      limit(500)
    );

    const unsubscribeDonations = onSnapshot(donationsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          ...d,
          amount: typeof d.amount === 'number' ? d.amount : (Number(String(d.amount || 0).replace(/[^\d.-]/g, "")) || 0),
          noOfGivers: typeof d.noOfGivers === 'number' ? d.noOfGivers : (Number(String(d.noOfGivers || 1).replace(/[^\d.-]/g, "")) || 1),
          category: d.category ? String(d.category).trim() : "Uncategorized",
          department: d.department ? String(d.department).trim() : "N/A",
          ministry: d.ministry ? String(d.ministry).trim() : (d.groupName ? String(d.groupName).trim() : "N/A"),
          groupName: d.groupName ? String(d.groupName).trim() : "N/A",
        };
      }) as Donation[];
      setDonations(data);
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeDonations();
    };
  }, [router]);

  // DERIVED DATA WITH FILTERS
  const passesFilters = (d: Donation) => {
    const normalize = (s: string) => (s || "").toLowerCase().trim();

    // Fuzzy matching helper: checks if two strings match exactly or if they share a significant component (split by - or |)
    const matchesFuzzy = (recordVal: string, filterVal: string) => {
      const r = normalize(recordVal);
      const f = normalize(filterVal);
      if (f === "all" || f === "") return true;
      if (r === f) return true;

      // Split by common delimiters used in the app ( - and | )
      const rParts = r.split(/[\-\|]/).map(p => p.trim()).filter(p => p.length > 0);
      const fParts = f.split(/[\-\|]/).map(p => p.trim()).filter(p => p.length > 0);

      // Match if the record value contains the filter value or vice versa, 
      // or if they share any component parts (e.g., "KAWAN I" matches "KAWAN I - SAN PEDRO")
      return r.includes(f) || f.includes(r) || rParts.some(rp => fParts.includes(rp)) || fParts.some(fp => rParts.some(rp => rp.includes(fp) || fp.includes(rp)));
    };

    const catMatch = activeCategory === "All" || normalize(d.category || "") === normalize(activeCategory);
    const deptMatch = activeDept === "All" || matchesFuzzy(d.department || "", activeDept);
    const ministryMatch = activeMinistry === "All" ||
      matchesFuzzy(d.ministry || "", activeMinistry) ||
      matchesFuzzy(d.groupName || "", activeMinistry);

    return catMatch && deptMatch && ministryMatch;
  };

  const monthFiltered = donations.filter(d => {
    if (!d.donationDate) return false;
    const date = new Date(d.donationDate);
    if (isNaN(date.getTime())) return false; // Skip invalid dates

    const yearMatch = date.getFullYear().toString() === activeYear;
    const monthMatch = activeMonth === -1 || date.getMonth() === activeMonth;

    return yearMatch && monthMatch && passesFilters(d);
  });

  const yearFiltered = donations.filter(d => {
    if (!d.donationDate) return false;
    const date = new Date(d.donationDate);
    if (isNaN(date.getTime())) return false;

    return date.getFullYear().toString() === activeYear && passesFilters(d);
  });

  const availableYears = Array.from(new Set(donations.map(d => {
    if (!d.donationDate) return "";
    const date = new Date(d.donationDate);
    return isNaN(date.getTime()) ? "" : date.getFullYear().toString();
  }))).filter(y => y !== "").sort((a, b) => b.localeCompare(a));

  const monthTotal = monthFiltered.reduce((acc, curr) => acc + curr.amount, 0);
  const monthGivers = monthFiltered.reduce((acc, curr) => acc + (curr.noOfGivers || 1), 0);
  const monthAvg = monthFiltered.length > 0 ? monthTotal / monthFiltered.length : 0;
  const monthLargest = monthFiltered.length > 0 ? [...monthFiltered].sort((a, b) => b.amount - a.amount)[0] : null;

  const monthlyStats = MONTHS.map((name, index) => {
    const txs = yearFiltered.filter(d => new Date(d.donationDate).getMonth() === index);
    const total = txs.reduce((acc, curr) => acc + curr.amount, 0);
    const count = txs.length;
    const givers = txs.reduce((acc, curr) => acc + (curr.noOfGivers || 1), 0);
    return { name, total, count, givers };
  });

  const yearMax = Math.max(...monthlyStats.map(s => s.total), 1);
  const GRAPH_WIDTH = 420;
  const GRAPH_HEIGHT = 160;
  const GRAPH_PLOT_HEIGHT = 140;

  const generatePath = () => {
    if (monthlyStats.length === 0) return "";
    return monthlyStats.map((s, i) => {
      const x = (i / 11) * GRAPH_WIDTH;
      const y = GRAPH_HEIGHT - (s.total / yearMax) * GRAPH_PLOT_HEIGHT;
      if (i === 0) return `M${x},${y}`;
      const prevX = ((i - 1) / 11) * GRAPH_WIDTH;
      const prevY = GRAPH_HEIGHT - (monthlyStats[i - 1].total / yearMax) * GRAPH_PLOT_HEIGHT;
      const cpX = prevX + (x - prevX) / 2;
      return `C${cpX},${prevY} ${cpX},${y} ${x},${y}`;
    }).join(" ");
  };



  if (loading) return <div className="flex-1 flex items-center justify-center text-emerald-900 font-bold">Initializing Dashboard...</div>;

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden gap-6 font-sans w-full bg-white">

      {/* 1. COMPACT HEADER */}
      <header className="flex flex-col justify-between gap-4 bg-white px-6 py-6 rounded-2xl border border-gray-100 shadow-sm shrink-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-lg font-black text-emerald-950 uppercase tracking-tight leading-none">Dashboard</h1>
            <p className="text-emerald-700/60 font-bold text-[8px] uppercase tracking-widest mt-0.5">{activeMonth === -1 ? "All Months" : FULL_MONTHS[activeMonth]} Activity • {activeYear}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Year Selector */}
            <div className="flex items-center gap-2 bg-zinc-50 px-3 py-1.5 rounded-lg border border-gray-100">
              <span className="text-[8px] font-black text-emerald-900/40 uppercase">Year:</span>
              <select
                value={activeYear}
                onChange={(e) => setActiveYear(e.target.value)}
                className="bg-transparent text-[10px] font-black text-emerald-950 outline-none cursor-pointer"
              >
                {availableYears.length > 0 ? availableYears.map(y => <option key={y} value={y}>{y}</option>) : <option value={activeYear}>{activeYear}</option>}
              </select>
            </div>

            {/* Month Selector */}
            <div className="flex items-center gap-2 bg-emerald-600 px-3 py-1.5 rounded-lg shadow-lg shadow-emerald-700/10">
              <span className="text-[8px] font-black text-white/50 uppercase">Month:</span>
              <select
                value={activeMonth}
                onChange={(e) => setActiveMonth(parseInt(e.target.value))}
                className="bg-transparent text-[10px] font-black text-white outline-none cursor-pointer"
              >
                <option value={-1} className="text-emerald-950">All Months</option>
                {FULL_MONTHS.map((m, i) => <option key={m} value={i} className="text-emerald-950">{m}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-nowrap items-center gap-1.5 pt-3 border-t border-gray-50 overflow-x-auto w-full">
          {/* Quick Search */}
          <div className="flex items-center gap-1.5 bg-emerald-50/50 px-2 py-1 rounded-lg border border-emerald-100 flex-1 min-w-[200px] shrink-0">
            <span className="text-[7px] font-black text-emerald-600 uppercase tracking-widest shrink-0 w-[50px]">Search:</span>
            <input
              type="text"
              list="dashboard-ministry-list"
              value={quickSearch}
              onChange={(e) => {
                const val = e.target.value;
                setQuickSearch(val);
                const match = ALL_MINISTRIES.find(m => m.name === val);
                if (match) {
                  setActiveCategory(match.category);
                  setActiveDept(match.department);
                  setActiveMinistry(match.name);
                  setIsQuickSearchSelected(true);
                } else if (val === "") {
                  setActiveCategory("All");
                  setActiveDept("All");
                  setActiveMinistry("All");
                  setIsQuickSearchSelected(false);
                } else {
                  setIsQuickSearchSelected(false);
                }
              }}
              placeholder={isQuickSearchSelected ? "Locked" : "Type ministry..."}
              className="bg-transparent text-[9px] font-black text-emerald-950 outline-none flex-1 placeholder:text-emerald-300 disabled:opacity-50 min-w-0"
              disabled={isQuickSearchSelected}
            />
            <datalist id="dashboard-ministry-list">
              {ALL_MINISTRIES.map(m => (
                <option key={m.name} value={m.name} />
              ))}
            </datalist>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-zinc-50 px-2 py-1 rounded-lg border border-gray-100 w-[130px] shrink-0">
            <span className="text-[7px] font-black text-emerald-900/40 uppercase tracking-widest shrink-0">Cat:</span>
            <select
              value={activeCategory}
              onChange={(e) => {
                setActiveCategory(e.target.value);
                setActiveDept("All");
                setActiveMinistry("All");
                setQuickSearch("");
                setIsQuickSearchSelected(false);
              }}
              className="bg-transparent text-[9px] font-black text-emerald-950 outline-none cursor-pointer disabled:opacity-30 flex-1 min-w-0"
              disabled={isQuickSearchSelected}
            >
              <option value="All">All Categories</option>
              {DONATION_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            {isQuickSearchSelected && <LockIcon />}
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-1 bg-zinc-50 px-2 py-1 rounded-lg border border-gray-100 w-[160px] shrink-0">
            <span className="text-[7px] font-black text-emerald-900/40 uppercase tracking-widest shrink-0">Dept:</span>
            <select
              value={activeDept}
              onChange={(e) => {
                setActiveDept(e.target.value);
                setActiveMinistry("All");
                setQuickSearch("");
                setIsQuickSearchSelected(false);
              }}
              className="bg-transparent text-[9px] font-black text-emerald-950 outline-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex-1 min-w-0"
              disabled={activeCategory === "All" || activeCategory === "Parishioner" || isQuickSearchSelected}
            >
              <option value="All">Select Dept</option>
              {activeCategory === "MSK" && MSK_DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
              {activeCategory === "Religious Organization" && RELIGIOUS_ORG_DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
              {activeCategory === "Parishioner" && <option value="GENERAL">GENERAL</option>}
            </select>
            {isQuickSearchSelected && <LockIcon />}
          </div>

          {/* Ministry Filter */}
          <div className="flex items-center gap-1 bg-zinc-50 px-2 py-1 rounded-lg border border-gray-100 flex-1 min-w-[150px] shrink-0">
            <span className="text-[7px] font-black text-emerald-900/40 uppercase tracking-widest shrink-0">Min:</span>
            <select
              value={activeMinistry}
              onChange={(e) => {
                setActiveMinistry(e.target.value);
                setQuickSearch("");
                setIsQuickSearchSelected(false);
              }}
              className="bg-transparent text-[9px] font-black text-emerald-950 outline-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex-1 min-w-0"
              disabled={activeDept === "All" || activeCategory === "Parishioner" || isQuickSearchSelected}
            >
              <option value="All">Select Ministry</option>
              {ALL_MINISTRIES
                .filter(m => {
                  const normalize = (s: string) => (s || "").toLowerCase().trim();
                  const catMatch = activeCategory === "All" || normalize(m.category) === normalize(activeCategory);
                  const deptMatch = activeDept === "All" || normalize(m.department) === normalize(activeDept);
                  return catMatch && deptMatch;
                })
                .map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
            </select>
            {isQuickSearchSelected && <LockIcon />}
          </div>

          {/* Always Show Reset Filters */}
          <button
            onClick={() => {
              setActiveCategory("All");
              setActiveDept("All");
              setActiveMinistry("All");
              setQuickSearch("");
              setIsQuickSearchSelected(false);
            }}
            className={`text-[8px] font-black uppercase transition-colors ml-auto shrink-0 ${activeCategory === "All" && activeDept === "All" && activeMinistry === "All" && !isQuickSearchSelected
              ? "text-gray-300 pointer-events-none"
              : "text-red-500 hover:text-red-700 cursor-pointer"
              }`}
          >
            Reset Filters
          </button>
        </div>
      </header>

      {/* MAIN CONTENT GRID - SINGLE PAGE LAYOUT */}
      <div className="flex-1 min-h-0 grid grid-cols-12 grid-rows-6 gap-4">

        {/* KPI CARDS - Spanning Top row */}
        <div className="col-span-12 row-span-1 grid grid-cols-4 gap-4">
          {[
            { label: activeMonth === -1 ? "Annual Summary" : "Current Month Summary", val: `₱${monthTotal.toLocaleString()}` },
            { label: "Contributors", val: monthGivers },
            { label: "Avg Contribution", val: `₱${monthAvg.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
            {
              label: "Highest Single Gift",
              val: `₱${monthLargest?.amount.toLocaleString() || 0}`,
              subtitle: monthLargest ? [monthLargest.giverName, (!monthLargest.ministry || monthLargest.ministry === "N/A") ? "Parishioner" : monthLargest.ministry] : []
            }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm shadow-emerald-900/5 flex flex-col justify-center gap-2 hover:border-emerald-100 transition-all group">
              <span className="text-[8px] font-bold text-emerald-900/40 uppercase tracking-[0.15em] leading-none">{stat.label}</span>
              <div className="flex flex-col overflow-hidden">
                <span className="text-xl font-black text-emerald-950 tabular-nums tracking-tight leading-none mb-1.5 group-hover:text-emerald-900 transition-colors whitespace-nowrap">{stat.val}</span>
                <div className="flex flex-col min-h-[22px] justify-center">
                  {(Array.isArray(stat.subtitle) ? stat.subtitle : [stat.subtitle]).filter(Boolean).map((line, idx) => (
                    <span key={idx} className={`${idx === 1 ? 'text-[7px] font-semibold text-emerald-800/40' : 'text-[8px] font-bold text-emerald-700/70'} uppercase tracking-widest truncate leading-tight`}>
                      {line}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* TREND GRAPH - Central Main Body */}
        <div className="col-span-12 row-span-3 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4 shrink-0">
            <h2 className="text-[10px] font-black text-emerald-950 uppercase tracking-widest flex items-center gap-3">
              <span className="h-4 w-1 bg-emerald-600 rounded-full"></span>
              Donation Trend Analysis ({activeYear})
            </h2>
            <div className="text-[9px] font-black text-emerald-900/40 uppercase tabular-nums whitespace-nowrap">Peak: ₱{yearMax.toLocaleString()}</div>
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
              <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`} preserveAspectRatio="none">
                <line x1="0" y1="80" x2={GRAPH_WIDTH} y2="80" stroke="#f1f5f9" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                <line x1="0" y1={GRAPH_HEIGHT} x2={GRAPH_WIDTH} y2={GRAPH_HEIGHT} stroke="#f1f5f9" strokeWidth="1" vectorEffect="non-scaling-stroke" />

                <defs>
                  <linearGradient id="trend-grad-area" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#059669" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                <path d={`${generatePath()} L${GRAPH_WIDTH},${GRAPH_HEIGHT} L0,${GRAPH_HEIGHT} Z`} fill="url(#trend-grad-area)" />
                <path d={generatePath()} fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              </svg>

              {/* HTML Overlay for Points and Tooltips */}
              <div className="absolute inset-0 pointer-events-none">
                {monthlyStats.map((s, i) => {
                  const leftPercentage = (i / 11) * 100;
                  const topPercentage = (1 - (s.total / yearMax) * (GRAPH_PLOT_HEIGHT / GRAPH_HEIGHT)) * 100;
                  const isActive = i === activeMonth;
                  const isHovered = hoveredMonth === i;

                  return (
                    <div
                      key={i}
                      className="absolute pointer-events-auto cursor-pointer flex justify-center items-center group z-10"
                      style={{
                        left: `${leftPercentage}%`,
                        top: `${topPercentage}%`,
                        width: '36px', height: '36px',
                        transform: 'translate(-50%, -50%)'
                      }}
                      onMouseEnter={() => setHoveredMonth(i)}
                      onMouseLeave={() => setHoveredMonth(null)}
                    >
                      <div
                        className={`rounded-full border-[#059669] transition-all duration-300 absolute box-border ${isActive || isHovered
                          ? "bg-[#059669] border-[2.5px] w-[10px] h-[10px]"
                          : "bg-white border-[1.5px] w-[6px] h-[6px]"
                          }`}
                      />

                      {!isHovered && s.total > 0 && (
                        <div
                          className={`absolute pointer-events-none transition-all duration-300 whitespace-nowrap ${isActive ? 'text-[8px] text-emerald-800 font-black' : 'text-[6px] text-emerald-600/50 font-bold'
                            }`}
                          style={{
                            left: '50%', top: '50%',
                            transform: `translate(6px, ${isActive ? '-12px' : '-10px'})`
                          }}
                        >
                          ₱{s.total >= 1000 ? `${(s.total / 1000).toFixed(0)}k` : s.total}
                        </div>
                      )}

                      {isHovered && (
                        <div
                          className="absolute flex flex-col items-center justify-center bg-[#022c22] rounded-[5px] drop-shadow-xl pointer-events-none z-50 w-[72px] h-[28px]"
                          style={{ left: '50%', top: '50%', transform: 'translate(-50%, -40px)' }}
                        >
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-[4px] border-transparent border-t-[#022c22]" />
                          <div className="text-[9px] font-black text-white tabular-nums leading-none">
                            ₱{s.total.toLocaleString()}
                          </div>
                          <div className="text-[5px] font-black text-[#6ee7b7] uppercase tracking-widest leading-none mt-1">
                            {s.count} tx • {s.givers} donors
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
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

      </div>
    </div>
  );
}
