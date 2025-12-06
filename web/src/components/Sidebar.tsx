import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, LogOut, Mail } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { logout, reset } from "../features/auth/authSlice";
import type { AppDispatch, RootState } from "../store";
import { ThemeToggle } from "./ThemeToggle";

const Sidebar = () => {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  // @ts-ignore
  const { user } = useSelector((state: RootState) => state.auth);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/mail", label: "Mail View", icon: Mail },
    // { path: "/applications", label: "Applications", icon: List },
  ];

  if (!user) return null;

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen flex flex-col transition-colors duration-200">
      <div className="p-6">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="Tejas Logo" className="w-8 h-8" />
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            Tejas
          </span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-400"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              }`}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
            {user.email.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-200 truncate">
              {user.email}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>
        <div className="mt-4 flex justify-center">
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
