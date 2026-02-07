import { useState } from "react";

export default function Profile() {
  const [form, setForm] = useState({
    name: "Sita Sharma",
    phone: "+977-98XXXXXXXX",
    email: "sita@email.com",
  });

  const onChange = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold">My Profile</h1>
        <p className="text-black/60 font-medium mt-1">
          Update your details (UI only). Later connect backend API.
        </p>
      </div>

      <div className="rounded-3xl bg-white border shadow-sm p-6 space-y-5">
        <div>
          <label className="font-extrabold">Full Name</label>
          <input
            className="mt-2 w-full rounded-2xl border p-3"
            value={form.name}
            onChange={onChange("name")}
          />
        </div>

        <div>
          <label className="font-extrabold">Phone Number</label>
          <input
            className="mt-2 w-full rounded-2xl border p-3"
            value={form.phone}
            onChange={onChange("phone")}
          />
        </div>

        <div>
          <label className="font-extrabold">Email</label>
          <input
            className="mt-2 w-full rounded-2xl border p-3"
            value={form.email}
            onChange={onChange("email")}
          />
        </div>

        <button
          onClick={() => alert("Profile saved ✅ (UI only)")}
          className="rounded-2xl px-5 py-3 font-extrabold bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 transition"
        >
          Save Profile
        </button>
      </div>
    </div>
  );
}
