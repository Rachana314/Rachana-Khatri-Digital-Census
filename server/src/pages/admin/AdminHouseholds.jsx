import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../lib/api";
import { Link } from "react-router-dom";

const tabs = ["submitted", "verified", "rejected", "draft"];

function StatusBadge({ status }) {
  const map = {
    draft: "bg-amber-50 text-amber-700 ring-amber-200",
    submitted: "bg-sky-50 text-sky-700 ring-sky-200",
    rejected: "bg-rose-50 text-rose-700 ring-rose-200",
    verified: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-extrabold ring-1 ${
        map[status] || "bg-zinc-50 text-zinc-700 ring-zinc-200"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {(status || "n/a").toUpperCase()}
    </span>
  );
}

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
          Write a reason. This will be shown to the citizen.
        </div>

        <textarea
          className="mt-4 w-full rounded-2xl border p-3 min-h-[130px] outline-none"
          placeholder="Example: Document photo is unclear. Please upload a clear image."
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

export default function AdminHouseholds() {
  const [rows, setRows] = useState([]);
  const [progress, setProgress] = useState({ total: 0, submitted: 0, verified: 0, rejected: 0 });

  const [q, setQ] = useState("");
  const [ward, setWard] = useState("");
  const [status, setStatus] = useState("submitted");

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [err, setErr] = useState("");

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState("");
  const [busyAction, setBusyAction] = useState(false);

  const loadProgress = async () => {
    const data = await apiFetch("/api/admin/progress");
    setProgress(data);
  };

  const loadHouseholds = async ({ isRefresh = false } = {}) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      setErr("");
      const params = new URLSearchParams();
      if (q) params.append("q", q);
      if (ward) params.append("ward", ward);
      if (status) params.append("status", status);

      const data = await apiFetch(`/api/admin/households?${params.toString()}`);
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message || "Failed to load households");
      setRows([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    (async () => {
      await loadProgress();
      await loadHouseholds();
    })();
    // eslint-disable-next-line
  }, [status]);

  const verify = async (householdId) => {
    setBusyAction(true);
    setErr("");
    try {
      await apiFetch(`/api/admin/households/${householdId}/verify`, { method: "PATCH" });
      await loadProgress();
      await loadHouseholds({ isRefresh: true });
    } catch (e) {
      setErr(e.message || "Verify failed");
    } finally {
      setBusyAction(false);
    }
  };

  const openReject = (householdId) => {
    setRejectTarget(householdId);
    setRejectOpen(true);
  };

  const reject = async (reason) => {
    setBusyAction(true);
    setErr("");
    try {
      await apiFetch(`/api/admin/households/${rejectTarget}/reject`, {
        method: "PATCH",
        body: JSON.stringify({ reason: reason || "" }),
      });
      setRejectOpen(false);
      setRejectTarget("");
      await loadProgress();
      await loadHouseholds({ isRefresh: true });
    } catch (e) {
      setErr(e.message || "Reject failed");
    } finally {
      setBusyAction(false);
    }
  };

  const wardOptions = useMemo(() => {
    const set = new Set((rows || []).map((r) => String(r.ward || "").trim()).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const clearFilters = () => {
    setQ("");
    setWard("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-white border shadow-sm p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">Households</h1>
            <p className="mt-1 text-black/60 font-semibold">
              Search, filter, verify/reject submissions.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => loadHouseholds({ isRefresh: true })}
              className="rounded-2xl px-4 py-2 font-extrabold border hover:bg-black/5 transition disabled:opacity-50"
              disabled={refreshing || loading}
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Progress cards */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <MiniCard label="Total" value={progress.total} />
          <MiniCard label="Submitted" value={progress.submitted} />
          <MiniCard label="Verified" value={progress.verified} />
          <MiniCard label="Rejected" value={progress.rejected} />
        </div>
      </div>

      {/* Status tabs */}
      <div className="rounded-3xl bg-white border shadow-sm p-3 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setStatus(tab)}
            className={`rounded-2xl px-4 py-2 font-extrabold transition ${
              status === tab ? "bg-zinc-900 text-white" : "bg-zinc-100 text-black/70 hover:bg-black/5"
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-3xl bg-white border shadow-sm p-5 space-y-3">
        <div className="flex flex-wrap gap-2 items-center">
          <input
            className="border rounded-2xl px-4 py-3 outline-none flex-1 min-w-[240px]"
            placeholder="Search by householdId / member name / address"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <select
            className="border rounded-2xl px-4 py-3 outline-none min-w-[160px]"
            value={ward}
            onChange={(e) => setWard(e.target.value)}
          >
            <option value="">All wards</option>
            {wardOptions.map((w) => (
              <option key={w} value={w}>
                Ward {w}
              </option>
            ))}
          </select>

          <button
            onClick={() => loadHouseholds()}
            disabled={loading}
            className="rounded-2xl px-5 py-3 font-extrabold bg-sky-700 text-white hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Loading..." : "Search"}
          </button>

          <button
            onClick={() => {
              clearFilters();
              setTimeout(() => loadHouseholds(), 0);
            }}
            className="rounded-2xl px-5 py-3 font-extrabold border hover:bg-black/5 transition"
          >
            Clear
          </button>
        </div>

        {err && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700 font-bold">
            {err}
          </div>
        )}
      </div>

      {/* List */}
      <div className="rounded-3xl bg-white border shadow-sm overflow-hidden">
        <div className="p-5 border-b flex items-center justify-between">
          <div className="font-extrabold text-lg">Records</div>
          <div className="text-sm text-black/60 font-bold">Showing: {rows.length}</div>
        </div>

        {loading ? (
          <div className="p-10 text-center font-extrabold text-black/60">Loading...</div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-black/60 font-semibold">No records found.</div>
        ) : (
          <div className="divide-y">
            {rows.map((r) => (
              <div key={r.householdId} className="p-5 flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-[260px]">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="font-extrabold text-xl">{r.householdId}</div>
                    <StatusBadge status={r.status} />
                    {r.locked && (
                      <span className="inline-flex rounded-full px-3 py-1 text-xs font-extrabold bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200">
                        LOCKED
                      </span>
                    )}
                  </div>

                  <div className="text-black/60 font-semibold mt-1">
                    Ward: <span className="text-black">{r.ward ?? "-"}</span>
                  </div>
                  <div className="text-black/60 font-semibold mt-1">
                    Address: <span className="text-black">{r.address ?? "-"}</span>
                  </div>
                </div>

                <div className="flex gap-2 items-center flex-wrap">
                  <Link
                    to={`/admin/households/${r.householdId}`}
                    className="rounded-2xl px-4 py-2 font-extrabold bg-zinc-900 text-white hover:opacity-90 transition"
                  >
                    View
                  </Link>

                  {r.status === "submitted" && !r.locked && (
                    <>
                      <button
                        onClick={() => verify(r.householdId)}
                        disabled={busyAction}
                        className="rounded-2xl px-4 py-2 font-extrabold bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-50"
                      >
                        Verify
                      </button>
                      <button
                        onClick={() => openReject(r.householdId)}
                        disabled={busyAction}
                        className="rounded-2xl px-4 py-2 font-extrabold bg-rose-600 text-white hover:bg-rose-700 transition disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {(r.status === "verified" || r.locked) && (
                    <span className="text-sm font-extrabold text-emerald-700">✅ Verified</span>
                  )}

                  {r.status === "rejected" && (
                    <span className="text-sm font-extrabold text-rose-700">❌ Rejected</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <RejectModal open={rejectOpen} onClose={() => setRejectOpen(false)} onSubmit={reject} busy={busyAction} />
    </div>
  );
}

function MiniCard({ label, value }) {
  return (
    <div className="rounded-3xl bg-white border shadow-sm p-5">
      <div className="text-black/60 font-bold text-sm">{label}</div>
      <div className="text-2xl font-extrabold mt-2">{value}</div>
    </div>
  );
}