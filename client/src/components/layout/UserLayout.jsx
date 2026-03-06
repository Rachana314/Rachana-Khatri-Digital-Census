import { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";

const Icon = ({ children }) => (
  <span className="w-5 h-5 inline-block">{children}</span>
);

const DashboardIcon = () => (
  <Icon>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  </Icon>
);

const FormIcon = () => (
  <Icon>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16v16H4z" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  </Icon>
);

const BellIcon = () => (
  <Icon>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  </Icon>
);

const UserIcon = () => (
  <Icon>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21a8 8 0 10-16 0" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  </Icon>
);

const SettingsIcon = () => (
  <Icon>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 000-6l2.1-1.6-2-3.5-2.5 1a7 7 0 00-4-1l-.5-2.7H9.5L9 3.9a7 7 0 00-4 1l-2.5-1-2 3.5L3.6 9a1.7 1.7 0 000 6l-2.1 1.6 2 3.5 2.5-1a7 7 0 004 1l.5 2.7h5l.5-2.7a7 7 0 004-1l2.5 1 2-3.5z" />
    </svg>
  </Icon>
);

function withCacheBust(url) {
  if (!url) return "";
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}t=${Date.now()}`;
}

export default function UserLayout() {
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState(null);
  const navigate = useNavigate();

  const baseLink =
    "flex items-center gap-3 px-4 py-3 rounded-xl text-white text-lg font-extrabold transition hover:text-blue-700 hover:bg-white/80";

  const activeLink = "bg-white text-zinc-900 shadow-sm";

  const linkClass = ({ isActive }) =>
    `${baseLink} ${isActive ? activeLink : ""}`;

  useEffect(() => {
    const loadUser = () => {
      try {
        const raw = localStorage.getItem("me") || localStorage.getItem("user");
        const parsed = raw ? JSON.parse(raw) : null;

        if (parsed?.profileImageUrl) {
          parsed.profileImageUrl = withCacheBust(parsed.profileImageUrl);
        }

        setMe(parsed);
      } catch {
        setMe(null);
      }
    };

    loadUser();

    window.addEventListener("user-updated", loadUser);
    window.addEventListener("storage", loadUser);

    return () => {
      window.removeEventListener("user-updated", loadUser);
      window.removeEventListener("storage", loadUser);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("me");
    window.dispatchEvent(new Event("user-updated"));
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="hidden md:flex w-72 bg-orange-500 text-white flex-col">
        <div className="p-5 border-b border-white/30">
          <h2 className="text-2xl font-extrabold">Digital Census</h2>
          <p className="text-sm text-white/80 font-semibold">User Panel</p>

          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white/10 p-3">
            <div className="h-12 w-12 rounded-full overflow-hidden border border-white/30 bg-white/20">
              {me?.profileImageUrl ? (
                <img
                  src={me.profileImageUrl}
                  alt={me?.name || "User"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center font-extrabold text-white">
                  {String(me?.name || "U").charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="font-extrabold truncate">{me?.name || "User"}</div>
              <div className="text-xs text-white/80 truncate">{me?.email || ""}</div>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2 flex-1">
          <NavLink to="/user/dashboard" className={linkClass}>
            <DashboardIcon /> Dashboard
          </NavLink>

          <NavLink to="/user/forms" className={linkClass}>
            <FormIcon /> Forms
          </NavLink>

          <NavLink to="/user/notifications" className={linkClass}>
            <BellIcon /> Notifications
          </NavLink>

          <NavLink to="/user/profile" className={linkClass}>
            <UserIcon /> Profile
          </NavLink>
        </nav>

        <div className="p-4 border-t border-white/30 space-y-2">
          <NavLink to="/user/settings" className={linkClass}>
            <SettingsIcon /> Settings
          </NavLink>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white text-lg font-extrabold transition hover:bg-white/15 text-left"
          >
            <SettingsIcon /> Logout
          </button>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />

          <div className="absolute left-0 top-0 h-full w-72 bg-orange-500 text-white flex flex-col shadow-xl">
            <div className="p-5 border-b border-white/30 flex justify-between items-start">
              <div className="w-full">
                <h2 className="text-2xl font-extrabold">Digital Census</h2>
                <p className="text-sm text-white/80 font-semibold">User Panel</p>

                <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white/10 p-3">
                  <div className="h-12 w-12 rounded-full overflow-hidden border border-white/30 bg-white/20">
                    {me?.profileImageUrl ? (
                      <img
                        src={me.profileImageUrl}
                        alt={me?.name || "User"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center font-extrabold text-white">
                        {String(me?.name || "U").charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="font-extrabold truncate">{me?.name || "User"}</div>
                    <div className="text-xs text-white/80 truncate">{me?.email || ""}</div>
                  </div>
                </div>
              </div>

              <button onClick={() => setOpen(false)} className="font-bold ml-3">
                ✕
              </button>
            </div>

            <nav className="p-4 space-y-2 flex-1">
              <NavLink
                to="/user/dashboard"
                className={linkClass}
                onClick={() => setOpen(false)}
              >
                <DashboardIcon /> Dashboard
              </NavLink>

              <NavLink
                to="/user/forms"
                className={linkClass}
                onClick={() => setOpen(false)}
              >
                <FormIcon /> Forms
              </NavLink>

              <NavLink
                to="/user/notifications"
                className={linkClass}
                onClick={() => setOpen(false)}
              >
                <BellIcon /> Notifications
              </NavLink>

              <NavLink
                to="/user/profile"
                className={linkClass}
                onClick={() => setOpen(false)}
              >
                <UserIcon /> Profile
              </NavLink>
            </nav>

            <div className="p-4 border-t border-white/30 space-y-2">
              <NavLink
                to="/user/settings"
                className={linkClass}
                onClick={() => setOpen(false)}
              >
                <SettingsIcon /> Settings
              </NavLink>

              <button
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white text-lg font-extrabold transition hover:bg-white/15 text-left"
              >
                <SettingsIcon /> Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b px-4 sm:px-6 py-3 flex justify-end items-center">
          <button
            onClick={() => setOpen(true)}
            className="md:hidden font-extrabold text-xl"
          >
            ☰
          </button>
        </header>

        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}