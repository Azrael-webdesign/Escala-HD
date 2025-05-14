
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Show loading state
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!user) {
    // Redirect to login page with the return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has the required role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to unauthorized page
    return <Navigate to="/unauthorized" replace />;
  }

  // Render children if all checks pass
  return <>{children}</>;
};

export default ProtectedRoute;
