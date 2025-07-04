import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

interface User {
  id: string;
  email: string;
  createdAt: string;
  fullName?: string;
  birthdate?: string;
  instagram?: string;
  avatar?: string;
  role?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false); // Nuevo estado

  const loadUserProfile = async (sessionUser: any) => {
    console.log('loadUserProfile start', sessionUser);
    if (!sessionUser?.id || !sessionUser?.email) {
      console.warn('⚠️ Usuario inválido en loadUserProfile');
      setUser(null);
      return;
    }

    try {
      let { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionUser.id)
        .single();

      if (error || !profile) {
        console.log('No se encontró perfil, intentando crear uno desde localStorage');
        const saved = localStorage.getItem('pendingProfile');
        if (saved) {
          const { fullName, birthdate, instagram, email } = JSON.parse(saved);
          const { error: insertError } = await supabase.from('profiles').insert({
            id: sessionUser.id,
            full_name: fullName,
            birthdate,
            instagram,
            email,
            created_at: sessionUser.created_at,
          });
          if (!insertError) {
            localStorage.removeItem('pendingProfile');
            profile = { full_name: fullName, birthdate, instagram, email };
            console.log('Perfil creado automáticamente');
          } else {
            console.error('Error insertando perfil:', insertError);
          }
        } else {
          console.log('No hay perfil ni pendingProfile');
        }
      }

      const role = sessionUser.email === 'maxif.ruiz@gmail.com' ? 'admin' : 'user';

      setUser({
        id: sessionUser.id,
        email: sessionUser.email,
        createdAt: sessionUser.created_at,
        fullName: profile?.full_name || '',
        birthdate: profile?.birthdate || '',
        instagram: profile?.instagram || '',
        avatar: profile?.avatar || '',
        role,
      });
      console.log('Usuario seteado en useAuth:', sessionUser.email);
    } catch (err) {
      console.error('Error cargando perfil:', err);
      setUser(null);
    }
  };

  useEffect(() => {
    const init = async () => {
      console.log('useAuth init - comenzando carga sesión');
      setLoading(true);
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const sessionUser = sessionData?.session?.user;

        if (sessionUser) {
          await loadUserProfile(sessionUser);
        } else {
          console.log('No hay sesión activa');
          setUser(null);
        }
      } catch (err) {
        console.error('Error obteniendo sesión inicial:', err);
        setUser(null);
      } finally {
        setLoading(false);
        setInitialized(true); // Setea que ya intentamos cargar
        console.log('useAuth init - loading false');
      }
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log('Auth state change:', _event);
        if (initialized) setLoading(true); // Solo si ya cargamos la primera vez

        try {
          if (session?.user) {
            await loadUserProfile(session.user);
          } else {
            setUser(null);
          }
        } catch (err) {
          console.error('Error en listener de auth:', err);
          setUser(null);
        } finally {
          setLoading(false);
          console.log('Listener - loading false');
        }
      }
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [initialized]);

  const login = async (email: string, password: string) => {
    if (!email || !password) return false;

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return false;

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
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError || !signUpData.user) return false;

    localStorage.setItem(
      'pendingProfile',
      JSON.stringify({ fullName, birthdate, instagram, email })
    );

    return true;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) return false;
    setUser(null);
    return true;
  };

  return { user, loading, initialized, login, register, logout };
};
