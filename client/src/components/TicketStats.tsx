import { Card, CardContent } from "@/components/ui/card";
import type { Ticket, TicketStatus } from "@shared/schema";
import { Ticket as TicketIcon, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface TicketStatsProps {
  tickets: Ticket[];
  isAgent?: boolean;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: typeof TicketIcon;
  className?: string;
}

function StatCard({ title, value, icon: Icon, className = "" }: StatCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-muted">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-semibold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TicketStats({ tickets, isAgent = false }: TicketStatsProps) {
  const countByStatus = (status: TicketStatus) => 
    tickets.filter(t => t.status === status).length;

  const countUnassigned = () => 
    tickets.filter(t => !t.assignedToId).length;

  const countHighPriority = () => 
    tickets.filter(t => t.priority === "high" && t.status !== "closed").length;

  if (isAgent) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Tickets"
          value={tickets.length}
          icon={TicketIcon}
        />
        <StatCard
          title="Unassigned"
          value={countUnassigned()}
          icon={AlertTriangle}
        />
        <StatCard
          title="High Priority"
          value={countHighPriority()}
          icon={Clock}
        />
        <StatCard
          title="Resolved"
          value={countByStatus("resolved")}
          icon={CheckCircle}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard
        title="Open"
        value={countByStatus("open")}
        icon={TicketIcon}
      />
      <StatCard
        title="In Progress"
        value={countByStatus("in_progress")}
        icon={Clock}
      />
      <StatCard
        title="Resolved"
        value={countByStatus("resolved") + countByStatus("closed")}
        icon={CheckCircle}
      />
    </div>
  );
}
