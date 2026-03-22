"use client";

import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../src/lib/firebase/client";
import { useAuthGuard } from "../../src/lib/useAuthGuard";
import { MINISTRY_OPTIONS } from "../../src/lib/constants";
import LoadingScreen from "../components/LoadingScreen";
import PageHeader from "../components/PageHeader";

/* ------------------------------------------------------------------ */
/*  Form defaults                                                      */
/* ------------------------------------------------------------------ */
const INITIAL_FORM_DATA = {
  category: "",
  department: "",
  groupId: "YTH", // Keep for compatibility if needed
  groupName: "Youth Ministry", // Organization
  numberOfGivers: "1",
  giverName: "",
  donationDate: new Date().toISOString().split("T")[0],
  amount: "",
  notes: "",
};

export default function AddDonation() {
  const { user, loading } = useAuthGuard();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  /* ---------------------------------------------------------------- */
  /*  Handlers                                                         */
  /* ---------------------------------------------------------------- */
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      const monthKey = `${year}-${String(month).padStart(2, "0")}`;

      await addDoc(collection(db, "donations"), {
        category: formData.category,
        department: formData.department,
        groupName: formData.groupName,
        numberOfGivers: Number(formData.numberOfGivers),
        giverName: formData.giverName,
        giverKey: formData.giverName.toLowerCase(),
        amount: Number(formData.amount),
        donationDate: formData.donationDate,
        notes: formData.notes,
        monthKey,
        year,
        month,
        encodedByUid: user.uid,
        createdAt: serverTimestamp(),
      });

      setStatus({ type: "success", message: "Donation record successfully secured." });
      setFormData({ ...INITIAL_FORM_DATA, donationDate: new Date().toISOString().split("T")[0] });

      // Auto-hide status after 3 seconds
      setTimeout(() => setStatus(null), 3000);
    } catch (err: any) {
      setStatus({ type: "error", message: err.message || "Failed to secure transaction." });
    } finally {
      setSubmitLoading(false);
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */
  if (loading) return <LoadingScreen message="Checking access clearance..." />;

  return (
    <div className="flex-1 space-y-6 font-sans w-full max-w-5xl">
      {/* ---------- Header ---------- */}
      <PageHeader
        title="Record Donation"
        subtitle="Initialize a new secure transaction into the ledger"
      />

      {/* ---------- Main Form Content ---------- */}
      <div className="bg-white p-8 sm:p-10 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">

        {/* Modern Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600" />

        <div className="mb-8">
          <h2 className="text-sm font-black text-emerald-950 uppercase tracking-widest">
            Donation Details
          </h2>
          <p className="text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-wider">
            Fill in the required fields to log exactly what was received.
          </p>
        </div>

        {/* ---------- Status banner ---------- */}
        <div className={`transition-all duration-300 overflow-hidden ${status ? "max-h-20 opacity-100 mb-8" : "max-h-0 opacity-0 mb-0"}`}>
          {status && (
            <div
              className={`p-4 rounded-xl text-xs font-bold flex items-center gap-3 border ${status.type === "success"
                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                : "bg-red-50 text-red-700 border-red-100"
                }`}
            >
              <span className={`flex shrink-0 h-2.5 w-2.5 rounded-full ${status.type === "success" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"}`} />
              {status.message}
            </div>
          )}
        </div>

        {/* ---------- Form ---------- */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">

            {/* Row 1: Category + Department */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Category">
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="modern-input"
                  placeholder="e.g. Regular Tithes"
                />
              </FormField>

              <FormField label="Department">
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="modern-input"
                  placeholder="e.g. Finance"
                />
              </FormField>
            </div>

            {/* Row 2: Organization + No of Givers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Organization" required>
                <div className="relative">
                  <select
                    name="groupName"
                    value={formData.groupName}
                    onChange={handleInputChange}
                    className="modern-input appearance-none pr-10"
                  >
                    {MINISTRY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </FormField>

              <FormField label="No. of Givers" required>
                <input
                  type="number"
                  name="numberOfGivers"
                  value={formData.numberOfGivers}
                  onChange={handleInputChange}
                  className="modern-input tabular-nums tracking-tight"
                  required
                  min="1"
                  placeholder="1"
                />
              </FormField>
            </div>

            {/* Row 3: Full Name + Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Full Name" required>
                <input
                  type="text"
                  name="giverName"
                  value={formData.giverName}
                  onChange={handleInputChange}
                  className="modern-input"
                  required
                  placeholder="e.g. Maria Clara"
                />
              </FormField>

              <FormField label="Date" required>
                <input
                  type="date"
                  name="donationDate"
                  value={formData.donationDate}
                  onChange={handleInputChange}
                  className="modern-input tabular-nums tracking-tight text-emerald-950 font-bold"
                  required
                />
              </FormField>
            </div>

            {/* Row 4: Amount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Amount" required>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-medium group-focus-within:text-emerald-500 transition-colors">₱</span>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="modern-input pl-9 tabular-nums tracking-tight"
                    required
                    placeholder="   0.00"
                  />
                </div>
              </FormField>
            </div>

            {/* Row 5: Remarks */}
            <FormField label="Remarks">
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="modern-input min-h-[120px] resize-y py-4 leading-relaxed"
                placeholder="Additional remarks..."
              />
            </FormField>
          </div>

          <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={submitLoading}
              className="w-full sm:w-auto min-w-[200px] py-3.5 px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] uppercase tracking-widest font-black shadow-lg shadow-emerald-600/20 hover:shadow-xl hover:shadow-emerald-600/30 transform active:scale-[0.98] transition-all disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2 group"
            >
              {submitLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  Submit Donation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-component: Modern Form Field wrapper                           */
/* ------------------------------------------------------------------ */
function FormField({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="space-y-2 flex flex-col group">
      <label className="text-[10px] font-black text-emerald-950/60 uppercase tracking-widest flex items-center gap-1.5 ml-1 transition-colors group-focus-within:text-emerald-700">
        {label}
        {required && <span className="text-emerald-500 font-bold">*</span>}
      </label>
      {children}
    </div>
  );
}
