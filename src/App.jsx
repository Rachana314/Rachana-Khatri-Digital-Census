import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "./components/PublicLayout";
import AuthLayout from "./components/AuthLayout";
import AdminProtectedRoute from "./components/layout/AdminProtectedRoute";

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

// User dashboard
import UserDashboard from "./pages/user/Dashboard";

// ✅ ADMIN (Layout is inside admin folder)
import AdminLayout from "./pages/admin/AdminLayout";
import AdminHome from "./pages/admin/AdminHome";
import AdminHouseholds from "./pages/admin/AdminHouseholds";
import HouseholdView from "./pages/admin/HouseholdView";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminReports from "./pages/admin/AdminReports";

// User protected area
import UserLayout from "./components/layout/UserLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import Forms from "./pages/user/Forms";
import Notifications from "./pages/user/Notifications";
import Settings from "./pages/user/Settings";
import QrCode from "./pages/user/QrCode";
import HouseholdNew from "./pages/user/HouseholdNew";
import Profile from "./pages/user/Profile";

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

        {/* ✅ AUTH (ONLY LOGIN/REGISTER PAGES) */}
        <Route element={<AuthLayout />}>
          <Route path="/register" element={<UserRegister />} />
          <Route path="/login" element={<UserLogin />} />

          <Route path="/admin/register" element={<AdminRegister />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route path="/enter" element={<Navigate to="/register" replace />} />
        </Route>

        {/* ✅ ADMIN AREA (Protected + Layout + Multiple Pages) */}
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminHome />} />
          <Route path="households" element={<AdminHouseholds />} />
          <Route path="households/:householdId" element={<HouseholdView />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="reports" element={<AdminReports />} />
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
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="forms" element={<Forms />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<Profile />} />
          <Route path="household/new" element={<HouseholdNew />} />
          <Route path="qr/:householdId" element={<QrCode />} />
        </Route>

        {/* ✅ fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}