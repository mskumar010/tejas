import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Loader } from "lucide-react";
import "@/App.css";
import ErrorBoundary from "@/components/ErrorBoundary";

// Lazy load components
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const MailPage = lazy(() => import("@/pages/MailPage"));
const MailDetailPage = lazy(() => import("@/pages/MailDetailPage"));
const LandingPage = lazy(() => import("@/pages/LandingPage"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("@/pages/TermsOfService"));
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const Layout = lazy(() => import("@/components/Layout"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const Companies = lazy(() => import("@/pages/Companies"));
const Preferences = lazy(() => import("@/pages/Preferences"));
const Profile = lazy(() => import("@/pages/Profile"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-app text-primary">
    <Loader size={32} className="animate-spin" />
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />

            {/* Protected Routes */}
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/mail" element={<MailPage />} />
              <Route path="/mail/:id" element={<MailDetailPage />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/companies" element={<Companies />} />
              <Route path="/preferences" element={<Preferences />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Catch-all for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Router>
      <Toaster />
    </ErrorBoundary>
  );
}

export default App;
