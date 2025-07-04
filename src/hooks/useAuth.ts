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

  // Función para crear perfil si no existe
  const createProfileIfNotExists = async (userId: string, email: string) => {
    // Verificamos si ya existe
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      // Intentamos crear perfil con datos de localStorage (pendingProfile)
      const pendingProfileRaw = localStorage.getItem('pendingProfile');
      let fullName = '';
      let birthdate = '';
      let instagram = '';

      if (pendingProfileRaw) {
        try {
          const pendingProfile = JSON.parse(pendingProfileRaw);
          fullName = pendingProfile.fullName || '';
          birthdate = pendingProfile.birthdate || '';
          instagram = pendingProfile.instagram || '';
        } catch {
          // No pasa nada si no se puede parsear
        }
      }

      // Por si no hay nombre, usar parte del email
      if (!fullName) fullName = email.split('@')[0];

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
        console.error('Error creando perfil:', insertError);
      } else {
        localStorage.removeItem('pendingProfile'); // Limpiamos storage
      }
    }
  };

  useEffect(() => {
    const getUserSession = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const sessionUser = sessionData?.session?.user;

        if (!sessionUser) {
          setUser(null);
          setLoading(false);
          return;
        }

        // Intentamos crear perfil si no existe (por si usuario confirma mail y hace login)
        await createProfileIfNotExists(sessionUser.id, sessionUser.email!);

        const { data: profile, error } = await supabase
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
      } catch (error) {
        console.error('Error en getUserSession:', error);
        setUser(null);
        setLoading(false);
      }
    };

    getUserSession();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const userSession = session.user;

        await createProfileIfNotExists(userSession.id, userSession.email!);

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userSession.id)
          .single();

        const role = userSession.email === 'maxif.ruiz@gmail.com' ? 'admin' : 'user';

        setUser({
          id: userSession.id,
          email: userSession.email!,
          createdAt: userSession.created_at!,
          fullName: profile?.full_name || '',
          birthdate: profile?.birthdate || '',
          instagram: profile?.instagram || '',
          role,
        });
        setLoading(false);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('Error al iniciar sesión:', error.message);
      return false;
    }

    // Crear perfil si no existe
    if (data.user) {
      await createProfileIfNotExists(data.user.id, email);
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
      console.error('Error al registrarse:', signUpError?.message);
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
