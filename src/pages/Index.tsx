
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Index page that serves as the authentication landing page
 * Provides login functionality with Supabase authentication
 */
const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, user } = useAuth();

  // Redirect if user is already authenticated
  useEffect(() => {
    if (user) {
      console.log("User is authenticated, redirecting to /app");
      navigate("/app");
    }
  }, [user, navigate]);

  /**
   * Handle user login with Supabase authentication
   * @param email User email
   * @param password User password
   */
  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      await signIn(email, password);
      toast({
        title: "Login successful",
        description: "Welcome back to the Meeting Survey Tool!",
      });
      // Navigation is now handled by the useEffect hook above
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary-blue to-accent-teal">
      <header className="w-full p-6">
        <h1 className="text-2xl font-bold text-white">Meeting Survey Tool</h1>
      </header>
      
      <main className="flex-grow flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-center text-secondary-dark">
              Welcome Back
            </h2>
            
            <LoginForm onLogin={handleLogin} isLoading={isLoading} />
          </div>
        </div>
      </main>
      
      <footer className="p-4 text-center text-white text-sm">
        <p>&copy; 2025 Meeting Survey Tool. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
