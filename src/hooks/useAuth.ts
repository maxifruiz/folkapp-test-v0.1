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
    console.log('[useAuth] Ejecutando ensureProfileExists para:', email);

    const { data: existingProfile, error: selectError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (selectError) {
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
          console.warn('[useAuth] No se pudo parsear pendingProfile');
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
      } else {
        console.log('[useAuth] Perfil creado correctamente');
      }

      localStorage.removeItem('pendingProfile');
    } else {
      console.log('[useAuth] Perfil ya existente, no se hace nada');
    }
  };


  const loadUserProfile = async (sessionUser: any) => {
    await ensureProfileExists(sessionUser.id, sessionUser.email);

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', sessionUser.id)
      .single();

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
      console.log('[useAuth] Obteniendo sesión con supabase.auth.getSession()...');
      const { data } = await supabase.auth.getSession();
      const sessionUser = data?.session?.user;

      if (sessionUser) {
        console.log('[useAuth] Sesión encontrada con getSession');
        await loadUserProfile(sessionUser);
        setLoading(false);
      } else {
        console.log('[useAuth] Esperando evento SIGNED_IN...');
        const { data: listener } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
              console.log('[useAuth] SIGNED_IN recibido');
              await loadUserProfile(session.user);
            }
            setLoading(false);
          }
        );

        // fallback: si en 1.5 seg no llegó SIGNED_IN, liberar el loading igual
        setTimeout(() => {
          setLoading(false);
        }, 1500);

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

    localStorage.setItem(
      'pendingProfile',
      JSON.stringify({ fullName, birthdate, instagram, email })
    );

    return true;
  };

    const logout = async () => {
      const { data, error: getError } = await supabase.auth.getSession();

      if (getError || !data?.session) {
        console.warn('[useAuth] No hay sesión activa. Limpiando usuario.');
        setUser(null);
        return true;
      }

      try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('[useAuth] Error al cerrar sesión:', error.message);
          return false;
        }

        setUser(null);
        console.log('[useAuth] Sesión cerrada correctamente.');
        return true;
      } catch (err) {
        console.error('[useAuth] Error inesperado al cerrar sesión:', err);
        setUser(null);
        return false;
      }
    };



  return { user, loading, login, register, logout };
};