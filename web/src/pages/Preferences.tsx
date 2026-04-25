import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { Download } from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";

function Preferences() {
  const { user } = useSelector((state: RootState) => state.auth);

  if (!user) return null;

  return (
    <section className="max-w-4xl mx-auto space-y-6 p-4 md:p-8">
      <div className="bg-surface p-6 rounded-xl border border-border-base shadow-sm">
        <h2 className="text-xl font-bold text-text-main mb-4">
          Application Preferences
        </h2>
        <p className="text-text-muted">
          Global application preferences will appear here.
        </p>
      </div>

      <div className="bg-surface p-6 rounded-xl border border-border-base shadow-sm">
        <h2 className="text-xl font-bold text-text-main mb-4">
          Export Data
        </h2>
        <p className="text-text-muted mb-4">
          Download a complete backup of all your applications and their statuses in CSV format.
        </p>
        <button
          onClick={async () => {
            try {
              const res = await api.get('/applications/export', { responseType: 'blob' });
              const url = window.URL.createObjectURL(new Blob([res.data]));
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', 'tejas_applications.csv');
              document.body.appendChild(link);
              link.click();
              link.remove();
              toast.success('Export successful');
            } catch (error) {
              console.error(error);
              toast.error('Failed to export data');
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-app border border-border-base text-text-main font-medium rounded-lg hover:border-primary/50 transition-colors"
        >
          <Download size={18} />
          Download CSV
        </button>
      </div>
    </section>
  );
}

export default Preferences;
