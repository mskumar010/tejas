import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import api from "@/services/api";
import {
  RefreshCw,
  Mail,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import StatsCard from "@/components/StatsCard";
import ApplicationList from "@/components/ApplicationList";
import { STATUS_CATEGORIES } from "@/utils/statusUtils.tsx";
import { formatDistanceToNow } from "date-fns";

function Dashboard() {
  const navigate = useNavigate();
  // @ts-ignore
  const { user, isLoading } = useSelector((state: RootState) => state.auth);
  const currentUser = user as any;
  const [applications, setApplications] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      fetchApplications();
    }
  }, [user, navigate]);

  const fetchApplications = async () => {
    try {
      const res = await api.get("/applications");
      setApplications(res.data);
    } catch (error) {
      console.error("Failed to fetch applications", error);
    }
  };

  const onConnectGmail = async () => {
    try {
      const res = await api.get("/gmail/connect", {
        // @ts-ignore
        headers: { Authorization: `Bearer ${currentUser?.token}` },
      });
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (error) {
      console.error("Failed to get connect URL", error);
      toast.error("Failed to connect Gmail");
    }
  };

  const onSync = async () => {
    setIsSyncing(true);
    try {
      const res = await api.post("/gmail/sync");
      toast.success(`Synced ${res.data.syncedCount} applications`);
      setLastSynced(new Date());
      fetchApplications();
    } catch (error) {
      console.error("Sync failed", error);
      toast.error("Sync failed. Ensure Gmail is connected.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Compute Stats
  const stats = useMemo(() => {
    const total = applications.length;
    const actionRequired = applications.filter((app) =>
      STATUS_CATEGORIES.ACTION_REQUIRED.includes(app.status)
    ).length;
    const inProgress = applications.filter((app) =>
      STATUS_CATEGORIES.IN_PROGRESS.includes(app.status)
    ).length;
    const completed = applications.filter((app) =>
      STATUS_CATEGORIES.COMPLETED.includes(app.status)
    ).length;
    const inactive = applications.filter((app) =>
      STATUS_CATEGORIES.INACTIVE.includes(app.status)
    ).length;
    const nonJob = applications.filter((app) =>
      STATUS_CATEGORIES.NON_JOB.includes(app.status)
    ).length;

    return { total, actionRequired, inProgress, completed, inactive, nonJob };
  }, [applications]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-text-muted">
        Retrieving dashboard...
      </div>
    );
  }

  return (
    <section className="space-y-8 p-4 md:p-8">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface p-4 rounded-xl border border-border-base shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-text-main">Dashboard</h1>
          <div className="flex items-center gap-2 text-sm text-text-muted mt-1">
            <Clock size={14} />
            {lastSynced ? (
              <span>Last synced {formatDistanceToNow(lastSynced)} ago</span>
            ) : (
              <span>Not synced recently</span>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 bg-app border border-border-base rounded-lg text-sm font-medium text-text-main hover:brightness-95 transition-all disabled:opacity-50"
          >
            <RefreshCw size={18} className={isSyncing ? "animate-spin" : ""} />
            {isSyncing ? "Syncing..." : "Sync Now"}
          </button>

          {!currentUser?.gmailAccessToken && (
            <button
              onClick={onConnectGmail}
              className="flex items-center gap-2 px-4 py-2 bg-success text-white rounded-lg text-sm font-medium hover:opacity-90 transition-colors"
            >
              <Mail size={18} />
              Connect Gmail
            </button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <section>
        <h2 className="text-lg font-bold text-text-main mb-4">Overview</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Applications"
            value={stats.total}
            icon={FileText}
            color="text-primary"
            bgColor="bg-primary/10"
          />
          <StatsCard
            title="Action Required"
            value={stats.actionRequired}
            icon={AlertCircle}
            color="text-danger"
            bgColor="bg-danger/10"
          />
          <StatsCard
            title="In Progress"
            value={stats.inProgress}
            icon={Clock}
            color="text-warning"
            bgColor="bg-warning/10"
          />
          <StatsCard
            title="Offers / Completed"
            value={stats.completed}
            icon={CheckCircle2}
            color="text-success"
            bgColor="bg-success/10"
          />
        </div>
      </section>

      {/* Recent Applications */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-text-main">
            Recent Applications
          </h2>
          <button
            onClick={() => navigate("/mail")}
            className="text-sm text-primary hover:opacity-80 font-medium"
          >
            View Mail
          </button>
        </div>
        <ApplicationList applications={applications.slice(0, 5)} />
      </section>
    </section>
  );
}

export default Dashboard;
