import React, { useEffect, useRef, useState } from 'react';
import { CalendarCheck, Plus, BookImage, User, Shield, Store } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import AdminAnnouncements from './AdminAnnouncements';
import LegalModal from "./LegalModal";
import UserSearchModal from './UserSearchModal';
import Market from './Market';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: 'cartelera' | 'calendario' | 'publicar' | 'perfil' | 'admin'| 'market';
  onPageChange: (page: 'cartelera' | 'calendario' | 'publicar' | 'perfil' | 'admin' | 'market') => void;
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
  const notificationRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [showUserSearch, setShowUserSearch] = useState(false);

  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);


  // Popup arriba notificaciones nuevas
  const [newNotiPopupVisible, setNewNotiPopupVisible] = useState(false);
  const [popupTranslateX, setPopupTranslateX] = useState(0);
  const [popupDragStartX, setPopupDragStartX] = useState<number | null>(null);
  const [bomboSonado, setBomboSonado] = useState(false);
  const popupTimeout = useRef<NodeJS.Timeout | null>(null);

  // Para controlar si hubo notificaciones nuevas
  const previousUnreadCount = useRef(0);

  // Cargar notificaciones
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

    if (error) {
      console.error('Error cargando notificaciones:', error);
    } else {
      setNotifications(data as Notification[]);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();

      if (notifications.some(n => !n.leido)) {
        setShouldShake(true);
        setTimeout(() => setShouldShake(false), 500);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [user?.id, notifications]);

  // Detectar nuevas notificaciones no leídas y mostrar popup + sonar bombo 1 sola vez
  useEffect(() => {
    const unreadCount = notifications.filter(n => !n.leido).length;

    if (
      unreadCount > 0 &&
      unreadCount > previousUnreadCount.current &&
      !newNotiPopupVisible
    ) {
      setNewNotiPopupVisible(true);
      setPopupTranslateX(0);

      if (!audioRef.current) {
        audioRef.current = new Audio('/bombo.mp3');
      }
      if (!bomboSonado) {
        audioRef.current.play().catch(() => {});
        setBomboSonado(true);
      }

      if (popupTimeout.current) clearTimeout(popupTimeout.current);

      popupTimeout.current = setTimeout(() => {
        setNewNotiPopupVisible(false);
        setPopupTranslateX(0);
        setBomboSonado(false);
        popupTimeout.current = null;
      }, 3000);
    }

    previousUnreadCount.current = unreadCount;
  }, [notifications]);

  // Manejo drag para cerrar popup deslizando
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setPopupDragStartX(clientX);
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (popupDragStartX === null) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const deltaX = clientX - popupDragStartX;
    setPopupTranslateX(deltaX);
  };

  const handleDragEnd = () => {
    if (Math.abs(popupTranslateX) > 100) {
      if (popupTimeout.current) {
        clearTimeout(popupTimeout.current);
        popupTimeout.current = null;
      }
      setNewNotiPopupVisible(false);
      setPopupTranslateX(0);
      setBomboSonado(false);
    }
    setPopupDragStartX(null);
  };

  // Marcar todas como leídas
  const markAllAsRead = async () => {
    const ids = notifications.filter(n => !n.leido).map(n => n.id);
    if (ids.length > 0) {
      await supabase
        .from('notifications')
        .update({ leido: true })
        .in('id', ids);
      fetchNotifications();
    }
  };

  // Marcar una sola como leída
  const markOneAsRead = async (id: string) => {
    await supabase.from('notifications').update({ leido: true }).eq('id', id);
    fetchNotifications();
  };

  // Limpiar notificaciones leídas
  const clearReadNotifications = async () => {
    const readIds = notifications.filter(n => n.leido).map(n => n.id);
    if (readIds.length > 0) {
      await supabase
        .from('notifications')
        .delete()
        .in('id', readIds);
      fetchNotifications();
    }
  };

  const navigationItems = [
    { id: 'cartelera', label: 'Cartelera', icon: BookImage },
    { id: 'calendario', label: 'Calendario', icon: CalendarCheck },
    { id: 'publicar', label: 'Publicar', icon: Plus },
    { id: 'perfil', label: 'Perfil', icon: User },
    { id: 'market', label: 'Market', icon: Store },
  ];

  if (user?.role === 'admin') {
    navigationItems.push({ id: 'admin', label: 'Admin', icon: Shield });
  }

  // Detectar click fuera del modal para cerrar notificaciones
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  return (
    <div className="min-h-screen font-sans text-neutral-900 relative overflow-hidden">
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
            background-image: linear-gradient(-60deg, #f5e8d5 50%, #800000 50%);
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

          /* BOTON DE NOTIFICACIONES CON COLOR BORDO Y SOMBRA */
          .noti-button {
            background-color: #f5e8d5;
            border: 2px solid #800000;
            box-shadow: 0 2px 8px rgb(128 0 0 / 0.4);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          .noti-button:hover {
            transform: scale(1.05);
            box-shadow: 0 4px 12px rgb(128 0 0 / 0.6);
          }

          @keyframes fadeSlideDown {
            0% {
              opacity: 0;
              transform: translateY(-10px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }

          /* MODAL DE NOTIFICACIONES */
          .noti-modal {
            background-color: #f5e8d5;
            border: 2px solid #800000;
            border-radius: 1.25rem;
            box-shadow: 0 6px 16px rgb(128 0 0 / 0.5);
            padding: 0.75rem 1rem;
            width: 300px;
            max-height: 60vh;
            display: flex;
            flex-direction: column;
            overflow-y: auto;
            font-size: 0.875rem;
            animation: fadeSlideDown 0.3s ease forwards;
          }
          .noti-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.4rem;
            font-weight: 600;
            color: #800000;
            font-size: 1.1rem;
          }
          .noti-modal-list {
            flex-grow: 1;
            overflow-y: auto;
            padding-right: 0.3rem;
            margin-bottom: 0.4rem;
          }
          .noti-item {
            background-color: #fff3db;
            border: 1.5px solid #d1a58b;
            border-radius: 0.5rem;
            padding: 0.3rem 0.5rem;
            margin-bottom: 0.3rem;
            line-height: 1.2;
            color: #4b2c1a;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          .noti-item.read {
            background-color: #f5e8d5;
            border-color: #800000;
            color: #800000;
          }
          .noti-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            object-fit: cover;
            border: 1.5px solid #800000;
            flex-shrink: 0;
          }
          .noti-text {
            flex-grow: 1;
          }
          .noti-item button {
            font-size: 0.7rem;
            color: #2f6b36;
            font-weight: 600;
            background: none;
            border: none;
            cursor: pointer;
            margin-left: 0.3rem;
          }
          .noti-item button:hover {
            text-decoration: underline;
          }
          .noti-clear-btn {
            margin-top: 0.3rem;
            align-self: center;
            font-size: 0.85rem;
            color: #800000;
            font-weight: 600;
            background: none;
            border: none;
            cursor: pointer;
            text-decoration: underline;
          }
          .noti-clear-btn:disabled {
            color: #c9a9a2;
            cursor: default;
            text-decoration: none;
          }

          /* POPUP DE NOTIFICACIONES NUEVAS ARRIBA */
          .new-noti-popup {
            position: fixed;
            top: 1rem;
            left: 50%;
            transform: translateX(calc(-50% + var(--popup-translate-x, 0px)));
            background-color: #f5e8d5;
            border: 2px solid #800000;
            border-radius: 1rem;
            box-shadow: 0 4px 10px rgb(128 0 0 / 0.5);
            padding: 0.75rem 1.2rem;
            font-weight: 600;
            color: #800000;
            display: flex;
            align-items: center;
            gap: 0.6rem;
            user-select: none;
            cursor: grab;
            transition: transform 0.3s ease, opacity 0.3s ease;
            z-index: 10000;
          }
          .new-noti-popup:active {
            cursor: grabbing;
          }
        `}
      </style>

      {/* Popup notificación arriba */}
      {newNotiPopupVisible && (
        <div
          className="new-noti-popup"
          style={{ '--popup-translate-x': `${popupTranslateX}px` } as React.CSSProperties}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          onMouseMove={handleDragMove}
          onTouchMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onTouchEnd={handleDragEnd}
          onMouseLeave={handleDragEnd}
          role="alert"
          aria-live="assertive"
        >
          <span>Tienes {notifications.filter(n => !n.leido).length} notificación{notifications.filter(n => !n.leido).length > 1 ? 'es' : ''} nuevas</span>
          <img src="/notificacion.png" alt="Campanita" className="h-6 w-6" />
        </div>
      )}

      <div className="relative z-10">
        {/* Header */}
        <header className="backdrop-blur-md bg-folkiRed/90 shadow-lg sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 overflow-visible">
              <div className="logo-container">
                <span className="logo-halo" />
                <img src="/logo.png" alt="Folki Logo" className="h-16 w-auto object-contain logo-glow" />
              </div>

              <div className="flex items-center space-x-3 ml-auto">
                {/* Botón lupa para buscar usuarios */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserSearch(true)}
                    className="noti-button relative p-2 rounded-full shadow-md"
                    aria-label="Buscar usuarios"
                    title="Buscar usuarios"
                  >
                    <img
                      src="/lupa.png"
                      alt="Buscar"
                      className="h-6 w-6"
                    />
                  </button>
                </div>
                {/* Notificaciones */}
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="noti-button relative p-2 rounded-full shadow-md"
                    aria-label="Mostrar notificaciones"
                    title="Mostrar notificaciones"
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
                    <div className="noti-modal absolute right-0 mt-2 z-50" role="dialog" aria-modal="true" aria-label="Lista de notificaciones">
                      <div className="noti-modal-header">
                        <span>Notificaciones</span>
                        <button
                          className="text-sm text-blue-700 hover:underline"
                          onClick={markAllAsRead}
                          title="Marcar todas como leídas"
                        >
                          Marcar todo como leído
                        </button>
                      </div>
                      <div className="noti-modal-list">
                        {notifications.length === 0 && (
                          <p className="text-sm text-gray-600">Sin notificaciones</p>
                        )}
                        {notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`noti-item ${n.leido ? 'read' : ''}`}
                          >
                            {n.from_user?.avatar ? (
                              <img src={n.from_user.avatar} alt={`${n.from_user.full_name} avatar`} className="noti-avatar" />
                            ) : (
                              <div className="noti-avatar bg-gray-300 flex items-center justify-center text-sm text-gray-600 font-semibold">
                                ?
                              </div>
                            )}
                            <div className="noti-text">
                              {n.type === 'like' ? (
                                `🧡 ${n.from_user?.full_name} le dio like a ${n.event?.type} "${n.event?.title}"`
                              ) : n.type === 'attend' ? (
                                `🎟️ ${n.from_user?.full_name} indicó que asistirá a ${n.event?.type} "${n.event?.title}"`
                              ) : n.type === 'follow' ? (
                                `👥 ${n.from_user?.full_name} se unió a tu red`
                              ) : null}
                            </div>
                            {!n.leido && (
                              <button
                                onClick={() => markOneAsRead(n.id)}
                                aria-label="Marcar notificación como leída"
                                title="Marcar como leído"
                              >
                                ✓
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <button
                        className="noti-clear-btn"
                        onClick={clearReadNotifications}
                        disabled={notifications.filter(n => n.leido).length === 0}
                        title="Limpiar notificaciones leídas"
                      >
                        Limpiar notificaciones
                      </button>
                    </div>
                  )}
                </div>

                 {/* 📢 Anuncios funcionales */}
                <AdminAnnouncements userId={user?.id} />
              </div>
            </div>
          </div>
        </header>

        {/* Navegación */}
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

        {/* Footer */}
        <footer className="bg-folkiRed text-white border-t border-folkiAmber mt-12 pt-8 pb-10 text-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Logo + frase */}
            <div className="text-center space-y-4">
              <div className="flex justify-center items-center overflow-visible">
                <div className="logo-container">
                  <span className="logo-halo" />
                  <img src="/logo.png" alt="Folki Icon" className="h-[70px] w-auto object-contain logo-glow" />
                </div>
              </div>
              <p className="text-folkiCream text-base max-w-lg mx-auto">
                La primer cartelera del Folklore Argentino. Conectando eventos, creando comunidad.
              </p>
            </div>

            {/* Línea superior: links legales */}
            <div className="mt-8 border-t border-folkiAmber pt-4">
              <div className="flex justify-between items-center text-xs sm:text-sm text-folkiCream">
                <button
                  onClick={() => setShowTerms(true)}
                  className="underline hover:text-folkiAmber transition"
                  type="button"
                >
                  Términos y condiciones
                </button>

                <button
                  onClick={() => setShowPrivacy(true)}
                  className="underline hover:text-folkiAmber transition"
                  type="button"
                >
                  Política de privacidad
                </button>
              </div>

              {/* Línea inferior: derechos + soporte */}
              <div className="mt-4 text-center text-xs sm:text-sm text-folkiCream space-y-1">
              <div>© 2025 Folki App. Todos los derechos reservados.</div>
               <div>
                  Soporte:{' '}
                <a
                   href="mailto:eventos.folki@gmail.com"
                   className="underline hover:text-folkiAmber"
                >
                 eventos.folki@gmail.com 
                </a>
              </div> 
            </div>
          </div>
        </div>
      </footer>
    </div> <LegalModal
              open={showTerms}   
              onClose={() => setShowTerms(false)}
              type="terminos"
            />
            <LegalModal
              open={showPrivacy}   
              onClose={() => setShowPrivacy(false)}
              type="privacidad"
            />
            {showUserSearch && (
              <UserSearchModal onClose={() => setShowUserSearch(false)} />
            )}
    </div>
);
}

