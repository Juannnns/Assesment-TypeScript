import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { ticketService } from "@/lib/services";
import { Navigation } from "@/components/Navigation";
import { TicketCard } from "@/components/TicketCard";
import { TicketStats } from "@/components/TicketStats";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { Ticket, TicketStatus } from "@shared/schema";
import { Plus, Ticket as TicketIcon, Inbox } from "lucide-react";

type FilterStatus = "all" | TicketStatus;

export default function ClientDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("all");

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const data = await ticketService.getMyTickets();
      setTickets(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Could not load your tickets",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTickets = filter === "all" 
    ? tickets 
    : tickets.filter(t => t.status === filter);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-semibold">My Tickets</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {user?.name}
            </p>
          </div>
          <Link href="/ticket/new">
            <Button className="gap-2" data-testid="button-create-ticket">
              <Plus className="h-4 w-4" />
              Create New Ticket
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
            <Skeleton className="h-12 w-80" />
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          </div>
        ) : (
          <>
            <TicketStats tickets={tickets} />

            <div className="mt-8">
              <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterStatus)}>
                <TabsList>
                  <TabsTrigger value="all" data-testid="filter-all">
                    All ({tickets.length})
                  </TabsTrigger>
                  <TabsTrigger value="open" data-testid="filter-open">
                    Open ({tickets.filter(t => t.status === "open").length})
                  </TabsTrigger>
                  <TabsTrigger value="in_progress" data-testid="filter-in-progress">
                    In Progress ({tickets.filter(t => t.status === "in_progress").length})
                  </TabsTrigger>
                  <TabsTrigger value="resolved" data-testid="filter-resolved">
                    Resolved ({tickets.filter(t => t.status === "resolved" || t.status === "closed").length})
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="mt-6 space-y-3">
                {filteredTickets.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="p-4 rounded-full bg-muted mb-4">
                      <Inbox className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">No tickets found</h3>
                    <p className="text-sm text-muted-foreground max-w-md mb-6">
                      {filter === "all" 
                        ? "You haven't created any support tickets yet. Click the button below to create your first ticket."
                        : `You don't have any ${filter.replace("_", " ")} tickets.`
                      }
                    </p>
                    {filter === "all" && (
                      <Link href="/ticket/new">
                        <Button className="gap-2">
                          <Plus className="h-4 w-4" />
                          Create Your First Ticket
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  filteredTickets.map(ticket => (
                    <TicketCard key={ticket.id} ticket={ticket} />
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
