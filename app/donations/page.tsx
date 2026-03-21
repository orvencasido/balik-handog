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
  notes: string;
  monthKey: string;
  createdAt: any;
}

export default function DonationsList() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDonations = donations.filter((donation) => {
    const query = searchQuery.toLowerCase();
    return (
      donation.giverName?.toLowerCase().includes(query) ||
      donation.groupName?.toLowerCase().includes(query) ||
      donation.notes?.toLowerCase().includes(query) ||
      donation.monthKey?.toLowerCase().includes(query)
    );
  });

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) router.push("/");
      else setUser(currentUser);
    });

    const donationsQuery = query(
      collection(db, "donations"),
      orderBy("createdAt", "desc")
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

  if (loading) return <div className="flex-1 flex items-center justify-center text-emerald-900 font-bold">Scanning Records...</div>;

  return (
    <div className="flex-1 space-y-6 font-sans max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-emerald-950 tracking-tight leading-none uppercase">Records List</h1>
          <p className="text-emerald-700/60 font-bold text-[10px] uppercase tracking-widest mt-2">{donations.length} total entries</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-center w-full md:w-auto">
          <div className="relative w-full sm:w-80 group">
            <input
              type="text"
              placeholder="Search donor or ministry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-gray-100 rounded-xl text-xs font-bold text-emerald-950 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
            <svg
              className="absolute left-3.5 top-3.5 h-4 w-4 text-emerald-300 group-focus-within:text-emerald-600 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            onClick={() => router.push("/admin/add-donation")}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transform active:scale-95 transition-all shadow-md shadow-emerald-700/10"
          >
            New Record
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-zinc-50 border-b border-gray-100">
              <th className="px-8 py-5 text-[9px] font-black text-emerald-900/40 uppercase tracking-widest leading-none">Donor Name</th>
              <th className="px-8 py-5 text-[9px] font-black text-emerald-900/40 uppercase tracking-widest leading-none">Ministry</th>
              <th className="px-8 py-5 text-[9px] font-black text-emerald-900/40 uppercase tracking-widest leading-none">Amount</th>
              <th className="px-8 py-5 text-[9px] font-black text-emerald-900/40 uppercase tracking-widest leading-none">Date</th>
              <th className="px-8 py-5 text-[9px] font-black text-emerald-900/40 uppercase tracking-widest leading-none">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredDonations.map((donation) => (
              <tr key={donation.id} className="hover:bg-emerald-50/30 transition-colors group">
                <td className="px-8 py-5 font-black text-xs text-emerald-950 group-hover:text-emerald-700">{donation.giverName}</td>
                <td className="px-8 py-5">
                  <span className="text-[10px] font-black text-emerald-900 opacity-60 group-hover:opacity-100 transition-all">{donation.groupName || 'General'}</span>
                </td>
                <td className="px-8 py-5 font-black text-xs text-emerald-950 tabular-nums">₱ {donation.amount.toLocaleString()}</td>
                <td className="px-8 py-5 text-[10px] font-bold text-zinc-400">{donation.donationDate}</td>
                <td className="px-8 py-5 italic text-[10px] font-bold text-zinc-300 max-w-xs truncate group-hover:text-emerald-600 transition-all">{donation.notes || '--'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
