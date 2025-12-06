import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import api from "../services/api";
import ApplicationList from "../components/ApplicationList";
import { RefreshCw, Mail } from "lucide-react";
import toast from "react-hot-toast";

function Dashboard() {
  const navigate = useNavigate();
  // @ts-ignore
  const { user, isLoading } = useSelector((state: RootState) => state.auth);
  const currentUser = user as any;
  const [applications, setApplications] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);

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
      fetchApplications();
    } catch (error) {
      console.error("Sync failed", error);
      toast.error("Sync failed. Ensure Gmail is connected.");
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) {
    return <h3>Loading...</h3>;
  }

  return (
    <section>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Track your job applications
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={isSyncing ? "animate-spin" : ""} />
            {isSyncing ? "Syncing..." : "Sync Now"}
          </button>

          <button
            onClick={onConnectGmail}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            disabled={!!currentUser?.gmailAccessToken}
          >
            <Mail size={18} />
            {currentUser?.gmailAccessToken
              ? "Gmail Connected"
              : "Connect Gmail"}
          </button>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Applications
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {applications.length}
          </p>
        </div>
      </div>

      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        Recent Applications
      </h2>
      <ApplicationList applications={applications} />
    </section>
  );
}

export default Dashboard;
