import { useMemo } from "react";
import UserLayout from "../../components/layout/Userlayout";
import StatCard from "../../components/ui/StatCard";
import Button from "../../components/ui/Button";
import StatusBadge from "../../components/ui/StatusBadge";

export default function UserDashboard() {
  // Mock forms (replace with API later)
  const forms = useMemo(
    () => [
      { id: "HH-1021", head: "Ram Shrestha", ward: "Ward 05", status: "Submitted", updated: "2026-01-30" },
      { id: "HH-1018", head: "Sita Thapa", ward: "Ward 03", status: "Rejected", updated: "2026-01-29" },
      { id: "HH-1012", head: "Hari KC", ward: "Ward 01", status: "Verified", updated: "2026-01-27" },
      { id: "HH-1009", head: "Mina Gurung", ward: "Ward 02", status: "Draft", updated: "2026-01-26" },
    ],
    []
  );

  const stats = useMemo(() => {
    const total = forms.length;
    const draft = forms.filter((f) => f.status === "Draft").length;
    const rejected = forms.filter((f) => f.status === "Rejected").length;
    const verified = forms.filter((f) => f.status === "Verified").length;
    const pending = forms.filter((f) => f.status === "Submitted").length;
    return { total, draft, pending, rejected, verified };
  }, [forms]);

  const recentForms = useMemo(() => forms.slice(0, 3), [forms]);

  return (
    <UserLayout>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Submit your household census form and track verification status.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => alert("Later: Go to My Forms")}>
            View My Forms
          </Button>
          <Button onClick={() => alert("Later: Go to New Form")}>New Household Form</Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-6">
        <StatCard title="Total Forms" value={stats.total} />
        <StatCard title="Draft" value={stats.draft} hint="Not submitted yet" />
        <StatCard title="Pending" value={stats.pending} hint="Waiting for admin" />
        <StatCard title="Rejected" value={stats.rejected} hint="Needs correction" />
        <StatCard title="Verified" value={stats.verified} hint="Approved by admin" />
      </div>

      {/* Recent forms */}
      <div className="bg-white rounded-2xl border mt-6 overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <div className="font-semibold">Recent Forms</div>
            <div className="text-sm text-gray-500">Your latest household submissions.</div>
          </div>
          <Button variant="secondary" onClick={() => alert("Later: Go to all forms")}>
            See all
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3">Form ID</th>
                <th className="text-left px-4 py-3">Household Head</th>
                <th className="text-left px-4 py-3">Ward</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Updated</th>
                <th className="text-right px-4 py-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {recentForms.map((f) => (
                <tr key={f.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{f.id}</td>
                  <td className="px-4 py-3">{f.head}</td>
                  <td className="px-4 py-3">{f.ward}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={f.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-500">{f.updated}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-black underline" onClick={() => alert(`Later: open ${f.id}`)}>
                      View
                    </button>
                  </td>
                </tr>
              ))}

              {recentForms.length === 0 && (
                <tr className="border-t">
                  <td className="px-4 py-6 text-gray-500" colSpan={6}>
                    No forms yet. Click “New Household Form” to start.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </UserLayout>
  );
}
