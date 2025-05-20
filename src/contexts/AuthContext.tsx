
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';
import { Session } from '@supabase/supabase-js';

/**
 * Authentication context interface definition
 */
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

/**
 * Create the authentication context with default values
 */
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
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
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /**
   * Initialize auth state from Supabase session
   */
  useEffect(() => {
    console.log("AuthProvider: Initializing auth state");
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession?.user?.id);
        
        setSession(currentSession);
        
        if (currentSession?.user) {
          // Get user profile data
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentSession.user.id)
            .single();
            
          if (profileError) {
            console.error('Error fetching profile:', profileError);
            return;
          }
            
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
            console.log("User profile set:", userData);
          }
        } else {
          setUser(null);
          console.log("User session cleared");
        }
      }
    );
    
    // THEN check for existing session
    const checkSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking session:', error);
          setLoading(false);
          return;
        }
        
        console.log("Initial session check:", currentSession?.user?.id);
        
        if (currentSession?.user) {
          // Get user profile data
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentSession.user.id)
            .single();
            
          if (profileError) {
            console.error('Error fetching profile:', profileError);
            setLoading(false);
            return;
          }
            
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
            setSession(currentSession);
            console.log("Initial user profile set:", userData);
          }
        }
      } catch (err) {
        console.error('Session initialization error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
    
    // Cleanup subscription
    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Sign in with email and password
   */
  const signIn = async (email: string, password: string) => {
    console.log("Attempting sign in with:", email);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error("Sign in error:", error.message);
        throw error;
      }
      
      console.log("Sign in successful, session:", data.session?.user?.id);
      
      // Explicitly navigate to app route after successful login
      navigate("/app");
      
      return data;
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
        console.error("Sign out error:", error.message);
        throw error;
      }
      
      setUser(null);
      setSession(null);
      
      toast({
        title: "Signed out successfully",
      });
      
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
