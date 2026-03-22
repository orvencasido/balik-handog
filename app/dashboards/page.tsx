"use client";

import { useState } from "react";
import { useAuthGuard } from "../../src/lib/useAuthGuard";
import { useDonations } from "../../src/lib/useDonations";
import { MONTHS, FULL_MONTHS } from "../../src/lib/constants";
import PageHeader from "../components/PageHeader";
import KpiCard from "../components/KpiCard";
import LoadingScreen from "../components/LoadingScreen";

/* ------------------------------------------------------------------ */
/*  Graph constants                                                    */
/* ------------------------------------------------------------------ */
const GRAPH_WIDTH = 420;
const GRAPH_HEIGHT = 160;
const GRAPH_PLOT_HEIGHT = 140;

export default function Dashboard() {
  useAuthGuard();
  const { donations, loading } = useDonations({
    orderByField: "donationDate",
    direction: "desc",
    maxResults: 500,
  });

  const now = new Date();
  const [activeYear, setActiveYear] = useState<string>(now.getFullYear().toString());
  const [activeMonth, setActiveMonth] = useState<number>(now.getMonth());
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  /* ---------------------------------------------------------------- */
  /*  Derived data                                                     */
  /* ---------------------------------------------------------------- */
  const yearFiltered = donations.filter(
    (d) => new Date(d.donationDate).getFullYear().toString() === activeYear
  );

  const monthFiltered = yearFiltered.filter(
    (d) => new Date(d.donationDate).getMonth() === activeMonth
  );

  const availableYears = Array.from(
    new Set(donations.map((d) => new Date(d.donationDate).getFullYear().toString()))
  )
    .filter(Boolean)
    .sort((a, b) => b.localeCompare(a));

  /* KPI values */
  const monthTotal = monthFiltered.reduce((acc, d) => acc + d.amount, 0);
  const monthGivers = new Set(monthFiltered.map((d) => d.giverName)).size;
  const monthAvg = monthFiltered.length > 0 ? monthTotal / monthFiltered.length : 0;
  const monthLargest =
    monthFiltered.length > 0
      ? [...monthFiltered].sort((a, b) => b.amount - a.amount)[0]
      : null;

  /* Monthly stats for the graph */
  const monthlyStats = MONTHS.map((name, index) => {
    const txs = yearFiltered.filter((d) => new Date(d.donationDate).getMonth() === index);
    const total = txs.reduce((acc, d) => acc + d.amount, 0);
    const count = txs.length;
    const givers = new Set(txs.map((d) => d.giverName)).size;
    return { name, total, count, givers };
  });

  const yearMax = Math.max(...monthlyStats.map((s) => s.total), 1);

  /* SVG path generator (smooth Bézier) */
  const generatePath = () => {
    return monthlyStats
      .map((s, i) => {
        const x = (i / 11) * GRAPH_WIDTH;
        const y = GRAPH_HEIGHT - (s.total / yearMax) * GRAPH_PLOT_HEIGHT;
        if (i === 0) return `M${x},${y}`;
        const prevX = ((i - 1) / 11) * GRAPH_WIDTH;
        const prevY = GRAPH_HEIGHT - (monthlyStats[i - 1].total / yearMax) * GRAPH_PLOT_HEIGHT;
        const cpX = prevX + (x - prevX) / 2;
        return `C${cpX},${prevY} ${cpX},${y} ${x},${y}`;
      })
      .join(" ");
  };

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */
  if (loading) return <LoadingScreen message="Initializing Dashboard..." />;

  const kpiCards = [
    { label: "Current Month Summary", val: `₱ ${monthTotal.toLocaleString()}` },
    { label: "Contributors", val: monthGivers },
    { label: "Avg Contribution", val: `₱ ${monthAvg.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
    { label: "Highest Single Gift", val: `₱ ${monthLargest?.amount.toLocaleString() || 0}`, subtitle: monthLargest?.giverName },
  ];

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden gap-6 font-sans w-full bg-white">
      {/* ---------- Header with filters ---------- */}
      <PageHeader
        title="Dashboard"
        subtitle={`${FULL_MONTHS[activeMonth]} Activity • ${activeYear}`}
      >
        {/* Month selector */}
        <div className="flex items-center gap-2 bg-emerald-600 px-3 py-1.5 rounded-lg shadow-lg shadow-emerald-700/10">
          <span className="text-[8px] font-black text-white/50 uppercase">Month:</span>
          <select
            value={activeMonth}
            onChange={(e) => setActiveMonth(parseInt(e.target.value))}
            className="bg-transparent text-[10px] font-black text-white outline-none cursor-pointer"
          >
            {FULL_MONTHS.map((m, i) => (
              <option key={m} value={i} className="text-emerald-950">{m}</option>
            ))}
          </select>
        </div>

        {/* Year selector */}
        <div className="flex items-center gap-2 bg-zinc-50 px-3 py-1.5 rounded-lg border border-gray-100">
          <select
            value={activeYear}
            onChange={(e) => setActiveYear(e.target.value)}
            className="bg-transparent text-[10px] font-black text-emerald-950 outline-none cursor-pointer"
          >
            {availableYears.length > 0
              ? availableYears.map((y) => <option key={y} value={y}>{y}</option>)
              : <option value={activeYear}>{activeYear}</option>}
          </select>
        </div>
      </PageHeader>

      {/* ---------- Main content grid ---------- */}
      <div className="flex-1 min-h-0 grid grid-cols-12 grid-rows-6 gap-4">
        {/* KPI Cards */}
        <div className="col-span-12 row-span-1 grid grid-cols-4 gap-4">
          {kpiCards.map((stat, i) => (
            <KpiCard key={i} {...stat} />
          ))}
        </div>

        {/* ---------- Trend Graph ---------- */}
        <div className="col-span-12 row-span-3 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4 shrink-0">
            <h2 className="text-[10px] font-black text-emerald-950 uppercase tracking-widest flex items-center gap-3">
              <span className="h-4 w-1 bg-emerald-600 rounded-full" />
              Donation Trend Analysis ({activeYear})
            </h2>
            <div className="text-[9px] font-black text-emerald-900/40 uppercase tabular-nums">
              Peak: ₱{yearMax.toLocaleString()}
            </div>
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

            {/* SVG chart */}
            <div className="absolute left-14 right-4 top-0 bottom-8">
              <svg
                className="w-full h-full overflow-visible"
                viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
                preserveAspectRatio="none"
              >
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

              {/* Interactive data points */}
              <div className="absolute inset-0 pointer-events-none">
                {monthlyStats.map((s, i) => {
                  const leftPct = (i / 11) * 100;
                  const topPct = (1 - (s.total / yearMax) * (GRAPH_PLOT_HEIGHT / GRAPH_HEIGHT)) * 100;
                  const isActive = i === activeMonth;
                  const isHovered = hoveredMonth === i;

                  return (
                    <div
                      key={i}
                      className="absolute pointer-events-auto cursor-pointer flex justify-center items-center group z-10"
                      style={{
                        left: `${leftPct}%`,
                        top: `${topPct}%`,
                        width: "36px",
                        height: "36px",
                        transform: "translate(-50%, -50%)",
                      }}
                      onMouseEnter={() => setHoveredMonth(i)}
                      onMouseLeave={() => setHoveredMonth(null)}
                    >
                      {/* Dot */}
                      <div
                        className={`rounded-full border-[#059669] transition-all duration-300 absolute box-border ${isActive || isHovered
                            ? "bg-[#059669] border-[2.5px] w-[10px] h-[10px]"
                            : "bg-white border-[1.5px] w-[6px] h-[6px]"
                          }`}
                      />

                      {/* Inline label */}
                      {!isHovered && s.total > 0 && (
                        <div
                          className={`absolute pointer-events-none transition-all duration-300 whitespace-nowrap ${isActive
                              ? "text-[8px] text-emerald-800 font-black"
                              : "text-[6px] text-emerald-600/50 font-bold"
                            }`}
                          style={{
                            left: "50%",
                            top: "50%",
                            transform: `translate(6px, ${isActive ? "-12px" : "-10px"})`,
                          }}
                        >
                          ₱{s.total >= 1000 ? `${(s.total / 1000).toFixed(0)}k` : s.total}
                        </div>
                      )}

                      {/* Hover tooltip */}
                      {isHovered && (
                        <div
                          className="absolute flex flex-col items-center justify-center bg-[#022c22] rounded-[5px] drop-shadow-xl pointer-events-none z-50 w-[72px] h-[28px]"
                          style={{ left: "50%", top: "50%", transform: "translate(-50%, -40px)" }}
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
                <span
                  key={i}
                  className={`text-[9px] font-black uppercase ${i === activeMonth
                      ? "text-emerald-700 underline underline-offset-4 decoration-2"
                      : "text-zinc-300"
                    }`}
                >
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
