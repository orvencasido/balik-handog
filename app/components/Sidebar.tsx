"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { auth, db } from "../../src/lib/firebase/client";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const navItems = [
  { name: "Dashboard", href: "/dashboards", iconPath: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", adminOnly: false },
  { name: "Donate", href: "/donate", iconPath: "M10 21v-6.5a.5.5 0 0 0-.5-.5h-2a.5.5 0 0 0-.5.5V21h3Z M21 12H3 M12 3a9 9 0 0 1 9 9v9H3v-9a9 9 0 0 1 9-9Z", adminOnly: true },
  { name: "Records", href: "/records", iconPath: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", adminOnly: false },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setIsAdmin(userDoc.data().role === 'admin');
        } else {
          setIsAdmin(false);
        }
      }
    });
    return () => unsub();
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-emerald-950 flex items-center justify-between px-4 py-3 shadow-lg shadow-emerald-950/30">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-900 p-1.5 rounded-lg border border-emerald-800/50">
            <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2a1 1 0 011 1v2h2V3a1 1 0 112 0v2h2V3a1 1 0 112 0v18a1 1 0 11-2 0V7h-2v14a1 1 0 11-2 0V7h-2v14a1 1 0 11-2 0V7H9v14a1 1 0 11-2 0V7H5v14a1 1 0 11-2 0V3a1 1 0 011-1h1v2h2V3a1 1 0 012 0v2h2V3a1 1 0 011-1z" />
            </svg>
          </div>
          <div>
            <h2 className="text-[10px] font-black text-white tracking-widest uppercase leading-none">St. Ferdinand</h2>
            <p className="text-[7px] font-bold text-emerald-400/60 uppercase tracking-tighter leading-none mt-0.5">Balik-Handog</p>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-emerald-400 hover:text-white transition-colors rounded-lg hover:bg-emerald-900"
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        w-52 bg-emerald-950 h-screen fixed left-0 top-0 flex flex-col z-50 border-r border-emerald-900 font-sans shadow-xl shadow-emerald-950/20 text-white
        transition-transform duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Sidebar Header Space */}
        <div className="py-10 flex flex-col items-start px-8 space-y-4">
          <div className="bg-emerald-900 p-2.5 rounded-xl shadow-inner active:scale-95 transition-transform duration-500 w-fit border border-emerald-800/50">
            <svg className="w-6 h-6 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2a1 1 0 011 1v2h2V3a1 1 0 112 0v2h2V3a1 1 0 112 0v18a1 1 0 11-2 0V7h-2v14a1 1 0 11-2 0V7h-2v14a1 1 0 11-2 0V7H9v14a1 1 0 11-2 0V7H5v14a1 1 0 11-2 0V3a1 1 0 011-1h1v2h2V3a1 1 0 012 0v2h2V3a1 1 0 011-1z" />
            </svg>
          </div>
          <div className="text-left w-full">
            <h2 className="text-[12px] font-black text-white tracking-widest uppercase leading-tight">ST. FERDINAND <br /> CATHEDRAL</h2>
            <p className="text-[9px] font-bold text-emerald-400/60 uppercase tracking-tighter mt-1.5 leading-none">Balik-Handog <br /> Donation Records</p>
            <div className="mt-4">
              {isAdmin ? (
                <span className="inline-flex items-center gap-1.5 bg-emerald-500 text-white text-[8px] font-black px-2.5 py-1.5 rounded-md uppercase tracking-widest shadow-lg shadow-emerald-500/20 leading-none">
                  <span className="h-1 w-1 rounded-full bg-white animate-pulse mt-px"></span>
                  Admin Access
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 bg-emerald-900 text-emerald-300 border border-emerald-800 text-[8px] font-black px-2.5 py-1.5 rounded-md uppercase tracking-widest leading-none">
                  <span className="h-1 w-1 rounded-full bg-emerald-400 mt-px"></span>
                  Viewer Access
                </span>
              )}
            </div>
          </div>
        </div>

        <nav className="flex-1 mt-6 px-4 space-y-1">
          {navItems
            .filter(item => !item.adminOnly || isAdmin)
            .map((item) => {
              const isActive = pathname === item.href;
              return (
                <div key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center group px-5 py-3.5 text-xs font-bold tracking-tight rounded-xl transition-all ${isActive
                      ? "bg-emerald-900 text-white"
                      : "text-emerald-500/60 hover:text-emerald-200 hover:bg-emerald-900/50"
                      }`}
                  >
                    <svg
                      className={`mr-3 h-5 w-5 ${isActive ? "text-emerald-400" : "text-emerald-600/50 group-hover:text-emerald-400"} transition-all`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={item.iconPath} />
                    </svg>
                    {item.name}
                  </Link>
                </div>
              );
            })}
        </nav>

        <div className="p-4 mt-auto space-y-2">
          <button
            onClick={() => signOut(auth)}
            className="w-full flex items-center justify-center px-5 py-3 text-[10px] font-black uppercase tracking-widest text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30 rounded-xl transition-all shadow-sm"
          >
            Log Out
          </button>
          <div className="flex items-center justify-center">
            <span className="text-[7px] text-emerald-500/40 font-bold uppercase tracking-widest text-center">v1.0 | © Orven Casido</span>
          </div>
        </div>
      </aside>
    </>
  );
}
