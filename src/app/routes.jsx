import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import UserDashboard from "../pages/user/UserDashboard";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/user/dashboard" replace />} />
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="*" element={<div style={{ padding: 30 }}>404</div>} />
      </Routes>
    </BrowserRouter>
  );
}
