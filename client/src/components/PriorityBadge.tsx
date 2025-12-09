import { Badge } from "@/components/ui/badge";
import type { TicketPriority } from "@shared/schema";
import { Flag } from "lucide-react";

interface PriorityBadgeProps {
  priority: TicketPriority;
  className?: string;
}

const priorityConfig: Record<TicketPriority, { label: string; className: string }> = {
  low: {
    label: "Low",
    className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-600",
  },
  medium: {
    label: "Medium",
    className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-300 dark:border-yellow-600",
  },
  high: {
    label: "High",
    className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 border-red-300 dark:border-red-600",
  },
};

export function PriorityBadge({ priority, className = "" }: PriorityBadgeProps) {
  const config = priorityConfig[priority];

  return (
    <Badge
      variant="outline"
      className={`gap-1 font-semibold ${config.className} ${className}`}
      data-testid={`badge-priority-${priority}`}
    >
      <Flag className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
