import { useState, useEffect } from "react";
import api from "@/services/api";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Loader } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  subject: string;
  from: string;
  date: string;
  isTagged: boolean;
  relatedAppId?: string;
}

const MailList = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<GmailMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null); // For showing spinner on click
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(
    undefined
  );

  // We keep a history of tokens to allow "Previous" functionality
  // Stack of page tokens: [undefined (page 1), "tokenA" (page 2), "tokenB" (page 3)]
  // Current page index points to the token used to fetch current page.
  const [tokenStack, setTokenStack] = useState<(string | undefined)[]>([
    undefined,
  ]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const fetchMessages = async (pageToken?: string) => {
    setLoading(true);
    try {
      const res = await api.get("/gmail/messages", {
        params: {
          pageToken: pageToken,
          maxResults: 20, // 20 per page for speed
        },
      });

      setMessages(res.data.messages);
      setNextPageToken(res.data.nextPageToken);
    } catch (error) {
      console.error("Failed to fetch emails", error);
      toast.error("Failed to load Gmail inbox.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial load
    fetchMessages(undefined);
  }, []);

  const handleNext = () => {
    if (nextPageToken) {
      const nextIndex = currentPageIndex + 1;
      // If we are moving forward to a new page we haven't visited in this session
      if (nextIndex >= tokenStack.length) {
        setTokenStack([...tokenStack, nextPageToken]);
      }
      setCurrentPageIndex(nextIndex);
      fetchMessages(nextPageToken);
    }
  };

  const handlePrev = () => {
    if (currentPageIndex > 0) {
      const prevIndex = currentPageIndex - 1;
      setCurrentPageIndex(prevIndex);
      // Fetch using the token stored for that page index
      fetchMessages(tokenStack[prevIndex]);
    }
  };

  const handleEmailClick = async (msg: GmailMessage) => {
    // If it's already tagged, navigate to the tracked application
    if (msg.isTagged && msg.relatedAppId) {
      navigate(`/mail/${msg.relatedAppId}`);
      return;
    }

    // "Click to Tag & Move" logic
    setProcessingId(msg.id);
    const toastId = toast.loading("Importing email...");

    try {
      const res = await api.post("/gmail/import", { id: msg.id });
      const { appId } = res.data;

      toast.success("Imported to tracked applications", { id: toastId });

      // Navigate to the main mail view for this new app
      navigate(`/mail/${appId}`);
    } catch (error) {
      console.error("Import failed", error);
      toast.error("Failed to import email", { id: toastId });
      setProcessingId(null);
    }
  };

  // Filter out tagged messages to implement "Inbox Zero" style
  // The user requested: "it shouldnt be there anymore" (in inbox)
  const displayMessages = messages.filter((msg) => !msg.isTagged);

  if (loading && messages.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* List */}
      <div className="bg-surface rounded-2xl shadow-sm border border-border-base divide-y divide-border-base overflow-hidden">
        {displayMessages.map((msg) => (
          <div
            key={msg.id}
            onClick={() => !processingId && handleEmailClick(msg)}
            className={`group p-4 hover:bg-app transition-colors cursor-pointer flex gap-4 items-start ${
              processingId === msg.id ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            {/* Icon / Status */}
            <div className={`mt-1 shrink-0 text-text-muted opacity-50`}>
              {processingId === msg.id ? (
                <Loader className="animate-spin" size={20} />
              ) : (
                // <div className="w-5 h-5 rounded-full border border-current" />
                <></>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h4 className={`text-sm font-semibold truncate text-text-main`}>
                  {msg.from.replace(/<.*>/, "").trim()}
                </h4>
                <span className="text-xs text-text-muted shrink-0 ml-2">
                  {msg.date ? format(new Date(msg.date), "MMM d, h:mm a") : ""}
                </span>
              </div>
              <p className="font-medium text-text-main text-sm truncate">
                {msg.subject}
              </p>
              <p className="text-xs text-text-muted line-clamp-1">
                {msg.snippet}
              </p>
            </div>
          </div>
        ))}

        {displayMessages.length === 0 && !loading && (
          <div className="p-8 text-center text-text-muted">
            {messages.length > 0 ? (
              <p>All emails on this page are already tracked!</p>
            ) : (
              <p>No emails found.</p>
            )}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-2">
        <button
          onClick={handlePrev}
          disabled={currentPageIndex === 0 || loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-surface disabled:opacity-30 disabled:hover:bg-transparent text-sm font-medium"
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        <span className="text-xs text-text-muted font-medium">
          Page {currentPageIndex + 1}
        </span>

        <button
          onClick={handleNext}
          disabled={!nextPageToken || loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-surface disabled:opacity-30 disabled:hover:bg-transparent text-sm font-medium"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default MailList;
