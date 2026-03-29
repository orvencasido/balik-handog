"use client";

import Link from "next/link";
import Image from "next/image";
import logoCathedral from "./logo-cathedral.svg";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-zinc-50 font-sans">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="space-y-6">
          <div className="w-fit mx-auto p-4 bg-white rounded-2xl shadow-xl shadow-emerald-700/5 border border-emerald-50">
            <Image src={logoCathedral} alt="St. Ferdinand Cathedral Logo" className="w-20 h-20 object-contain grayscale opacity-50" priority />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-emerald-950 tracking-tighter uppercase leading-none">404 Error</h1>
            <p className="text-[10px] font-black text-emerald-600/40 uppercase tracking-widest border-t border-emerald-100 pt-4 inline-block">The page you are looking for does not exist</p>
          </div>
        </div>

        <div className="pt-8">
          <Link
            href="/"
            className="inline-block px-10 py-4 bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-800 transform active:scale-[0.98] transition-all shadow-lg shadow-emerald-700/10"
          >
            Go Back Home
          </Link>
        </div>

        <p className="text-[8px] font-black text-zinc-300 uppercase tracking-widest">
          St. Ferdinand Cathedral | Balik Handog
        </p>
      </div>
    </div>
  );
}
