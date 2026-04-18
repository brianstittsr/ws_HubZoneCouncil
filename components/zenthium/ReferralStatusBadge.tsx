import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ZenthiumReferralStatus } from "@/types/zenthium";

const STATUS_CONFIG: Record<
  ZenthiumReferralStatus,
  { label: string; className: string }
> = {
  Submitted: { label: "Submitted", className: "bg-blue-100 text-blue-700 border-blue-200" },
  "Under Review": { label: "Under Review", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  "Screening Complete": { label: "Screening Complete", className: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  "Follow-Up Requested": { label: "Follow-Up Requested", className: "bg-orange-100 text-orange-700 border-orange-200" },
  "Meeting Scheduled": { label: "Meeting Scheduled", className: "bg-purple-100 text-purple-700 border-purple-200" },
  Accepted: { label: "Accepted", className: "bg-green-100 text-green-700 border-green-200" },
  Declined: { label: "Declined", className: "bg-red-100 text-red-700 border-red-200" },
  Closed: { label: "Closed", className: "bg-slate-100 text-slate-600 border-slate-200" },
};

interface ReferralStatusBadgeProps {
  status: ZenthiumReferralStatus;
  className?: string;
}

export function ReferralStatusBadge({ status, className }: ReferralStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: "bg-slate-100 text-slate-600" };
  return (
    <Badge
      variant="outline"
      className={cn("font-medium text-xs", config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
