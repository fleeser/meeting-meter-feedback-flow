
import { useEffect } from "react";
import { Outlet, Navigate, useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Layout component that handles authentication and provides the app's main layout structure
 * Redirects to login if user is not authenticated
 */
const Layout = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // For debugging authentication state
  useEffect(() => {
    console.log("Auth state in Layout:", { user, loading });
    
    // If user is not authenticated and not loading, redirect to login
    if (!loading && !user) {
      console.log("Not authenticated, redirecting to login");
      navigate("/", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }
  
  // If not loading and no user, show nothing (redirect will happen in useEffect)
  if (!user) {
    return null;
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
