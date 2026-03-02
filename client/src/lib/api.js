const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // Only set JSON header when we actually send JSON
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    },
  });

  // ✅ Always read raw text first so we can handle HTML/plain text errors too
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
