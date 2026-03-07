import { useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function AdminReports() {
  const [loadingType, setLoadingType] = useState("");

  // Downloads a report file from backend
  // type can be "pdf" or "excel"
  const handleExport = async (type) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Admin token not found. Please login again.");
      return;
    }

    try {
      setLoadingType(type);

      // Backend endpoints expected:
      // GET /api/admin/reports/pdf
      // GET /api/admin/reports/excel
      const res = await fetch(`${API}/api/admin/reports/${type}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        let message = `Export failed (${res.status})`;
        try {
          const data = await res.json();
          message = data.message || message;
        } catch {
          // ignore JSON parse failure
        }
        throw new Error(message);
      }

      // Convert backend response to downloadable file
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;

      // File names for downloaded reports
      if (type === "pdf") {
        a.download = `census-report-${new Date().toISOString().slice(0, 10)}.pdf`;
      } else {
        a.download = `census-report-${new Date().toISOString().slice(0, 10)}.csv`;
      }

      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert(err.message || "Report export failed");
    } finally {
      setLoadingType("");
    }
  };

  return (
    <div className="rounded-3xl bg-white border shadow-sm p-6">
      <h1 className="text-2xl font-extrabold">Reports</h1>

      <p className="text-black/60 font-semibold mt-2">
        Export verified census data for official use.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border p-5">
          <h2 className="text-lg font-extrabold">PDF Report</h2>
          <p className="text-sm text-black/60 mt-2">
            Download a printable summary report for office and official review.
          </p>

          <button
            onClick={() => handleExport("pdf")}
            disabled={loadingType === "pdf" || loadingType === "excel"}
            className="mt-4 rounded-2xl px-5 py-3 font-extrabold bg-blue-600 text-white hover:opacity-90 transition disabled:opacity-60"
          >
            {loadingType === "pdf" ? "Exporting PDF..." : "Export PDF"}
          </button>
        </div>

        <div className="rounded-2xl border p-5">
          <h2 className="text-lg font-extrabold">Excel / CSV Report</h2>
          <p className="text-sm text-black/60 mt-2">
            Download tabular household and population data for analysis.
          </p>

          <button
            onClick={() => handleExport("excel")}
            disabled={loadingType === "pdf" || loadingType === "excel"}
            className="mt-4 rounded-2xl px-5 py-3 font-extrabold bg-emerald-600 text-white hover:opacity-90 transition disabled:opacity-60"
          >
            {loadingType === "excel" ? "Exporting Excel..." : "Export Excel"}
          </button>
        </div>
      </div>
    </div>
  );
}