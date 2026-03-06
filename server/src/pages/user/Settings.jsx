import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../lib/api";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Settings() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPasswordBox, setShowPasswordBox] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const [household, setHousehold] = useState(null);

  const load = async () => {
    try {
      setErr("");
      const data = await apiFetch("/api/users/me");
      setMe(data.user);
      setHousehold(data.household || null);

      localStorage.setItem("me", JSON.stringify(data.user));
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("user-updated"));
    } catch (e) {
      setErr(e.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const changePass = async () => {
    try {
      setErr("");
      setMsg("");

      if (!oldPassword || !newPassword) {
        throw new Error("Old password and new password are required.");
      }

      setSavingPassword(true);

      await apiFetch("/api/users/change-password", {
        method: "POST",
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      setOldPassword("");
      setNewPassword("");
      setShowPasswordBox(false);
      setMsg("Password changed successfully.");
    } catch (e) {
      setErr(e.message);
    } finally {
      setSavingPassword(false);
    }
  };

  const uploadAvatar = async (file) => {
    try {
      setErr("");
      setMsg("");
      setUploading(true);

      const token = localStorage.getItem("token");
      const form = new FormData();
      form.append("file", file);

      const res = await fetch(`${API}/api/users/avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      const raw = await res.text();
      let data = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = { message: raw };
      }

      if (!res.ok) throw new Error(data.message || "Upload failed");

      setMsg("Profile photo updated.");

      if (data.user) {
        setMe(data.user);
        localStorage.setItem("me", JSON.stringify(data.user));
        localStorage.setItem("user", JSON.stringify(data.user));
        window.dispatchEvent(new Event("user-updated"));
      } else {
        await load();
      }
    } catch (e) {
      setErr(e.message);
    } finally {
      setUploading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("me");
    window.dispatchEvent(new Event("user-updated"));
    navigate("/login", { replace: true });
  };

  const isVerified = household?.status === "verified";
  const hasHousehold = Boolean(household?.householdId);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">Settings</h1>
        <p className="text-black/60 font-medium mt-1">
          Manage your profile, security, verification, and account preferences.
        </p>
      </div>

      {err && (
        <div className="p-5 rounded-2xl bg-rose-50 text-rose-700 font-bold">
          {err}
        </div>
      )}

      {msg && (
        <div className="p-5 rounded-2xl bg-emerald-50 text-emerald-700 font-bold">
          {msg}
        </div>
      )}

      <div className="rounded-3xl bg-white border shadow-sm p-6 space-y-4">
        <div className="font-extrabold text-lg">Profile Photo</div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="h-24 w-24 rounded-full border overflow-hidden bg-zinc-100">
            {me?.profileImageUrl ? (
              <img
                src={me.profileImageUrl}
                alt="profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center font-extrabold text-black/40">
                {String(me?.name || "U").charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                uploadAvatar(file);
                e.target.value = "";
              }}
            />
            <div className="text-sm text-black/60 font-medium">
              Upload a clear profile photo for your account.
            </div>
            {uploading && (
              <div className="text-black/60 font-bold">Uploading...</div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white border shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="font-extrabold text-lg">Password & Security</div>
            <p className="text-sm text-black/60 mt-1">
              Update your password to keep your account secure.
            </p>
          </div>

          <button
            onClick={() => setShowPasswordBox((v) => !v)}
            className="rounded-2xl px-5 py-3 font-extrabold bg-zinc-900 text-white hover:opacity-90 transition"
          >
            {showPasswordBox ? "Close" : "Change Password"}
          </button>
        </div>

        {showPasswordBox && (
          <div className="border rounded-3xl p-5 space-y-4 bg-zinc-50">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-extrabold text-sm">Old Password</label>
                <input
                  type="password"
                  className="mt-2 w-full rounded-2xl border p-3"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter old password"
                />
              </div>

              <div>
                <label className="font-extrabold text-sm">New Password</label>
                <input
                  type="password"
                  className="mt-2 w-full rounded-2xl border p-3"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={changePass}
                disabled={savingPassword}
                className="rounded-2xl px-6 py-3 font-extrabold bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 transition"
              >
                {savingPassword ? "Saving..." : "Save Password"}
              </button>

              <button
                onClick={() => {
                  setShowPasswordBox(false);
                  setOldPassword("");
                  setNewPassword("");
                }}
                className="rounded-2xl px-6 py-3 font-extrabold border hover:bg-black/5 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-3xl bg-white border shadow-sm p-6 space-y-4">
        <div className="font-extrabold text-lg">Verification & QR</div>
        <p className="text-sm text-black/60">
          Your household QR code will be generated after the household form is verified by the admin.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border p-4 bg-zinc-50">
            <div className="text-sm font-bold text-black/50">Form Status</div>
            <div className="mt-2 text-lg font-extrabold">
              {household?.status ? household.status.toUpperCase() : "NO FORM"}
            </div>
          </div>

          <div className="rounded-2xl border p-4 bg-zinc-50">
            <div className="text-sm font-bold text-black/50">QR Availability</div>
            <div className="mt-2 text-lg font-extrabold">
              {isVerified ? "AVAILABLE" : "NOT AVAILABLE YET"}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-dashed p-5 bg-zinc-50">
          {isVerified ? (
            <div className="space-y-3">
              <div className="font-extrabold text-emerald-700">
                Your household has been verified.
              </div>
              <div className="text-sm text-black/60">
                You can now open your QR code and use it for verification and household lookup.
              </div>
              <button
                onClick={() => navigate(`/user/qr/${household.householdId}`)}
                className="rounded-2xl px-5 py-3 font-extrabold bg-orange-500 text-white hover:bg-orange-600 transition"
              >
                Open QR Code
              </button>
            </div>
          ) : hasHousehold ? (
            <div className="space-y-2">
              <div className="font-extrabold text-zinc-900">
                QR code is not available yet.
              </div>
              <div className="text-sm text-black/60">
                Your QR code will be generated automatically after admin verification.
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="font-extrabold text-zinc-900">
                No household form found.
              </div>
              <div className="text-sm text-black/60">
                Create and submit your household form first to continue the verification process.
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-3xl bg-white border shadow-sm p-6 space-y-4">
        <div className="font-extrabold text-lg">Account</div>
        <p className="text-sm text-black/60">
          Sign out from your account on this device.
        </p>

        <button
          onClick={logout}
          className="rounded-2xl px-6 py-3 font-extrabold bg-rose-600 text-white hover:bg-rose-700 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}