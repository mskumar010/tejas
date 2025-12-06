import {
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  HelpCircle,
} from "lucide-react";

export const STATUS_CATEGORIES = {
  Auto: ["Auto"],
  ACTION_REQUIRED: [
    "Assessment Pending",
    "Interview Tomorrow",
    "Offer Decision",
  ],
  IN_PROGRESS: [
    "Applied",
    "Follow-up Needed",
    "Screening",
    "Interview Scheduled",
  ],
  COMPLETED: ["Accepted", "Offer Received"],
  INACTIVE: [
    "Rejected",
    "No Longer Considering",
    "Cooldown",
    "Archived",
    "Reject",
  ],
  NON_JOB: ["Non-job"],
};

export const getAllStatuses = () => [
  ...STATUS_CATEGORIES.ACTION_REQUIRED,
  ...STATUS_CATEGORIES.IN_PROGRESS,
  ...STATUS_CATEGORIES.COMPLETED,
  ...STATUS_CATEGORIES.INACTIVE,
  ...STATUS_CATEGORIES.NON_JOB,
];

export const getStatusColor = (status: string) => {
  if (STATUS_CATEGORIES.ACTION_REQUIRED.includes(status)) {
    return "bg-warning/10 text-warning border border-warning/20";
  }
  if (STATUS_CATEGORIES.IN_PROGRESS.includes(status)) {
    return "bg-primary/10 text-primary border border-primary/20";
  }
  if (STATUS_CATEGORIES.COMPLETED.includes(status)) {
    return "bg-success/10 text-success border border-success/20";
  }
  if (STATUS_CATEGORIES.INACTIVE.includes(status)) {
    return "bg-secondary/10 text-secondary border border-secondary/20";
  }
  if (STATUS_CATEGORIES.NON_JOB.includes(status)) {
    return "bg-purple-500/10 text-purple-500 border border-purple-500/20";
  }
  return "bg-surface text-text-muted border border-border-base";
};

export const getStatusIcon = (status: string) => {
  if (STATUS_CATEGORIES.ACTION_REQUIRED.includes(status)) return AlertCircle;
  if (STATUS_CATEGORIES.IN_PROGRESS.includes(status)) return Clock; // Or Briefcase for Interview
  if (STATUS_CATEGORIES.COMPLETED.includes(status)) return CheckCircle2;
  if (STATUS_CATEGORIES.INACTIVE.includes(status)) return XCircle;
  if (STATUS_CATEGORIES.NON_JOB.includes(status)) return HelpCircle;

  return Clock;
};
