import { useSelector } from "react-redux";
import type { RootState } from "@/store";

function Preferences() {
  // @ts-ignore
  const { user } = useSelector((state: RootState) => state.auth);

  if (!user) return null;

  return (
    <section className="max-w-4xl mx-auto space-y-6 p-4 md:p-8">
      <div className="bg-surface p-6 rounded-xl border border-border-base shadow-sm">
        <h2 className="text-xl font-bold text-text-main mb-4">
          Application Preferences
        </h2>
        <p className="text-text-muted">
          Global application settings will appear here.
        </p>
      </div>
    </section>
  );
}

export default Preferences;
