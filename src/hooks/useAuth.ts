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

  useEffect(() => {
    const getUserSession = async () => {
      try {
        console.log('🚀 getUserSession iniciado');
        const { data: sessionData } = await supabase.auth.getSession();
        console.log('📦 sessionData:', sessionData);
        const sessionUser = sessionData?.session?.user;

        if (!sessionUser) {
          console.log('⛔ No hay sessionUser, usuario no logueado');
          setUser(null);
          setLoading(false);
          return;
        }

        console.log('🔍 Buscando perfil para user id:', sessionUser.id);
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sessionUser.id)
          .single();

        if (error || !profile) {
          console.log('❌ Perfil no encontrado o error:', error);
          const fallbackEmail = sessionUser.email!;
          const fallbackRole = fallbackEmail === 'maxif.ruiz@gmail.com' ? 'admin' : 'user';

          setUser({
            id: sessionUser.id,
            email: fallbackEmail,
            createdAt: sessionUser.created_at!,
            fullName: '',
            birthdate: '',
            instagram: '',
            role: fallbackRole,
          });
          setLoading(false);
          return;
        }

        const role = profile.email === 'maxif.ruiz@gmail.com' ? 'admin' : 'user';

        console.log('✅ Perfil encontrado:', profile);

        setUser({
          id: sessionUser.id,
          email: sessionUser.email!,
          createdAt: sessionUser.created_at!,
          fullName: profile.full_name,
          birthdate: profile.birthdate,
          instagram: profile.instagram,
          role,
        });
        setLoading(false);
      } catch (error) {
        console.error('❌ Error en getUserSession:', error);
        setUser(null);
        setLoading(false);
      }
    };

    getUserSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('🔄 onAuthStateChange event:', _event, session);

      if (session?.user) {
        console.log('🔍 Buscando perfil para onAuthStateChange user id:', session.user.id);

        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile, error }) => {
            if (error) {
              console.error('❌ Error buscando perfil en onAuthStateChange:', error);
            } else {
              console.log('✅ Perfil encontrado en onAuthStateChange:', profile);
            }

            const email = session.user.email!;
            const role = email === 'maxif.ruiz@gmail.com' ? 'admin' : 'user';

            setUser({
              id: session.user.id,
              email,
              createdAt: session.user.created_at!,
              fullName: profile?.full_name || '',
              birthdate: profile?.birthdate || '',
              instagram: profile?.instagram || '',
              role,
            });
          })
          .catch((err) => {
            console.error('❌ Error inesperado al buscar perfil en onAuthStateChange:', err);
            setUser(null);
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        console.log('🔒 Sesión cerrada o no hay usuario');
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('❌ Error al iniciar sesión:', error.message);
      return false;
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
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'https://folkapp-test-v01.vercel.app/',
      },
    });

    if (signUpError || !signUpData.user) {
      console.error('❌ Error al registrarse:', signUpError?.message);
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
      console.error('❌ Error al cerrar sesión:', error.message);
      return false;
    }
    setUser(null);
    return true;
  };

  return { user, loading, login, register, logout };
};
