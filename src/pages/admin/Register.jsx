import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function AdminRegister() {
  const nav = useNavigate();

  const [role, setRole] = useState("ADMIN");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);

  const [loadingRegister, setLoadingRegister] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [loadingResend, setLoadingResend] = useState(false);

  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleOtp = (e) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= 6) setOtp(val);
  };

  const onRoleChange = (e) => {
    const v = e.target.value;
    setRole(v);

    if (v === "USER") return nav("/register");

    // reset otp states
    setOtpSent(false);
    setOtp("");
    setOtpVerified(false);
  };

  const register = async (e) => {
    e.preventDefault();

    if (!name.trim()) return alert("Name is required");
    if (!email.trim() || !isValidEmail(email)) return alert("Enter a valid email");
    if (password.length < 8) return alert("Password must be at least 8 characters");
    if (password !== confirmPassword) return alert("Passwords do not match");

    try {
      setLoadingRegister(true);

      const res = await fetch("http://localhost:5000/api/auth/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          roles: ["ADMIN"], // ✅ enforce admin role
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) return alert(data.msg || data.message || "Registration failed");

      setOtpSent(true);
      alert(data.msg || "Admin registered. OTP sent to email.");
      if (data.devOtp) console.log("DEV OTP:", data.devOtp);
    } catch (err) {
      console.error(err);
      alert("Server error (cannot reach backend)");
    } finally {
      setLoadingRegister(false);
    }
  };

  const verifyOtp = async () => {
    if (!otpSent) return alert("Register first to receive OTP");
    if (otp.length !== 6) return alert("Enter 6-digit OTP");

    try {
      setLoadingVerify(true);

      const res = await fetch("http://localhost:5000/api/auth/admin/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          verificationCode: otp,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) return alert(data.message || data.msg || "OTP verification failed");

      setOtpVerified(true);
      alert(data.message || "Admin email verified. Now login.");
      nav("/admin/login");
    } catch (err) {
      console.error(err);
      alert("Server error (cannot reach backend)");
    } finally {
      setLoadingVerify(false);
    }
  };

  const resendOtp = async () => {
    if (!otpSent) return alert("Register first");

    try {
      setLoadingResend(true);

      const res = await fetch("http://localhost:5000/api/auth/admin/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) return alert(data.message || data.msg || "Resend OTP failed");

      alert(data.message || "OTP resent");
      if (data.devOtp) console.log("DEV OTP:", data.devOtp);
    } catch (err) {
      console.error(err);
      alert("Server error (cannot reach backend)");
    } finally {
      setLoadingResend(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl bg-white/70 backdrop-blur border border-black/10 shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl font-extrabold">Admin Register</h1>

        <form onSubmit={register} className="mt-6 grid gap-4">
          {/* Role selector */}
          <div>
            <label className="text-sm font-bold text-black/80">Role</label>
            <select
              value={role}
              onChange={onRoleChange}
              disabled={otpSent}
              className="mt-2 w-full rounded-2xl border px-4 py-3 bg-white"
            >
              <option value="ADMIN">Admin</option>
              <option value="USER">User</option>
            </select>
          </div>

          <input
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={otpSent}
            className="rounded-2xl border px-4 py-3"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={otpSent}
            className="rounded-2xl border px-4 py-3"
          />

          <div className="flex items-center gap-2 rounded-2xl border px-4 py-3">
            <input
              type={showPw ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={otpSent}
              className="w-full outline-none bg-transparent"
            />
            <button type="button" onClick={() => setShowPw((v) => !v)}>
              {showPw ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border px-4 py-3">
            <input
              type={showCpw ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={otpSent}
              className="w-full outline-none bg-transparent"
            />
            <button type="button" onClick={() => setShowCpw((v) => !v)}>
              {showCpw ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          {!otpSent && (
            <button
              disabled={loadingRegister}
              className="rounded-2xl bg-sky-700 text-white py-3 font-bold disabled:opacity-60"
            >
              {loadingRegister ? "Please wait..." : "Register (Send OTP)"}
            </button>
          )}
        </form>

        {otpSent && (
          <div className="mt-5 grid gap-3">
            <h2 className="text-lg font-extrabold">Verify Admin Email</h2>

            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={handleOtp}
              className="w-full rounded-2xl border px-4 py-3 text-center font-extrabold tracking-[0.35em]"
            />

            <button
              type="button"
              onClick={verifyOtp}
              disabled={loadingVerify || otp.length !== 6 || otpVerified}
              className="w-full rounded-2xl bg-green-600 text-white py-3 font-bold disabled:opacity-60"
            >
              {loadingVerify ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              type="button"
              onClick={resendOtp}
              disabled={loadingResend}
              className="w-full rounded-2xl bg-blue-600 text-white py-3 font-bold disabled:opacity-60"
            >
              {loadingResend ? "Please wait..." : "Resend OTP"}
            </button>
          </div>
        )}

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
