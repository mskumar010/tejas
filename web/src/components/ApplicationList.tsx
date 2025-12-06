import { format } from "date-fns";
import { Briefcase } from "lucide-react";
import { getStatusColor, getStatusIcon } from "@/utils/statusUtils.tsx";

interface Application {
  _id: string;
  company: string;
  role: string;
  status: string;
  appliedDate: string;
}

interface ApplicationListProps {
  applications: Application[];
}

const ApplicationList = ({ applications }: ApplicationListProps) => {
  if (applications.length === 0) {
    return (
      <div className="text-center py-10 bg-surface rounded-xl shadow-sm border border-border-base">
        <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-text-main">
          No applications found
        </h3>
        <p className="text-text-muted">
          Sync your Gmail to see your job applications here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl shadow-sm border border-border-base overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-app">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-base">
            {applications.map((app) => {
              const StatusIcon = getStatusIcon(app.status);
              return (
                <tr key={app._id} className="hover:bg-app transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-app flex items-center justify-center text-sm font-bold text-text-muted">
                        {app.company.charAt(0)}
                      </div>
                      <span className="font-medium text-text-main">
                        {app.company}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-text-main">
                    {app.role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        app.status
                      )}`}
                    >
                      <StatusIcon size={14} />
                      {app.status}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
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
