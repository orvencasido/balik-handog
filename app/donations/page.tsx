"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "../../src/lib/useAuthGuard";
import { useDonations } from "../../src/lib/useDonations";
import type { Donation } from "../../src/lib/types";
import PageHeader from "../components/PageHeader";
import SearchInput from "../components/SearchInput";
import LoadingScreen from "../components/LoadingScreen";

export default function DonationsList() {
  const router = useRouter();
  useAuthGuard();
  const { donations, loading } = useDonations();
  const [searchQuery, setSearchQuery] = useState("");

  /* ---------------------------------------------------------------- */
  /*  Filtering                                                        */
  /* ---------------------------------------------------------------- */
  const filteredDonations = donations.filter((d) => {
    const q = searchQuery.toLowerCase();
    return (
      d.giverName?.toLowerCase().includes(q) ||
      d.groupName?.toLowerCase().includes(q) ||
      d.notes?.toLowerCase().includes(q) ||
      d.monthKey?.toLowerCase().includes(q)
    );
  });

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */
  if (loading) return <LoadingScreen message="Scanning Records..." />;

  return (
    <div className="flex-1 space-y-6 font-sans max-w-7xl mx-auto">
      {/* ---------- Header ---------- */}
      <PageHeader title="Records List" subtitle={`${donations.length} total entries`}>
        <div className="flex flex-col sm:flex-row gap-3 items-center w-full md:w-auto">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search donor or ministry..."
          />
          <button
            onClick={() => router.push("/admin/add-donation")}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transform active:scale-95 transition-all shadow-md shadow-emerald-700/10"
          >
            New Record
          </button>
        </div>
      </PageHeader>

      {/* ---------- Table ---------- */}
      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-zinc-50 border-b border-gray-100">
              {["Donor Name", "Ministry", "Amount", "Date", "Notes"].map((heading) => (
                <th
                  key={heading}
                  className="px-8 py-5 text-[9px] font-black text-emerald-900/40 uppercase tracking-widest leading-none"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredDonations.map((donation) => (
              <DonationRow key={donation.id} donation={donation} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-component: single table row                                    */
/* ------------------------------------------------------------------ */
function DonationRow({ donation }: { donation: Donation }) {
  return (
    <tr className="hover:bg-emerald-50/30 transition-colors group">
      <td className="px-8 py-5 font-black text-xs text-emerald-950 group-hover:text-emerald-700">
        {donation.giverName}
      </td>
      <td className="px-8 py-5">
        <span className="text-[10px] font-black text-emerald-900 opacity-60 group-hover:opacity-100 transition-all">
          {donation.groupName || "General"}
        </span>
      </td>
      <td className="px-8 py-5 font-black text-xs text-emerald-950 tabular-nums">
        ₱ {donation.amount.toLocaleString()}
      </td>
      <td className="px-8 py-5 text-[10px] font-bold text-zinc-400">
        {donation.donationDate}
      </td>
      <td className="px-8 py-5 italic text-[10px] font-bold text-zinc-300 max-w-xs truncate group-hover:text-emerald-600 transition-all">
        {donation.notes || "--"}
      </td>
    </tr>
  );
}
