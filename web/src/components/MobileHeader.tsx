import { Menu } from "lucide-react";

interface MobileHeaderProps {
  onMenuClick: () => void;
}

const MobileHeader = ({ onMenuClick }: MobileHeaderProps) => {
  return (
    <header className="bg-surface border-b border-border-base p-4 flex items-center justify-between md:hidden">
      <div className="flex items-center gap-2">
        <img src="/logo.svg" alt="Tejas Logo" className="w-8 h-8" />
        <span className="text-xl font-bold text-text-main">Tejas</span>
      </div>
      <button onClick={onMenuClick} className="text-text-muted">
        <Menu size={24} />
      </button>
    </header>
  );
};

export default MobileHeader;
