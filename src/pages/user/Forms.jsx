import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { apiFetch } from "../../lib/api";

const tabs = ["draft", "submitted", "rejected", "verified"];

function StatusBadge({ status }) {
  const map = {
    draft: "bg-amber-50 text-amber-700 ring-amber-200",
    submitted: "bg-sky-50 text-sky-700 ring-sky-200",
    rejected: "bg-rose-50 text-rose-700 ring-rose-200",
    verified: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  };
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-extrabold ring-1 ${map[status] || ""}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {(status || "n/a").toUpperCase()}
    </span>
  );
}

export default function Forms() {
  const { t } = useTranslation();
  const [active, setActive] = useState("draft");
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const loadForms = async () => {
    try {
      setErr("");
      setLoading(true);
      const data = await apiFetch("/api/households");
      setForms(data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForms();
  }, []);

  const filtered = useMemo(() => forms.filter((f) => f.status === active), [forms, active]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">{t("forms.title")}</h1>
          <p className="text-black/60 font-medium mt-1">{t("forms.subtitle")}</p>
        </div>

        <Link
          to="/user/household/new"
          className="rounded-2xl px-5 py-3 font-extrabold bg-orange-500 text-white hover:bg-orange-600 transition"
        >
          {t("forms.newHousehold")}
        </Link>
      </div>

      {/* Tabs */}
      <div className="rounded-3xl bg-white border shadow-sm p-3 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`rounded-2xl px-4 py-2 font-extrabold transition ${
              active === tab ? "bg-zinc-900 text-white" : "bg-zinc-100 text-black/70 hover:bg-black/5"
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {loading && <div className="p-10 text-center font-extrabold text-black/60">Loading...</div>}

      {err && <div className="p-6 bg-rose-50 text-rose-700 font-bold rounded-2xl">{err}</div>}

      {!loading && !err && (
        <div className="rounded-3xl bg-white border shadow-sm overflow-hidden">
          <div className="p-5 border-b flex items-center justify-between">
            <div className="font-extrabold text-lg">{t("forms.tabTitle", { status: active.toUpperCase() })}</div>
            <div className="text-sm text-black/60 font-bold">{t("forms.items", { count: filtered.length })}</div>
          </div>

          {filtered.length === 0 ? (
            <div className="p-10 text-center text-black/60 font-semibold">{t("forms.empty")}</div>
          ) : (
            <div className="divide-y">
              {filtered.map((f) => (
                <div key={f.householdId} className="p-5 flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="font-extrabold text-xl">{f.householdId}</div>
                      <StatusBadge status={f.status} />
                    </div>

                    <div className="text-black/60 font-semibold mt-1">
                      {t("forms.lastUpdated", { time: new Date(f.updatedAt).toLocaleString() })}
                    </div>

                    {f.status === "rejected" && (
                      <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
                        <div className="font-extrabold text-rose-700">{t("forms.rejectedReason")}</div>
                        <div className="text-rose-700/80 mt-1">{f.rejectionReason || "-"}</div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button className="rounded-2xl px-4 py-2 font-bold border hover:bg-black/5 transition">
                      {t("common.view")}
                    </button>

                    {(f.status === "draft" || f.status === "rejected") && (
                      <Link
                        to={`/user/household/new?edit=${f.householdId}`}
                        className="rounded-2xl px-4 py-2 font-extrabold bg-orange-500 text-white hover:bg-orange-600 transition"
                      >
                        {t("common.edit")}
                      </Link>
                    )}

                    {f.status === "verified" && (
                      <Link
                        to={`/user/qr/${f.householdId}`}
                        className="rounded-2xl px-4 py-2 font-extrabold bg-orange-500 text-white hover:bg-orange-600 transition"
                      >
                        {t("common.openQr")}
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
