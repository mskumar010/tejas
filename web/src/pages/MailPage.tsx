import { useEffect, useState } from "react";
import api from "../services/api";
import { format } from "date-fns";
import { Mail, Search } from "lucide-react";

interface Email {
  messageId: string;
  subject: string;
  sender: string;
  date: string;
  snippet: string;
}

interface Application {
  _id: string;
  company: string;
  role: string;
  status: string;
  relatedEmails?: Email[];
}

function MailPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await api.get("/applications");
      setApplications(res.data);
    } catch (error) {
      console.error("Failed to fetch applications", error);
    } finally {
      setLoading(false);
    }
  };

  // Flatten all emails from all applications into a single list
  const allEmails = applications
    .flatMap((app) =>
      (app.relatedEmails || []).map((email) => ({
        ...email,
        company: app.company,
        role: app.role,
        appStatus: app.status,
      }))
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredEmails = allEmails.filter(
    (email) =>
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.sender.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Mail View
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            All synced application emails
          </p>
        </div>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search emails..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {filteredEmails.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <Mail className="mx-auto h-12 w-12 mb-3 opacity-20" />
            <p>No emails found.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredEmails.map((email) => (
              <div
                key={email.messageId}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                onClick={() =>
                  window.open(
                    `https://mail.google.com/mail/u/0/#search/${email.messageId}`,
                    "_blank"
                  )
                }
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {email.company}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                      {email.appStatus}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                    {format(new Date(email.date), "MMM d, h:mm a")}
                  </span>
                </div>
                <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                  {email.subject}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                  {email.snippet} -{" "}
                  <span className="text-xs text-gray-400">{email.sender}</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MailPage;
