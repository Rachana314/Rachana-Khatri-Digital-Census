import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../lib/api";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

function StatCard({ title, value }) {
  return (
    <div className="rounded-3xl bg-white border shadow-sm p-6">
      <p className="text-sm font-semibold text-black/60">{title}</p>
      <h3 className="mt-3 text-3xl font-extrabold text-[var(--color-brandBlack)]">
        {value}
      </h3>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="rounded-3xl bg-white border shadow-sm p-6">
      <h2 className="text-xl font-extrabold">{title}</h2>
      <div className="mt-6 h-[320px]">{children}</div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-xl border bg-white px-4 py-3 shadow-lg">
      <p className="font-extrabold text-black mb-2">{label}</p>
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <p key={index} className="text-sm font-semibold text-black/70">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    </div>
  );
}

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadAnalytics() {
      try {
        setLoading(true);
        setError("");

        const res = await apiFetch("/api/admin/analytics");

        if (mounted) {
          setData(res);
        }
      } catch (err) {
        console.error(err);
        if (mounted) {
          setError(err.message || "Failed to load analytics");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadAnalytics();

    return () => {
      mounted = false;
    };
  }, []);

  const statusChartData = useMemo(() => {
    if (!data) return [];
    return [
      { name: "Draft", count: data.statusBreakdown.draft || 0 },
      { name: "Submitted", count: data.statusBreakdown.submitted || 0 },
      {
        name: "Correction",
        count: data.statusBreakdown.correction_required || 0,
      },
      { name: "Rejected", count: data.statusBreakdown.rejected || 0 },
      { name: "Verified", count: data.statusBreakdown.verified || 0 },
    ];
  }, [data]);

  const genderChartData = useMemo(() => {
    if (!data) return [];
    return [
      { name: "Male", count: data.genderBreakdown.Male || 0 },
      { name: "Female", count: data.genderBreakdown.Female || 0 },
      { name: "Other", count: data.genderBreakdown.Other || 0 },
    ];
  }, [data]);

  const ageChartData = useMemo(() => {
    if (!data) return [];
    return [
      { name: "Children", count: data.ageBreakdown.children || 0 },
      { name: "Adults", count: data.ageBreakdown.adults || 0 },
      { name: "Seniors", count: data.ageBreakdown.seniors || 0 },
    ];
  }, [data]);

  const wardPopulationChartData = useMemo(() => {
    if (!data?.wards) return [];
    return data.wards.map((ward) => ({
      name: ward.ward,
      households: ward.households || 0,
      population: ward.population || 0,
    }));
  }, [data]);

  const wardGenderChartData = useMemo(() => {
    if (!data?.wards) return [];
    return data.wards.map((ward) => ({
      name: ward.ward,
      male: ward.male || 0,
      female: ward.female || 0,
      other: ward.other || 0,
    }));
  }, [data]);

  const topEducationChartData = useMemo(() => {
    if (!data?.educationBreakdown) return [];
    return data.educationBreakdown.slice(0, 8).map((item) => ({
      name: item.name,
      count: item.count,
    }));
  }, [data]);

  const topOccupationChartData = useMemo(() => {
    if (!data?.occupationBreakdown) return [];
    return data.occupationBreakdown.slice(0, 8).map((item) => ({
      name: item.name,
      count: item.count,
    }));
  }, [data]);

  if (loading) {
    return (
      <div className="rounded-3xl bg-white border shadow-sm p-6">
        <h1 className="text-2xl font-extrabold">Analytics</h1>
        <p className="mt-2 text-black/60 font-semibold">Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl bg-red-50 border border-red-200 shadow-sm p-6">
        <h1 className="text-2xl font-extrabold text-red-700">Analytics Error</h1>
        <p className="mt-2 text-red-600 font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white border shadow-sm p-6">
        <h1 className="text-2xl font-extrabold">Analytics</h1>
        <p className="text-black/60 font-semibold mt-2">
          Population breakdowns, household counts, and insights shown in bar charts.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Households" value={data.totalHouseholds} />
        <StatCard title="Total Population" value={data.totalPopulation} />
        <StatCard title="Verified Households" value={data.statusBreakdown.verified} />
        <StatCard title="Average Household Size" value={data.averageHouseholdSize} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Household Status Breakdown">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="count" name="Households" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Population by Gender">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={genderChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="count" name="Population" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Population by Age Group">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ageChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="count" name="Population" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Ward-wise Households vs Population">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={wardPopulationChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="households" name="Households" radius={[8, 8, 0, 0]} />
              <Bar dataKey="population" name="Population" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Ward-wise Gender Breakdown">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={wardGenderChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="male" name="Male" radius={[8, 8, 0, 0]} />
              <Bar dataKey="female" name="Female" radius={[8, 8, 0, 0]} />
              <Bar dataKey="other" name="Other" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Disability Insights">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                {
                  name: "Disability",
                  households: data.disability.householdsWithDisability || 0,
                  members: data.disability.totalDisabledMembers || 0,
                },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="households" name="Households" radius={[8, 8, 0, 0]} />
              <Bar dataKey="members" name="Members" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Top Education Levels">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topEducationChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" interval={0} angle={-15} textAnchor="end" height={70} />
              <YAxis allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="count" name="People" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top Occupations">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topOccupationChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" interval={0} angle={-15} textAnchor="end" height={70} />
              <YAxis allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="count" name="People" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="rounded-3xl bg-white border shadow-sm p-6">
        <h2 className="text-xl font-extrabold">Ward-wise Table</h2>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="px-3 py-3 font-extrabold">Ward</th>
                <th className="px-3 py-3 font-extrabold">Households</th>
                <th className="px-3 py-3 font-extrabold">Population</th>
                <th className="px-3 py-3 font-extrabold">Male</th>
                <th className="px-3 py-3 font-extrabold">Female</th>
                <th className="px-3 py-3 font-extrabold">Other</th>
                <th className="px-3 py-3 font-extrabold">Verified</th>
                <th className="px-3 py-3 font-extrabold">Submitted</th>
                <th className="px-3 py-3 font-extrabold">Rejected</th>
              </tr>
            </thead>
            <tbody>
              {data.wards.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-3 py-4 text-black/50 font-medium">
                    No ward data available.
                  </td>
                </tr>
              ) : (
                data.wards.map((ward) => (
                  <tr key={ward.ward} className="border-b last:border-b-0">
                    <td className="px-3 py-3 font-bold">{ward.ward}</td>
                    <td className="px-3 py-3">{ward.households}</td>
                    <td className="px-3 py-3">{ward.population}</td>
                    <td className="px-3 py-3">{ward.male}</td>
                    <td className="px-3 py-3">{ward.female}</td>
                    <td className="px-3 py-3">{ward.other}</td>
                    <td className="px-3 py-3">{ward.verified}</td>
                    <td className="px-3 py-3">{ward.submitted}</td>
                    <td className="px-3 py-3">{ward.rejected}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}