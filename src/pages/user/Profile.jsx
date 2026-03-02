import { useEffect, useState } from "react";

export default function Profile() {
  const [form, setForm] = useState({ name: "", phone: "", email: "" });

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    console.log("Loaded user from localStorage:", savedUser); // debug

    if (savedUser) {
      const u = JSON.parse(savedUser);
      setForm({
        name: u.name || "",
        email: u.email || "",
        phone: u.phone || "",
      });
    }
  }, []);

  const onChange = (k) => (e) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const saveProfile = () => {
    const current = JSON.parse(localStorage.getItem("user") || "{}");
    localStorage.setItem("user", JSON.stringify({ ...current, ...form }));
    alert("Profile saved locally ✅");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-extrabold">My Profile</h1>

      <div className="rounded-3xl bg-white border shadow-sm p-6 space-y-5">
        <div>
          <label className="font-extrabold">Full Name</label>
          <input className="mt-2 w-full rounded-2xl border p-3" value={form.name} onChange={onChange("name")} />
        </div>

        <div>
          <label className="font-extrabold">Phone Number</label>
          <input className="mt-2 w-full rounded-2xl border p-3" value={form.phone} onChange={onChange("phone")} />
        </div>

        <div>
          <label className="font-extrabold">Email</label>
          <input className="mt-2 w-full rounded-2xl border p-3" value={form.email} onChange={onChange("email")} />
        </div>

        <button onClick={saveProfile} className="rounded-2xl px-5 py-3 font-extrabold bg-orange-500 text-white">
          Save Profile
        </button>
      </div>
    </div>
  );
}
