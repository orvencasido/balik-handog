"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp, getDoc, doc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "../../src/lib/firebase/client";
import {
  DONATION_CATEGORIES,
  MSK_DEPARTMENTS,
  RELIGIOUS_ORG_DEPARTMENTS,
  MSK_GROUPS,
  RELIGIOUS_ORG_GROUPS,
  ALL_MINISTRIES
} from "../../src/lib/constants";

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-2.5 h-2.5 text-emerald-600 shrink-0">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

export default function AddDonation() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [isQuickSearchSelected, setIsQuickSearchSelected] = useState(false);

  const [formData, setFormData] = useState({
    giverName: "",
    ministry: "",
    amount: "",
    donationDate: new Date().toISOString().split('T')[0],
    notes: "",
    category: "",
    department: "",
    noOfGivers: "1",
    recordedBy: ""
  });

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/");
      } else {
        setUser(currentUser);
        // Check Role
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          if (userDoc.data().role !== "admin") {
            router.push("/records"); // Redirect non-admins
          } else {
            setLoading(false);
          }
        } else {
          router.push("/records");
        }
      }
    });

    return () => unsubscribeAuth();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'ministry') {
      // Reverse lookup: Auto-fill category and department when a ministry is selected
      const match = ALL_MINISTRIES.find(m => m.name === value);
      if (match) {
        setFormData(prev => ({
          ...prev,
          ministry: value,
          category: match.category,
          department: match.department
        }));
        setIsQuickSearchSelected(true);
        return;
      }
      setFormData(prev => ({ ...prev, [name]: value }));
      setIsQuickSearchSelected(false);
    } else if (name === 'category') {
      // Cascading reset: category -> department -> ministry
      setFormData(prev => ({ ...prev, [name]: value, department: "", ministry: "" }));
    } else if (name === 'department') {
      // Cascading reset: department -> ministry
      setFormData(prev => ({ ...prev, [name]: value, ministry: "" }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const clearForm = () => {
    setFormData({
      giverName: "",
      ministry: "",
      amount: "",
      donationDate: new Date().toISOString().split('T')[0],
      notes: "",
      category: "",
      department: "",
      noOfGivers: "1",
      recordedBy: ""
    });
    setStatus(null);
    setIsQuickSearchSelected(false);
  };

  const getMinistryOptions = () => {
    if (formData.category === "MSK" && formData.department) {
      return MSK_GROUPS[formData.department] || [];
    }
    if (formData.category === "Religious Organization" && formData.department) {
      return RELIGIOUS_ORG_GROUPS[formData.department] || [];
    }
    if (formData.category === "Parishioner") {
      return ["General Donation", "Tithes", "Thanksgiving", "Special Intention"];
    }
    return [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitLoading(true);
    setStatus(null);

    try {
      const date = new Date(formData.donationDate);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthKey = `${year}-${String(month).padStart(2, '0')}`;

      await addDoc(collection(db, "donations"), {
        giverName: formData.giverName,
        giverKey: formData.giverName.toLowerCase(),
        groupId: "GENERAL", // Restored for Firestore security rule compliance
        groupName: formData.ministry, // Restored for Firestore security rule compliance
        ministry: formData.ministry,
        amount: Number(formData.amount),
        category: formData.category,
        department: formData.department,
        noOfGivers: Number(formData.noOfGivers),
        recordedBy: formData.recordedBy,
        donationDate: formData.donationDate,
        monthKey: monthKey,
        year: year,
        month: month,
        notes: formData.notes,
        encodedByUid: user.uid,
        createdAt: serverTimestamp(),
      });

      setStatus({ type: 'success', message: "Donation record saved." });
      setFormData({
        giverName: "",
        ministry: "",
        amount: "",
        donationDate: new Date().toISOString().split('T')[0],
        notes: "",
        category: "",
        department: "",
        noOfGivers: "1",
        recordedBy: ""
      });
      setIsQuickSearchSelected(false);
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || "Save failed." });
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <div className="flex-1 flex items-center justify-center text-emerald-900 font-bold italic">Checking access...</div>;

  return (
    <div className="flex-1 space-y-5 font-sans w-full min-h-0 flex flex-col">
      {/* Header - Compact Glass Style */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 backdrop-blur-md px-6 py-5 rounded-2xl border border-zinc-100 shadow-sm shadow-zinc-200/50 shrink-0">
        <div>
          <h1 className="text-lg font-black text-emerald-950 tracking-tight leading-none uppercase">Record Entry</h1>
          <p className="text-emerald-700/60 font-bold text-[7px] uppercase tracking-widest mt-1">New transaction to ledger</p>
        </div>

        {status ? (
          <div className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all animate-in fade-in slide-in-from-right-4 duration-300 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
            }`}>
            <span className={`h-2 w-2 rounded-full animate-pulse ${status.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
            {status.message}
          </div>
        ) : (
          <div className="px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 border border-zinc-100 bg-zinc-50/50 text-zinc-400">
            <span className="h-2 w-2 rounded-full bg-zinc-200"></span>
            Ready for New Entry
          </div>
        )}
      </header>

      {/* Main Entry Panel - Super Compact Grid */}
      <div className="flex-1 bg-white rounded-2xl border border-zinc-100 shadow-xl shadow-zinc-200/20 p-5 flex flex-col min-h-0 overflow-hidden">
        <form onSubmit={handleSubmit} className="h-full flex flex-col min-h-0">
          <div className="grid grid-cols-12 gap-x-8 gap-y-3 min-h-0 overflow-hidden">

            {/* Upper Section: Identifiers & Metadata */}
            <div className="col-span-7 space-y-1">
              <div className="flex items-center justify-between px-1">
                <label className="text-[7px] font-black text-emerald-900/40 uppercase tracking-[0.2em] leading-none mb-1">Quick Search</label>
                {isQuickSearchSelected && <LockIcon />}
              </div>
              <input
                type="text"
                name="ministry"
                list="ministry-list"
                value={formData.ministry}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-zinc-50/50 border border-zinc-100 rounded-xl text-xs font-bold text-emerald-950 outline-none transition-all placeholder:text-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder={formData.category === "Parishioner" ? "Search disabled" : (isQuickSearchSelected ? "Locked" : "Select or search...")}
                required={formData.category !== "Parishioner"}
                disabled={formData.category === "Parishioner" || isQuickSearchSelected}
              />
              <datalist id="ministry-list">
                {ALL_MINISTRIES.map((m) => (
                  <option key={m.name} value={m.name} />
                ))}
              </datalist>
            </div>

            <div className="col-span-5 grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[7px] font-black text-emerald-900/40 uppercase tracking-[0.2em] px-1">Receipt Date</label>
                <input
                  type="date"
                  name="donationDate"
                  value={formData.donationDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-zinc-50/50 border border-zinc-100 rounded-xl text-xs font-bold text-emerald-950 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[7px] font-black text-emerald-900/40 uppercase tracking-[0.2em] px-1">Givers</label>
                <input
                  type="number"
                  name="noOfGivers"
                  value={formData.noOfGivers}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-zinc-50/50 border border-zinc-100 rounded-xl text-xs font-bold text-emerald-950 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-zinc-400"
                  required
                />
              </div>
            </div>

            {/* Middle Section: Classification & Recorder */}
            <div className="col-span-7 grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[7px] font-black text-emerald-900/40 uppercase tracking-[0.2em] px-1">Category</label>
                <div className="relative">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-zinc-50/50 border border-zinc-100 rounded-xl text-xs font-bold text-emerald-950 outline-none appearance-none cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed pr-10"
                    required
                    disabled={isQuickSearchSelected}
                  >
                    <option value="" disabled>Select Cat</option>
                    {DONATION_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[7px] font-black text-emerald-900/40 uppercase tracking-[0.2em] px-1">Department</label>
                <div className="relative">
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-zinc-50/50 border border-zinc-100 rounded-xl text-xs font-bold text-emerald-950 outline-none appearance-none cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed pr-10"
                    required={formData.category !== "Parishioner"}
                    disabled={!formData.category || formData.category === "Parishioner" || isQuickSearchSelected}
                  >
                    <option value="">
                      {!formData.category ? "Select Cat" : (formData.category === "Parishioner" ? "GENERAL" : "Select Dept")}
                    </option>
                    {formData.category === "MSK" && MSK_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                    {formData.category === "Religious Organization" && RELIGIOUS_ORG_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                    {formData.category === "Parishioner" && (
                      <option value="GENERAL">GENERAL</option>
                    )}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-5 space-y-1">
              <label className="text-[7px] font-black text-emerald-900/40 uppercase tracking-[0.2em] px-1">Recorded By</label>
              <input
                type="text"
                name="recordedBy"
                value={formData.recordedBy}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-zinc-50/50 border border-zinc-100 rounded-xl text-xs font-bold text-emerald-950 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-zinc-400"
                placeholder="e.g. Maria Clara"
              />
            </div>

            {/* Lower Section: Transaction Details & Notes Alignment */}
            <div className="col-span-7 space-y-3">
              <div className="space-y-1">
                <label className="text-[7px] font-black text-emerald-900/40 uppercase tracking-[0.2em] px-1">Ministry</label>
                <div className="relative">
                  <select
                    name="ministry"
                    value={formData.ministry}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-zinc-50/50 border border-zinc-100 rounded-xl text-xs font-bold text-emerald-950 outline-none appearance-none cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed pr-10"
                    required
                    disabled={!formData.category || !formData.department || isQuickSearchSelected}
                  >
                    <option value="">
                      {!formData.department ? "Select Dept First" : "Select Min"}
                    </option>
                    {getMinistryOptions().map((opt: string) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[7px] font-black text-emerald-900/40 uppercase tracking-[0.2em] px-1">Donor Name</label>
                <input
                  type="text"
                  name="giverName"
                  value={formData.giverName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-zinc-50/50 border border-zinc-100 rounded-xl text-xs font-bold text-emerald-950 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-zinc-400"
                  required
                  placeholder="e.g. Maria Clara"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[7px] font-black text-emerald-900/40 uppercase tracking-[0.2em] px-1">Amount (₱)</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-zinc-50/50 border border-zinc-100 rounded-xl text-xs font-bold text-emerald-950 outline-none tabular-nums transition-all disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-zinc-400"
                  required
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="col-span-5 flex flex-col h-full min-h-0">
              <div className="flex-1 flex flex-col space-y-1 min-h-0">
                <label className="text-[7px] font-black text-emerald-900/40 uppercase tracking-[0.2em] px-1">Transaction Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="flex-1 w-full px-4 py-2 bg-zinc-50/50 border border-zinc-100 rounded-xl text-xs font-bold text-emerald-950 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-zinc-400 resize-none"
                  placeholder="Enter context for this transaction..."
                />
              </div>
            </div>
          </div>

          {/* Unified Action Footer */}
          <div className="grid grid-cols-2 gap-4 shrink-0 mt-auto">
            <button
              type="button"
              onClick={clearForm}
              className="py-3 bg-zinc-50 text-zinc-400 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-zinc-100 hover:text-zinc-600 transition-all border border-zinc-100 transform active:scale-[0.98]"
            >
              Clear Entries
            </button>
            <button
              type="submit"
              disabled={submitLoading}
              className="py-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] hover:from-emerald-700 hover:to-teal-800 transform active:scale-[0.98] transition-all shadow-lg shadow-emerald-900/10 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitLoading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Save Transaction
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
