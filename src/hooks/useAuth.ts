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

  const saveProfileToLocal = (profile: any) => {
    localStorage.setItem('cachedProfile', JSON.stringify(profile));
  };

  const getProfileFromLocal = (userId: string) => {
    const raw = localStorage.getItem('cachedProfile');
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return parsed?.id === userId ? parsed : null;
    } catch {
      return null;
    }
  };

  const loadUserProfile = async (sessionUser: any, retry = false) => {
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
        if (!retry) {
          console.warn('Perfil no encontrado, reintentando en 500ms...');
          setTimeout(() => loadUserProfile(sessionUser, true), 500);
          return;
        } else {
          const cached = getProfileFromLocal(sessionUser.id);
          if (cached) {
            console.log('✅ Usando perfil desde localStorage');
            const role = sessionUser.email === 'maxif.ruiz@gmail.com' ? 'admin' : 'user';
            setUser({ ...cached, role });
            return;
          }
          console.error('❌ Error al obtener perfil incluso tras reintento:', error);
          setUser(null);
          return;
        }
      }

      const role = sessionUser.email === 'maxif.ruiz@gmail.com' ? 'admin' : 'user';

      const formattedUser = {
        id: sessionUser.id,
        email: sessionUser.email,
        createdAt: sessionUser.created_at,
        fullName: profile?.full_name || '',
        birthdate: profile?.birthdate || '',
        instagram: profile?.instagram || '',
        avatar: profile?.avatar || '',
        role,
      };

      saveProfileToLocal(formattedUser);
      setUser(formattedUser);
      console.log('✅ Usuario seteado en useAuth:', sessionUser.email);
    } catch (err) {
      console.error('❌ Error cargando perfil:', err);
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
        console.log('useAuth init - loading false');
      }
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log('Auth state change:', _event);
        setLoading(true);
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
  }, []);

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

  return { user, loading, login, register, logout };
};