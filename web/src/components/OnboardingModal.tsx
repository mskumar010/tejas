import { useState } from "react";
import { useDispatch } from "react-redux";
import { completeOnboarding } from "@/features/auth/authSlice";
import type { AppDispatch } from "@/store";
import { Dialog } from "@headlessui/react";
import { Target, Search, CalendarDays } from "lucide-react";
import toast from "react-hot-toast";

interface OnboardingModalProps {
  isOpen: boolean;
}

export const OnboardingModal = ({ isOpen }: OnboardingModalProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [scanDepth, setScanDepth] = useState("");
  const [volume, setVolume] = useState("");
  const [goal, setGoal] = useState("");

  const handleComplete = async () => {
    if (!scanDepth || !volume || !goal) return;

    setLoading(true);
    try {
      await dispatch(
        completeOnboarding({ scanDepthDays: parseInt(scanDepth, 10), applicationVolume: volume, goal })
      ).unwrap();
      toast.success("Welcome to TEJAS!");
    } catch (err) {
      toast.error("Failed to complete onboarding.");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step === 1 && scanDepth) setStep(2);
    else if (step === 2 && volume) setStep(3);
    else if (step === 3 && goal) handleComplete();
  };

  return (
    <Dialog open={isOpen} onClose={() => {}} className="relative z-50">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto w-full max-w-lg rounded-2xl bg-surface border border-border-base shadow-2xl p-6 transition-all">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-text-main mb-2">
              Welcome to TEJAS
            </h2>
            <p className="text-sm text-text-muted">
              Let's set up your workspace. This only takes a few seconds.
            </p>
          </div>

          <div className="space-y-6">
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <CalendarDays size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-text-main">
                    How far back should we scan?
                  </h3>
                </div>
                
                <div className="grid gap-3">
                  {[
                    { label: "Last 30 days", value: "30" },
                    { label: "Last 3 months", value: "90" },
                    { label: "Last 6 months", value: "180" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setScanDepth(option.value)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        scanDepth === option.value
                          ? "border-primary bg-primary/5 text-primary shadow-sm"
                          : "border-border-base bg-app text-text-main hover:border-text-muted"
                      }`}
                    >
                      <span className="font-medium">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Search size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-text-main">
                    Roughly how many jobs do you apply to per week?
                  </h3>
                </div>

                <div className="grid gap-3">
                  {[
                    { label: "1–5", desc: "Selective", value: "1-5" },
                    { label: "5–15", desc: "Active", value: "5-15" },
                    { label: "15+", desc: "Aggressive", value: "15+" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setVolume(option.value)}
                      className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                        volume === option.value
                          ? "border-primary bg-primary/5 text-primary shadow-sm"
                          : "border-border-base bg-app text-text-main hover:border-text-muted"
                      }`}
                    >
                      <span className="font-medium">{option.label}</span>
                      <span className={`text-sm ${volume === option.value ? "text-primary" : "text-text-muted"}`}>{option.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Target size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-text-main">
                    What is your primary goal with TEJAS?
                  </h3>
                </div>

                <div className="grid gap-3">
                  {[
                    { label: "Track my applications", value: "Track applications" },
                    { label: "Never miss an interview", value: "Never miss an interview" },
                    { label: "Automate follow-ups", value: "Automate follow-ups" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setGoal(option.value)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        goal === option.value
                          ? "border-primary bg-primary/5 text-primary shadow-sm"
                          : "border-border-base bg-app text-text-main hover:border-text-muted"
                      }`}
                    >
                      <span className="font-medium">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-border-base">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-5 py-2.5 rounded-lg font-medium text-text-muted hover:bg-app transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={
                (step === 1 && !scanDepth) ||
                (step === 2 && !volume) ||
                (step === 3 && !goal) ||
                loading
              }
              className="px-6 py-2.5 rounded-lg font-medium bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? "Saving..." : step === 3 ? "Complete Setup" : "Next"}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
