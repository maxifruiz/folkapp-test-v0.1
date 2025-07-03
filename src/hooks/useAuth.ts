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
      const { data: sessionData } = await supabase.auth.getSession();
      const sessionUser = sessionData?.session?.user;

      if (!sessionUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionUser.id)
        .single();

      const role = sessionUser.email === 'maxif.ruiz@gmail.com' ? 'admin' : 'user';

      setUser({
        id: sessionUser.id,
        email: sessionUser.email!,
        createdAt: sessionUser.created_at!,
        fullName: profile?.full_name || '',
        birthdate: profile?.birthdate || '',
        instagram: profile?.instagram || '',
        role,
      });

      setLoading(false);
    };

    getUserSession();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const sessionUser = session?.user;
      if (!sessionUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Buscar perfil
      let { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionUser.id)
        .single();

      // Si no existe perfil, intentamos crearlo
      if (error || !profile) {
        const saved = localStorage.getItem('pendingProfile');
        if (saved) {
          const { fullName, birthdate, instagram, email } = JSON.parse(saved);
          const { error: insertError } = await supabase.from('profiles').insert({
            id: sessionUser.id,
            full_name: fullName,
            birthdate,
            instagram,
            email,
          });

          if (!insertError) {
            localStorage.removeItem('pendingProfile');
            profile = { full_name: fullName, birthdate, instagram, email };
            console.log('✅ Perfil creado en onAuthStateChange');
          } else {
            console.error('❌ Error insertando perfil:', insertError);
          }
        } else {
          console.warn('⚠️ No hay pendingProfile en localStorage');
        }
      }

      const role = sessionUser.email === 'maxif.ruiz@gmail.com' ? 'admin' : 'user';

      setUser({
        id: sessionUser.id,
        email: sessionUser.email!,
        createdAt: sessionUser.created_at!,
        fullName: profile?.full_name || '',
        birthdate: profile?.birthdate || '',
        instagram: profile?.instagram || '',
        role,
      });

      setLoading(false);
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
