import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: string; // Tailwind text color class, e.g., "text-blue-500"
  bgColor?: string; // Tailwind bg color class, e.g., "bg-blue-100 dark:bg-blue-900/20"
  trend?: string;
  onClick?: () => void;
}

const StatsCard = ({
  title,
  value,
  icon: Icon,
  color = "text-primary",
  bgColor = "bg-primary/10",
  trend,
  onClick,
}: StatsCardProps) => {
  return (
    <div
      onClick={onClick}
      className={`bg-surface p-6 rounded-xl shadow-sm border border-border-base transition-all hover:shadow-md ${
        onClick ? "cursor-pointer hover:border-primary/50" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-text-muted mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-text-main">{value}</h3>
          {trend && (
            <p className="text-xs mt-1 text-success font-medium">{trend}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <Icon className={color} size={24} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
