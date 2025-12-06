import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

function PrivacyPolicy() {
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

      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="mb-4 text-sm text-gray-500">
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
        <p>
          Tejas ("we," "our," or "us") is committed to protecting your privacy.
          This Privacy Policy explains how we collect, use, and safeguard your
          information when you use our job application tracking service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">
          2. Information We Collect
        </h2>
        <h3 className="text-lg font-medium mb-2">Google User Data</h3>
        <p className="mb-2">
          Our application accesses your Gmail account to identify email threads
          related to job applications. Specifically, we access:
        </p>
        <ul className="list-disc ml-6 mb-4">
          <li>
            <strong>Email Content:</strong> We read email headers and bodies to
            extract information such as Company Name, Job Role, and Application
            Status.
          </li>
          <li>
            <strong>Metadata:</strong> We store the Sender, Date, and Subject
            line of these specific emails to organize your application
            dashboard.
          </li>
        </ul>
        <p>
          We <strong>do not</strong> read your personal emails or any emails
          unrelated to job hunting.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">3. How We Use Your Data</h2>
        <p className="mb-4">
          We use the information we collect solely to provide the specific
          features of our application:
        </p>
        <ul className="list-disc ml-6 mb-4">
          <li>
            To automatically create entries in your job application dashboard.
          </li>
          <li>
            To update the status of your applications (e.g., from "Applied" to
            "Interview") based on email replies.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">
          4. Data Sharing and Transfer
        </h2>
        <p>
          We do not share, sell, or transfer your personal data to any third
          parties using your Google User Data. Your data is stored securely in
          our database and is accessed only by you via our secure dashboard.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">
          5. Limited Use Disclosure
        </h2>
        <p className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          Tejas's use and transfer to any other app of information received from
          Google APIs will adhere to the{" "}
          <a
            href="https://developers.google.com/terms/api-services-user-data-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Google API Services User Data Policy
          </a>
          , including the Limited Use requirements.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">6. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us
          at support@tejas.app.
        </p>
      </section>
    </div>
  );
}

export default PrivacyPolicy;
