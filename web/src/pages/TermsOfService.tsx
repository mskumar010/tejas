import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white dark:bg-gray-900 min-h-screen text-gray-800 dark:text-gray-200">
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-primary hover:text-indigo-700 transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" /> Back to Home
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="mb-4 text-sm text-gray-500">
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
        <p>
          By accessing and using Tejas, you accept and agree to be bound by the
          terms and provision of this agreement.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">
          2. Description of Service
        </h2>
        <p>
          Tejas provides a job application tracking service that integrates with
          your Gmail account to organize your job search. Use of the service is
          at your own risk.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">3. User Conduct</h2>
        <p>
          You agree to use the service only for lawful purposes. You are solely
          responsible for the content of your communications and interactions
          with the service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">
          4. Disclaimer of Warranties
        </h2>
        <p>
          The service is provided on an "as is" and "as available" basis. We do
          not warrant that the service will be uninterrupted or error-free.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">
          5. Limitation of Liability
        </h2>
        <p>
          Tejas shall not be liable for any indirect, incidental, special,
          consequential or punitive damages resulting from your use of the
          service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">6. Contact Information</h2>
        <p>
          If you have any questions about these Terms, please contact us at
          support@tejas.app.
        </p>
      </section>
    </div>
  );
}

export default TermsOfService;
