import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiFetch } from "../../lib/api";

export default function Notifications() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState("all");

  const [data, setData] = useState([]); // ✅ filled from backend
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const res = await apiFetch("/api/notifications"); // ✅ backend call

        // backend returns array
        if (alive) setData(Array.isArray(res) ? res : []);
      } catch (e) {
        if (alive) setError(e.message || "Failed to load notifications");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // ✅ map backend fields -> UI fields
  const mapped = useMemo(() => {
    return data.map((n) => ({
      id: n._id,
      type: String(n.type || "").toLowerCase(), // form/admin
      title: n.title || "Notification",
      msg: n.msg || n.message || "",
      time: n.createdAt ? new Date(n.createdAt).toLocaleString() : "",
    }));
  }, [data]);

  const filtered = filter === "all" ? mapped : mapped.filter((n) => n.type === filter);

  const filters = [
    { key: "all", label: t("notifications.filterAll") },
    { key: "form", label: t("notifications.filterForm") },
    { key: "admin", label: t("notifications.filterAdmin") },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold">{t("notifications.title")}</h1>
        <p className="text-black/60 font-medium mt-1">{t("notifications.subtitle")}</p>
      </div>

      <div className="rounded-3xl bg-white border shadow-sm p-4 flex gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-2xl px-4 py-2 font-extrabold transition ${
              filter === f.key ? "bg-zinc-900 text-white" : "bg-zinc-100 text-black/70 hover:bg-black/5"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5">
          <div className="font-extrabold text-rose-700">Error</div>
          <div className="text-rose-700/80 mt-1">{error}</div>
        </div>
      )}

      <div className="rounded-3xl bg-white border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-black/60 font-semibold">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-black/60 font-semibold">{t("notifications.empty")}</div>
        ) : (
          <div className="divide-y">
            {filtered.map((n) => (
              <div key={n.id} className="p-5 hover:bg-black/5 transition">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-extrabold text-lg">{n.title}</div>
                    <div className="text-black/70 mt-1">{n.msg}</div>
                    <div className="text-sm text-black/50 font-bold mt-2">{String(n.type).toUpperCase()}</div>
                  </div>
                  <div className="text-sm font-bold text-black/50 whitespace-nowrap">{n.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
