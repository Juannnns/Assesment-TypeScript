import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from "@/pages/Login";
import ClientDashboard from "@/pages/ClientDashboard";
import AgentDashboard from "@/pages/AgentDashboard";
import CreateTicket from "@/pages/CreateTicket";
import TicketDetail from "@/pages/TicketDetail";
import NotFound from "@/pages/not-found";

function HomeRedirect() {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }
  
  return <Redirect to={user?.role === "agent" ? "/agent" : "/client"} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomeRedirect} />
      <Route path="/login" component={Login} />
      
      <Route path="/client">
        <ProtectedRoute allowedRoles={["client"]}>
          <ClientDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/agent">
        <ProtectedRoute allowedRoles={["agent"]}>
          <AgentDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/ticket/new">
        <ProtectedRoute allowedRoles={["client"]}>
          <CreateTicket />
        </ProtectedRoute>
      </Route>
      
      <Route path="/ticket/:id">
        <ProtectedRoute>
          <TicketDetail />
        </ProtectedRoute>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
