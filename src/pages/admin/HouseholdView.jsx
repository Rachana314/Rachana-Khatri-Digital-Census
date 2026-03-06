import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../../lib/api";

function RejectModal({ open, onClose, onSubmit, busy }) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) setReason("");
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white border shadow-xl p-6">
        <div className="text-xl font-extrabold">Reject Submission</div>
        <div className="text-black/60 text-sm font-semibold mt-1">
          This will be shown to the citizen.
        </div>

        <textarea
          className="mt-4 w-full rounded-2xl border p-3 min-h-[130px] outline-none"
          placeholder="Reason..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={busy}
            className="rounded-2xl px-4 py-2 font-extrabold border hover:bg-black/5 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(reason)}
            disabled={busy || !reason.trim()}
            className="rounded-2xl px-4 py-2 font-extrabold bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50"
          >
            {busy ? "Rejecting..." : "Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HouseholdView() {
  const { householdId } = useParams();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const [rejectOpen, setRejectOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const data = await apiFetch(`/api/admin/households/${householdId}`);
      setItem(data);
    } catch (e) {
      setErr(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [householdId]);

  const verify = async () => {
    setBusy(true);
    setErr("");
    try {
      await apiFetch(`/api/admin/households/${householdId}/verify`, { method: "PATCH" });
      await load();
    } catch (e) {
      setErr(e.message || "Verify failed");
    } finally {
      setBusy(false);
    }
  };

  const reject = async (reason) => {
    setBusy(true);
    setErr("");
    try {
      await apiFetch(`/api/admin/households/${householdId}/reject`, {
        method: "PATCH",
        body: JSON.stringify({ reason: reason || "" }),
      });
      setRejectOpen(false);
      await load();
    } catch (e) {
      setErr(e.message || "Reject failed");
    } finally {
      setBusy(false);
    }
  };

  const canAction = item && item.status === "submitted" && !item.locked;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">Household {householdId}</h1>
          <p className="text-black/60 font-semibold mt-1">Review details, documents, and members.</p>
        </div>

        <Link
          to="/admin/households"
          className="rounded-2xl px-4 py-2 font-extrabold border hover:bg-black/5 transition"
        >
          Back
        </Link>
      </div>

      {err && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700 font-bold">
          {err}
        </div>
      )}

      {loading ? (
        <div className="p-10 text-center font-extrabold text-black/60">Loading...</div>
      ) : !item ? (
        <div className="p-10 text-center text-black/60 font-semibold">Not found.</div>
      ) : (
        <div className="rounded-3xl bg-white border shadow-sm p-6 space-y-6">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <div className="font-extrabold text-lg">
                Ward {item.ward} • {item.address}
              </div>
              <div className="text-sm text-black/60 font-semibold mt-1">
                Status: <b>{item.status}</b> • Locked: <b>{String(item.locked)}</b>
              </div>
            </div>

            <div className="flex gap-2 items-center flex-wrap">
              {canAction && (
                <>
                  <button
                    onClick={verify}
                    disabled={busy}
                    className="rounded-2xl px-4 py-2 font-extrabold bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-50"
                  >
                    {busy ? "Working..." : "Verify"}
                  </button>
                  <button
                    onClick={() => setRejectOpen(true)}
                    disabled={busy}
                    className="rounded-2xl px-4 py-2 font-extrabold bg-rose-600 text-white hover:bg-rose-700 transition disabled:opacity-50"
                  >
                    Reject
                  </button>
                </>
              )}

              {(item.status === "verified" || item.locked) && (
                <span className="text-sm font-extrabold text-emerald-700">✅ Verified & Locked</span>
              )}

              {item.status === "rejected" && (
                <span className="text-sm font-extrabold text-rose-700">❌ Rejected</span>
              )}
            </div>
          </div>

          {item.status === "rejected" && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
              <div className="font-extrabold text-rose-700">Rejection Reason</div>
              <div className="text-rose-700/80 mt-1">{item.rejectionReason || "-"}</div>
            </div>
          )}

          {/* Members */}
          <section className="rounded-2xl border p-5">
            <div className="font-extrabold">Members ({item.members?.length || 0})</div>
            <div className="mt-3 space-y-2">
              {(item.members || []).length === 0 ? (
                <div className="text-black/60 font-semibold">No members</div>
              ) : (
                item.members.map((m, i) => (
                  <div key={i} className="rounded-2xl bg-zinc-50 border p-4">
                    <div className="font-extrabold">{m.name || `Member ${i + 1}`}</div>
                    <div className="text-black/60 font-semibold mt-1">
                      Age: {m.age ?? "-"} • Gender: {m.gender ?? "-"} • Education: {m.education ?? "-"} • Occupation:{" "}
                      {m.occupation ?? "-"}
                    </div>
                    {m.disability && (
                      <div className="mt-2 text-rose-700 font-bold">
                        Disability: <span className="font-semibold">{m.disabilityDetail || "-"}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Documents */}
          <section className="rounded-2xl border p-5">
            <div className="font-extrabold">Documents ({item.documents?.length || 0})</div>
            <div className="mt-3 space-y-2">
              {(item.documents || []).length === 0 ? (
                <div className="text-black/60 font-semibold">No documents</div>
              ) : (
                item.documents.map((d, i) => (
                  <div key={i} className="rounded-2xl border p-4">
                    <div className="font-extrabold">{d.type}</div>
                    <a className="text-blue-700 underline break-all" href={d.url} target="_blank" rel="noreferrer">
                      {d.url}
                    </a>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      )}

      <RejectModal open={rejectOpen} onClose={() => setRejectOpen(false)} onSubmit={reject} busy={busy} />
    </div>
  );
}