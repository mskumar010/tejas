import { Menu } from "lucide-react";

interface MobileHeaderProps {
  onMenuClick: () => void;
}

const MobileHeader = ({ onMenuClick }: MobileHeaderProps) => {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between md:hidden">
      <div className="flex items-center gap-2">
        <img src="/logo.svg" alt="Tejas Logo" className="w-8 h-8" />
        <span className="text-xl font-bold text-gray-900 dark:text-white">
          Tejas
        </span>
      </div>
      <button
        onClick={onMenuClick}
        className="text-gray-600 dark:text-gray-300"
      >
        <Menu size={24} />
      </button>
    </header>
  );
};

export default MobileHeader;
