import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  User,
  Building,
  Tag,
  Clock,
  ExternalLink,
} from "lucide-react";
import api from "@/services/api";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { getStatusColor, getAllStatuses } from "@/utils/statusUtils.tsx";

interface Application {
  _id: string;
  company: string;
  role: string;
  status: string;
  appliedDate: string;
  relatedEmails: {
    messageId: string;
    subject: string;
    sender: string;
    date: string;
    snippet: string;
    body?: string;
  }[];
  notes?: string;
}

const MailDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const res = await api.get("/applications");
        const app = res.data.find((a: Application) => a._id === id);

        if (app) {
          setApplication(app);
          setSelectedStatus(app.status);
        } else {
          toast.error("Application not found");
          navigate("/mail");
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load details");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchApplication();
  }, [id, navigate]);

  const handleStatusChange = async (newStatus: string) => {
    setSelectedStatus(newStatus);
    try {
      await api.patch(`/applications/${id}/status`, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
      if (application) setSelectedStatus(application.status);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-app">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!application) return null;

  const latestEmail = application.relatedEmails.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )[0];

  return (
    <div className="min-h-screen bg-app flex flex-col">
      {/* Header */}
      <header className="bg-surface border-b border-border-base px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm/5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-app rounded-full transition-colors text-text-muted"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-text-main truncate max-w-xl leading-tight">
              {latestEmail?.subject || "No Subject"}
            </h1>
            <div className="flex items-center gap-3 text-sm text-text-muted mt-1">
              <span className="flex items-center gap-1.5 font-medium text-text-main">
                <User size={14} className="opacity-70" />
                {latestEmail?.sender}
              </span>
              <span className="text-border-base">•</span>
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="opacity-70" />
                {latestEmail &&
                  format(new Date(latestEmail.date), "MMM d, yyyy 'at' h:mm a")}
              </span>
            </div>
          </div>
        </div>

        <div
          className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(
            selectedStatus
          )}`}
        >
          {selectedStatus}
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden max-w-[1920px] mx-auto w-full">
        {/* Main Content - Email Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="bg-surface rounded-2xl shadow-sm border border-border-base min-h-[600px] flex flex-col">
            <div className="p-8 flex-1">
              <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap font-sans text-text-main leading-relaxed text-base">
                {latestEmail?.body ||
                  latestEmail?.snippet ||
                  "No content available."}
              </div>
            </div>

            <div className="bg-app border-t border-border-base p-6 rounded-b-2xl">
              <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">
                Extracted Metadata
              </h4>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-border-base rounded-lg shadow-sm">
                  <Building size={16} className="text-primary" />
                  <span className="text-sm font-medium text-text-main">
                    {application.company}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-border-base rounded-lg shadow-sm">
                  <Tag size={16} className="text-purple-500" />
                  <span className="text-sm font-medium text-text-main">
                    {application.role}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Sidebar / Status Section */}
        <aside className="w-full md:w-96 bg-surface border-l border-border-base flex-shrink-0 flex flex-col z-10 h-full">
          <div className="p-6 border-b border-border-base">
            <h2 className="text-sm font-bold text-text-main uppercase tracking-wider mb-5">
              Application Status
            </h2>
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-text-muted mb-2 block">
                  Current Stage
                </label>
                <div className="relative">
                  <select
                    value={selectedStatus}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="w-full appearance-none p-3 pl-4 pr-10 rounded-xl border border-border-base bg-app text-text-main focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-sm"
                  >
                    {getAllStatuses().map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                    <Clock size={16} />
                  </div>
                </div>
              </div>

              {application.notes && (
                <div className="p-4 rounded-xl bg-warning/10 border border-warning/20">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <ExternalLink className="text-warning" size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-warning mb-1">
                        Notes & ID
                      </p>
                      <p className="text-sm text-text-main whitespace-pre-line leading-relaxed">
                        {application.notes}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-app">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-6">
              Activity History
            </h3>
            <div className="relative border-l-2 border-border-base ml-3 space-y-8 pb-6">
              {application.relatedEmails.map((email, idx) => (
                <div key={idx} className="relative pl-8 group">
                  <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-surface border-2 border-primary group-hover:scale-110 transition-transform shadow-sm" />
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-text-muted">
                      {format(new Date(email.date), "MMM d, yyyy 'at' h:mm a")}
                    </span>
                    <p className="text-sm font-semibold text-text-main leading-snug">
                      Received email: {email.subject}
                    </p>
                    <p className="text-xs text-text-muted line-clamp-1">
                      {email.snippet}
                    </p>
                  </div>
                </div>
              ))}

              <div className="relative pl-8">
                <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-surface border-2 border-text-muted" />
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-text-muted">
                    {format(new Date(application.appliedDate), "MMM d, yyyy")}
                  </span>
                  <p className="text-sm font-medium text-text-main">
                    Application Created
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default MailDetailPage;
