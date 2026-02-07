import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function Login() {
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email) return alert("Enter email");
    if (!password) return alert("Enter password");

    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/auth/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) return alert(data.msg || "Login failed");

      localStorage.setItem("token", data.token);
      navigate("/admin/dashboard");
    } catch {
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl bg-white/70 backdrop-blur border border-black/10 shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl font-extrabold text-[var(--color-brandBlack)]">Admin Login</h1>
        <p className="text-sm text-black/60 mt-1">Login using email & password.</p>

        <form onSubmit={submit} className="mt-6 grid gap-4">
          <div>
            <label className="text-sm font-bold text-black/80">Email</label>
            <input
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-2xl bg-white border border-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-black/80">Password</label>
            <div className="mt-2 flex items-center gap-2 rounded-2xl bg-white border border-black/10 px-4 py-3 focus-within:ring-2 focus-within:ring-black/10">
              <input
                type={showPw ? "text" : "password"}
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full outline-none bg-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="text-xl text-black/60 hover:text-black"
              >
                {showPw ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <button
            disabled={loading}
            className="mt-2 rounded-2xl bg-sky-700 text-white font-extrabold py-3 hover:opacity-90 transition disabled:opacity-60"
          >
            {loading ? "Please wait..." : "Login"}
          </button>
        </form>

        <p className="mt-5 text-sm text-black/60">
          New admin?{" "}
          <Link to="/admin/register" className="font-extrabold text-sky-700 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
