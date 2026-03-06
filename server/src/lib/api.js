<<<<<<< HEAD
const API = import.meta.env.VITE_API_URL;

function getToken() {
  return localStorage.getItem("token"); // change if your token key is different
}

export async function apiFetch(path, options = {}) {
  const token = getToken();

  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  // handle errors nicely
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Request failed");
  }
  return res.json();
}
=======
const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // Only set JSON header when NOT sending FormData and when body exists
  const isForm = options.body instanceof FormData;
  if (!isForm && options.body !== undefined && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API}${path}`, {
    ...options,
    headers,
    credentials: "include", // ✅ IMPORTANT
  });

  const raw = await res.text();
  let data = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    data = { message: raw };
  }

  if (!res.ok) {
    throw new Error(data.message || data.msg || `Request failed (${res.status})`);
  }

  return data;
}
>>>>>>> 32bdc4b2bf581f7c68974fba7032ea87fb04d0bc
