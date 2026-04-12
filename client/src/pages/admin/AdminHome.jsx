import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";
import { Link } from "react-router-dom";

function Card({ label, value, hint }) {
  return (
    <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5 hover:shadow-md transition duration-300">
      <div className="text-black/50 font-bold text-sm">{label}</div>
      <div className="text-4xl font-extrabold mt-2 text-blue-900">{value}</div>
      {hint && <div className="text-black/40 text-sm font-semibold mt-2">{hint}</div>}
    </div>
  );
}

export default function AdminHome() {
  const [progress, setProgress] = useState({ total: 0, submitted: 0, verified: 0, rejected: 0 });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        setLoading(true);
        const data = await apiFetch("/api/admin/progress");
        setProgress(data);
      } catch (e) {
        setErr(e.message || "Failed to load progress");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900">Dashboard</h1>
          <p className="text-black/50 font-semibold mt-1">Overview of submissions and progress.</p>
        </div>
        <Link
          to="/admin/households"
          className="rounded-2xl px-5 py-3 font-extrabold bg-blue-900 text-white hover:bg-blue-800 transition"
        >
          Review Households
        </Link>
      </div>

      {/* Error */}
      {err && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-rose-700 font-bold">
          {err}
        </div>
      )}

      {/* Stats grid */}
      {loading ? (
        <div className="p-10 text-center font-extrabold text-black/40">Loading...</div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card label="Total Records" value={progress.total}     hint="All households"   />
          <Card label="Submitted"     value={progress.submitted} hint="Waiting review"   />
          <Card label="Verified"      value={progress.verified}  hint="Approved & locked"/>
          <Card label="Rejected"      value={progress.rejected}  hint="Needs correction" />
        </div>
      )}

      {/* Next steps */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6">
        <div className="font-extrabold text-zinc-900">Next steps</div>
        <div className="text-black/60 font-semibold mt-2">
          Use <b>Households</b> to verify/reject. Later we'll add Analytics, GIS and Reports.
        </div>
      </div>
    </div>
  );
}