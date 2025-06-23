import React from 'react';
import { Music, Calendar, Plus, User, Shield } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: 'cartelera' | 'calendario' | 'publicar' | 'perfil' | 'admin';
  onPageChange: (page: 'cartelera' | 'calendario' | 'publicar' | 'perfil' | 'admin') => void;
  user?: any;
}

export function Layout({ children, currentPage, onPageChange, user }: LayoutProps) {
  const navigationItems = [
    { id: 'cartelera', label: 'Cartelera', icon: Music },
    { id: 'calendario', label: 'Calendario', icon: Calendar },
    { id: 'publicar', label: 'Publicar', icon: Plus },
    { id: 'perfil', label: 'Perfil', icon: User }
  ];

  // Add admin panel only for admin users
  if (user?.role === 'admin') {
    navigationItems.push({ id: 'admin', label: 'Admin', icon: Shield });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-900 to-red-800 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Music className="h-8 w-8 text-amber-300" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Folki</h1>
                <p className="text-xs text-amber-200 -mt-1">Red del Folklore</p>
              </div>
            </div>
            
            {user && (
              <div className="flex items-center space-x-2">
                <img 
                  src={user.avatar} 
                  alt={user.name}
                  className="w-8 h-8 rounded-full border-2 border-amber-300"
                />
                <div className="hidden sm:block">
                  <span className="text-white text-sm font-medium block">
                    {user.name}
                  </span>
                  {user.role === 'admin' && (
                    <span className="text-amber-300 text-xs">Administrador</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-neutral-800 border-b border-neutral-700 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center space-x-1 sm:space-x-8 py-3">
            {navigationItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => onPageChange(id as any)}
                className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-all duration-300 ${
                  currentPage === id
                    ? 'bg-red-700 text-white shadow-lg transform scale-105'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:block text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-neutral-900 border-t border-neutral-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-2 mb-4">
              <Music className="h-6 w-6 text-red-500" />
              <span className="text-xl font-bold text-white">Folki App</span>
            </div>
            <p className="text-neutral-400 text-sm">
              La red social del folklore argentino. Conectando tradiciones, creando comunidad.
            </p>
            <div className="mt-4 flex justify-center space-x-4 text-xs text-neutral-500">
              <span>🥁 Bombos</span>
              <span>🎸 Guitarras</span>
              <span>💃 Tradición</span>
              <span>🎶 Folklore</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}