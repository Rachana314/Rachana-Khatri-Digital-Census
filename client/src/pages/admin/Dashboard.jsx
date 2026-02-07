import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="w-full max-w-2xl">
      <div className="rounded-3xl bg-white/70 backdrop-blur border border-black/10 shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl font-extrabold text-[var(--color-brandBlack)]">Admin Dashboard</h1>
        <p className="mt-2 text-black/60">
          You are logged in as admin (sample page).
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/"
            className="rounded-2xl px-5 py-3 font-extrabold bg-black text-white hover:opacity-90 transition"
          >
            Go to Home
          </Link>
          <Link
            to="/admin/login"
            className="rounded-2xl px-5 py-3 font-extrabold bg-white border border-black/10 hover:bg-black/5 transition"
          >
            Logout (demo)
          </Link>
        </div>
      </div>
    </div>
  );
}
