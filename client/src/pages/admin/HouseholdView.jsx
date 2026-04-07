import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
// FIX: Ensure this matches your api.js export (added curly braces)
import { apiFetch } from "../../lib/api";

// --- SUB-COMPONENT: REJECT MODAL ---
function RejectModal({ open, onClose, onSubmit, busy }) {
  const [reason, setReason] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white border shadow-xl p-6">
        <div className="text-xl font-extrabold text-zinc-900">Reject Submission</div>
        <p className="text-zinc-500 text-sm font-semibold mt-1">
          Provide a reason for the citizen to fix.
        </p>

        <textarea
          className="mt-4 w-full rounded-2xl border p-4 min-h-[130px] outline-none focus:border-zinc-900 transition"
          placeholder="Reason for rejection..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={busy}
            className="rounded-2xl px-5 py-2 font-black border hover:bg-zinc-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(reason)}
            disabled={busy || !reason.trim()}
            className="rounded-2xl px-5 py-2 font-black bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50"
          >
            {busy ? "Sending..." : "Confirm Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- MAIN COMPONENT ---
export default function HouseholdView() {
  const { householdId } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      // The path /api/admin/households/${householdId} must exist on your server
      const data = await apiFetch(`/api/admin/households/${householdId}`);
      setItem(data);
    } catch (e) { 
      setErr(e.message); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    if (householdId) load(); 
  }, [householdId]);

  const verify = async () => {
    if(!window.confirm("Mark this household as verified?")) return;
    setBusy(true);
    try {
      await apiFetch(`/api/admin/households/${householdId}/verify`, { method: "PATCH" });
      await load();
    } catch (e) { 
      alert(e.message); 
    } finally { 
      setBusy(false); 
    }
  };

  const removeMember = async (memberId) => {
    if (!window.confirm("Admin: Remove this member permanently?")) return;
    setBusy(true);
    try {
      const updatedMembers = item.members.filter(m => m._id !== memberId);
      await apiFetch(`/api/admin/households/${householdId}/members`, {
        method: "PUT",
        body: JSON.stringify({ members: updatedMembers }),
      });
      setItem({ ...item, members: updatedMembers });
    } catch (e) { 
      alert(e.message); 
    } finally { 
      setBusy(false); 
    }
  };

  const reject = async (reason) => {
    setBusy(true);
    try {
      await apiFetch(`/api/admin/households/${householdId}/reject`, {
        method: "PATCH",
        body: JSON.stringify({ reason }),
      });
      setRejectOpen(false);
      await load();
    } catch (e) { 
      alert(e.message); 
    } finally { 
      setBusy(false); 
    }
  };

  if (loading) return <div className="p-20 text-center font-black text-zinc-400 text-xl">Loading record...</div>;
  if (err) return <div className="p-20 text-center font-black text-rose-500">Error: {err}</div>;
  if (!item) return <div className="p-20 text-center font-black text-rose-500">Household record not found.</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/admin/households" className="font-black text-zinc-400 hover:text-zinc-900 transition">
            ← Back to List
        </Link>
        <div className="flex gap-2">
          {item.status === "submitted" && (
            <>
              <button onClick={verify} disabled={busy} className="bg-emerald-600 text-white px-6 py-2.5 rounded-2xl font-black shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition">
                {busy ? "Processing..." : "Verify Record"}
              </button>
              <button onClick={() => setRejectOpen(true)} disabled={busy} className="bg-rose-50 text-rose-600 px-6 py-2.5 rounded-2xl font-black hover:bg-rose-100 transition">
                Reject
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border rounded-3xl p-8 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-black text-zinc-900">{item.householdId}</h1>
                <p className="text-zinc-500 font-bold mt-2 text-lg">{item.address}</p>
              </div>
              <div className="px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest bg-zinc-100 text-zinc-600">
                {item.status}
              </div>
            </div>
            
            <div className="mt-8 grid grid-cols-2 gap-4 border-t pt-6">
              <div>
                <div className="text-zinc-400 text-xs font-black uppercase">Ward Number</div>
                <div className="text-zinc-900 font-black text-lg">{item.ward || "N/A"}</div>
              </div>
              <div>
                <div className="text-zinc-400 text-xs font-black uppercase">Lock Status</div>
                <div className="text-zinc-900 font-black text-lg">{item.locked ? "Locked 🔒" : "Open 🔓"}</div>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-3xl p-8 shadow-sm">
            <h2 className="text-2xl font-black text-zinc-900 mb-6">Members ({item.members?.length || 0})</h2>
            <div className="space-y-4">
              {item.members?.map((m) => (
                <div key={m._id} className="p-5 rounded-2xl bg-zinc-50 border flex justify-between items-center group">
                  <div>
                    <div className="font-black text-zinc-900 text-lg">{m.name}</div>
                    <div className="text-zinc-500 font-bold text-sm">
                      {m.age} Yrs • {m.gender} • {m.relation}
                    </div>
                  </div>
                  <button onClick={() => removeMember(m._id)} className="opacity-0 group-hover:opacity-100 px-4 py-2 rounded-xl bg-rose-50 text-rose-600 font-black text-xs transition">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-white border rounded-3xl p-6 shadow-sm">
              <h3 className="font-black text-zinc-900 mb-4 uppercase text-xs tracking-widest">Verification Docs</h3>
              <div className="space-y-3">
                {item.documents?.length > 0 ? item.documents.map((doc, idx) => (
                  <a key={idx} href={doc.url} target="_blank" rel="noreferrer" className="block p-4 rounded-2xl border bg-zinc-50 hover:border-zinc-900 transition">
                    <div className="font-black text-zinc-900 text-sm">{doc.type}</div>
                    <div className="text-zinc-400 text-xs mt-1">Click to view file ↗</div>
                  </a>
                )) : (
                  <p className="text-zinc-400 text-sm font-bold">No documents uploaded.</p>
                )}
              </div>
           </div>
        </div>
      </div>

      <RejectModal 
        open={rejectOpen} 
        onClose={() => setRejectOpen(false)} 
        onSubmit={reject} 
        busy={busy} 
      />
    </div>
  );
}