import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function Notifications() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState("all");

  // Real-life: start empty; backend will fill
  const data = []; // [{id,type,title,msg,time}]

  const filtered = filter === "all" ? data : data.filter((n) => n.type === filter);

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

      <div className="rounded-3xl bg-white border shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
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
