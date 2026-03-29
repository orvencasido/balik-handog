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
    <div className="flex-1 flex flex-col items-center justify-start py-8 px-2 min-h-screen">
      <div className="w-full max-w-2xl bg-white p-6 rounded-2xl border border-gray-100 shadow-sm shadow-emerald-900/5">
        <div className="mb-6 border-b border-gray-50 pb-4 text-center">
          <h1 className="text-lg font-black text-emerald-950 uppercase tracking-tight leading-none">Record Entry</h1>
          <p className="text-[8px] text-emerald-700/60 font-bold uppercase tracking-widest mt-1">Balik Handog Ledger System</p>
        </div>

        {status && (
          <div className={`mb-6 p-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
            }`}>
            <span className={`h-2 w-2 rounded-full ${status.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            {/* 1. Global Ministry Search */}
            <div className="space-y-1.5">
              <label className="text-[8px] font-black text-emerald-900/40 uppercase tracking-widest px-1 text-emerald-600">Quick Search: Organization / Ministry {isQuickSearchSelected && "(Locked)"}</label>
              <input
                type="text"
                name="ministry"
                list="ministry-list"
                value={formData.ministry}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-emerald-50/50 border border-emerald-100 rounded-xl text-xs font-bold text-emerald-950 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder={formData.category === "Parishioner" ? "Search disabled for Parishioners" : (isQuickSearchSelected ? "Selection Locked" : "Start typing ministry name (e.g. Sorrow or Altar)...")}
                required={formData.category !== "Parishioner"}
                disabled={formData.category === "Parishioner" || isQuickSearchSelected}
              />
              <datalist id="ministry-list">
                {ALL_MINISTRIES.map((m) => (
                  <option key={m.name} value={m.name} />
                ))}
              </datalist>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[8px] font-black text-emerald-900/40 uppercase tracking-widest px-1">Donor Name</label>
                <input
                  type="text"
                  name="giverName"
                  value={formData.giverName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-zinc-50 border border-gray-100 rounded-xl text-xs font-bold text-emerald-950 focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-zinc-300"
                  required
                  placeholder="e.g. Maria Clara"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[8px] font-black text-emerald-900/40 uppercase tracking-widest px-1">Amount (₱)</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-zinc-50 border border-gray-100 rounded-xl text-xs font-black text-emerald-950 focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all tabular-nums"
                  required
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[8px] font-black text-emerald-900/40 uppercase tracking-widest px-1">Category {isQuickSearchSelected && "(Locked)"}</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-zinc-50 border border-gray-100 rounded-xl text-xs font-bold text-emerald-950 focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                  disabled={isQuickSearchSelected}
                >
                  <option value="" disabled>Select Category</option>
                  {DONATION_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[8px] font-black text-emerald-900/40 uppercase tracking-widest px-1">Department {isQuickSearchSelected && "(Locked)"}</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-zinc-50 border border-gray-100 rounded-xl text-xs font-bold text-emerald-950 focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  required={formData.category !== "Parishioner"}
                  disabled={!formData.category || formData.category === "Parishioner" || isQuickSearchSelected}
                >
                  <option value="">
                    {!formData.category
                      ? "Select Category First"
                      : (formData.category === "Parishioner" ? "GENERAL" : "Select Department")
                    }
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
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[8px] font-black text-emerald-900/40 uppercase tracking-widest px-1">Ministry / Group {isQuickSearchSelected && "(Locked)"}</label>
              <select
                name="ministry"
                value={formData.ministry}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-zinc-50 border border-gray-100 rounded-xl text-xs font-bold text-emerald-950 focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                required
                disabled={!formData.department || isQuickSearchSelected}
              >
                <option value="">
                  {!formData.department ? "Select Department First" : "Select Ministry/Group"}
                </option>
                {getMinistryOptions().map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-[8px] font-black text-emerald-900/40 uppercase tracking-widest px-1">Receipt Date</label>
                <input
                  type="date"
                  name="donationDate"
                  value={formData.donationDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-zinc-50 border border-gray-100 rounded-xl text-xs font-black text-emerald-950 focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all tabular-nums"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[8px] font-black text-emerald-900/40 uppercase tracking-widest px-1">Givers</label>
                <input
                  type="number"
                  name="noOfGivers"
                  value={formData.noOfGivers}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-zinc-50 border border-gray-100 rounded-xl text-xs font-black text-emerald-950 focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all tabular-nums"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[8px] font-black text-emerald-900/40 uppercase tracking-widest px-1">Recorded By</label>
                <input
                  type="text"
                  name="recordedBy"
                  value={formData.recordedBy}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-zinc-50 border border-gray-100 rounded-xl text-xs font-bold text-emerald-950 focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-zinc-300"
                  placeholder="e.g. Clerk Name"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[8px] font-black text-emerald-900/40 uppercase tracking-widest px-1">Transaction Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-zinc-50 border border-gray-100 rounded-xl h-12 text-xs font-bold text-emerald-950 focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-zinc-300 resize-none"
                placeholder="Optional notes..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-2">
            <button
              type="button"
              onClick={clearForm}
              className="py-4 bg-zinc-50 text-zinc-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-100 transform active:scale-[0.98] transition-all border border-gray-100"
            >
              Clear Entries
            </button>
            <button
              type="submit"
              disabled={submitLoading}
              className="py-4 bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-800 transform active:scale-[0.98] transition-all shadow-lg shadow-emerald-700/10 disabled:opacity-50"
            >
              {submitLoading ? "Processing..." : "Save Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
