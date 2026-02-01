import { Navigate } from "react-router-dom";

export default function RequireAuth({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/test" replace />; // temp redirect
  return children;
}
export default function UserDashboard() {
  return <div style={{ padding: 30 }}>✅ Dashboard Loaded</div>;
}

export default function RequireAuth({ children }) {
  return children; // temporarily allow access
}
