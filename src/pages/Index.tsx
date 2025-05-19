
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    
    // This would be replaced with an actual API call in a real app
    setTimeout(() => {
      setIsLoading(false);
      
      // Simulating successful login for demo purposes
      if (email === "demo@example.com" && password === "password") {
        // Store auth in localStorage (in real app, use secure storage)
        localStorage.setItem("surveyToolUser", JSON.stringify({
          name: "Demo User",
          email,
          id: "user-1"
        }));
        
        toast({
          title: "Login successful",
          description: "Welcome back to the Survey Tool!",
        });
        
        navigate("/app");
      } else {
        toast({
          title: "Login failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        });
      }
    }, 1000);
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
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                For demo purposes, use:
                <br />
                Email: demo@example.com
                <br />
                Password: password
              </p>
            </div>
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
