import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "./components/PublicLayout";
import AuthLayout from "./components/AuthLayout";

// Public pages
import Home from "./pages/public/Home";
import Services from "./pages/public/Services";
import HowItWorks from "./pages/public/HowItWorks";
import News from "./pages/public/News";
import Contact from "./pages/public/Contact";
import PrivacyPolicy from "./pages/public/PrivacyPolicy";

// Auth pages
import UserRegister from "./pages/user/Register";
import UserLogin from "./pages/user/Login";
import AdminRegister from "./pages/admin/Register";
import AdminLogin from "./pages/admin/Login";

// Dashboards
import UserDashboard from "./pages/user/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";

// User protected area
import UserLayout from "./components/layout/UserLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import Forms from "./pages/user/Forms";
import Notifications from "./pages/user/Notifications";
import Settings from "./pages/user/Settings";
import QrCode from "./pages/user/QrCode";
import HouseholdNew from "./pages/user/HouseholdNew";
import Profile from "./pages/user/Profile"; // ✅ ADD THIS FILE

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ✅ PUBLIC */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/news" element={<News />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        </Route>

        {/* ✅ AUTH */}
        <Route element={<AuthLayout />}>
          <Route path="/register" element={<UserRegister />} />
          <Route path="/login" element={<UserLogin />} />
          <Route path="/admin/register" element={<AdminRegister />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/enter" element={<Navigate to="/register" replace />} />
        </Route>

        {/* ✅ USER AREA (Protected + Layout) */}
        <Route
          path="/user"
          element={
            <ProtectedRoute>
              <UserLayout />
            </ProtectedRoute>
          }
        >
          {/* Default redirect inside /user */}
          <Route index element={<Navigate to="dashboard" replace />} />

          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="forms" element={<Forms />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<Profile />} />

          {/* Household form UI */}
          <Route path="household/new" element={<HouseholdNew />} />

          {/* QR */}
          <Route path="qr/:householdId" element={<QrCode />} />
        </Route>

        {/* ✅ fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
