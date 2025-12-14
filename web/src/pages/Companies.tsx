import { useState, useMemo, useEffect, Fragment } from "react";
import api from "@/services/api";
import {
  Building2,
  Search,
  Filter,
  ChevronDown,
  CheckCircle2,
  Clock,
  Briefcase,
  ChevronUp,
} from "lucide-react";
import { Popover, Transition } from "@headlessui/react";
import {
  STATUS_CATEGORIES,
  getStatusColor,
  getStatusIcon,
} from "@/utils/statusUtils.tsx";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

interface Application {
  _id: string;
  company: string;
  role: string;
  status: string;
  appliedDate: string;
}

function Companies() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "ACTION_REQUIRED",
    "IN_PROGRESS",
    "COMPLETED",
    "INACTIVE",
    "NON_JOB",
  ]);
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null);

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
      setIsLoading(false);
    }
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const filteredData = useMemo(() => {
    let filtered = applications;

    // 1. Status Filter
    if (selectedCategories.length < 5) {
      filtered = filtered.filter((app) => {
        for (const [key, statuses] of Object.entries(STATUS_CATEGORIES)) {
          if (
            selectedCategories.includes(key) &&
            statuses.includes(app.status)
          ) {
            return true;
          }
        }
        return false;
      });
    }

    // 2. Search Filter
    if (searchTerm.trim()) {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.company.toLowerCase().includes(lowerTerm) ||
          app.role.toLowerCase().includes(lowerTerm)
      );
    }

    // 3. Group by Company
    const groups: Record<string, Application[]> = {};
    filtered.forEach((app) => {
      if (!groups[app.company]) {
        groups[app.company] = [];
      }
      groups[app.company].push(app);
    });

    // 4. Convert to Array and Sort
    return Object.entries(groups)
      .map(([name, apps]) => ({
        name,
        applications: apps.sort(
          (a, b) =>
            new Date(b.appliedDate).getTime() -
            new Date(a.appliedDate).getTime()
        ),
        latestActivity: apps[0]?.appliedDate,
      }))
      .sort(
        (a, b) =>
          new Date(b.latestActivity).getTime() -
          new Date(a.latestActivity).getTime()
      );
  }, [applications, searchTerm, selectedCategories]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <section className="space-y-6 p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Building2 size={28} className="text-primary shrink-0" />
          <h1 className="text-3xl font-bold text-text-main tracking-tight truncate">
            Companies
          </h1>
          <span className="bg-app text-text-muted px-3 py-1 rounded-full text-sm font-medium shrink-0">
            {filteredData.length}
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 min-w-0">
          <Search
            className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-text-muted"
            size={20}
          />
          <input
            type="text"
            placeholder="Search companies or roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-border-base rounded-xl bg-surface text-text-main placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
          />
        </div>

        <Popover className="relative shrink-0">
          {({ open }) => (
            <>
              <Popover.Button
                className={`flex items-center justify-between w-full sm:w-auto gap-2 px-4 py-3 bg-surface border border-border-base rounded-xl text-text-main hover:bg-app transition-colors shadow-sm font-medium outline-none ${
                  open ? "ring-2 ring-primary/20 border-primary" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <Filter size={18} />
                  <span>Filter</span>
                  {selectedCategories.length < 5 && (
                    <span className="ml-1 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                      {selectedCategories.length}
                    </span>
                  )}
                </div>
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
                <Popover.Panel className="absolute right-0 z-20 mt-2 w-full sm:w-56 origin-top-right rounded-xl bg-surface border border-border-base shadow-xl focus:outline-none p-2">
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

      <div className="space-y-4">
        {filteredData.length === 0 ? (
          <div className="p-12 text-center text-text-muted bg-surface rounded-2xl border border-border-base">
            <div className="bg-app w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 opacity-40 text-text-main" />
            </div>
            <h3 className="text-lg font-medium text-text-main mb-1">
              No companies found
            </h3>
            <p>Try adjusting your search or filters.</p>
          </div>
        ) : (
          filteredData.map((group) => (
            <div
              key={group.name}
              className={`bg-surface rounded-xl border transition-all duration-200 ${
                expandedCompany === group.name
                  ? "border-primary ring-2 ring-primary/10 shadow-lg"
                  : "border-border-base shadow-sm hover:shadow-md hover:border-primary/50"
              }`}
            >
              {/* Card Header - Click to Expand */}
              <div
                onClick={() =>
                  setExpandedCompany(
                    expandedCompany === group.name ? null : group.name
                  )
                }
                className="p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 cursor-pointer select-none"
              >
                <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                  <div className="w-12 h-12 bg-app rounded-xl flex items-center justify-center text-text-muted font-bold text-xl shrink-0">
                    {group.name.charAt(0).toUpperCase()}
                  </div>
                </div>

                <div className="flex-1 min-w-0 w-full sm:w-auto">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                    <h3 className="font-bold text-text-main text-lg truncate">
                      {group.name}
                    </h3>
                    <span className="bg-app text-text-main text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                      {group.applications.length} Role
                      {group.applications.length !== 1 && "s"}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-text-muted">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      Latest: {format(new Date(group.latestActivity), "MMM d")}
                    </span>
                    {/* Show quick status dots */}
                    <div className="flex -space-x-1">
                      {group.applications.slice(0, 5).map((app, i) => {
                        const StatusIcon = getStatusIcon(app.status);
                        const colorClass = getStatusColor(app.status);
                        // Extract text color from class string
                        const textColor =
                          colorClass.match(/text-([a-z]+)-(\d+)/) || [];
                        const bgClass = colorClass.split(" ")[0]; // Approx bg color

                        return (
                          <div
                            key={i}
                            className={`w-5 h-5 rounded-full ring-2 ring-surface flex items-center justify-center ${bgClass}`}
                            title={app.status}
                          >
                            <StatusIcon
                              size={10}
                              className={
                                textColor[0]
                                  ? `text-${textColor[1]}-${textColor[2]}`
                                  : "text-text-muted"
                              }
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="text-text-muted hidden sm:block">
                  {expandedCompany === group.name ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </div>
              </div>

              {/* Expanded Content */}
              {expandedCompany === group.name && (
                <div className="border-t border-border-base bg-app px-4 py-4 md:px-5 rounded-b-xl animate-in slide-in-from-top-2 duration-200">
                  <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                    Applied Roles
                  </h4>
                  <div className="space-y-3">
                    {group.applications.map((app) => {
                      const StatusIcon = getStatusIcon(app.status);
                      return (
                        <div
                          key={app._id}
                          onClick={() => navigate(`/mail/${app._id}`)}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-surface rounded-lg border border-border-base gap-2 cursor-pointer hover:border-primary/50 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Briefcase
                              size={16}
                              className="text-text-muted shrink-0"
                            />
                            <span className="font-medium text-text-main break-words">
                              {app.role}
                            </span>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                            <span className="text-sm text-text-muted shrink-0">
                              {format(new Date(app.appliedDate), "MMM d, yyyy")}
                            </span>
                            <div
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border ${getStatusColor(
                                app.status
                              )} shrink-0`}
                            >
                              <StatusIcon size={14} />
                              {app.status}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default Companies;
