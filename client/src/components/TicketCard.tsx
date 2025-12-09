import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { PriorityBadge } from "./PriorityBadge";
import type { Ticket } from "@shared/schema";
import { Calendar, User, Eye, MessageSquare } from "lucide-react";
import { format } from "date-fns";

interface TicketCardProps {
  ticket: Ticket;
  showAssignee?: boolean;
  showCreator?: boolean;
}

export function TicketCard({ ticket, showAssignee = false, showCreator = false }: TicketCardProps) {
  const statusBorderColors: Record<string, string> = {
    open: "border-l-blue-500",
    in_progress: "border-l-amber-500",
    resolved: "border-l-green-500",
    closed: "border-l-gray-500",
  };

  return (
    <Card
      className={`hover-elevate border-l-4 ${statusBorderColors[ticket.status]} transition-all`}
      data-testid={`card-ticket-${ticket.id}`}
    >
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-lg truncate" data-testid={`text-ticket-title-${ticket.id}`}>
                {ticket.title}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <span className="font-mono">#{ticket.id.slice(0, 8)}</span>
                <span className="text-muted-foreground/50">|</span>
                <Calendar className="h-3.5 w-3.5" />
                <span>{format(new Date(ticket.createdAt), "MMM d, yyyy")}</span>
              </div>
            </div>
            <PriorityBadge priority={ticket.priority} />
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {ticket.description}
          </p>

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
              <StatusBadge status={ticket.status} />
              
              {showCreator && ticket.createdBy && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                  <span>{ticket.createdBy.name}</span>
                </div>
              )}

              {showAssignee && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                  <span>{ticket.assignedTo?.name || "Unassigned"}</span>
                </div>
              )}

              {ticket.comments && ticket.comments.length > 0 && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>{ticket.comments.length}</span>
                </div>
              )}
            </div>

            <Link href={`/ticket/${ticket.id}`}>
              <Button variant="ghost" size="sm" className="gap-2" data-testid={`button-view-ticket-${ticket.id}`}>
                <Eye className="h-4 w-4" />
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
