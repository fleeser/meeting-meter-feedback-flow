
import { useEffect } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Layout component that handles authentication and provides the app's main layout structure
 * Redirects to login if user is not authenticated
 */
const Layout = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // For debugging authentication state
  useEffect(() => {
    console.log("Auth state in Layout:", { user, loading });
  }, [user, loading]);

  // Redirect to login if not authenticated
  if (!loading && !user) {
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Navbar user={user} />
      
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
