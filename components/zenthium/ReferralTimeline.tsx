import { cn } from "@/lib/utils";
import { ReferralStatusBadge } from "./ReferralStatusBadge";
import type { ZenthiumReferralStatus } from "@/types/zenthium";

interface TimelineEntry {
  id: string;
  previousStatus: ZenthiumReferralStatus | null;
  newStatus: ZenthiumReferralStatus;
  changedBy: string;
  note?: string;
  createdAt: string;
}

interface ReferralTimelineProps {
  entries: TimelineEntry[];
}

export function ReferralTimeline({ entries }: ReferralTimelineProps) {
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground py-4">No status history yet.</p>;
  }

  return (
    <ol className="relative border-l border-border ml-3 space-y-6">
      {entries.map((entry, index) => (
        <li key={entry.id} className="ml-6">
          <span
            className={cn(
              "absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-background",
              index === 0 ? "bg-primary" : "bg-muted"
            )}
          >
            <span className="h-2 w-2 rounded-full bg-white" />
          </span>
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <ReferralStatusBadge status={entry.newStatus} />
              {entry.previousStatus && (
                <span className="text-xs text-muted-foreground">
                  from <span className="font-medium">{entry.previousStatus}</span>
                </span>
              )}
            </div>
            {entry.note && (
              <p className="text-sm text-foreground">{entry.note}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {entry.changedBy} &middot;{" "}
              {new Date(entry.createdAt).toLocaleString()}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
