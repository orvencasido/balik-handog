"use client";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../src/lib/firebase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logoCathedral from "./logo-cathedral.svg";

export async function login(email: string, password: string) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  } catch (error: any) {
    throw error;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      router.push("/dashboards");
    } catch (err: any) {
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-50 font-sans">
      <div className="w-full max-w-sm space-y-12">
        <div className="text-center space-y-6">
          <div className="w-fit mx-auto p-4">
            <Image src={logoCathedral} alt="St. Ferdinand Cathedral Logo" className="w-24 h-24 sm:w-32 sm:h-32 object-contain" priority />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-black text-emerald-950 tracking-widest leading-none uppercase">St. Ferdinand Cathedral</h1>
            <p className="text-[10px] font-black text-emerald-600/50 uppercase tracking-widest border-t border-emerald-100 pt-2 inline-block">Balik Handog Donation System</p>
          </div>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-[10px] font-black uppercase tracking-widest text-red-800 flex items-center justify-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-emerald-900/40 uppercase tracking-widest block px-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 bg-white border border-gray-100 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-sm font-bold text-emerald-950 shadow-sm"
                placeholder="Enter Email"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-emerald-900/40 uppercase tracking-widest block px-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 bg-white border border-gray-100 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-sm font-bold text-emerald-950 shadow-sm"
                placeholder="Enter Password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4.5 bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-800 transform active:scale-[0.98] transition-all shadow-lg shadow-emerald-700/10 disabled:opacity-50 mt-10"
          >
            {loading ? "Verifying..." : "Enter Dashboard"}
          </button>
        </form>

        <p className="text-center text-[8px] font-black text-zinc-300 uppercase tracking-widest">
          Created by Orven Casido | 2026
        </p>
      </div>
    </div>
  );
}