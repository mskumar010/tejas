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
  LineChart,
  Line,
} from "recharts";
import {
  format,
  eachMonthOfInterval,
  subMonths,
  eachDayOfInterval,
} from "date-fns";

function Analytics() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    const interviews = applications.filter((app) =>
      ["Interviewing", "Technical Interview", "Final Round"].includes(
        app.status
      )
    ).length;

    const offers = applications.filter((app) => app.status === "Offer").length;

    return {
      total,
      actionRequired,
      inProgress,
      completed,
      inactive,
      nonJob,
      interviews,
      offers,
    };
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

  // Group by Month for Line Chart
  const trendData = useMemo(() => {
    if (applications.length === 0) return [];

    const now = new Date();
    const sixMonthsAgo = subMonths(now, 5);
    const months = eachMonthOfInterval({ start: sixMonthsAgo, end: now });

    const grouped = months.map((month) => {
      const monthKey = format(month, "MMM yyyy");
      const count = applications.filter((app) => {
        if (!app.appliedDate) return false;
        const appDate = new Date(app.appliedDate);
        return format(appDate, "MMM yyyy") === monthKey;
      }).length;
      return { name: monthKey, apps: count };
    });

    return grouped;
  }, [applications]);

  // GitHub-style Activity Heatmap Data
  const heatmapData = useMemo(() => {
    const today = new Date();
    // Use last 365 days for a full year view, or 6 months. Let's do 6 months (~26 weeks)
    const startDate = subMonths(today, 6);

    // Adjust start date to the previous Sunday to align grid properly
    // getDay() returns 0 for Sunday.
    // actually, we want the grid to flow Col 1: Sun-Sat.
    // RECHARTS/Grid approach:
    // We want the list to be: [Sun, Mon, Tue, ...].
    // If startDate is Wed, we need [Sun, Mon, Tue] as spacers.

    const dayOfWeek = startDate.getDay(); // 0 (Sun) - 6 (Sat)
    // We don't change startDate, we just prepend spacers in the render loop or array.

    const allDays = eachDayOfInterval({ start: startDate, end: today });

    // Create spacers
    const prefixDays = Array(dayOfWeek).fill(null);
    const gridItems = [...prefixDays, ...allDays];

    const activityMap: Record<string, number> = {};
    applications.forEach((app) => {
      if (app.appliedDate) {
        const dateKey = format(new Date(app.appliedDate), "yyyy-MM-dd");
        activityMap[dateKey] = (activityMap[dateKey] || 0) + 1;
      }
    });

    return { gridItems, activityMap };
  }, [applications]);

  const getColorForCount = (count: number) => {
    if (count === 0) return "bg-app border border-border-base"; // Empty
    // Using primary color opacity for "contribution" feel
    if (count <= 1) return "bg-primary/40 border-primary/40";
    if (count <= 2) return "bg-primary/60 border-primary/60";
    if (count <= 3) return "bg-primary/80 border-primary/80";
    return "bg-primary border-primary";
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-text-muted">
        Loading analytics...
      </div>
    );
  }

  // Custom Tooltip to support theme
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface border border-border-base p-3 rounded shadow-lg z-50">
          <p className="font-bold text-text-main text-sm">{label}</p>
          <p className="text-text-muted text-xs">
            {payload[0].name}: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <section className="space-y-6 p-4 md:p-8">
      <h1 className="text-2xl font-bold text-text-main mb-6">Analytics</h1>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface p-5 rounded-2xl border border-border-base shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-primary/5 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <p className="text-text-muted text-xs font-semibold uppercase tracking-wider">
            Total Applications
          </p>
          <p className="text-3xl font-bold text-text-main mt-2">
            {stats.total}
          </p>
        </div>
        <div className="bg-surface p-5 rounded-2xl border border-border-base shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/5 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <p className="text-text-muted text-xs font-semibold uppercase tracking-wider">
            Interviews
          </p>
          <p className="text-3xl font-bold text-blue-500 mt-2">
            {stats.interviews}
          </p>
        </div>
        <div className="bg-surface p-5 rounded-2xl border border-border-base shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-green-500/5 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <p className="text-text-muted text-xs font-semibold uppercase tracking-wider">
            Offers
          </p>
          <p className="text-3xl font-bold text-green-500 mt-2">
            {stats.offers}
          </p>
        </div>
        <div className="bg-surface p-5 rounded-2xl border border-border-base shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-red-500/5 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <p className="text-text-muted text-xs font-semibold uppercase tracking-wider">
            Action Needed
          </p>
          <p className="text-3xl font-bold text-red-500 mt-2">
            {stats.actionRequired}
          </p>
        </div>
      </div>

      {/* Activity Heatmap */}
      <div className="bg-surface p-6 rounded-2xl border border-border-base shadow-sm overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-text-main">
            Activity Map (Last 6 Months)
          </h3>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span>Less</span>
            <div className="w-3 h-3 rounded bg-app border border-border-base" />
            <div className="w-3 h-3 rounded bg-primary/40" />
            <div className="w-3 h-3 rounded bg-primary/80" />
            <div className="w-3 h-3 rounded bg-primary" />
            <span>More</span>
          </div>
        </div>

        <div className="w-full overflow-x-auto pb-2">
          <div className="inline-flex gap-4">
            {/* Labels */}
            <div className="grid grid-rows-7 gap-1 text-[10px] text-text-muted font-medium h-[100px] py-[2px] pr-2 text-right">
              <span className="leading-[10px]">Sun</span>
              <span className="leading-[10px]">Mon</span>
              <span className="leading-[10px]">Tue</span>
              <span className="leading-[10px]">Wed</span>
              <span className="leading-[10px]">Thu</span>
              <span className="leading-[10px]">Fri</span>
              <span className="leading-[10px]">Sat</span>
            </div>

            {/* Grid */}
            <div className="grid grid-rows-7 grid-flow-col gap-1 h-[100px]">
              {heatmapData.gridItems.map((date, i) => {
                if (!date) {
                  return <div key={`spacer-${i}`} className="w-3 h-3" />;
                }
                const dateKey = format(date, "yyyy-MM-dd");
                const count = heatmapData.activityMap[dateKey] || 0;
                return (
                  <div
                    key={dateKey}
                    title={`${dateKey}: ${count} applications`}
                    className={`w-3 h-3 rounded-sm transition-all hover:scale-125 hover:z-10 relative ${getColorForCount(
                      count
                    )}`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Line Chart: Applications Trend */}
      <div className="bg-surface p-6 rounded-xl border border-border-base shadow-sm min-w-0">
        <h3 className="text-lg font-bold text-text-main mb-6">
          Application Trend (Last 6 Months)
        </h3>
        <div className="h-64 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis
                dataKey="name"
                stroke="#9ca3af"
                tick={{ fill: "#9ca3af" }}
                tickMargin={10}
              />
              <YAxis stroke="#9ca3af" tick={{ fill: "#9ca3af" }} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="apps"
                name="Applications"
                stroke={APP_COLORS.primary}
                strokeWidth={3}
                dot={{ r: 4, fill: APP_COLORS.primary }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-surface p-6 rounded-xl border border-border-base shadow-sm min-w-0">
          <h3 className="text-lg font-bold text-text-main mb-6">
            Application Status Distribution
          </h3>
          <div className="h-64 w-full min-w-0">
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
        <div className="bg-surface p-6 rounded-xl border border-border-base shadow-sm min-w-0">
          <h3 className="text-lg font-bold text-text-main mb-6">
            Top Companies Applied To
          </h3>
          <div className="h-64 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={companyData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis
                  dataKey="name"
                  stroke="#9ca3af"
                  tick={{ fill: "#9ca3af" }}
                />
                <YAxis
                  stroke="#9ca3af"
                  tick={{ fill: "#9ca3af" }}
                  allowDecimals={false}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "transparent" }}
                />
                <Bar
                  dataKey="count"
                  name="Applications"
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
