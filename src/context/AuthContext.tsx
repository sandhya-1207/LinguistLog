import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { LocalStore } from '../services/storageService';

interface CustomUser {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
  };
}

interface AuthContextType {
  user: CustomUser | User | null;
  session: Session | null;
  loading: boolean;
  isDemo: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: AuthError | Error | null }>;
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<{ error: AuthError | Error | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | Error | null }>;
  resetPasswordForEmail: (email: string) => Promise<{ error: AuthError | Error | null }>;
  updateUserPassword: (password: string) => Promise<{ error: AuthError | Error | null }>;
  signOut: () => Promise<void>;
  enterDemoMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CustomUser | User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState<boolean>(() => {
    return localStorage.getItem('ll_tracker_is_demo') === 'true';
  });

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Offline / Demo mode automatically if Supabase is not configured
      const savedDemo = localStorage.getItem('ll_tracker_demo_user');
      if (savedDemo) {
        setUser(JSON.parse(savedDemo));
        setIsDemo(true);
      } else {
        // Automatically provide demo session so user can immediately experience the app
        const defaultUser: CustomUser = {
          id: 'demo-user',
          email: 'elena.learner@example.com',
          user_metadata: { full_name: 'Elena Rostova' }
        };
        setUser(defaultUser);
        setIsDemo(true);
        localStorage.setItem('ll_tracker_is_demo', 'true');
        localStorage.setItem('ll_tracker_demo_user', JSON.stringify(defaultUser));
        if (!LocalStore.getProfile()) {
          LocalStore.loadSampleData('demo-user');
        }
      }
      setLoading(false);
      return;
    }

    // Supabase is configured
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session) {
        setIsDemo(false);
        localStorage.removeItem('ll_tracker_is_demo');
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session) {
        setIsDemo(false);
        localStorage.removeItem('ll_tracker_is_demo');
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      const demoUser: CustomUser = {
        id: 'demo-user',
        email,
        user_metadata: { full_name: email.split('@')[0] }
      };
      setUser(demoUser);
      setIsDemo(true);
      localStorage.setItem('ll_tracker_is_demo', 'true');
      localStorage.setItem('ll_tracker_demo_user', JSON.stringify(demoUser));
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signUpWithEmail = async (email: string, password: string, name?: string) => {
    if (!isSupabaseConfigured) {
      const demoUser: CustomUser = {
        id: 'demo-user',
        email,
        user_metadata: { full_name: name || email.split('@')[0] }
      };
      setUser(demoUser);
      setIsDemo(true);
      localStorage.setItem('ll_tracker_is_demo', 'true');
      localStorage.setItem('ll_tracker_demo_user', JSON.stringify(demoUser));
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name || '',
          },
        },
      });
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured) {
      const demoUser: CustomUser = {
        id: 'demo-user',
        email: 'google.learner@example.com',
        user_metadata: { full_name: 'Google Learner' }
      };
      setUser(demoUser);
      setIsDemo(true);
      localStorage.setItem('ll_tracker_is_demo', 'true');
      localStorage.setItem('ll_tracker_demo_user', JSON.stringify(demoUser));
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  const resetPasswordForEmail = async (email: string) => {
    if (!isSupabaseConfigured) {
      return { error: null };
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  const updateUserPassword = async (password: string) => {
    if (!isSupabaseConfigured) {
      return { error: null };
    }
    try {
      const { error } = await supabase.auth.updateUser({ password });
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setIsDemo(false);
    localStorage.removeItem('ll_tracker_is_demo');
    localStorage.removeItem('ll_tracker_demo_user');
  };

  const enterDemoMode = () => {
    const demoUser: CustomUser = {
      id: 'demo-user',
      email: 'elena.learner@example.com',
      user_metadata: { full_name: 'Elena Rostova' }
    };
    setUser(demoUser);
    setIsDemo(true);
    localStorage.setItem('ll_tracker_is_demo', 'true');
    localStorage.setItem('ll_tracker_demo_user', JSON.stringify(demoUser));
    if (!LocalStore.getProfile()) {
      LocalStore.loadSampleData('demo-user');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isDemo,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        resetPasswordForEmail,
        updateUserPassword,
        signOut,
        enterDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
