import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  LogOut,
  Mail,
  Building2,
  BarChart2,
  Settings,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { logout, reset } from "@/features/auth/authSlice";
import type { AppDispatch, RootState } from "@/store";
import { ThemeToggle } from "@/components/ThemeToggle";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  // @ts-ignore
  const { user, isLoading } = useSelector((state: RootState) => state.auth);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate("/login");
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/mail", label: "Email Viewer", icon: Mail },
    { path: "/companies", label: "Companies", icon: Building2 },
    { path: "/analytics", label: "Analytics", icon: BarChart2 },
    { path: "/preferences", label: "Preferences", icon: Settings },
  ];

  /* Skeleton Loading State */
  if (isLoading || !user) {
    return (
      <aside className="w-64 bg-surface dark:bg-app border-r border-border-base min-h-screen flex flex-col p-6 space-y-8 transition-colors duration-200">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-skeleton-base animate-pulse" />
            <div className="w-20 h-6 bg-skeleton-base rounded animate-pulse" />
          </div>
          <div className="w-8 h-8 bg-skeleton-base rounded-lg animate-pulse" />
        </div>

        {/* Nav Skeleton */}
        <div className="space-y-3 flex-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-10 w-full bg-skeleton-highlight rounded-lg animate-pulse"
            />
          ))}
        </div>

        {/* Footer Skeleton */}
        <div className="space-y-4 pt-4 border-t border-border-base">
          <div className="h-14 w-full bg-skeleton-highlight rounded-lg animate-pulse" />
          <div className="h-10 w-full bg-skeleton-highlight rounded-lg animate-pulse" />
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-surface dark:bg-app border-r border-border-base min-h-screen flex flex-col transition-colors duration-200">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="Tejas Logo" className="w-8 h-8" />
          <span className="text-xl font-bold text-text-main">Tejas</span>
        </div>
        <ThemeToggle />
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary border-l-4 border-primary"
                  : "text-text-muted hover:bg-app dark:hover:bg-surface hover:text-text-main"
              }`}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border-base space-y-4">
        {/* Clickable Profile Section */}
        <div
          onClick={() => navigate("/profile")}
          className="flex items-center gap-3 px-4 py-3 bg-app dark:bg-surface rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
            {user.email.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-main truncate">
              {user.email}
            </p>
            <p className="text-xs text-text-muted">View Profile</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-danger hover:bg-red-700 rounded-lg transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
