"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { auth } from "../../src/lib/firebase/client";
import { signOut } from "firebase/auth";

const navItems = [
  { name: "Dashboard", href: "/dashboards", iconPath: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { name: "Donate", href: "/donate", iconPath: "M10 21v-6.5a.5.5 0 0 0-.5-.5h-2a.5.5 0 0 0-.5.5V21h3Z M21 12H3 M12 3a9 9 0 0 1 9 9v9H3v-9a9 9 0 0 1 9-9Z", children: false },
  // { name: "Analytics", href: "/analytics", iconPath: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", children: false },
  { name: "Records", href: "/records", iconPath: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", children: false },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-emerald-700 h-screen fixed left-0 top-0 flex flex-col z-50 border-r border-emerald-600/50 font-sans shadow-xl shadow-emerald-800/10">
      {/* Sidebar Header Space (Left-aligned & Modernized) */}
      <div className="p-8 pb-10 flex items-center gap-4 relative">
        <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-emerald-500 to-transparent" />
        <div className="bg-gradient-to-b from-white to-emerald-50 p-2.5 rounded-xl shadow-md shrink-0 ring-1 ring-black/5">
          <svg className="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2a1 1 0 011 1v2h2V3a1 1 0 112 0v2h2V3a1 1 0 112 0v18a1 1 0 11-2 0V7h-2v14a1 1 0 11-2 0V7h-2v14a1 1 0 11-2 0V7H9v14a1 1 0 11-2 0V7H5v14a1 1 0 11-2 0V3a1 1 0 011-1h1v2h2V3a1 1 0 012 0v2h2V3a1 1 0 011-1z" />
          </svg>
        </div>
        <div className="flex flex-col">
          <h2 className="text-[12px] font-black text-white tracking-widest uppercase leading-tight">
            St. Ferdinand Cathedral
          </h2>
          <p className="text-[9px] font-bold text-emerald-100/90 uppercase tracking-widest mt-1.5 leading-none">
            Balik Handog Donation System
          </p>
        </div>
      </div>

      <nav className="flex-1 mt-8 px-4 space-y-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <div key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center group px-4 py-3 text-sm font-semibold tracking-wide rounded-xl transition-all duration-300 ${isActive
                  ? "bg-emerald-800/60 text-white shadow-inner shadow-emerald-900/20 ring-1 ring-black/5"
                  : "text-emerald-50/80 hover:text-white hover:bg-white/10"
                  }`}
              >
                <svg
                  className={`mr-3.5 h-5 w-5 transition-transform duration-300 ${isActive
                    ? "text-white"
                    : "text-emerald-200/60 group-hover:text-white group-hover:scale-110"
                    }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.iconPath} />
                </svg>
                {item.name}
              </Link>
            </div>
          );
        })}
      </nav>

      {/* Footer Area */}
      <div className="p-6 mt-auto space-y-4">
        <button
          onClick={() => signOut(auth)}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 text-xs font-bold text-white hover:bg-white/10 rounded-xl transition-all ring-1 ring-white/20 hover:ring-white/40"
        >
          Sign Out
        </button>
        <div className="flex flex-col items-center justify-center opacity-60">
          <span className="text-[8px] text-white font-medium uppercase tracking-widest">
            Balik-Handog Donation
          </span>
          <span className="text-[8px] text-white font-medium mt-1">
            v1.0 | &copy; Orven Casido
          </span>
        </div>
      </div>
    </aside>
  );
}
