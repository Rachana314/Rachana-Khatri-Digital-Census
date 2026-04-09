import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const HOUSEHOLD_STATUSES = [
  { value: "all", label: "All" },
  { value: "submitted", label: "Submitted" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
  { value: "correction_required", label: "Correction" },
  { value: "draft", label: "Draft" },
];

export default function AdminReports() {
  const [activeTab, setActiveTab] = useState("household");
  const [status, setStatus] = useState("all");
  const [households, setHouseholds] = useState([]);
  const [citizens, setCitizens] = useState([]);
  const [selectedHouseIds, setSelectedHouseIds] = useState([]);
  const [selectedCitizenIds, setSelectedCitizenIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // ── Fetch Households ────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab !== "household") return;
    const fetchHouseholds = async () => {
      setLoading(true);
      setError("");
      try {
        const params = status !== "all" ? `?status=${status}` : "";
        const res = await fetch(`${API}/api/admin/households${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Failed to fetch (${res.status})`);
        const data = await res.json();
        setHouseholds(Array.isArray(data) ? data : data.households || []);
        setSelectedHouseIds([]);
      } catch (err) {
        setError(err.message || "Failed to load households");
      } finally {
        setLoading(false);
      }
    };
    fetchHouseholds();
  }, [activeTab, status]);

  // ── Fetch Verified Citizens ─────────────────────────────────────────
  useEffect(() => {
    if (activeTab !== "verified") return;
    const fetchCitizens = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API}/api/admin/verified-citizens`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Failed to fetch (${res.status})`);
        const data = await res.json();
        setCitizens(Array.isArray(data) ? data : data.citizens || []);
        setSelectedCitizenIds([]);
      } catch (err) {
        setError(err.message || "Failed to load verified citizens");
      } finally {
        setLoading(false);
      }
    };
    fetchCitizens();
  }, [activeTab]);

  // ── Checkbox Helpers ────────────────────────────────────────────────
  const toggleHouse = (id) =>
    setSelectedHouseIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );

  const toggleAllHouses = () =>
    setSelectedHouseIds(
      selectedHouseIds.length === households.length
        ? []
        : households.map((h) => h._id)
    );

  const toggleCitizen = (id) =>
    setSelectedCitizenIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );

  const toggleAllCitizens = () =>
    setSelectedCitizenIds(
      selectedCitizenIds.length === citizens.length
        ? []
        : citizens.map((c) => c._id)
    );

  // ── Export PDF ──────────────────────────────────────────────────────
  const handleExport = async () => {
    const houseIds = selectedHouseIds;
    const citizenIds = selectedCitizenIds;

    if (houseIds.length === 0 && citizenIds.length === 0) {
      alert("Please select at least one record to export.");
      return;
    }

    try {
      setExporting(true);
      const res = await fetch(`${API}/api/admin/reports/pdf`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ householdIds: houseIds, citizenIds }),
      });

      if (!res.ok) {
        let message = `Export failed (${res.status})`;
        try {
          const data = await res.json();
          message = data.message || message;
        } catch { /* ignore */ }
        throw new Error(message);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `census-report-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert(err.message || "PDF export failed");
    } finally {
      setExporting(false);
    }
  };

  const totalSelected = selectedHouseIds.length + selectedCitizenIds.length;

  return (
    <div className="bg-white rounded-3xl border border-gray-300 shadow-sm p-6">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold">Reports</h1>
          <p className="text-black/50 font-semibold mt-1 text-sm">
            Select records from the list and export as PDF.
          </p>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={exporting || totalSelected === 0}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
            text-white font-extrabold px-6 py-3 rounded-2xl transition duration-200 flex items-center gap-2"
        >
          {exporting ? (
            <>
              <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              Generating...
            </>
          ) : (
            <>
              ⬇ Export PDF
              {totalSelected > 0 && (
                <span className="bg-white text-blue-600 text-xs font-extrabold px-2 py-0.5 rounded-lg">
                  {totalSelected}
                </span>
              )}
            </>
          )}
        </button>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-2 border-b border-gray-200 mb-5">
        <TabButton
          active={activeTab === "household"}
          onClick={() => { setActiveTab("household"); setStatus("all"); }}
          label="Household Forms"
          count={selectedHouseIds.length}
        />
        <TabButton
          active={activeTab === "verified"}
          onClick={() => { setActiveTab("verified"); }}
          label="Verified Citizen Forms"
          count={selectedCitizenIds.length}
        />
      </div>

      {/* ── Status Filter (Household tab only) ── */}
      {activeTab === "household" && (
        <div className="flex flex-wrap gap-2 mb-4">
          {HOUSEHOLD_STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatus(s.value)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition duration-200
                ${status === s.value
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-semibold px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      )}

      {/* ── Household Tab Content ── */}
      {activeTab === "household" && (
        <HouseholdTable
          households={households}
          selectedIds={selectedHouseIds}
          loading={loading}
          toggleOne={toggleHouse}
          toggleAll={toggleAllHouses}
        />
      )}

      {/* ── Verified Citizen Tab Content ── */}
      {activeTab === "verified" && (
        <CitizenTable
          citizens={citizens}
          selectedIds={selectedCitizenIds}
          loading={loading}
          toggleOne={toggleCitizen}
          toggleAll={toggleAllCitizens}
        />
      )}

      {/* ── Bottom Selection Summary ── */}
      <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
        <div className="text-sm text-gray-500 font-semibold">
          {totalSelected === 0 ? (
            "No records selected across both tabs"
          ) : (
            <span>
              <span className="text-blue-600 font-extrabold">{totalSelected}</span> record
              {totalSelected !== 1 ? "s" : ""} selected
              {selectedHouseIds.length > 0 && (
                <span className="ml-2 text-gray-400">
                  ({selectedHouseIds.length} household
                  {selectedHouseIds.length !== 1 ? "s" : ""}
                  {selectedCitizenIds.length > 0 ? `, ${selectedCitizenIds.length} citizen${selectedCitizenIds.length !== 1 ? "s" : ""}` : ""})
                </span>
              )}
              {selectedHouseIds.length === 0 && selectedCitizenIds.length > 0 && (
                <span className="ml-2 text-gray-400">
                  ({selectedCitizenIds.length} citizen{selectedCitizenIds.length !== 1 ? "s" : ""})
                </span>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Tab Button ───────────────────────────────────────────────────────────────
function TabButton({ active, onClick, label, count }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 text-sm font-extrabold border-b-2 transition duration-200 flex items-center gap-2
        ${active
          ? "border-blue-600 text-blue-600"
          : "border-transparent text-gray-500 hover:text-gray-800"
        }`}
    >
      {label}
      {count > 0 && (
        <span className="bg-blue-600 text-white text-xs font-extrabold px-2 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </button>
  );
}

// ── Household Table ──────────────────────────────────────────────────────────
function HouseholdTable({ households, selectedIds, loading, toggleOne, toggleAll }) {
  const allChecked = households.length > 0 && selectedIds.length === households.length;
  const someChecked = selectedIds.length > 0 && selectedIds.length < households.length;

  if (loading) return <LoadingState text="Loading household forms..." />;
  if (households.length === 0)
    return <EmptyState text="No household forms found for this status." />;

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 grid grid-cols-12 gap-2 border-b border-gray-200">
        <div className="col-span-1 flex items-center">
          <input
            type="checkbox"
            checked={allChecked}
            ref={(el) => { if (el) el.indeterminate = someChecked; }}
            onChange={toggleAll}
            className="w-4 h-4 accent-blue-600 cursor-pointer"
          />
        </div>
        <div className="col-span-3 text-xs font-extrabold text-gray-500 uppercase">Household ID</div>
        <div className="col-span-2 text-xs font-extrabold text-gray-500 uppercase">Ward</div>
        <div className="col-span-3 text-xs font-extrabold text-gray-500 uppercase">Address</div>
        <div className="col-span-2 text-xs font-extrabold text-gray-500 uppercase">Status</div>
        <div className="col-span-1 text-xs font-extrabold text-gray-500 uppercase">Members</div>
      </div>

      {/* Rows */}
      <div className="max-h-96 overflow-y-auto">
        {households.map((h) => (
          <div
            key={h._id}
            onClick={() => toggleOne(h._id)}
            className={`px-4 py-3 grid grid-cols-12 gap-2 items-center border-b border-gray-100
              cursor-pointer transition duration-150
              ${selectedIds.includes(h._id) ? "bg-blue-50" : "hover:bg-gray-50"}`}
          >
            <div className="col-span-1">
              <input
                type="checkbox"
                checked={selectedIds.includes(h._id)}
                onChange={() => toggleOne(h._id)}
                onClick={(e) => e.stopPropagation()}
                className="w-4 h-4 accent-blue-600 cursor-pointer"
              />
            </div>
            <div className="col-span-3 text-sm font-mono text-gray-800 truncate">
              {h.householdId || h._id}
            </div>
            <div className="col-span-2 text-sm text-gray-600 truncate">{h.ward || "—"}</div>
            <div className="col-span-3 text-sm text-gray-600 truncate">{h.address || "—"}</div>
            <div className="col-span-2">
              <StatusBadge status={h.status} />
            </div>
            <div className="col-span-1 text-sm text-gray-600">
              {h.members?.length ?? 0}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Verified Citizen Table ───────────────────────────────────────────────────
function CitizenTable({ citizens, selectedIds, loading, toggleOne, toggleAll }) {
  const allChecked = citizens.length > 0 && selectedIds.length === citizens.length;
  const someChecked = selectedIds.length > 0 && selectedIds.length < citizens.length;

  if (loading) return <LoadingState text="Loading verified citizen forms..." />;
  if (citizens.length === 0)
    return <EmptyState text="No verified citizen records found." />;

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 grid grid-cols-12 gap-2 border-b border-gray-200">
        <div className="col-span-1 flex items-center">
          <input
            type="checkbox"
            checked={allChecked}
            ref={(el) => { if (el) el.indeterminate = someChecked; }}
            onChange={toggleAll}
            className="w-4 h-4 accent-blue-600 cursor-pointer"
          />
        </div>
        <div className="col-span-3 text-xs font-extrabold text-gray-500 uppercase">Citizenship No</div>
        <div className="col-span-4 text-xs font-extrabold text-gray-500 uppercase">Full Name</div>
        <div className="col-span-2 text-xs font-extrabold text-gray-500 uppercase">District</div>
        <div className="col-span-2 text-xs font-extrabold text-gray-500 uppercase">DOB</div>
      </div>

      {/* Rows */}
      <div className="max-h-96 overflow-y-auto">
        {citizens.map((c) => (
          <div
            key={c._id}
            onClick={() => toggleOne(c._id)}
            className={`px-4 py-3 grid grid-cols-12 gap-2 items-center border-b border-gray-100
              cursor-pointer transition duration-150
              ${selectedIds.includes(c._id) ? "bg-blue-50" : "hover:bg-gray-50"}`}
          >
            <div className="col-span-1">
              <input
                type="checkbox"
                checked={selectedIds.includes(c._id)}
                onChange={() => toggleOne(c._id)}
                onClick={(e) => e.stopPropagation()}
                className="w-4 h-4 accent-blue-600 cursor-pointer"
              />
            </div>
            <div className="col-span-3 text-sm font-mono text-gray-800 truncate">
              {c.citizenshipNo}
            </div>
            <div className="col-span-4 text-sm text-gray-700 truncate">{c.fullName || "—"}</div>
            <div className="col-span-2 text-sm text-gray-600 truncate">{c.district || "—"}</div>
            <div className="col-span-2 text-sm text-gray-600">
              {c.dob ? new Date(c.dob).toLocaleDateString() : "—"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const styles = {
    verified: "bg-green-100 text-green-700",
    submitted: "bg-blue-100 text-blue-700",
    draft: "bg-gray-100 text-gray-600",
    rejected: "bg-red-100 text-red-700",
    correction_required: "bg-yellow-100 text-yellow-700",
  };
  return (
    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${styles[status] || "bg-gray-100 text-gray-500"}`}>
      {status || "—"}
    </span>
  );
}

// ── Loading & Empty States ────────────────────────────────────────────────────
function LoadingState({ text }) {
  return (
    <div className="py-12 text-center text-gray-400 text-sm font-semibold">
      <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full mb-3" />
      <p>{text}</p>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="py-12 text-center text-gray-400 text-sm font-semibold border border-dashed border-gray-200 rounded-2xl">
      {text}
    </div>
  );
}