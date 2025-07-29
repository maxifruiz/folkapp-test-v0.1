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
    const { data: existingProfile, error: selectError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      // PGRST116 = no rows found, que acá es válido para crear perfil
      console.error('[useAuth] Error al buscar perfil:', selectError.message);
      return;
    }

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
        } catch {
          // no pasa nada si no parsea
        }
      }

      const { error: insertError } = await supabase.from('profiles').insert({
        id: userId,
        email,
        full_name: fullName,
        birthdate,
        instagram,
        created_at: new Date(),
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}`,
      });

      if (insertError) {
        console.error('[useAuth] Error al insertar perfil:', insertError.message);
      }
      localStorage.removeItem('pendingProfile');
    }
  };

  const loadUserProfile = async (sessionUser: any) => {
    await ensureProfileExists(sessionUser.id, sessionUser.email);

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', sessionUser.id)
      .single();

    if (error) {
      console.error('[useAuth] Error al cargar perfil:', error.message);
      setUser(null);
      return;
    }

    setUser({
      id: sessionUser.id,
      email: sessionUser.email,
      createdAt: sessionUser.created_at,
      fullName: profile?.full_name || '',
      birthdate: profile?.birthdate || '',
      instagram: profile?.instagram || '',
      role: ['maxif.ruiz@gmail.com', 'eventos.folki@gmail.com'].includes(sessionUser.email) ? 'admin' : 'user',
    });
  };

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data?.session?.user;

      if (sessionUser) {
        await loadUserProfile(sessionUser);
        setLoading(false);
      } else {
        const { data: listener } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
              await loadUserProfile(session.user);
            }
            setLoading(false);
          }
        );
        // fallback para no quedar colgado en loading
        setTimeout(() => setLoading(false), 1500);

        return () => {
          listener.subscription.unsubscribe();
        };
      }
    };
    init();
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
      if (error?.message.includes('email rate limit exceeded')) {
        alert('¡Ups! Se hicieron muchos registros seguidos. Por favor, esperá unos minutos antes de intentar de nuevo.');
      } else {
        alert(`Error al registrarse: ${error.message}`);
      }
      console.error('Error al registrarse:', error.message);
      return false;
    }

    // Guardamos el perfil pendiente en localStorage
    localStorage.setItem(
      'pendingProfile',
      JSON.stringify({ fullName, birthdate, instagram, email })
    );

    // Ahora que el usuario está registrado, forzamos el login para actualizar la sesión
    const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (sessionError) {
      console.error('Error al iniciar sesión después del registro:', sessionError.message);
      return false;
    }

    // Cargar el perfil del usuario y actualizar la sesión
    if (sessionData?.user) {
      await loadUserProfile(sessionData.user);  // Esta es la función que ya tienes para cargar el perfil
    }

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
