import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";
import { Link } from "react-router-dom";

function Card({ label, value, hint }) {
  return (
    <div className="rounded-xl border-gray-300 hover:scale-105 transition duration-700 bg-white border shadow-sm p-5">
      <div className="text-black/60 font-bold text-sm">{label}</div>
      <div className="text-3xl font-extrabold mt-2">{value}</div>
      {hint && <div className="text-black/50 text-sm font-semibold mt-2">{hint}</div>}
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
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">Dashboard</h1>
          <p className="text-black/60 font-semibold mt-1">Overview of submissions and progress.</p>
        </div>

        <Link
          to="/admin/households"
          className="rounded-2xl px-5 py-3 hover:scale-105 duration-700 ease-in-out font-extrabold bg-zinc-900 text-white hover:opacity-90 transition"
        >
          Review Households
        </Link>
      </div>

      {err && <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-rose-700 font-bold">{err}</div>}
      {loading ? (
        <div className="p-10 text-center font-extrabold text-black/60">Loading...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card label="Total records" value={progress.total} hint="All households" />
          <Card label="Submitted" value={progress.submitted} hint="Waiting review" />
          <Card label="Verified" value={progress.verified} hint="Approved & locked" />
          <Card label="Rejected" value={progress.rejected} hint="Needs correction" />
        </div>
      )}

      <div className="rounded-xl bg-white border hover:scale-102 border-gray-300 transition duration-700 shadow-sm p-6">
        <div className="font-extrabold">Next steps</div>
        <div className="text-black/60 font-semibold mt-2">
          Use <b>Households</b> to verify/reject. Later we’ll add Analytics, GIS and Reports.
        </div>
      </div>
    </div>
  );
}