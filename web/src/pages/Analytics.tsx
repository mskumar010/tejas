import { useEffect, useState, useMemo } from "react";
import api from "@/services/api";
import { STATUS_CATEGORIES } from "@/utils/statusUtils.tsx";
import { APP_COLORS } from "@/utils/colors";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

function Analytics() {
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  // Compute Stats
  const stats = useMemo(() => {
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

    return { actionRequired, inProgress, completed, inactive, nonJob };
  }, [applications]);

  const chartData = [
    { name: "Action", value: stats.actionRequired, color: APP_COLORS.danger }, // Red
    { name: "In Progress", value: stats.inProgress, color: "#3b82f6" }, // Blue
    { name: "Completed", value: stats.completed, color: APP_COLORS.success }, // Green
    { name: "Inactive", value: stats.inactive, color: "#9ca3af" }, // Gray
    { name: "Non-Job", value: stats.nonJob, color: "#a855f7" }, // Purple
  ].filter((d) => d.value > 0);

  // Group by Company for Bar Chart (Top 5)
  const companyData = useMemo(() => {
    const counts: Record<string, number> = {};
    applications.forEach((app) => {
      counts[app.company] = (counts[app.company] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [applications]);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-text-muted">
        Loading analytics...
      </div>
    );
  }

  // Custom Tooltip to support theme
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface border border-border-base p-3 rounded shadow-lg">
          <p className="font-bold text-text-main">{label}</p>
          <p className="text-text-muted">
            {payload[0].name}: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold text-text-main mb-6">Analytics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-surface p-6 rounded-xl border border-border-base shadow-sm">
          <h3 className="text-lg font-bold text-text-main mb-6">
            Application Status Distribution
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {chartData.map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-sm">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: d.color }}
                />
                <span className="text-text-muted">
                  {d.name} ({d.value})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Companies */}
        <div className="bg-surface p-6 rounded-xl border border-border-base shadow-sm">
          <h3 className="text-lg font-bold text-text-main mb-6">
            Top Companies Applied To
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={companyData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis
                  dataKey="name"
                  stroke="#9ca3af"
                  tick={{ fill: "#9ca3af" }}
                />
                <YAxis stroke="#9ca3af" tick={{ fill: "#9ca3af" }} />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "transparent" }}
                />
                <Bar
                  dataKey="count"
                  fill={APP_COLORS.primary}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Analytics;
