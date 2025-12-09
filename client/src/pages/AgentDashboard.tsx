import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ticketService } from "@/lib/services";
import { Navigation } from "@/components/Navigation";
import { TicketCard } from "@/components/TicketCard";
import { TicketStats } from "@/components/TicketStats";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { Ticket, TicketStatus, TicketPriority } from "@shared/schema";
import { RefreshCw, Inbox } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

type FilterStatus = "all" | TicketStatus;
type FilterPriority = "all" | TicketPriority;

const statusFilters: { value: FilterStatus; label: string }[] = [
  { value: "all", label: "All Tickets" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const priorityFilters: { value: FilterPriority; label: string }[] = [
  { value: "all", label: "All Priorities" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

function AgentSidebar({ 
  statusFilter, 
  setStatusFilter, 
  priorityFilter, 
  setPriorityFilter,
  ticketCounts 
}: {
  statusFilter: FilterStatus;
  setStatusFilter: (v: FilterStatus) => void;
  priorityFilter: FilterPriority;
  setPriorityFilter: (v: FilterPriority) => void;
  ticketCounts: Record<string, number>;
}) {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Status</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {statusFilters.map((item) => (
                <SidebarMenuItem key={item.value}>
                  <SidebarMenuButton
                    onClick={() => setStatusFilter(item.value)}
                    isActive={statusFilter === item.value}
                    data-testid={`filter-status-${item.value}`}
                  >
                    <span>{item.label}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {ticketCounts[item.value] || 0}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Priority</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {priorityFilters.map((item) => (
                <SidebarMenuItem key={item.value}>
                  <SidebarMenuButton
                    onClick={() => setPriorityFilter(item.value)}
                    isActive={priorityFilter === item.value}
                    data-testid={`filter-priority-${item.value}`}
                  >
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default function AgentDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [priorityFilter, setPriorityFilter] = useState<FilterPriority>("all");

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setIsLoading(true);
    try {
      const data = await ticketService.getAll();
      setTickets(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Could not load tickets",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTickets = tickets.filter(t => {
    const statusMatch = statusFilter === "all" || t.status === statusFilter;
    const priorityMatch = priorityFilter === "all" || t.priority === priorityFilter;
    return statusMatch && priorityMatch;
  });

  const ticketCounts: Record<string, number> = {
    all: tickets.length,
    open: tickets.filter(t => t.status === "open").length,
    in_progress: tickets.filter(t => t.status === "in_progress").length,
    resolved: tickets.filter(t => t.status === "resolved").length,
    closed: tickets.filter(t => t.status === "closed").length,
  };

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  } as React.CSSProperties;

  return (
    <SidebarProvider style={sidebarStyle}>
      <div className="flex h-screen w-full">
        <AgentSidebar
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          ticketCounts={ticketCounts}
        />
        
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <div>
                  <h1 className="text-xl font-semibold">Agent Dashboard</h1>
                  <p className="text-sm text-muted-foreground">
                    Welcome, {user?.name}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={loadTickets}
                disabled={isLoading}
                className="gap-2"
                data-testid="button-refresh"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-4 md:p-6">
            {isLoading ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} className="h-24" />
                  ))}
                </div>
                <div className="space-y-3 mt-8">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Skeleton key={i} className="h-32" />
                  ))}
                </div>
              </div>
            ) : (
              <>
                <TicketStats tickets={tickets} isAgent />

                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium">
                      {statusFilter === "all" ? "All Tickets" : statusFilter.replace("_", " ").replace(/^\w/, c => c.toUpperCase())}
                      {priorityFilter !== "all" && ` - ${priorityFilter.charAt(0).toUpperCase() + priorityFilter.slice(1)} Priority`}
                    </h2>
                    <span className="text-sm text-muted-foreground">
                      {filteredTickets.length} ticket{filteredTickets.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {filteredTickets.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="p-4 rounded-full bg-muted mb-4">
                          <Inbox className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-medium mb-2">No tickets found</h3>
                        <p className="text-sm text-muted-foreground max-w-md">
                          There are no tickets matching your current filters.
                        </p>
                      </div>
                    ) : (
                      filteredTickets.map(ticket => (
                        <TicketCard 
                          key={ticket.id} 
                          ticket={ticket} 
                          showCreator 
                          showAssignee 
                        />
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
