import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@shared/schema";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        setLocation("/login");
      } else if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on role
        if (user.role === "client") {
          setLocation("/client");
        } else {
          setLocation("/agent");
        }
      }
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
