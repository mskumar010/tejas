import { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, Save, FileText, Loader } from "lucide-react";
import api from "@/services/api";
import { toast } from "react-hot-toast";
import { STATUS_CATEGORIES } from "@/utils/statusUtils.tsx";

interface ManualEmailModalProps {
  isOpen: boolean;
  closeModal: () => void;
  onSave: () => void;
}

const ManualEmailModal = ({
  isOpen,
  closeModal,
  onSave,
}: ManualEmailModalProps) => {
  const [emailBody, setEmailBody] = useState("");
  const [status, setStatus] = useState("Auto-detect"); // Default to Applied
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailBody.trim()) {
      toast.error("Please paste the email content");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Analyzing and saving...");

    try {
      // Send the raw body. The backend will parse it.
      // We send "Manual Entry" as subject/sender placeholders if not extracted by client (which we aren't doing here to keep it simple)
      const payload = {
        status,
        emailContent: {
          subject: "Manual Entry", // Placeholder, parser will try to find better info in body or fallback
          sender: "Manual Input",
          snippet: emailBody.substring(0, 200),
          body: emailBody, // The full pasted content
        },
      };

      await api.post("/applications/manual", payload);

      toast.success("Application added successfully!", { id: toastId });
      setEmailBody("");
      setStatus("Applied");
      onSave();
      closeModal();
    } catch (error) {
      console.error(error);
      toast.error("Failed to add application", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-surface p-6 text-left align-middle shadow-xl transition-all border border-border-base">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-bold leading-6 text-text-main"
                  >
                    Add Manual Entry
                  </Dialog.Title>
                  <button
                    onClick={closeModal}
                    className="text-text-muted hover:text-text-main transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Content Input - The main focus */}
                  <div>
                    <label
                      htmlFor="emailBody"
                      className="block text-sm font-medium text-text-main mb-2"
                    >
                      Paste Email Content
                    </label>
                    <div className="relative">
                      <textarea
                        id="emailBody"
                        rows={12}
                        className="block w-full rounded-xl border-border-base bg-app text-text-main shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-4 font-mono text-xs"
                        placeholder="Paste the full email here (Headers, Subject, Body)..."
                        value={emailBody}
                        onChange={(e) => setEmailBody(e.target.value)}
                        required
                      />
                      <div className="absolute top-3 right-3 text-text-muted pointer-events-none">
                        <FileText size={20} />
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-text-muted">
                      We'll analyze this text to detect the Company, Role, and
                      details automatically.
                    </p>
                  </div>

                  {/* Status Section Selection */}
                  <div>
                    <label
                      htmlFor="status"
                      className="block text-sm font-medium text-text-main mb-2"
                    >
                      Status Section
                    </label>
                    <select
                      id="status"
                      className="block w-full rounded-xl border-border-base bg-surface text-text-main shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-3 px-4"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      {Object.entries(STATUS_CATEGORIES).map(
                        ([category, statuses]) => (
                          <optgroup
                            key={category}
                            label={category.replace("_", " ")}
                          >
                            {statuses.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </optgroup>
                        )
                      )}
                    </select>
                  </div>

                  <div className="mt-8 flex justify-end gap-3">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-text-main bg-surface border border-border-base rounded-lg hover:bg-app transition-colors"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-primary hover:opacity-90 rounded-lg transition-all shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader className="animate-spin" size={18} />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Save size={18} />
                          Save Application
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ManualEmailModal;
