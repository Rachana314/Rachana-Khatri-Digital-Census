import { NavLink } from "react-router-dom";

export default function UserLayout({ children }) {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r hidden md:flex md:flex-col">
        <div className="p-5 border-b">
          <div className="text-lg font-semibold">Digital Census</div>
          <div className="text-xs text-gray-500 mt-1">Citizen Portal</div>
        </div>

        <nav className="p-3 space-y-1 flex-1">
          <SideLink to="/user/dashboard" label="Dashboard" />
          <SideLink to="/user/forms/new" label="New Household Form" />
          <SideLink to="/user/forms" label="My Forms" />
          <SideLink to="/user/notifications" label="Notifications" />
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              window.location.href = "/";
            }}
            className="w-full rounded-xl border px-3 py-2 text-sm hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-4">
          <div className="font-medium">
            Welcome{user?.fullName ? `, ${user.fullName}` : ""}
          </div>
          <div className="text-sm text-gray-500">{user?.phone || ""}</div>
        </header>

        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

function SideLink({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block rounded-xl px-3 py-2 text-sm ${
          isActive ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"
        }`
      }
    >
      {label}
    </NavLink>
  );
}
