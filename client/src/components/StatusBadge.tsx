import { Badge } from "@/components/ui/badge";
import type { TicketStatus } from "@shared/schema";
import { Circle, Clock, CheckCircle, XCircle } from "lucide-react";

interface StatusBadgeProps {
  status: TicketStatus;
  className?: string;
}

const statusConfig: Record<TicketStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof Circle; className: string }> = {
  open: {
    label: "Open",
    variant: "outline",
    icon: Circle,
    className: "border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950",
  },
  in_progress: {
    label: "In Progress",
    variant: "outline",
    icon: Clock,
    className: "border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950",
  },
  resolved: {
    label: "Resolved",
    variant: "outline",
    icon: CheckCircle,
    className: "border-green-500 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950",
  },
  closed: {
    label: "Closed",
    variant: "outline",
    icon: XCircle,
    className: "border-gray-500 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800",
  },
};

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={`gap-1.5 font-medium ${config.className} ${className}`}
      data-testid={`badge-status-${status}`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
