import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

function UserIcon({ className = "h-6 w-6" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M20 21a8 8 0 0 0-16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M12 13a5 5 0 1 0-5-5 5 5 0 0 0 5 5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const badgeStyles = {
  draft: "bg-amber-50 text-amber-700 ring-amber-200",
  submitted: "bg-sky-50 text-sky-700 ring-sky-200",
  rejected: "bg-rose-50 text-rose-700 ring-rose-200",
  verified: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

function StatusBadge({ status = "n/a" }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-extrabold ring-1 ${
        badgeStyles[status] || "bg-zinc-50 text-zinc-700 ring-zinc-200"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status.toUpperCase()}
    </span>
  );
}

function Card({ title, right, children, className = "" }) {
  return (
    <div className={`rounded-3xl border border-black/5 bg-white p-6 shadow-sm hover:shadow-md transition ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-base sm:text-lg font-extrabold tracking-tight">{title}</h2>
        {right}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function PrimaryBtn({ to, children, disabled }) {
  return (
    <Link
      to={to}
      className={[
        "inline-flex items-center justify-center rounded-2xl px-5 py-3 font-extrabold",
        "transition focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2",
        disabled
          ? "bg-zinc-200 text-zinc-500 pointer-events-none"
          : "bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

function GhostBtn({ to, children }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center justify-center rounded-2xl px-4 py-2 font-extrabold border border-black/10 bg-white hover:bg-black/5 transition"
    >
      {children}
    </Link>
  );
}

export default function Dashboard() {
  const { t, i18n } = useTranslation();

  // ✅ Replace with real auth data later
  const user = useMemo(
    () => ({
      name: "Sita Sharma",
      phone: "+977-98XXXXXXXX",
      email: "sita@email.com",
    }),
    []
  );

  // ✅ Replace with backend data later
  const household = useMemo(
    () => ({
      exists: true,
      status: "draft", // draft | submitted | rejected | verified
      householdId: "HH-10293",
      lastUpdated: "Today, 10:42 AM",
      rejectionReason: "Citizenship photo is unclear.",
    }),
    []
  );

  // ✅ Real-life: start empty; backend will fill
  const notifications = useMemo(() => [], []);

  const canEdit = household.status === "draft" || household.status === "rejected";
  const ctaTo = !household.exists ? "/user/household/new" : canEdit ? "/user/household/new" : "/user/forms";

  const currentLang = i18n.language?.startsWith("np") ? "np" : "en";

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-orange-50/60 via-white to-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-10 space-y-6">
        {/* ✅ Header = Profile section */}
        <div className="rounded-3xl border border-black/5 bg-white p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Left: profile */}
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-orange-100 text-orange-700 grid place-items-center">
                <UserIcon className="h-6 w-6" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900">
                    {t("dashboard.title")}
                  </h1>

                  <Link to="/user/profile" className="text-sm font-extrabold text-orange-600 hover:text-orange-700">
                    {t("dashboard.editProfile")}
                  </Link>
                </div>

                <p className="mt-1 text-sm sm:text-base text-zinc-600 font-medium">{t("dashboard.subtitle")}</p>

                <div className="mt-2 text-sm font-semibold text-zinc-800 flex flex-wrap gap-x-3 gap-y-1">
                  <span className="truncate">{user.name}</span>
                  <span className="text-zinc-400">•</span>
                  <span className="truncate">{user.phone}</span>
                  <span className="text-zinc-400">•</span>
                  <span className="truncate">{user.email}</span>
                </div>
              </div>
            </div>

            {/* Right: language + actions */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Language toggle */}
              <div className="flex items-center gap-2 rounded-2xl border border-black/10 bg-zinc-50 p-2">
                <span className="text-xs font-extrabold text-zinc-500 px-2">{t("common.language")}</span>

                <button
                  onClick={() => {
                    i18n.changeLanguage("en");
                    localStorage.setItem("app_lang", "en");
                  }}
                  className={`rounded-xl px-3 py-2 text-sm font-extrabold transition ${
                    currentLang === "en" ? "bg-white shadow-sm border border-black/10" : "hover:bg-white/70"
                  }`}
                >
                  {t("common.english")}
                </button>

                <button
                  onClick={() => {
                    i18n.changeLanguage("np");
                    localStorage.setItem("app_lang", "np");
                  }}
                  className={`rounded-xl px-3 py-2 text-sm font-extrabold transition ${
                    currentLang === "np" ? "bg-white shadow-sm border border-black/10" : "hover:bg-white/70"
                  }`}
                >
                  {t("common.nepali")}
                </button>
              </div>

              <PrimaryBtn to={ctaTo}>
                {!household.exists ? t("dashboard.createHousehold") : canEdit ? t("dashboard.continueSubmit") : t("dashboard.viewForms")}
              </PrimaryBtn>

              <GhostBtn to="/user/notifications">{t("dashboard.notificationsBtn")}</GhostBtn>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Household form status */}
          <Card title={t("dashboard.householdForm")} right={<StatusBadge status={household.status} />} className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-black/5 bg-zinc-50 p-4">
                <div className="text-xs font-extrabold text-zinc-500">{t("dashboard.householdId")}</div>
                <div className="mt-1 text-lg font-extrabold text-zinc-900">{household.householdId}</div>
              </div>
              <div className="rounded-2xl border border-black/5 bg-zinc-50 p-4">
                <div className="text-xs font-extrabold text-zinc-500">{t("dashboard.lastUpdated")}</div>
                <div className="mt-1 text-lg font-extrabold text-zinc-900">{household.lastUpdated}</div>
              </div>
            </div>

            {household.status === "rejected" && (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4">
                <div className="font-extrabold text-rose-700">{t("dashboard.correctionNeeded")}</div>
                <div className="mt-1 text-sm font-medium text-rose-700/90">{household.rejectionReason}</div>
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-3">
              <GhostBtn to="/user/forms">{t("common.manageForms")}</GhostBtn>
              {canEdit && <PrimaryBtn to="/user/household/new">{t("common.editSubmit")}</PrimaryBtn>}
            </div>
          </Card>

          {/* QR */}
          <Card title={t("dashboard.qrCode")} right={household.status === "verified" ? <StatusBadge status="verified" /> : null}>
            <p className="text-sm font-medium text-zinc-600">{t("dashboard.qrDesc")}</p>

            <div className="mt-4 rounded-2xl border border-dashed border-black/15 bg-zinc-50 p-6 flex items-center justify-center">
              <div className="text-sm font-extrabold text-zinc-700">
                {household.status === "verified" ? t("dashboard.qrAvail") : t("dashboard.qrNot")}
              </div>
            </div>

            <div className="mt-4">
              <PrimaryBtn to={`/user/qr/${household.householdId}`} disabled={household.status !== "verified"}>
                {t("common.openQr")}
              </PrimaryBtn>
            </div>
          </Card>

          {/* Notifications (real-life empty) */}
          <Card
            title={t("notifications.recent")}
            right={
              <Link to="/user/notifications" className="text-sm font-extrabold text-orange-600 hover:text-orange-700">
                {t("common.viewAll")}
              </Link>
            }
            className="lg:col-span-3"
          >
            {notifications.length === 0 ? (
              <div className="rounded-2xl border border-black/5 bg-zinc-50 p-6">
                <div className="font-extrabold text-zinc-900">{t("notifications.emptyTitle")}</div>
                <div className="mt-1 text-sm font-medium text-zinc-600">{t("notifications.emptyDesc")}</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {notifications.map((n) => (
                  <div key={n.id} className="rounded-2xl border border-black/5 bg-white p-4 hover:bg-orange-50/40 transition">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-extrabold text-zinc-900">{n.title}</div>
                        <div className="mt-1 text-sm font-medium text-zinc-600">{n.message}</div>
                      </div>
                      <div className="text-xs font-extrabold text-zinc-400 whitespace-nowrap">{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Quick actions */}
        <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
          <h2 className="text-base sm:text-lg font-extrabold tracking-tight">{t("dashboard.quickActions")}</h2>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { to: "/user/household/new", title: t("dashboard.qaHousehold"), desc: t("dashboard.qaHouseholdDesc") },
              { to: "/user/forms", title: t("dashboard.qaForms"), desc: t("dashboard.qaFormsDesc") },
              { to: "/user/settings", title: t("dashboard.qaAccessibility"), desc: t("dashboard.qaAccessibilityDesc") },
            ].map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className="group rounded-2xl border border-black/5 bg-zinc-50 p-5 hover:bg-orange-50/60 hover:border-orange-200 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="font-extrabold text-zinc-900">{a.title}</div>
                  <div className="text-orange-600 font-extrabold group-hover:translate-x-0.5 transition">→</div>
                </div>
                <div className="mt-1 text-sm font-medium text-zinc-600">{a.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
