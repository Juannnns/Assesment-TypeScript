import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Ticket, 
  LogOut, 
  User as UserIcon,
  LayoutDashboard
} from "lucide-react";

export function Navigation() {
  const { user, logout, isClient, isAgent } = useAuth();
  const [location] = useLocation();

  if (!user) return null;

  const dashboardPath = isClient ? "/client" : "/agent";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Link href={dashboardPath} className="flex items-center gap-2">
            <Ticket className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg hidden sm:inline">HelpDeskPro</span>
          </Link>
        </div>

        <nav className="flex items-center gap-2">
          <Link href={dashboardPath}>
            <Button
              variant={location === dashboardPath ? "secondary" : "ghost"}
              size="sm"
              className="gap-2"
              data-testid="link-dashboard"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium hidden md:inline">{user.name}</span>
            <Badge variant={isAgent ? "default" : "secondary"} className="text-xs">
              {user.role}
            </Badge>
          </div>
          
          <ThemeToggle />
          
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            data-testid="button-logout"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
