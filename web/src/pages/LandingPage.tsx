import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, Shield, LayoutDashboard } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { ThemeToggle } from "@/components/ThemeToggle";

function LandingPage() {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div className="min-h-screen bg-app flex flex-col transition-colors duration-200">
      <header className="px-6 py-4 flex justify-between items-center bg-surface shadow-sm border-b border-border-base">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="Tejas Logo" className="w-8 h-8" />
          <span className="text-xl font-bold text-text-main">Tejas</span>
        </div>
        <nav className="flex gap-4 items-center">
          <ThemeToggle />
          {user ? (
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-sm font-medium px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-colors"
            >
              <LayoutDashboard size={16} />
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-text-muted hover:text-text-main"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-extrabold text-text-main mb-6">
          Track your job hunt <br className="hidden md:block" /> on{" "}
          <span className="text-primary">Autopilot</span>.
        </h1>
        <p className="text-xl text-text-muted mb-8 max-w-2xl">
          Tejas syncs with your Gmail to automatically find job applications,
          track their status, and organize your job search. No more manual data
          entry.
        </p>

        <div className="flex flex-col md:flex-row gap-4 mb-16">
          {user ? (
            <Link
              to="/dashboard"
              className="flex items-center justify-center gap-2 px-8 py-3 bg-primary text-white rounded-xl text-lg font-semibold hover:opacity-90 transition-transform hover:scale-105 shadow-xl shadow-primary/20"
            >
              View Dashboard <ArrowRight size={20} />
            </Link>
          ) : (
            <Link
              to="/register"
              className="flex items-center justify-center gap-2 px-8 py-3 bg-primary text-white rounded-xl text-lg font-semibold hover:opacity-90 transition-transform hover:scale-105 shadow-xl shadow-primary/20"
            >
              Start Tracking for Free <ArrowRight size={20} />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left w-full mb-16">
          <div className="p-6 bg-surface rounded-xl shadow-sm border border-border-base">
            <CheckCircle className="text-success mb-4" size={32} />
            <h3 className="text-lg font-bold text-text-main mb-2">Auto-Sync</h3>
            <p className="text-text-muted">
              Connect your Gmail and let us find your applications
              automatically.
            </p>
          </div>
          <div className="p-6 bg-surface rounded-xl shadow-sm border border-border-base">
            <Shield className="text-primary mb-4" size={32} />
            <h3 className="text-lg font-bold text-text-main mb-2">
              Secure & Private
            </h3>
            <p className="text-text-muted">
              We only access emails related to job applications. Your privacy is
              our priority.
            </p>
          </div>
          <div className="p-6 bg-surface rounded-xl shadow-sm border border-border-base">
            <CheckCircle className="text-primary mb-4" size={32} />
            <h3 className="text-lg font-bold text-text-main mb-2">
              Smart Status
            </h3>
            <p className="text-text-muted">
              We detect if you've been rejected or offered an interview based on
              email replies.
            </p>
          </div>
        </div>

        {/* Transparency Section for Google Verification */}
        <div className="w-full max-w-4xl p-8 bg-surface rounded-xl border border-primary/20 shadow-lg text-left">
          <h2 className="text-2xl font-bold text-text-main mb-4 flex items-center gap-2">
            <Shield className="text-primary" /> Transparency & Data Usage
          </h2>
          <div className="space-y-4 text-text-muted">
            <p>
              Tejas uses the <code>gmail.readonly</code> scope to identifying
              job application outcomes. Here is exactly how we use your data:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Automated Scanning:</strong> Our system programmatically
                scans your inbox <em>only</em> for emails that match job
                application patterns (e.g., from ATS systems, "Application
                Received", "Offer", "Rejection").
              </li>
              <li>
                <strong>Data Extraction:</strong> We extract specific metadata
                (Company Name, Job Title) to populate your dashboard.
              </li>
              <li>
                <strong>No Human Access:</strong> No human scans or reads your
                emails. The process is entirely automated.
              </li>
              <li>
                <strong>Limited Use:</strong> We do not sell or share your Gmail
                data with third parties for advertising or market research.
              </li>
            </ul>
            <div className="mt-4 pt-4 border-t border-border-base">
              <Link
                to="/privacy"
                className="text-primary font-semibold hover:underline"
              >
                Read our full Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-sm text-text-muted border-t border-border-base bg-surface">
        <div className="mb-2">
          &copy; {new Date().getFullYear()} Tejas. All rights reserved.
        </div>
        <div className="flex gap-4 justify-center">
          <Link to="/privacy" className="hover:underline hover:text-text-main">
            Privacy Policy
          </Link>
          <Link to="/terms" className="hover:underline hover:text-text-main">
            Terms of Service
          </Link>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
