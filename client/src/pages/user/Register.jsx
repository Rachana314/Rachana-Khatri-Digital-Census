import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function Register() {
  const nav = useNavigate();

  // form fields
  const [role, setRole] = useState("USER");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI states
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);

  // OTP states
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);

  // loading states
  const [loadingRegister, setLoadingRegister] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [loadingResend, setLoadingResend] = useState(false);

  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleOtp = (e) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= 4) setOtp(val);
  };

  // ✅ Step 1: Register (backend sends OTP)
  const register = async (e) => {
    e.preventDefault();

    if (!name.trim()) return alert("Name is required");
    if (!email.trim() || !isValidEmail(email)) return alert("Enter a valid email");
    if (password.length < 8) return alert("Password must be at least 8 characters");
    if (password !== confirmPassword) return alert("Passwords do not match");

    try {
      setLoadingRegister(true);

      const res = await fetch("http://localhost:5000/api/auth/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          roles: [role],
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        return alert(data.msg || data.message || `Registration failed (${res.status})`);
      }

      setOtpSent(true);
      alert(data.msg || "Registered. OTP sent to email.");

      // In dev you may get devOtp
      if (data.devOtp) {
        console.log("DEV OTP:", data.devOtp);
      }
    } catch (err) {
      console.error("REGISTER ERROR:", err);
      alert("Server error (cannot reach backend)");
    } finally {
      setLoadingRegister(false);
    }
  };

  // ✅ Step 2: Verify OTP
  const verifyOtp = async () => {
    if (!otpSent) return alert("Register first to receive OTP");
    if (otp.length !== 4) return alert("Enter 4-digit OTP");

    try {
      setLoadingVerify(true);

      const res = await fetch("http://localhost:5000/api/auth/user/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          verificationCode: otp,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        return alert(data.message || data.msg || `OTP verification failed (${res.status})`);
      }

      setOtpVerified(true);
      alert(data.message || "Email verified successfully");

      // ✅ after verification go to login
      nav("/login");
    } catch (err) {
      console.error("VERIFY OTP ERROR:", err);
      alert("Server error (cannot reach backend)");
    } finally {
      setLoadingVerify(false);
    }
  };

  // ✅ Step 3: Resend OTP (only after register)
  const resendOtp = async () => {
    if (!otpSent) return alert("Register first");
    if (!email.trim() || !isValidEmail(email)) return alert("Enter a valid email");

    try {
      setLoadingResend(true);

      const res = await fetch("http://localhost:5000/api/auth/user/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        return alert(data.message || data.msg || `Resend OTP failed (${res.status})`);
      }

      alert(data.message || "OTP resent to email");
    } catch (err) {
      console.error("RESEND OTP ERROR:", err);
      alert("Server error (cannot reach backend)");
    } finally {
      setLoadingResend(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl bg-white/70 backdrop-blur border border-black/10 shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl font-extrabold">Create Account</h1>
        <p className="text-sm text-black/60 mt-1">
          Register → OTP sent → Verify → Login
        </p>

        {/* ✅ REGISTER FORM */}
        <form onSubmit={register} className="mt-6 grid gap-4">
          {/* Role */}
          <div>
            <label className="text-sm font-bold text-black/80">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={otpSent}
              className="mt-2 w-full rounded-2xl border px-4 py-3 bg-white"
            >
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {/* Name */}
          <div>
            <label className="text-sm font-bold text-black/80">Full Name</label>
            <input
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={otpSent}
              className="mt-2 w-full rounded-2xl border px-4 py-3"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-bold text-black/80">Email</label>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={otpSent}
              className="mt-2 w-full rounded-2xl border px-4 py-3"
            />
          </div>

          {/* Password */}
          <div className="flex items-center gap-2 rounded-2xl border px-4 py-3">
            <input
              type={showPw ? "text" : "password"}
              placeholder="Password (min 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={otpSent}
              className="w-full outline-none bg-transparent"
            />
            <button type="button" onClick={() => setShowPw((v) => !v)}>
              {showPw ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          {/* Confirm Password */}
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

          {/* Register button */}
          {!otpSent && (
            <button
              disabled={loadingRegister}
              className="rounded-2xl bg-red-600 text-white py-3 font-bold disabled:opacity-60"
            >
              {loadingRegister ? "Please wait..." : "Register (Send OTP)"}
            </button>
          )}
        </form>

        {/* ✅ OTP SECTION (only after register) */}
        {otpSent && (
          <div className="mt-5 grid gap-3">
            <h2 className="text-lg font-extrabold">Verify Email</h2>

            <input
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              placeholder="Enter 4-digit OTP"
              value={otp}
              onChange={handleOtp}
              className="w-full rounded-2xl border px-4 py-3 text-center font-extrabold tracking-[0.35em]"
            />

            <button
              type="button"
              onClick={verifyOtp}
              disabled={loadingVerify || otp.length !== 4 || otpVerified}
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

        <p className="mt-5 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-red-600">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
