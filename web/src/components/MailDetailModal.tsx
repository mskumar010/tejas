import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, Loader, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import api from "@/services/api";
import toast from "react-hot-toast";

interface MailDetailModalProps {
  isOpen: boolean;
  closeModal: () => void;
  messageId: string | null;
}

interface EmailDetail {
  id: string;
  subject: string;
  from: string;
  date: string;
  body: string;
  snippet: string;
}

const MailDetailModal = ({
  isOpen,
  closeModal,
  messageId,
}: MailDetailModalProps) => {
  const [email, setEmail] = useState<EmailDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && messageId) {
      fetchEmailDetails(messageId);
    } else {
      setEmail(null);
    }
  }, [isOpen, messageId]);

  const fetchEmailDetails = async (id: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/gmail/message/${id}`);
      setEmail(res.data);
    } catch (error) {
      console.error("Failed to fetch email details", error);
      toast.error("Failed to load email content.");
      closeModal();
    } finally {
      setLoading(false);
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
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-surface p-6 text-left align-middle shadow-xl transition-all border border-border-base">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-semibold leading-6 text-text-main"
                  >
                    Email Details
                  </Dialog.Title>
                  <button
                    onClick={closeModal}
                    className="text-text-muted hover:text-text-main transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader className="animate-spin text-primary w-8 h-8" />
                  </div>
                ) : email ? (
                  <div className="space-y-6">
                    {/* Header Info */}
                    <div className="bg-app p-4 rounded-xl space-y-3">
                      <h2 className="text-xl font-bold text-text-main">
                        {email.subject}
                      </h2>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
                        <div className="flex items-center gap-2 text-text-main font-medium">
                          <User size={16} className="text-primary" />
                          {email.from.replace(/<.*>/, "").trim()}
                          <span className="text-text-muted font-normal text-xs">
                            {email.from.match(/<.*>/)?.[0] || ""}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-text-muted">
                          <Calendar size={16} />
                          {format(new Date(email.date), "PPP p")}
                        </div>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="prose dark:prose-invert max-w-none text-text-main bg-white dark:bg-black/20 p-4 rounded-xl border border-border-base min-h-[200px] max-h-[500px] overflow-y-auto whitespace-pre-wrap">
                      {email.body}
                    </div>

                    {/* Footer Actions (Placeholder for future tagging) */}
                    {/* 
                    <div className="flex justify-end gap-3 pt-4 border-t border-border-base">
                       <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90">
                         <Tag size={16} /> Tag as Application
                       </button>
                    </div>
                    */}
                  </div>
                ) : (
                  <div className="text-center text-text-muted py-12">
                    Email not found.
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default MailDetailModal;
