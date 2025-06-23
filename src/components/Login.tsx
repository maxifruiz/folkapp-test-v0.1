import React from 'react';
import { Music, Chrome, Instagram } from 'lucide-react';

interface LoginProps {
  onLogin: (provider: 'google' | 'instagram') => void;
}

export function Login({ onLogin }: LoginProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-amber-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <div className="relative">
              <Music className="h-12 w-12 text-red-600" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">Folki</h1>
          <p className="text-neutral-600">La red social del folklore argentino</p>
        </div>

        {/* Welcome Message */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-neutral-800 mb-2">
            ¡Bienvenido a la comunidad!
          </h2>
          <p className="text-neutral-600 text-sm">
            Conectá con la tradición, descubrí eventos y compartí tu pasión por el folklore
          </p>
        </div>

        {/* Social Login Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => onLogin('google')}
            className="w-full flex items-center justify-center space-x-3 py-4 px-6 border-2 border-neutral-300 rounded-lg hover:border-red-400 hover:bg-red-50 transition-all duration-300 group"
          >
            <Chrome className="h-5 w-5 text-neutral-600 group-hover:text-red-600" />
            <span className="font-medium text-neutral-700 group-hover:text-red-700">
              Continuar con Google
            </span>
          </button>

          <button
            onClick={() => onLogin('instagram')}
            className="w-full flex items-center justify-center space-x-3 py-4 px-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            <Instagram className="h-5 w-5" />
            <span className="font-medium">Continuar con Instagram</span>
          </button>
        </div>

        {/* Features */}
        <div className="mt-8 pt-6 border-t border-neutral-200">
          <h3 className="text-sm font-semibold text-neutral-700 mb-3 text-center">
            ¿Qué podés hacer en Folki?
          </h3>
          <div className="space-y-2">
            {[
              '🎭 Descubrir peñas y festivales',
              '📅 Ver eventos en tu calendario',
              '📍 Encontrar eventos cerca tuyo',
              '❤️ Marcar tus eventos favoritos',
              '📢 Publicar tus propios eventos'
            ].map((feature, index) => (
              <div key={index} className="flex items-center text-sm text-neutral-600">
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-neutral-200 text-center">
          <p className="text-xs text-neutral-500">
            Al continuar, aceptás nuestros términos y condiciones
          </p>
        </div>
      </div>
    </div>
  );
}