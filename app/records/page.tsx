"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "../../src/lib/useAuthGuard";
import { useDonations } from "../../src/lib/useDonations";
import type { Donation } from "../../src/lib/types";
import PageHeader from "../components/PageHeader";
import SearchInput from "../components/SearchInput";
import LoadingScreen from "../components/LoadingScreen";

/** How many records to show when the user isn't searching. */
const DEFAULT_DISPLAY_COUNT = 15;

export default function RecordsPage() {
  const router = useRouter();
  useAuthGuard();
  const { donations, loading } = useDonations();
  const [searchQuery, setSearchQuery] = useState("");

  /* ---------------------------------------------------------------- */
  /*  Filtering                                                        */
  /* ---------------------------------------------------------------- */
  const isSearching = searchQuery.trim().length > 0;

  const filteredDonations = donations.filter((d) => {
    const q = searchQuery.toLowerCase();
    return (
      d.giverName?.toLowerCase().includes(q) ||
      d.groupName?.toLowerCase().includes(q) ||
      d.notes?.toLowerCase().includes(q)
    );
  });

  const displayDonations = isSearching
    ? filteredDonations
    : donations.slice(0, DEFAULT_DISPLAY_COUNT);

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */
  if (loading) return <LoadingScreen message="Scanning Ledger..." />;

  return (
    <div className="flex-1 space-y-6 font-sans w-full">
      {/* ---------- Header ---------- */}
      <PageHeader
        title="Records List"
        subtitle={
          isSearching
            ? `Found ${filteredDonations.length} matches`
            : `Displaying latest ${displayDonations.length} of ${donations.length}`
        }
      >
        <div className="flex flex-col sm:flex-row gap-3 items-center w-full md:w-auto">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name or ministry..."
          />
          <button
            onClick={() => router.push("/donate")}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transform active:scale-95 transition-all shadow-md shadow-emerald-700/10"
          >
            New Record
          </button>
        </div>
      </PageHeader>

      {/* ---------- Table ---------- */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-zinc-50 border-b border-gray-100">
              {["Donor Name", "Ministry", "Amount", "Date", "Notes"].map((heading) => (
                <th
                  key={heading}
                  className={`px-8 py-5 text-[9px] font-black text-emerald-900/40 uppercase tracking-widest leading-none ${heading === "Notes" ? "text-right" : ""}`}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {displayDonations.map((donation) => (
              <DonationRow key={donation.id} donation={donation} />
            ))}
          </tbody>
        </table>

        {/* Footer hint */}
        {!isSearching && donations.length > DEFAULT_DISPLAY_COUNT && (
          <div className="bg-zinc-50 p-6 text-center border-t border-gray-50">
            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">
              Total {donations.length} records in ledger. Use search bar to find specific entries.
            </p>
          </div>
        )}

        {/* Empty search state */}
        {isSearching && displayDonations.length === 0 && (
          <div className="p-20 text-center">
            <div className="bg-emerald-50 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-[10px] font-black text-emerald-900 uppercase tracking-widest">
              No matching results for &quot;{searchQuery}&quot;
            </p>
          </div>
        )}
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
      <td className="px-8 py-5">
        <div className="flex flex-col">
          <span className="font-black text-xs text-emerald-950 group-hover:text-emerald-700 transition-colors">
            {donation.giverName}
          </span>
          <span className="text-[8px] font-black text-zinc-400 uppercase tracking-tighter mt-0.5">
            Contributor
          </span>
        </div>
      </td>
      <td className="px-8 py-5">
        <span className="text-[10px] font-black text-emerald-900 opacity-60 group-hover:opacity-100 transition-all uppercase tracking-tight">
          {donation.groupName || "General"}
        </span>
      </td>
      <td className="px-8 py-5 font-black text-xs text-emerald-950 tabular-nums">
        ₱ {donation.amount.toLocaleString()}
      </td>
      <td className="px-8 py-5 text-[10px] font-bold text-zinc-400">
        {donation.donationDate}
      </td>
      <td className="px-8 py-5 italic text-[10px] font-bold text-zinc-300 max-w-xs truncate group-hover:text-emerald-600 transition-all text-right">
        {donation.notes || "--"}
      </td>
    </tr>
  );
}
