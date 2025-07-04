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
    { id: 'perfil', label: 'Perfil', icon: User },
  ];

  if (user?.role === 'admin') {
    navigationItems.push({ id: 'admin', label: 'Admin', icon: Shield });
  }

  return (
    <div
      className="min-h-screen font-sans text-neutral-900 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #a89b8a 0%, #dcd6c9 100%)',
      }}
    >
      {/* Textura con animación */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ccircle fill=\'%23a89b8a\' fill-opacity=\'0.05\' cx=\'50\' cy=\'50\' r=\'2\' /%3E%3C/svg%3E")',
          backgroundRepeat: 'repeat',
          animation: 'moveTexture 60s linear infinite',
          zIndex: 0,
        }}
      />
      <style>
        {`
          @keyframes moveTexture {
            0% { background-position: 0 0; }
            100% { background-position: 100px 100px; }
          }
        `}
      </style>

      {/* Contenido principal arriba del fondo y textura */}
      <div className="relative z-10">
        {/* Header */}
        <header className="backdrop-blur-md bg-folkiRed/90 shadow-lg sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Music className="h-8 w-8 text-folkiAmber animate-pulse-slow" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Folki</h1>
                  <p className="text-xs text-folkiCream -mt-1">Red del Folklore</p>
                </div>
              </div>

              {/* Círculo amarillo sin foto de usuario */}
              <div className="w-8 h-8 rounded-full bg-yellow-400"></div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-white/70 backdrop-blur-sm shadow-md sticky top-16 z-30 border-b border-folkiAmber">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center space-x-1 sm:space-x-6 py-3">
              {navigationItems.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => onPageChange(id as any)}
                  className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-all duration-300 font-medium ${
                    currentPage === id
                      ? 'bg-folkiRed text-white shadow-md transform scale-105'
                      : 'text-folkiRed hover:bg-folkiAmber/30 hover:text-folkiRed'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="hidden sm:block text-sm">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">{children}</main>

        {/* Footer */}
        <footer className="bg-folkiRed text-white border-t border-folkiAmber mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center space-y-2">
              <div className="flex justify-center items-center space-x-2">
                <Music className="h-6 w-6 text-folkiAmber" />
                <span className="text-xl font-bold">Folki App</span>
              </div>
              <p className="text-folkiCream text-sm">
                La red social del folklore argentino. Conectando tradiciones, creando comunidad.
              </p>
              <div className="flex justify-center space-x-4 text-xs text-folkiCream mt-2">
                <span>🥁 Bombos</span>
                <span>🎸 Guitarras</span>
                <span>💃 Tradición</span>
                <span>🎶 Folklore</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
