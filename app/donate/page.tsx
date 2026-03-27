"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "../../src/lib/firebase/client";

export default function AddDonation() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const [formData, setFormData] = useState({
    giverName: "",
    groupId: "YTH",
    groupName: "Youth Ministry",
    amount: "",
    donationDate: new Date().toISOString().split('T')[0],
    notes: "",
    category: "",
    department: "",
    noOfGivers: "1",
    recordedBy: ""
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) router.push("/");
      else setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
        groupId: formData.groupId,
        groupName: formData.groupName,
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
        groupId: "YTH",
        groupName: "Youth Ministry",
        amount: "",
        donationDate: new Date().toISOString().split('T')[0],
        notes: "",
        category: "",
        department: "",
        noOfGivers: "1",
        recordedBy: ""
      });
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || "Save failed." });
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <div className="flex-1 flex items-center justify-center text-emerald-900 font-bold italic">Checking access...</div>;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white p-10 rounded-2xl border border-gray-100 shadow-sm shadow-emerald-900/5">
        <div className="mb-10 border-b border-gray-50 pb-6 text-center">
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[8px] font-black text-emerald-900/40 uppercase tracking-widest px-1">Donor Full Name</label>
                <input
                  type="text"
                  name="giverName"
                  value={formData.giverName}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 bg-zinc-50 border border-gray-100 rounded-xl text-xs font-bold text-emerald-950 focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-zinc-300"
                  required
                  placeholder="e.g. Maria Clara"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-black text-emerald-900/40 uppercase tracking-widest px-1">Amount (₱)</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 bg-zinc-50 border border-gray-100 rounded-xl text-xs font-black text-emerald-950 focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all tabular-nums"
                  required
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[8px] font-black text-emerald-900/40 uppercase tracking-widest px-1">Category</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 bg-zinc-50 border border-gray-100 rounded-xl text-xs font-bold text-emerald-950 focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-zinc-300"
                  placeholder="e.g. Tithes"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-black text-emerald-900/40 uppercase tracking-widest px-1">Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 bg-zinc-50 border border-gray-100 rounded-xl text-xs font-bold text-emerald-950 focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-zinc-300"
                  placeholder="e.g. Finance"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[8px] font-black text-emerald-900/40 uppercase tracking-widest px-1">Organization / Ministry</label>
                <select
                  name="groupName"
                  value={formData.groupName}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 bg-zinc-50 border border-gray-100 rounded-xl text-xs font-bold text-emerald-950 focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                >
                  <option value="Worship Dept.">Worship Dept.</option>
                  <option value="Music Ministry">Music Ministry</option>
                  <option value="Youth Ministry">Youth Ministry</option>
                  <option value="Outreach">Outreach</option>
                  <option value="General Fund">General Fund</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-black text-emerald-900/40 uppercase tracking-widest px-1">Receipt Date</label>
                <input
                  type="date"
                  name="donationDate"
                  value={formData.donationDate}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 bg-zinc-50 border border-gray-100 rounded-xl text-xs font-black text-emerald-950 focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all tabular-nums"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[8px] font-black text-emerald-900/40 uppercase tracking-widest px-1">No. Of Givers</label>
                <input
                  type="number"
                  name="noOfGivers"
                  value={formData.noOfGivers}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 bg-zinc-50 border border-gray-100 rounded-xl text-xs font-black text-emerald-950 focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all tabular-nums"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-black text-emerald-900/40 uppercase tracking-widest px-1">Recorded By</label>
                <input
                  type="text"
                  name="recordedBy"
                  value={formData.recordedBy}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 bg-zinc-50 border border-gray-100 rounded-xl text-xs font-bold text-emerald-950 focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-zinc-300"
                  placeholder="e.g. Clerk Name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[8px] font-black text-emerald-900/40 uppercase tracking-widest px-1">Transaction Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="w-full px-5 py-4 bg-zinc-50 border border-gray-100 rounded-xl h-24 text-xs font-bold text-emerald-950 focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-zinc-300"
                placeholder="Notes about this contribution..."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitLoading}
            className="w-full py-4 bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-800 transform active:scale-[0.98] transition-all shadow-lg shadow-emerald-700/10 disabled:opacity-50 mt-4"
          >
            {submitLoading ? "Processing..." : "Save Transaction"}
          </button>
        </form>
      </div>
    </div>
  );
}
