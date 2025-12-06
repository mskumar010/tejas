import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Mail, Building2, Menu } from "lucide-react";

interface MobileBottomNavProps {
  onMenuClick: () => void;
}

const MobileBottomNav = ({ onMenuClick }: MobileBottomNavProps) => {
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", label: "Home", icon: LayoutDashboard },
    { path: "/mail", label: "Mail", icon: Mail },
    { path: "/companies", label: "Jobs", icon: Building2 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-xl border-t border-border-base z-30 md:hidden pb-safe">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 ${
                isActive
                  ? "text-primary"
                  : "text-text-muted hover:text-text-main"
              }`}
            >
              <Icon size={20} className={isActive ? "fill-primary/20" : ""} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}

        {/* Menu Button */}
        <button
          onClick={onMenuClick}
          className="flex flex-col items-center justify-center w-full h-full gap-1 text-text-muted hover:text-text-main"
        >
          <Menu size={20} />
          <span className="text-[10px] font-medium">Menu</span>
        </button>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
