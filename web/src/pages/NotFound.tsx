import { useNavigate } from "react-router-dom";
import { Ghost, Home } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-app flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="relative inline-block">
          <Ghost size={120} className="text-text-muted/20" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl font-bold text-text-muted">
            404
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-text-main">Page Not Found</h1>
          <p className="text-text-muted">
            The page you are looking for might have been removed, had its name
            changed, or is temporarily unavailable.
          </p>
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:opacity-90 text-white rounded-xl transition-all shadow-md shadow-primary/20 font-medium active:scale-95"
        >
          <Home size={20} />
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default NotFound;
