"use client";

import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../src/lib/firebase/client";
import { useAuthGuard } from "../../src/lib/useAuthGuard";
import { MINISTRY_OPTIONS } from "../../src/lib/constants";
import LoadingScreen from "../components/LoadingScreen";

/* ------------------------------------------------------------------ */
/*  Form defaults                                                      */
/* ------------------------------------------------------------------ */
const INITIAL_FORM_DATA = {
  giverName: "",
  groupId: "YTH",
  groupName: "Youth Ministry",
  amount: "",
  donationDate: new Date().toISOString().split("T")[0],
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
        giverName: formData.giverName,
        giverKey: formData.giverName.toLowerCase(),
        groupId: formData.groupId,
        groupName: formData.groupName,
        amount: Number(formData.amount),
        donationDate: formData.donationDate,
        monthKey,
        year,
        month,
        notes: formData.notes,
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
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 bg-white min-h-full">
      <div className="w-full max-w-2xl transition-all duration-500 ease-out animate-in fade-in slide-in-from-bottom-4">
        <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">

          {/* ---------- Title Area ---------- */}
          <div className="mb-12 text-center flex flex-col items-center">
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">Donation</h1>
            <p className="text-sm text-zinc-500 font-medium mt-2">Record Donation Balik Handog</p>
          </div>

          {/* ---------- Status banner ---------- */}
          <div className={`transition-all duration-300 overflow-hidden ${status ? "max-h-20 opacity-100 mb-8" : "max-h-0 opacity-0 mb-0"}`}>
            {status && (
              <div
                className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-3 border ${status.type === "success"
                  ? "bg-emerald-50/50 text-emerald-700 border-emerald-100"
                  : "bg-red-50/50 text-red-700 border-red-100"
                  }`}
              >
                <span className={`flex shrink-0 h-2.5 w-2.5 rounded-full ${status.type === "success" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"}`} />
                {status.message}
              </div>
            )}
          </div>

          {/* ---------- Form ---------- */}
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-8">
              {/* Row 1: Name + Amount */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Donor Full Name" required>
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

                <FormField label="Amount (₱)" required>
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

              {/* Row 2: Ministry + Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Organization / Ministry" required>
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

                <FormField label="Receipt Date" required>
                  <input
                    type="date"
                    name="donationDate"
                    value={formData.donationDate}
                    onChange={handleInputChange}
                    className="modern-input tabular-nums tracking-tight"
                    required
                  />
                </FormField>
              </div>

              {/* Row 3: Notes */}
              <FormField label="Transaction Notes">
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="modern-input min-h-[120px] resize-y py-4 leading-relaxed"
                  placeholder="Additional context or remarks about this contribution..."
                />
              </FormField>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={submitLoading}
                className="w-full sm:w-auto min-w-[200px] float-right py-4 px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-600/25 hover:shadow-xl hover:shadow-emerald-600/35 transform active:scale-[0.98] transition-all disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2 group"
              >
                {submitLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing encryption...
                  </>
                ) : (
                  <>
                    Submit Donation
                  </>
                )}
              </button>
              <div className="clear-both" />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-component: Modern Form Field wrapper                           */
/* ------------------------------------------------------------------ */
function FormField({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="space-y-2.5 flex flex-col group">
      <label className="text-xs font-bold text-zinc-600 tracking-wide flex items-center gap-1.5 ml-1 transition-colors group-focus-within:text-emerald-700">
        {label}
        {required && <span className="text-emerald-500 font-bold">*</span>}
      </label>
      {children}
    </div>
  );
}
