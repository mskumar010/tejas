import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { Loader } from "lucide-react";
import "@/App.css";
import ErrorBoundary from "@/components/ErrorBoundary";
import api from "@/services/api";

// Lazy load components
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const MailPage = lazy(() => import("@/pages/MailPage"));
const MailDetailPage = lazy(() => import("@/pages/MailDetailPage"));
const LandingPage = lazy(() => import("@/pages/LandingPage"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("@/pages/TermsOfService"));
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const AuthSuccess = lazy(() => import("@/pages/AuthSuccess"));
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
  useEffect(() => {
    const checkServer = async () => {
      const toastId = "server-status";
      try {
        // Attempt to reach the server. Even a 404/401 means it's running.
        await api.get("/health-check-ping");
      } catch (error: unknown) {
        const err = error as { code?: string; message?: string };
        // If connection refused/network error, server is likely down or waking up
        if (
          err.code === "ERR_NETWORK" ||
          err.message?.includes("Network Error")
        ) {
          toast.loading("Connecting to backend server...", {
            id: toastId,
            duration: Infinity,
          });

          // Poll until successful
          const interval = setInterval(async () => {
            try {
              await api.get("/health-check-ping");
              // If we get here (or catch a non-network error), server is up
              toast.success("Connected to server!", {
                id: toastId,
                duration: 2000,
              });
              clearInterval(interval);
            } catch (retryError: unknown) {
              const retryErr = retryError as {
                code?: string;
                message?: string;
              };
              // If it's NOT a network error (e.g. 401, 404), it means server is UP.
              if (
                retryErr.code !== "ERR_NETWORK" &&
                !retryErr.message?.includes("Network Error")
              ) {
                toast.success("Connected to server!", {
                  id: toastId,
                  duration: 2000,
                });
                clearInterval(interval);
              }
            }
          }, 2000);

          // Cleanup interval on unmount
          return () => clearInterval(interval);
        }
      }
    };

    checkServer();
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/success" element={<AuthSuccess />} />
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
