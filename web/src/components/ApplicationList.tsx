import { format } from "date-fns";
import { CheckCircle, Clock, XCircle, Briefcase } from "lucide-react";

interface Application {
  _id: string;
  company: string;
  role: string;
  status: "Applied" | "Interview" | "Reject" | "Offer";
  appliedDate: string;
}

interface ApplicationListProps {
  applications: Application[];
}

const statusConfig = {
  Applied: {
    icon: Clock,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-900/20",
  },
  Interview: {
    icon: Briefcase,
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-900/20",
  },
  Offer: {
    icon: CheckCircle,
    color: "text-green-500",
    bg: "bg-green-50 dark:bg-green-900/20",
  },
  Reject: {
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-50 dark:bg-red-900/20",
  },
};

const ApplicationList = ({ applications }: ApplicationListProps) => {
  if (applications.length === 0) {
    return (
      <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          No applications found
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Sync your Gmail to see your job applications here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {applications.map((app) => {
              const StatusIcon = statusConfig[app.status]?.icon || Clock;
              return (
                <tr
                  key={app._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300">
                        {app.company.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {app.company}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                    {app.role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                        statusConfig[app.status]?.bg || "bg-gray-100"
                      } ${statusConfig[app.status]?.color || "text-gray-600"}`}
                    >
                      <StatusIcon size={14} />
                      {app.status}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {app.appliedDate
                      ? format(new Date(app.appliedDate), "MMM d, yyyy")
                      : "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApplicationList;
