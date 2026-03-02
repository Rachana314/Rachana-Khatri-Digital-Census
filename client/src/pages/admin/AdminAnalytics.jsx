export default function AdminReports() {
  return (
    <div className="rounded-3xl bg-white border shadow-sm p-6">
      <h1 className="text-2xl font-extrabold">Reports</h1>
      <p className="text-black/60 font-semibold mt-2">
        Next: export PDF/Excel reports using backend endpoints.
      </p>

      <div className="mt-4 flex gap-3 flex-wrap">
        <button className="rounded-2xl px-5 py-3 font-extrabold bg-blue-600 text-white hover:opacity-90 transition">
          Export PDF
        </button>
        <button className="rounded-2xl px-5 py-3 font-extrabold bg-emerald-600 text-white hover:opacity-90 transition">
          Export Excel
        </button>
      </div>
    </div>
  );
}