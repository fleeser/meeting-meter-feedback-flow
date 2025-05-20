
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';

/**
 * Authentication context interface definition
 */
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

/**
 * Create the authentication context with default values
 */
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
});

/**
 * Custom hook to access the authentication context
 */
export const useAuth = () => useContext(AuthContext);

/**
 * Auth provider component to wrap the application
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /**
   * Initialize auth state from Supabase session
   */
  useEffect(() => {
    // Check current authentication state
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error initializing auth:', error);
          return;
        }
        
        if (session?.user) {
          // Get user profile data
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profileData) {
            const userData: User = {
              id: profileData.id,
              name: profileData.name,
              email: profileData.email,
              role: profileData.role as "Admin" | "Moderator" | "User",
              department: profileData.department || undefined,
              position: profileData.position || undefined,
              active: profileData.active,
              joinDate: profileData.join_date || undefined,
              profileImage: profileData.profile_image || undefined,
            };
            
            setUser(userData);
            localStorage.setItem('surveyToolUser', JSON.stringify(userData));
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Listen for authentication state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Get user profile data
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (profileData) {
          const userData: User = {
            id: profileData.id,
            name: profileData.name,
            email: profileData.email,
            role: profileData.role as "Admin" | "Moderator" | "User",
            department: profileData.department || undefined,
            position: profileData.position || undefined,
            active: profileData.active,
            joinDate: profileData.join_date || undefined,
            profileImage: profileData.profile_image || undefined,
          };
          
          setUser(userData);
          localStorage.setItem('surveyToolUser', JSON.stringify(userData));
        }
      }
      
      if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('surveyToolUser');
        navigate('/');
      }
    });
    
    initializeAuth();
    
    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  /**
   * Sign in with email and password
   */
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  /**
   * Sign out the current user
   */
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: "Sign out failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      localStorage.removeItem('surveyToolUser');
      setUser(null);
      
      toast({
        title: "Signed out successfully",
      });
      
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
