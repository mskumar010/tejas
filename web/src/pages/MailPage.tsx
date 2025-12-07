import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import { format, formatDistanceToNow } from "date-fns";
import {
  Search,
  Plus,
  MoreVertical,
  Filter,
  RefreshCw,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import ManualEmailModal from "@/components/ManualEmailModal";
import toast from "react-hot-toast";
import Fuse from "fuse.js";
import {
  STATUS_CATEGORIES,
  getStatusColor,
  getStatusIcon,
} from "@/utils/statusUtils.tsx";
import { Menu, Transition, Popover } from "@headlessui/react";
import { Fragment } from "react";

interface Application {
  _id: string;
  company: string;
  role: string;
  status: string;
  relatedEmails?: {
    messageId: string;
    subject: string;
    sender: string;
    date: string;
    snippet: string;
  }[];
}

function MailPage() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Filter States
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "ACTION_REQUIRED",
    "IN_PROGRESS",
    "COMPLETED",
    "INACTIVE",
  ]);

  useEffect(() => {
    fetchApplications();
    // Check if we have a stored sync time (mocking it for now or could get from user profile)
    const stored = localStorage.getItem("lastSynced");
    if (stored) setLastSynced(new Date(stored));
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

  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    try {
      await api.patch(`/applications/${appId}/status`, { status: newStatus });
      toast.success(`Marked as ${newStatus}`);
      fetchApplications();
    } catch (_error) {
      toast.error("Failed to update status");
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    const toastId = toast.loading("Syncing emails...");
    try {
      await api.post("/gmail/sync");
      toast.success("Emails synced", { id: toastId });
      const now = new Date();
      setLastSynced(now);
      localStorage.setItem("lastSynced", now.toString());
      fetchApplications();
    } catch (error) {
      toast.error("Sync failed", { id: toastId });
      console.error(error);
    } finally {
      setIsSyncing(false);
    }
  };

  // 1. Flatten Data
  const allEmails = useMemo(() => {
    return applications
      .flatMap((app) =>
        (app.relatedEmails || []).map((email, index) => ({
          ...email,
          company: app.company,
          role: app.role,
          appStatus: app.status,
          appId: app._id,
          uniqueKey: `${email.messageId}_${app._id}_${index}`,
        }))
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [applications]);

  // 2. Setup Fuse.js
  const fuse = useMemo(() => {
    return new Fuse(allEmails, {
      keys: ["subject", "company", "role", "sender", "snippet"],
      threshold: 0.3, // Fuzzy threshold
    });
  }, [allEmails]);

  // 3. Filter & Search Logic
  const filteredEmails = useMemo(() => {
    let result = allEmails;

    // Apply Search
    if (searchTerm) {
      result = fuse.search(searchTerm).map((r) => r.item);
    }

    // Apply Category Filter
    if (selectedCategories.length < 4) {
      // Only filter if not all selected
      result = result.filter((email) => {
        const status = email.appStatus;
        for (const [key, statuses] of Object.entries(STATUS_CATEGORIES)) {
          if (selectedCategories.includes(key) && statuses.includes(status)) {
            return true;
          }
        }
        return false;
      });
    }

    return result;
  }, [allEmails, searchTerm, fuse, selectedCategories]);

  // UI Helpers
  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  if (loading)
    return (
      <div className="flex bg-app h-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-main tracking-tight">
            Mail View
          </h1>
          <div className="flex items-center gap-2 mt-1 text-sm text-text-muted">
            <span>{filteredEmails.length} messages found</span>
            {lastSynced && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <RefreshCw
                    size={12}
                    className={isSyncing ? "animate-spin" : ""}
                  />
                  Last synced{" "}
                  {formatDistanceToNow(lastSynced, { addSuffix: true })}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2.5 bg-surface hover:bg-app text-text-main border border-border-base rounded-xl transition-all shadow-sm font-medium disabled:opacity-50"
          >
            <RefreshCw size={18} className={isSyncing ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Sync</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:opacity-90 text-white rounded-xl transition-all shadow-md shadow-primary/20 font-medium active:scale-95"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add Manual</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-text-muted"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by company, subject, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-border-base rounded-xl bg-surface text-text-main placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
          />
        </div>

        <Popover className="relative">
          {({ open }) => (
            <>
              <Popover.Button
                className={`flex items-center gap-2 px-4 py-3 bg-surface border border-border-base rounded-xl text-text-main hover:bg-app transition-colors shadow-sm font-medium outline-none ${
                  open ? "ring-2 ring-primary/20 border-primary" : ""
                }`}
              >
                <Filter size={18} />
                <span>Filter</span>
                {selectedCategories.length < 4 && (
                  <span className="ml-1 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                    {selectedCategories.length}
                  </span>
                )}
                <ChevronDown
                  size={14}
                  className={`ml-1 transition-transform ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </Popover.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
              >
                <Popover.Panel className="absolute right-0 z-20 mt-2 w-56 origin-top-right rounded-xl bg-surface border border-border-base shadow-xl focus:outline-none p-2">
                  <div className="space-y-1">
                    <h3 className="px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                      Filter by Status
                    </h3>
                    {Object.keys(STATUS_CATEGORIES).map((key) => (
                      <button
                        key={key}
                        onClick={() => toggleCategory(key)}
                        className={`flex items-center w-full px-3 py-2 text-sm rounded-lg transition-colors ${
                          selectedCategories.includes(key)
                            ? "bg-primary/10 text-primary"
                            : "text-text-main hover:bg-app"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded border mr-3 flex items-center justify-center ${
                            selectedCategories.includes(key)
                              ? "bg-primary border-primary"
                              : "border-border-base"
                          }`}
                        >
                          {selectedCategories.includes(key) && (
                            <CheckCircle2 size={10} className="text-white" />
                          )}
                        </div>
                        {key.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </Popover.Panel>
              </Transition>
            </>
          )}
        </Popover>
      </div>

      {/* Email List */}
      <div className="bg-surface rounded-2xl shadow-sm border border-border-base overflow-hidden">
        {filteredEmails.length === 0 ? (
          <div className="p-12 text-center text-text-muted">
            <div className="bg-app w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 opacity-40 text-text-main" />
            </div>
            <h3 className="text-lg font-medium text-text-main mb-1">
              No emails found
            </h3>
            <p>Try adjusting your search or filters, or sync your mailbox.</p>
          </div>
        ) : (
          // Using a simple list for better readability
          <div className="divide-y divide-border-base">
            {filteredEmails.map((email) => (
              <div
                key={email.uniqueKey}
                onClick={() => navigate(`/mail/${email.appId}`)}
                className="group p-5 hover:bg-app transition-all cursor-pointer relative"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-4 justify-between">
                  {/* Left: Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <div
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wide border ${getStatusColor(
                          email.appStatus
                        )}`}
                      >
                        <span className="mr-1.5">
                          {(() => {
                            const Icon = getStatusIcon(email.appStatus);
                            return <Icon size={14} />;
                          })()}
                        </span>
                        {email.appStatus}
                      </div>
                      <span className="text-sm font-semibold text-text-main truncate">
                        {email.company}
                      </span>
                      <span className="text-border-base">•</span>
                      <span className="text-sm text-text-muted truncate">
                        {email.role}
                      </span>
                    </div>

                    <h4 className="text-base font-semibold text-text-main mb-1 leading-snug">
                      {email.subject}
                    </h4>
                    <p className="text-sm text-text-muted line-clamp-1">
                      <span className="font-medium text-text-main mr-2">
                        {email.sender}
                      </span>
                      {email.snippet}
                    </p>
                  </div>

                  {/* Right: Meta & Actions */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-2 md:pl-4 md:border-l md:border-border-base">
                    <span className="text-xs text-text-muted whitespace-nowrap font-medium">
                      {format(new Date(email.date), "MMM d, h:mm a")}
                    </span>

                    {/* Action Menu Trigger (Only visible on hover) */}
                    <Menu
                      as="div"
                      className="relative ml-auto opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity"
                    >
                      <Menu.Button
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-full hover:bg-app text-text-muted hover:text-text-main transition-colors"
                      >
                        <MoreVertical size={16} />
                      </Menu.Button>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right divide-y divide-border-base rounded-xl bg-surface shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                          <div className="px-1 py-1">
                            <div className="px-3 py-2 text-xs font-semibold text-text-muted uppercase">
                              Update Status
                            </div>
                            {[
                              "Applied",
                              "Interview Tomorrow",
                              "Offer Received",
                              "Rejected",
                            ].map((status) => (
                              <Menu.Item key={status}>
                                {({ active }) => (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUpdateStatus(email.appId, status);
                                    }}
                                    className={`${
                                      active ? "bg-primary/10" : ""
                                    } group flex w-full items-center rounded-lg px-2 py-2 text-sm text-text-main`}
                                  >
                                    {status}
                                  </button>
                                )}
                              </Menu.Item>
                            ))}
                          </div>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ManualEmailModal
        isOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
        onSave={fetchApplications}
      />
    </div>
  );
}

export default MailPage;
