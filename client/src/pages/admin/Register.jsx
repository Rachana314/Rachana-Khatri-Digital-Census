import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function Register() {
  const nav = useNavigate();
  const [role, setRole] = useState("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cp, setCp] = useState("");
  const [sp, setSp] = useState(false);
  const [scp, setScp] = useState(false);
  const [loading, setLoading] = useState(false);

  const onRole = (e) => {
    const v = e.target.value;
    setRole(v);
    if (v === "user") nav("/register");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!email) return alert("Enter email");
    if (!password) return alert("Enter password");
    if (password !== cp) return alert("Passwords do not match");

    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/auth/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) return alert(data.msg || "Registration failed");

      localStorage.setItem("token", data.token);
      nav("/admin/dashboard");
    } catch {
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl bg-white/70 backdrop-blur border border-black/10 shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl font-extrabold text-[var(--color-brandBlack)]">Register</h1>
        <p className="text-sm text-black/60 mt-1">Admin registration</p>

        <form onSubmit={submit} className="mt-6 grid gap-4">
          <div>
            <label className="text-sm font-bold text-black/80">Role</label>
            <select
              value={role}
              onChange={onRole}
              className="mt-2 w-full rounded-2xl bg-white border border-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl bg-white border border-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
          />

          <div className="flex items-center gap-2 rounded-2xl bg-white border border-black/10 px-4 py-3 focus-within:ring-2 focus-within:ring-black/10">
            <input
              type={sp ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent outline-none"
            />
            <button
              type="button"
              onClick={() => setSp((v) => !v)}
              className="text-xl text-black/60 hover:text-black"
            >
              {sp ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-white border border-black/10 px-4 py-3 focus-within:ring-2 focus-within:ring-black/10">
            <input
              type={scp ? "text" : "password"}
              placeholder="Confirm password"
              value={cp}
              onChange={(e) => setCp(e.target.value)}
              className="w-full bg-transparent outline-none"
            />
            <button
              type="button"
              onClick={() => setScp((v) => !v)}
              className="text-xl text-black/60 hover:text-black"
            >
              {scp ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <button
            disabled={loading}
            className="mt-1 rounded-2xl bg-sky-700 text-white font-extrabold py-3 hover:opacity-90 transition disabled:opacity-60"
          >
            {loading ? "Please wait..." : "Register"}
          </button>
        </form>

        <p className="mt-5 text-sm text-black/60">
          Already an admin?{" "}
          <Link to="/admin/login" className="font-extrabold text-sky-700 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
