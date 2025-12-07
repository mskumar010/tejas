import { useSelector } from "react-redux";
import type { RootState } from "@/store";

function Profile() {
  // @ts-expect-error - user definition mismatch
  const { user } = useSelector((state: RootState) => state.auth);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentUser = user as any;

  if (!user) return null;

  return (
    <section className="max-w-2xl mx-auto space-y-6 p-4 md:p-8">
      <div className="bg-surface p-8 rounded-xl border border-border-base shadow-sm text-center">
        <div className="w-24 h-24 bg-primary/10 text-primary text-4xl font-bold rounded-full flex items-center justify-center mx-auto mb-4">
          {currentUser.email?.charAt(0).toUpperCase()}
        </div>
        <h1 className="text-2xl font-bold text-text-main">
          {currentUser.name || "User Profile"}
        </h1>
        <p className="text-text-muted mb-6">{currentUser.email}</p>

        <div className="border-t border-border-base pt-6 text-left">
          <h3 className="text-lg font-semibold text-text-main mb-4">
            Personal Details
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-muted">
                Email Address
              </label>
              <p className="mt-1 text-text-main">{currentUser.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted">
                Member Since
              </label>
              <p className="mt-1 text-text-main">
                {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Profile;
