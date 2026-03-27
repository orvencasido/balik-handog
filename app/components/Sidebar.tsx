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

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setIsAdmin(userDoc.data().role === 'admin');
        } else {
          // Default to non-admin if no doc exists
          setIsAdmin(false);
        }
      }
    });
    return () => unsub();
  }, []);

  return (
    <aside className="w-64 bg-white h-screen fixed left-0 top-0 flex flex-col z-50 border-r border-gray-100 font-sans shadow-sm">
      {/* Sidebar Header Space */}
      <div className="py-10 flex flex-col items-center px-8 border-b border-gray-50 space-y-4">
        <div className="bg-emerald-600 p-2.5 rounded-xl shadow-lg shadow-emerald-700/10 active:scale-95 transition-transform duration-500">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2a1 1 0 011 1v2h2V3a1 1 0 112 0v2h2V3a1 1 0 112 0v18a1 1 0 11-2 0V7h-2v14a1 1 0 11-2 0V7h-2v14a1 1 0 11-2 0V7H9v14a1 1 0 11-2 0V7H5v14a1 1 0 11-2 0V3a1 1 0 011-1h1v2h2V3a1 1 0 012 0v2h2V3a1 1 0 011-1z" />
          </svg>
        </div>
        <div className="text-center">
          <h2 className="text-[12px] font-black text-emerald-950 tracking-widest uppercase leading-tight">ST. FERDINAND <br /> CATHEDRAL</h2>
          <p className="text-[9px] font-bold text-emerald-600/50 uppercase tracking-tighter mt-1.5 leading-none">Balik-Handog <br /> Donation Records {isAdmin ? '(Admin)' : '(Viewer)'}</p>
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
                  ? "bg-emerald-50 text-emerald-800"
                  : "text-zinc-400 hover:text-emerald-700 hover:bg-emerald-50/50"
                  }`}
              >
                <svg
                  className={`mr-3 h-5 w-5 ${isActive ? "text-emerald-600" : "text-zinc-400 group-hover:text-emerald-600"} transition-all`}
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

      <div className="p-4 mt-auto space-y-2 border-t border-gray-50">
        <button
          onClick={() => signOut(auth)}
          className="w-full flex items-center gap-3 px-5 py-3.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7" />
          </svg>
          Sign Out
        </button>
        <div className="bg-zinc-50 p-4 rounded-xl flex items-center justify-center">
          <span className="text-[7px] text-zinc-400 font-bold uppercase tracking-widest text-center">v1.1 | Role-Based Access | Mar 2026</span>
        </div>
      </div>
    </aside>
  );
}
