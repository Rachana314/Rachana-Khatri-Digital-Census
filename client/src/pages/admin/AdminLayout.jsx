import { NavLink, Outlet, useNavigate } from "react-router-dom";

const nav = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/households", label: "Households" },
  { to: "/admin/analytics", label: "Analytics" },
  { to: "/admin/reports", label: "Reports" },
  { to: "/admin/notifications", label: "Notifications" },
];

export default function AdminLayout() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-7xl mx-auto flex gap-6 p-4">
        {/* Sidebar */}
        <aside className="w-64 shrink-0">
          <div className="rounded-3xl bg-white border shadow-sm p-4 sticky top-4">
            <div className="font-extrabold text-lg">Admin Panel</div>
            <div className="text-black/60 text-sm mt-1 font-semibold">Census Verification</div>

            <div className="mt-4 space-y-2">
              {nav.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  className={({ isActive }) =>
                    `block rounded-2xl px-4 py-3 font-extrabold transition ${
                      isActive ? "bg-zinc-900 text-white" : "bg-zinc-100 text-black/70 hover:bg-black/5"
                    }`
                  }
                >
                  {n.label}
                </NavLink>
              ))}
            </div>

            <button
              onClick={logout}
              className="mt-4 w-full rounded-2xl px-4 py-3 font-extrabold border hover:bg-black/5 transition"
            >
              Logout
            </button>
          </div>
        </aside>

        {/* Page content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}