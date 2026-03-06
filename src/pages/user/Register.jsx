import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../../lib/api";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await apiFetch("/api/auth/user/register", {
        method: "POST",
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          password: form.password,
        }),
      });

      alert(res.msg || "Registered! OTP sent to your email.");

      navigate("/verify-email", {
        replace: true,
        state: { email: form.email.trim().toLowerCase() },
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-3xl border shadow-sm">
      <h2 className="text-2xl font-extrabold mb-1">Register</h2>
      <p className="text-black/60 font-medium mb-5">Create your account.</p>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 text-rose-700 rounded-2xl font-bold">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="font-extrabold text-sm">Name</label>
          <input
            className="mt-2 w-full border p-3 rounded-2xl"
            placeholder="Your name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div>
          <label className="font-extrabold text-sm">Email</label>
          <input
            type="email"
            className="mt-2 w-full border p-3 rounded-2xl"
            placeholder="example@gmail.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div>
          <label className="font-extrabold text-sm">Phone</label>
          <input
            className="mt-2 w-full border p-3 rounded-2xl"
            placeholder="98XXXXXXXX"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>

        <div>
          <label className="font-extrabold text-sm">Password</label>
          <input
            type="password"
            className="mt-2 w-full border p-3 rounded-2xl"
            placeholder="Min 8 characters"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <button
          disabled={loading}
          className="w-full bg-orange-500 text-white p-3 rounded-2xl font-extrabold hover:bg-orange-600 transition disabled:opacity-50"
        >
          {loading ? "Creating..." : "Register"}
        </button>
      </form>

      <div className="mt-4 text-sm font-semibold text-black/60">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-700 underline">
          Login
        </Link>
      </div>
    </div>
  );
}