import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

interface User {
  id: string;
  email: string;
  createdAt: string;
  fullName?: string;
  birthdate?: string;
  instagram?: string;
  role?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const ensureProfileExists = async (userId: string, email: string) => {
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (!existingProfile) {
      const pendingRaw = localStorage.getItem('pendingProfile');
      let fullName = email.split('@')[0];
      let birthdate = '';
      let instagram = '';

      if (pendingRaw) {
        try {
          const pending = JSON.parse(pendingRaw);
          fullName = pending.fullName || fullName;
          birthdate = pending.birthdate || '';
          instagram = pending.instagram || '';
        } catch {}
      }

      await supabase.from('profiles').insert({
        id: userId,
        email,
        full_name: fullName,
        birthdate,
        instagram,
        created_at: new Date(),
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}`,
      });

      localStorage.removeItem('pendingProfile');
    }
  };

  const loadUserProfile = async (sessionUser: any) => {
    try {
      await ensureProfileExists(sessionUser.id, sessionUser.email!);

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionUser.id)
        .single();

      if (error) {
        console.error('[useAuth] Error cargando perfil:', error);
      }

      setUser({
        id: sessionUser.id,
        email: sessionUser.email!,
        createdAt: sessionUser.created_at!,
        fullName: profile?.full_name || '',
        birthdate: profile?.birthdate || '',
        instagram: profile?.instagram || '',
        role: sessionUser.email === 'maxif.ruiz@gmail.com' ? 'admin' : 'user',
      });
    } catch (err) {
      console.error('[useAuth] Error en loadUserProfile:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Esperar el evento inicial
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[useAuth] onAuthStateChange:', event, session);
        const sessionUser = session?.user;
        if (sessionUser) {
          await loadUserProfile(sessionUser);
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    // Forzar recuperación manual (fallback)
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session?.user) {
        loadUserProfile(data.session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('Error al iniciar sesión:', error.message);
      return false;
    }
    if (data.user) {
      await ensureProfileExists(data.user.id, email);
    }
    return true;
  };

  const register = async ({
    email,
    password,
    fullName,
    birthdate,
    instagram,
  }: {
    email: string;
    password: string;
    fullName: string;
    birthdate: string;
    instagram: string;
  }) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error || !data.user) {
      console.error('Error al registrarse:', error.message);
      return false;
    }

    localStorage.setItem(
      'pendingProfile',
      JSON.stringify({ fullName, birthdate, instagram, email })
    );

    return true;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error al cerrar sesión:', error.message);
      return false;
    }
    setUser(null);
    return true;
  };

  return { user, loading, login, register, logout };
};



