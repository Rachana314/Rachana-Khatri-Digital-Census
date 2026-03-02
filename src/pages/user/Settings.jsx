import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Settings() {
  const [me, setMe] = useState(null);

  // password
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // avatar
  const [uploading, setUploading] = useState(false);

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      setErr("");
      const data = await apiFetch("/api/users/me");
      setMe(data.user);
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
      await apiFetch("/api/users/change-password", {
        method: "POST",
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      setOldPassword("");
      setNewPassword("");
      setMsg("Password changed.");
    } catch (e) {
      setErr(e.message);
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
      const data = raw ? JSON.parse(raw) : {};

      if (!res.ok) throw new Error(data.message || "Upload failed");

      setMsg("Profile photo updated.");
      await load();
    } catch (e) {
      setErr(e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">Settings</h1>
        <p className="text-black/60 font-medium mt-1">Change password and profile photo.</p>
      </div>

      {err && <div className="p-5 rounded-2xl bg-rose-50 text-rose-700 font-bold">{err}</div>}
      {msg && <div className="p-5 rounded-2xl bg-emerald-50 text-emerald-700 font-bold">{msg}</div>}

      {/* Avatar */}
      <div className="rounded-3xl bg-white border shadow-sm p-6 space-y-4">
        <div className="font-extrabold text-lg">Profile Photo</div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="h-20 w-20 rounded-full border overflow-hidden bg-zinc-100">
            {me?.avatarUrl ? (
              <img src={me.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center font-extrabold text-black/40">No</div>
            )}
          </div>

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

          {uploading && <div className="text-black/60 font-bold">Uploading...</div>}
        </div>
      </div>

      {/* Password */}
      <div className="rounded-3xl bg-white border shadow-sm p-6 space-y-4">
        <div className="font-extrabold text-lg">Change Password</div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-extrabold text-sm">Old Password</label>
            <input
              type="password"
              className="mt-2 w-full rounded-2xl border p-3"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="old password"
            />
          </div>

          <div>
            <label className="font-extrabold text-sm">New Password</label>
            <input
              type="password"
              className="mt-2 w-full rounded-2xl border p-3"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="new password"
            />
          </div>
        </div>

        <button
          onClick={changePass}
          className="rounded-2xl px-6 py-3 font-extrabold bg-orange-500 text-white hover:bg-orange-600 transition"
        >
          Save Password
        </button>
      </div>
    </div>
  );
}