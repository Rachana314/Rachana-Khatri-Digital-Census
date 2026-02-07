import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    if (!email || !password) return alert("All fields required");

    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/api/auth/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) return alert(data.msg || data.message || "Login failed");

      // ✅ Save JWT token
      localStorage.setItem("token", data.token);

      // (optional) Save user info
      localStorage.setItem("user", JSON.stringify(data.user));

      // ✅ Redirect after login
      navigate("/user/dashboard"); // change if your route is different
    } catch (err) {
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl bg-white/70 backdrop-blur border border-black/10 shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl font-extrabold">Login</h1>

        <form onSubmit={submit} className="mt-6 grid gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-2xl border px-4 py-3"
          />

          <div className="flex items-center gap-2 rounded-2xl border px-4 py-3">
            <input
              type={showPw ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full outline-none"
            />
            <button type="button" onClick={() => setShowPw(!showPw)}>
              {showPw ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <button
            disabled={loading}
            className="rounded-2xl bg-red-600 text-white py-3 font-bold disabled:opacity-60"
          >
            {loading ? "Please wait..." : "Login"}
          </button>
        </form>

        <p className="mt-5 text-sm">
          Don’t have an account?{" "}
          <Link to="/register" className="font-bold text-red-600">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
