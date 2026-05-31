import { useState, useEffect, createContext, useContext } from 'react';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(() => {
    try {
      const cached = localStorage.getItem('user_profile');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const timer = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 5000);

    const loadProfile = async (sessionUser: User) => {
      try {
        let { data, error: selectError } = await Promise.race([
          supabase
            .from('profiles')
            .select('*')
            .eq('id', sessionUser.id)
            .maybeSingle(),
          new Promise<any>((_, reject) => setTimeout(() => reject(new Error('Profile fetch timed out')), 8000))
        ]);

        if (selectError) console.error('Select profile error:', selectError);

        if (!data) {
          const { data: newProfile, error: upsertError } = await Promise.race([
            supabase
              .from('profiles')
              .upsert({
                id: sessionUser.id,
                email: sessionUser.email,
                full_name: sessionUser.user_metadata?.full_name || '',
              }, { onConflict: 'id' })
              .select()
              .single(),
            new Promise<any>((_, reject) => setTimeout(() => reject(new Error('Profile upsert timed out')), 8000))
          ]);

          if (upsertError) {
            console.error('Upsert profile error:', upsertError);
            data = { role: 'ERROR: ' + upsertError.message } as any;
          } else {
            data = newProfile;
          }
        }
        if (mounted) {
          setProfile(data);
          localStorage.setItem('user_profile', JSON.stringify(data));
        }
      } catch (err) {
        console.error('loadProfile error:', err);
      }
    };

    (async () => {
      try {
        const { data: { session } } = await Promise.race([
          supabase.auth.getSession(),
          new Promise<any>((_, reject) => setTimeout(() => reject(new Error('Get session timed out')), 8000))
        ]);
        if (!mounted) return;
        
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadProfile(session.user);
        }
      } catch (err) {
        console.error('Auth init error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: any, session: any) => {
        if (!mounted) return;
        try {
          setUser(session?.user ?? null);
          if (session?.user) {
            await loadProfile(session.user);
          } else {
            setProfile(null);
            localStorage.removeItem('user_profile');
          }
        } catch (err) {
          console.error('Auth state change error:', err);
        } finally {
          if (mounted) setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    return Promise.race([
      supabase.auth.signInWithPassword({ email, password }).then(({ error }) => ({ error })),
      new Promise<{ error: Error }>((resolve) => 
        setTimeout(() => resolve({ error: new Error('Request timed out. Please check if an adblocker is blocking the connection.') }), 8000)
      )
    ]);
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
    return { error };
  };

  const signOut = async () => {
    try {
      await Promise.race([
        supabase.auth.signOut(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Sign out timed out')), 5000))
      ]);
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      // Forcefully clear Supabase auth tokens from localStorage just in case
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
          localStorage.removeItem(key);
        }
      }
      setUser(null);
      setProfile(null);
      localStorage.removeItem('user_profile');
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    return { error };
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error };
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (!error && profile) {
      const updated = { ...profile, ...updates };
      setProfile(updated);
      localStorage.setItem('user_profile', JSON.stringify(updated));
    }

    return { error };
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signIn, signInWithGoogle, signUp, signOut, resetPassword, updatePassword, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
