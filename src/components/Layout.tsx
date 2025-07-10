import React, { useEffect, useRef, useState } from 'react';
import { CalendarCheck, Plus, BookImage, User, Shield } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: 'cartelera' | 'calendario' | 'publicar' | 'perfil' | 'admin';
  onPageChange: (page: 'cartelera' | 'calendario' | 'publicar' | 'perfil' | 'admin') => void;
  user?: any;
}

interface Notification {
  id: string;
  type: string;
  leido: boolean;
  from_user_id: string;
  created_at: string;
  event: {
    title: string;
    type: string;
  };
  from_user: {
    full_name: string;
    avatar: string;
  };
}

export function Layout({ children, currentPage, onPageChange, user }: LayoutProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [shouldShake, setShouldShake] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const bomboRef = useRef<HTMLAudioElement | null>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const prevUnreadRef = useRef(0);

  const fetchNotifications = async () => {
    if (!user?.id) return;
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        id, type, leido, from_user_id, created_at,
        event:events (title, type),
        from_user:from_user_id (full_name, avatar)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error) setNotifications(data as Notification[]);
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [user?.id]);

  useEffect(() => {
    const newCount = notifications.filter(n => !n.leido).length;
    if (newCount > prevUnreadRef.current) {
      setShowBanner(true);
      if (bomboRef.current) {
        bomboRef.current.currentTime = 0;
        bomboRef.current.play().catch(() => {});
      }
      setTimeout(() => setShowBanner(false), 5000);
    }
    prevUnreadRef.current = newCount;
    setUnreadCount(newCount);
  }, [notifications]);

  useEffect(() => {
    const enableAudio = () => {
      if (bomboRef.current) {
        bomboRef.current.play().catch(() => {});
        bomboRef.current.pause();
        bomboRef.current.currentTime = 0;
      }
      document.removeEventListener('click', enableAudio);
    };
    document.addEventListener('click', enableAudio);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (notifications.some(n => !n.leido)) {
        setShouldShake(true);
        setTimeout(() => setShouldShake(false), 500);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [notifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const markAllAsRead = async () => {
    const ids = notifications.filter(n => !n.leido).map(n => n.id);
    if (ids.length > 0) {
      await supabase.from('notifications').update({ leido: true }).in('id', ids);
      fetchNotifications();
    }
  };

  const markOneAsRead = async (id: string) => {
    await supabase.from('notifications').update({ leido: true }).eq('id', id);
    fetchNotifications();
  };

  const deleteReadNotifications = async () => {
    const ids = notifications.filter(n => n.leido).map(n => n.id);
    if (ids.length > 0) {
      await supabase.from('notifications').delete().in('id', ids);
      fetchNotifications();
    }
  };

  const navigationItems = [
    { id: 'cartelera', label: 'Cartelera', icon: BookImage },
    { id: 'calendario', label: 'Calendario', icon: CalendarCheck },
    { id: 'publicar', label: 'Publicar', icon: Plus },
    { id: 'perfil', label: 'Perfil', icon: User },
  ];
  if (user?.role === 'admin') {
    navigationItems.push({ id: 'admin', label: 'Admin', icon: Shield });
  }

  return (
    <div className="min-h-screen font-sans text-neutral-900 relative overflow-hidden">
      <audio ref={bomboRef} src="/bombo.mp3" preload="auto" />

      {showBanner && unreadCount > 0 && (
        <div
          className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-folkiCream text-folkiRed px-4 py-2 rounded-xl shadow-xl text-sm font-semibold z-[9999] cursor-pointer select-none animate-[pop_0.4s_ease-out]"
        >
          Tienes {unreadCount} notificación{unreadCount !== 1 ? 'es' : ''} nueva{unreadCount !== 1 ? 's' : ''} 🔔
        </div>
      )}

      <div className="bg"></div>
      <div className="bg bg2"></div>
      <div className="bg bg3"></div>

      <style>
        {`
        .bg {
          animation: slide 3s ease-in-out infinite alternate;
          background-image: linear-gradient(-60deg, #ebb24c 50%, #f5e8d5 50%);
          bottom: 0;
          left: -50%;
          opacity: 0.5;
          position: fixed;
          right: -50%;
          top: 0;
          z-index: -1;
        }
        .bg2 {
          animation-direction: alternate-reverse;
          animation-duration: 4s;
          background-image: linear-gradient(-60deg, #f5e8d5 50%, #eeb6ac 50%);
        }
        .bg3 {
          animation-duration: 5s;
          background-image: linear-gradient(-60deg,rgb(240, 220, 111) 50%, #ebb24c 50%);
        }
        @keyframes slide {
          0% { transform: translateX(-25%); }
          100% { transform: translateX(25%); }
        }
        .logo-container {
          position: relative;
          display: inline-block;
        }
        .logo-glow {
          filter: drop-shadow(0 0 14px rgba(255, 220, 100, 0.8)) drop-shadow(0 0 8px rgba(0, 0, 0, 0.6));
          animation: pulse 2.5s ease-in-out infinite;
          transition: filter 0.3s ease;
          z-index: 2;
          position: relative;
        }
        .logo-halo {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100px;
          height: 100px;
          transform: translate(-50%, -50%);
          background: radial-gradient(circle, rgba(255, 230, 150, 0.25) 0%, transparent 80%);
          border-radius: 50%;
          animation: halo-glow 3s ease-in-out infinite;
          z-index: 1;
        }
        @keyframes pulse {
          0%, 100% {
            filter: drop-shadow(0 0 14px rgba(255, 220, 100, 0.8)) drop-shadow(0 0 8px rgba(0, 0, 0, 0.6));
          }
          50% {
            filter: drop-shadow(0 0 18px rgba(255, 230, 120, 1)) drop-shadow(0 0 10px rgba(0, 0, 0, 0.7));
          }
        }
        @keyframes halo-glow {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1);
            opacity: 0.6;
          }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-1px); }
          50% { transform: translateX(2px); }
          75% { transform: translateX(-1px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
        @keyframes tv-pop {
          0% {transform: scale(0.05) translateX(0); opacity: 0;}
          70% {transform: scale(1.2) translateX(-50%); opacity: 1;}
          100% {transform: scale(1) translateX(-50%);}
        }
        @keyframes pop {
          0% { transform: scaleY(0.02) scaleX(0) translateX(-50%); opacity: 0; }
          50% { transform: scaleY(0.05) scaleX(1.2) translateX(-50%); opacity: 1; }
          100% { transform: scaleY(1) scaleX(1) translateX(-50%); }
        }
        `}
      </style>

      <div className="relative z-10">
        <header className="backdrop-blur-md bg-folkiRed/90 shadow-lg sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 overflow-visible">
              <div className="logo-container">
                <span className="logo-halo" />
                <img src="/logo.png" alt="Folki Logo" className="h-16 w-auto object-contain logo-glow" />
              </div>

              <div className="flex items-center space-x-3 ml-auto">
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 bg-folkiCream rounded-full shadow-md hover:shadow-lg transition transform hover:scale-105"
                  >
                    <img
                      src="/notificacion.png"
                      alt="Notificaciones"
                      className={`h-6 w-6 ${shouldShake ? 'animate-shake' : ''}`}
                    />
                    {notifications.filter(n => !n.leido).length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {notifications.filter(n => !n.leido).length}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div
                      className="absolute right-0 mt-2 w-80 max-h-[60vh] overflow-y-auto bg-folkiCream border border-folkiAmber rounded-xl shadow-xl p-4 z-50"
                      style={{ transform: 'translateY(10px)' }}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-folkiRed font-semibold text-base">Notificaciones</span>
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-blue-700 hover:underline"
                        >
                          Marcar todo como leído
                        </button>
                      </div>

                      <div className="space-y-2">
                        {notifications.length === 0 ? (
                          <p className="text-sm text-gray-500">Sin notificaciones</p>
                        ) : (
                          notifications.map(n => (
                            <div
                              key={n.id}
                              className={`flex items-start gap-2 p-2 rounded-lg border ${n.leido ? 'bg-gray-100' : 'bg-yellow-100 border-yellow-300'}`}
                            >
                              {n.from_user?.avatar && (
                                <img
                                  src={n.from_user.avatar}
                                  alt={n.from_user.full_name}
                                  className="h-8 w-8 rounded-full object-cover"
                                />
                              )}
                              <div className="flex-1 text-sm text-gray-800">
                                {n.type === 'like'
                                  ? `🧡 ${n.from_user?.full_name} le dio like a ${n.event?.type} "${n.event?.title}"`
                                  : `🗓️ ${n.from_user?.full_name} indicó que asistirá a ${n.event?.type} "${n.event?.title}"`}
                              </div>
                              {!n.leido && (
                                <button
                                  onClick={() => markOneAsRead(n.id)}
                                  className="text-xs text-green-600 hover:underline"
                                >
                                  ✓ Leído
                                </button>
                              )}
                            </div>
                          ))
                        )}
                      </div>

                      {/* 🔽 AÑADIDO NUEVO: botón para limpiar notificaciones leídas */}
                      <div className="pt-3 border-t border-folkiAmber mt-3">
                        <button
                          onClick={deleteReadNotifications}
                          className="w-full text-xs text-red-700 hover:underline text-center"
                        >
                          Limpiar notificaciones leídas
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <button disabled className="p-2 bg-folkiCream rounded-full shadow-md opacity-70 cursor-not-allowed">
                  <img src="/anuncio.png" alt="Anuncios" className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </header>

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

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">{children}</main>

        <footer className="bg-folkiRed text-white border-t border-folkiAmber mt-12 pt-8 pb-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <div className="flex justify-center items-center overflow-visible">
              <div className="logo-container">
                <span className="logo-halo" />
                <img src="/logo.png" alt="Folki Icon" className="h-[70px] w-auto object-contain logo-glow" />
              </div>
            </div>
            <p className="text-folkiCream text-base max-w-lg mx-auto">
              La primera red del folklore Argentino. Conectando eventos, creando comunidad.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

