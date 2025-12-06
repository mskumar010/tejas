import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, Shield } from "lucide-react";

function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <header className="px-6 py-4 flex justify-between items-center bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="Tejas Logo" className="w-8 h-8" />
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            Tejas
          </span>
        </div>
        <nav className="flex gap-4">
          <Link
            to="/login"
            className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="text-sm font-medium px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Get Started
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6">
          Track your job hunt <br className="hidden md:block" /> on{" "}
          <span className="text-primary">Autopilot</span>.
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl">
          Tejas syncs with your Gmail to automatically find job applications,
          track their status, and organize your job search. No more manual data
          entry.
        </p>

        <div className="flex flex-col md:flex-row gap-4 mb-16">
          <Link
            to="/register"
            className="flex items-center justify-center gap-2 px-8 py-3 bg-primary text-white rounded-xl text-lg font-semibold hover:bg-indigo-700 transition-transform hover:scale-105 shadow-xl shadow-indigo-500/20"
          >
            Start Tracking for Free <ArrowRight size={20} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left w-full">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <CheckCircle className="text-green-500 mb-4" size={32} />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Auto-Sync
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Connect your Gmail and let us find your applications
              automatically.
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <Shield className="text-blue-500 mb-4" size={32} />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Secure & Private
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              We only access emails related to job applications. Your privacy is
              our priority.
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <CheckCircle className="text-purple-500 mb-4" size={32} />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Smart Status
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              We detect if you've been rejected or offered an interview based on
              email replies.
            </p>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-sm text-gray-500 border-t border-gray-200 dark:border-gray-800">
        <div className="mb-2">
          &copy; {new Date().getFullYear()} Tejas. All rights reserved.
        </div>
        <div className="flex gap-4 justify-center">
          <Link
            to="/privacy"
            className="hover:underline hover:text-gray-700 dark:hover:text-gray-300"
          >
            Privacy Policy
          </Link>
          <Link
            to="/terms"
            className="hover:underline hover:text-gray-700 dark:hover:text-gray-300"
          >
            Terms of Service
          </Link>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
