"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, onSnapshot, query, orderBy, updateDoc, doc, deleteDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "../../src/lib/firebase/client";
import {
  DONATION_CATEGORIES,
  MSK_DEPARTMENTS,
  RELIGIOUS_ORG_DEPARTMENTS,
  ALL_MINISTRIES
} from "../../src/lib/constants";

interface Donation {
  id: string;
  giverName: string;
  amount: number;
  ministry?: string;
  groupName?: string;
  donationDate: string;
  notes: string;
  monthKey: string;
  category?: string;
  department?: string;
  noOfGivers?: number;
  recordedBy?: string;
  createdAt: any;
}

const formatDate = (dateString: string) => {
  if (!dateString) return '--';
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
};

export default function DonationsList() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [editingDonation, setEditingDonation] = useState<Donation | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/");
      } else {
        setUser(currentUser);
        // Fetch role
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setIsAdmin(userDoc.data().role === 'admin');
        } else {
          setIsAdmin(false);
        }
      }
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

  const handleModalInputChange = (name: string, value: any) => {
    if (!editingDonation) return;

    let updated = { ...editingDonation, [name]: value };

    // Quick Search Logic
    if (name === "ministry" && value) {
      const found = ALL_MINISTRIES.find(m => m.name === value);
      if (found) {
        updated = {
          ...updated,
          category: found.category,
          department: found.department
        };
      }
    }

    // Cascading resets
    if (name === "category") {
      updated.department = "";
      updated.ministry = "";
    }
    if (name === "department") {
      updated.ministry = "";
    }

    setEditingDonation(updated);
  };

  const filteredDonations = donations.filter((donation) => {
    const q = searchQuery.toLowerCase();
    return (
      donation.giverName?.toLowerCase().includes(q) ||
      donation.ministry?.toLowerCase().includes(q) ||
      donation.groupName?.toLowerCase().includes(q) ||
      donation.category?.toLowerCase().includes(q) ||
      donation.department?.toLowerCase().includes(q) ||
      donation.recordedBy?.toLowerCase().includes(q) ||
      donation.notes?.toLowerCase().includes(q)
    );
  });

  // "Don't show everything all at once"
  // If no search query, only show the 15 most recent records.
  // If searching, show all matches.
  const isSearching = searchQuery.trim().length > 0;
  const displayDonations = isSearching ? filteredDonations : donations.slice(0, 15);

  if (loading) return <div className="flex-1 flex items-center justify-center text-emerald-900 font-bold">Scanning Ledger...</div>;

  return (
    <div className="flex-1 space-y-6 font-sans w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white px-6 py-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-lg font-black text-emerald-950 tracking-tight leading-none uppercase">Records List</h1>
          <p className="text-emerald-700/60 font-bold text-[8px] uppercase tracking-widest mt-1">
            {isSearching ? `Found ${filteredDonations.length} matches` : `Displaying latest ${displayDonations.length} of ${donations.length}`}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-center w-full md:w-auto">
          <div className="relative w-full sm:w-80 group">
            <input
              type="text"
              placeholder="Search by name or ministry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-gray-100 rounded-xl text-xs font-bold text-emerald-950 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-zinc-300"
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
          {isAdmin && (
            <button
              onClick={() => router.push("/donate")}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transform active:scale-95 transition-all shadow-md shadow-emerald-700/10"
            >
              New Record
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1000px]">
            <thead>
              <tr className="bg-zinc-50 border-b border-gray-100">
                <th className="px-8 py-5 text-[9px] font-black text-emerald-900/40 uppercase tracking-widest leading-none">Amount</th>
                <th className="px-8 py-5 text-[9px] font-black text-emerald-900/40 uppercase tracking-widest leading-none">Donor Name</th>
                <th className="px-8 py-5 text-[9px] font-black text-emerald-900/40 uppercase tracking-widest leading-none">Category</th>
                <th className="px-8 py-5 text-[9px] font-black text-emerald-900/40 uppercase tracking-widest leading-none">Date</th>
                <th className="px-8 py-5 text-[9px] font-black text-emerald-900/40 uppercase tracking-widest leading-none">Ministry / Dept</th>
                <th className="px-8 py-5 text-[9px] font-black text-emerald-900/40 uppercase tracking-widest leading-none text-center">Givers</th>
                <th className="px-8 py-5 text-[9px] font-black text-emerald-900/40 uppercase tracking-widest leading-none text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {displayDonations.map((donation) => (
                <tr key={donation.id} className="hover:bg-emerald-50/30 transition-colors group">
                  <td className="px-8 py-5 font-black text-sm text-emerald-600 tabular-nums">₱ {donation.amount.toLocaleString()}</td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="font-black text-xs text-emerald-950 group-hover:text-emerald-700 transition-colors uppercase">{donation.giverName}</span>
                      <span className="text-[8px] font-black text-zinc-400 uppercase tracking-tighter mt-0.5">{donation.recordedBy || 'Contributor'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[10px] font-black text-emerald-800 uppercase tracking-tight">{donation.category || 'N/A'}</span>
                  </td>
                  <td className="px-8 py-5 text-[10px] font-bold text-zinc-400">{formatDate(donation.donationDate)}</td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-emerald-900 opacity-60 group-hover:opacity-100 transition-all uppercase tracking-tight">{donation.ministry || donation.groupName || 'General'}</span>
                      {donation.department && <span className="text-[7px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">{donation.department}</span>}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="text-[10px] font-black text-emerald-950 tabular-nums">{donation.noOfGivers || 1}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => donation.notes && setSelectedNote(donation.notes)}
                        className={`p-2 rounded-lg transition-all ${donation.notes ? 'bg-zinc-50 text-zinc-400 hover:bg-emerald-50 hover:text-emerald-600' : 'opacity-0 pointer-events-none'}`}
                        title="View Note"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                      </button>
                      {isAdmin && (
                        <button 
                          onClick={() => setEditingDonation(donation)}
                          className="p-2 bg-zinc-50 text-zinc-400 rounded-lg hover:bg-amber-50 hover:text-amber-600 transition-all"
                          title="Edit Record"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {!isSearching && donations.length > 15 && (
        <div className="bg-zinc-50 p-6 text-center border-t border-gray-50">
          <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">
            Total {donations.length} records in ledger. Use search bar to find specific entries.
          </p>
        </div>
      )}

      {isSearching && displayDonations.length === 0 && (
        <div className="p-20 text-center">
          <div className="bg-emerald-50 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-[10px] font-black text-emerald-900 uppercase tracking-widest">No matching results for "{searchQuery}"</p>
        </div>
      )}

      {/* Note Modal */}
      {selectedNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/20 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-emerald-100 overflow-hidden transform animate-in fade-in zoom-in duration-200">
            <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100 flex justify-between items-center">
              <h3 className="text-[10px] font-black text-emerald-900 uppercase tracking-widest">Transaction Notes</h3>
              <button onClick={() => setSelectedNote(null)} className="text-emerald-600 hover:text-emerald-800 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-8">
              <p className="text-xs font-bold text-emerald-950 leading-relaxed whitespace-pre-wrap">{selectedNote}</p>
            </div>
            <div className="p-6 bg-zinc-50 flex justify-end">
              <button
                onClick={() => setSelectedNote(null)}
                className="px-6 py-2 bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/20 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-emerald-100 overflow-hidden transform animate-in fade-in zoom-in duration-200 h-[90vh] flex flex-col">
            <div className="bg-white px-8 py-6 border-b border-gray-50 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-sm font-black text-emerald-950 uppercase tracking-tight">Edit Record</h3>
                <p className="text-[8px] font-bold text-emerald-600/60 uppercase tracking-widest mt-1">Transaction ID: {editingDonation.id}</p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    if (editingDonation) {
                      setEditingDonation({
                        ...editingDonation,
                        giverName: "",
                        amount: 0,
                        category: "",
                        department: "",
                        ministry: "",
                        groupName: "",
                        noOfGivers: 1,
                        notes: ""
                      });
                    }
                  }}
                  className="px-4 py-2 bg-emerald-50 text-[9px] font-bold text-emerald-700 rounded-lg hover:bg-emerald-100 transition-all uppercase tracking-widest border border-emerald-100"
                >
                  Clear All
                </button>
                <button onClick={() => setEditingDonation(null)} className="p-2 hover:bg-zinc-50 rounded-xl transition-colors">
                  <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[8px] font-black text-emerald-900/40 uppercase tracking-widest px-1">Donor Name</label>
                  <input
                    type="text"
                    value={editingDonation.giverName}
                    onChange={(e) => handleModalInputChange("giverName", e.target.value)}
                    className="w-full px-5 py-4 bg-zinc-50 border border-gray-100 rounded-xl text-xs font-bold text-emerald-950 outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-black text-emerald-900/40 uppercase tracking-widest px-1">Amount (₱)</label>
                  <input
                    type="number"
                    value={editingDonation.amount}
                    onChange={(e) => handleModalInputChange("amount", Number(e.target.value))}
                    className="w-full px-5 py-4 bg-zinc-50 border border-gray-100 rounded-xl text-xs font-bold text-emerald-950 outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[8px] font-black text-emerald-900/40 uppercase tracking-widest px-1">Category</label>
                  <select
                    value={editingDonation.category || ''}
                    onChange={(e) => handleModalInputChange("category", e.target.value)}
                    className="w-full px-5 py-4 bg-zinc-50 border border-gray-100 rounded-xl text-xs font-bold text-emerald-950 outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="">Select Category</option>
                    {DONATION_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-black text-emerald-900/40 uppercase tracking-widest px-1">Department</label>
                  <select
                    value={editingDonation.department || ''}
                    onChange={(e) => handleModalInputChange("department", e.target.value)}
                    className="w-full px-5 py-4 bg-zinc-50 border border-gray-100 rounded-xl text-xs font-bold text-emerald-950 outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500 disabled:opacity-30"
                    disabled={!editingDonation.category || editingDonation.category === "Parishioner"}
                  >
                    <option value="">
                      {!editingDonation.category
                        ? "Select Category First"
                        : (editingDonation.category === "Parishioner" ? "GENERAL" : "Select Department")
                      }
                    </option>
                    {editingDonation.category === "MSK" && MSK_DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                    {editingDonation.category === "Religious Organization" && RELIGIOUS_ORG_DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[8px] font-black text-emerald-900/40 uppercase tracking-widest px-1">Organization / Ministry</label>
                <input
                  type="text"
                  name="ministry"
                  list="edit-ministry-list"
                  value={editingDonation.ministry || editingDonation.groupName || ''}
                  onChange={(e) => handleModalInputChange("ministry", e.target.value)}
                  className="w-full px-5 py-4 bg-zinc-50 border border-gray-100 rounded-xl text-xs font-bold text-emerald-950 outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500 disabled:opacity-30"
                  placeholder={editingDonation.category === "Parishioner" ? "Search disabled for Parishioners" : "Start typing ministry name..."}
                  disabled={editingDonation.category === "Parishioner"}
                />
                <datalist id="edit-ministry-list">
                  {ALL_MINISTRIES
                    .filter(m => (editingDonation.category === "" || editingDonation.category === "All" || m.category === editingDonation.category) && (editingDonation.department === "" || editingDonation.department === "All" || m.department === editingDonation.department))
                    .map(m => <option key={m.name} value={m.name} />)}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[8px] font-black text-emerald-900/40 uppercase tracking-widest px-1">Givers</label>
                  <input
                    type="number"
                    value={editingDonation.noOfGivers || 1}
                    onChange={(e) => handleModalInputChange("noOfGivers", Number(e.target.value))}
                    className="w-full px-5 py-4 bg-zinc-50 border border-gray-100 rounded-xl text-xs font-bold text-emerald-950 outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-black text-emerald-900/40 uppercase tracking-widest px-1">Recorded By</label>
                  <input
                    type="text"
                    value={editingDonation.recordedBy || ''}
                    onChange={(e) => handleModalInputChange("recordedBy", e.target.value)}
                    className="w-full px-5 py-4 bg-zinc-50 border border-gray-100 rounded-xl text-xs font-bold text-emerald-950 outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[8px] font-black text-emerald-900/40 uppercase tracking-widest px-1">Notes</label>
                <textarea
                  value={editingDonation.notes || ''}
                  onChange={(e) => handleModalInputChange("notes", e.target.value)}
                  className="w-full px-5 py-4 bg-zinc-50 border border-gray-100 rounded-xl h-24 text-xs font-bold text-emerald-950 outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500 resize-none"
                />
              </div>
            </div>

            <div className="p-8 bg-zinc-50 border-t border-gray-100 flex gap-4 shrink-0">
              <button
                onClick={() => setEditingDonation(null)}
                className="flex-1 py-4 bg-white border border-gray-200 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-100 transition-all"
              >
                Cancel
              </button>
              <button
                disabled={updateLoading}
                onClick={async () => {
                  if (!editingDonation) return;
                  setUpdateLoading(true);
                  try {
                    const docRef = doc(db, "donations", editingDonation.id);
                    const { id, ...dataToUpdate } = editingDonation;
                    await updateDoc(docRef, dataToUpdate);
                    setEditingDonation(null);
                  } catch (err) {
                    alert("Update failed. Check permissions.");
                  } finally {
                    setUpdateLoading(false);
                  }
                }}
                className="flex-1 py-4 bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-700/10"
              >
                {updateLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
