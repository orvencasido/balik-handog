"use client";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../src/lib/firebase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
          <div className="bg-emerald-600 p-2 w-fit rounded-xl shadow-xl mx-auto shadow-emerald-700/20 group hover:rotate-[360deg] transition-transform duration-1000">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2a1 1 0 011 1v2h2V3a1 1 0 112 0v2h2V3a1 1 0 112 0v18a1 1 0 11-2 0V7h-2v14a1 1 0 11-2 0V7h-2v14a1 1 0 11-2 0V7H9v14a1 1 0 11-2 0V7H5v14a1 1 0 11-2 0V3a1 1 0 011-1h1v2h2V3a1 1 0 012 0v2h2V3a1 1 0 011-1z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-black text-emerald-950 tracking-widest leading-none uppercase">ST. FERDINAND</h1>
            <p className="text-[10px] font-black text-emerald-600/50 uppercase tracking-widest border-t border-emerald-100 pt-2 inline-block">Balik Handog Ledger Access</p>
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
              <label className="text-[9px] font-black text-emerald-900/40 uppercase tracking-widest block px-1">Administrative Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 bg-white border border-gray-100 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-sm font-bold text-emerald-950 shadow-sm"
                placeholder="admin@cathedral.org"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-emerald-900/40 uppercase tracking-widest block px-1">Access Key</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 bg-white border border-gray-100 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-sm font-bold text-emerald-950 shadow-sm"
                placeholder="••••••••"
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
          Secure Access Protocol v1.0
        </p>
      </div>
    </div>
  );
}