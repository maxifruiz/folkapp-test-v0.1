import { useState, useCallback } from 'react';
import { User } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (provider: 'google' | 'instagram') => {
    setIsLoading(true);
    
    try {
      // Simulate OAuth flow
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful login - in real app, this would come from OAuth provider
      const mockEmail = provider === 'google' ? 'usuario@example.com' : 'usuario@instagram.com';
      const mockName = provider === 'google' ? 'Usuario Google' : 'Usuario Instagram';
      
      // Determine role based on email
      const isAdmin = mockEmail === 'maxif.ruiz@gmail.com';
      
      const loggedInUser: User = {
        id: Date.now().toString(),
        name: mockName,
        email: mockEmail,
        avatar: `https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop`,
        provider,
        role: isAdmin ? 'admin' : 'user',
        createdAt: new Date()
      };
      
      setUser(loggedInUser);
      
      // Store in localStorage for persistence
      localStorage.setItem('folki_user', JSON.stringify(loggedInUser));
      
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('folki_user');
  }, []);

  const initializeAuth = useCallback(() => {
    const storedUser = localStorage.getItem('folki_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Ensure role is set for existing users
        if (!parsedUser.role) {
          parsedUser.role = parsedUser.email === 'maxif.ruiz@gmail.com' ? 'admin' : 'user';
        }
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('folki_user');
      }
    }
  }, []);

  return {
    user,
    isLoading,
    login,
    logout,
    initializeAuth
  };
}