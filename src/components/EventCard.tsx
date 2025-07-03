import React, { useState, useEffect, useCallback } from 'react';
import {
  Heart,
  Calendar as CalendarIcon,
  DollarSign,
  X,
} from 'lucide-react';
import { ReactionModal } from './ReactionModal';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

// --- INTERFACES ---
interface User {
  id: string;
  full_name: string;
  avatar: string;
}

interface MultimediaItem {
  id: string;
  type?: string;
  url: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  type?: string;
  location?: string;
  address?: string;
  city?: string;
  province?: string;
  price_anticipada?: number;
  price_general?: number;
  multimedia?: MultimediaItem[];
  organizer?: {
    id?: string;
    full_name?: string;
    avatar?: string;
  } | null;
  reactions: {
    likes: (User | null)[];
    attending: (User | null)[];
  };
}

interface EventCardProps {
  event: Event;
  currentUserId: string;
  onToggleLike: (eventId: string, userId: string) => void;
  onToggleAttending: (eventId: string, userId: string) => void;
  index?: number; // <--- nuevo para delay animación
}

interface EventListProps {
  events: Event[];
  currentUserId: string;
  onToggleLike: (eventId: string, userId: string) => void;
  onToggleAttending: (eventId: string, userId: string) => void;
}

// --- COMPONENTE EVENTCARD ---
export function EventCard({
  event,
  currentUserId,
  onToggleLike,
  onToggleAttending,
  index = 0, // default 0
}: EventCardProps) {
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [showAttendingModal, setShowAttendingModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [likeAnimation, setLikeAnimation] = useState(false);
  const [attendAnimation, setAttendAnimation] = useState(false);

  const likes = event.reactions.likes?.filter(Boolean) ?? [];
  const attending = event.reactions.attending?.filter(Boolean) ?? [];

  const userLiked = likes.some((u) => u.id === currentUserId);
  const userAttending = attending.some((u) => u.id === currentUserId);

  const imageUrl =
    event.multimedia && event.multimedia.length > 0
      ? event.multimedia[0].url
      : '';

  const organizerName = event.organizer?.full_name || 'Organizador desconocido';
  const organizerAvatar =
    event.organizer?.avatar && event.organizer.avatar !== ''
      ? event.organizer.avatar
      : 'https://via.placeholder.com/40?text=👤';

  const truncateTitle = (title: string, maxLength: number) => {
    if (title.length <= maxLength) return title;
    return title.slice(0, maxLength) + '...';
  };

  const isFreeEvent =
    (!event.price_anticipada || event.price_anticipada === 0) &&
    (!event.price_general || event.price_general === 0);

  const eventTypeStyle = {
    peña: 'bg-red-100 text-red-800',
    certamen: 'bg-purple-100 text-purple-800',
    festival: 'bg-orange-100 text-orange-800',
    recital: 'bg-blue-100 text-blue-800',
    clase: 'bg-green-100 text-green-800',
    encuentro: 'bg-yellow-100 text-yellow-800',
  }[event.type || ''] || 'bg-gray-100 text-gray-800';

  const triggerLike = () => {
    if (!userLiked) {
      setLikeAnimation(true);
      setTimeout(() => setLikeAnimation(false), 2000);
    }
    onToggleLike(event.id, currentUserId);
  };

  const triggerAttend = () => {
    if (!userAttending) {
      setAttendAnimation(true);
      setTimeout(() => setAttendAnimation(false), 2000);
    }
    onToggleAttending(event.id, currentUserId);
  };

  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1, ease: 'easeOut', delay: index * 0.3 }} // delay incremental por index
        className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg relative"
        onClick={() => setShowDetail(true)}
      >
        {event.type && (
          <div
            className={`absolute top-0 left-0 px-3 py-1 text-xs font-bold rounded-br-xl ${eventTypeStyle} animate-flamear`}
          >
            {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
          </div>
        )}

        {imageUrl && (
          <img src={imageUrl} alt={event.title} className="w-full h-48 object-cover" />
        )}

        <div className="p-4 space-y-0.5 pb-2 bg-white">
          <h2 className="text-lg font-semibold text-gray-800">
            {truncateTitle(event.title, 30)}
          </h2>

          <div className="text-xs text-gray-600">
            🗓️ <strong>Fecha:</strong>{' '}
            {new Date(event.date).toLocaleString('es-AR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </div>

          {(event.province || event.city) && (
            <div className="text-xs text-gray-600">
              🗺️ <strong>Ubicación:</strong>{' '}
              {[event.province, event.city].filter(Boolean).join(' - ')}
            </div>
          )}

          <div className="flex items-center mt-1 space-x-2">
            <img
              src={organizerAvatar}
              alt={organizerName}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="text-xs text-gray-700 leading-tight">
              Evento creado por <span className="font-semibold">{organizerName}</span>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-4 mt-2">
            <div
              className={`flex items-center space-x-1 ${
                userLiked ? 'text-red-600' : 'text-gray-600'
              }`}
            >
              <Heart className={`w-5 h-5 ${userLiked ? 'fill-current' : ''}`} />
              <span className="text-sm">{likes.length}</span>
            </div>
            <div
              className={`flex items-center space-x-1 ${
                userAttending ? 'text-green-600' : 'text-gray-600'
              }`}
            >
              <CalendarIcon className={`w-5 h-5 ${userAttending ? 'fill-current' : ''}`} />
              <span className="text-sm">{attending.length}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modal Detalle */}
      {showDetail && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center animate-fade-in">
          <div className="bg-white max-w-2xl w-full mx-4 rounded-xl overflow-hidden shadow-xl relative animate-slide-up">
            <button
              onClick={() => setShowDetail(false)}
              className="absolute top-3 right-3 text-gray-700 hover:text-black"
            >
              <X className="w-6 h-6" />
            </button>

            {imageUrl && (
              <img
                src={imageUrl}
                alt={event.title}
                className="w-full h-auto max-h-[320px] object-cover"
              />
            )}

            <div className="p-6 space-y-4 relative">
              {likeAnimation && (
                <>
                  <img
                    src="/like.gif"
                    alt="like animation"
                    className="fixed top-1/2 left-1/2 w-40 h-40 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[999]"
                    style={{ animation: 'none' }} // quitamos animación css para controlar timing JS
                  />
                  <div
                    className="fixed top-[60%] left-1/2 transform -translate-x-1/2 text-4xl font-bold text-red-600 pointer-events-none z-[999] select-none"
                    style={{ userSelect: 'none' }}
                  >
                    ¡Like!
                  </div>
                </>
              )}
              {attendAnimation && (
                <>
                  <img
                    src="/asistire.gif"
                    alt="asistiré animation"
                    className="fixed top-1/2 left-1/2 w-40 h-40 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[999]"
                    style={{ animation: 'none' }}
                  />
                  <div
                    className="fixed top-[60%] left-1/2 transform -translate-x-1/2 text-4xl font-bold text-green-600 pointer-events-none z-[999] select-none"
                    style={{ userSelect: 'none' }}
                  >
                    ¡Asistiré!
                  </div>
                </>
              )}

              <h2 className="text-2xl font-bold text-gray-900">{event.title}</h2>
              <p className="text-gray-800 whitespace-pre-line">{event.description}</p>
              <div className="text-gray-600 text-sm">
                🗓️ <strong>Fecha:</strong>{' '}
                {new Date(event.date).toLocaleString('es-AR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </div>
              {(event.province || event.city) && (
                <div className="text-gray-600 text-sm">
                  🗺️ <strong>Ubicación:</strong>{' '}
                  {[event.province, event.city].filter(Boolean).join(' - ')}
                </div>
              )}
              {event.address && (
                <div className="text-gray-600 text-sm">
                  📍 <strong>Dirección:</strong> {event.address}
                </div>
              )}
              <div className="text-red-600 text-sm space-y-1">
                {isFreeEvent ? (
                  <div>Evento gratuito</div>
                ) : (
                  <>
                    {event.price_anticipada !== undefined && event.price_anticipada !== 0 && (
                      <div>
                        <DollarSign className="w-4 h-4 inline mr-1" />
                        Valor anticipada: ${event.price_anticipada}
                      </div>
                    )}
                    {event.price_general !== undefined && event.price_general !== 0 && (
                      <div>
                        <DollarSign className="w-4 h-4 inline mr-1" />
                        Valor general: ${event.price_general}
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="flex items-center">
                <img
                  src={organizerAvatar}
                  alt={organizerName}
                  className="w-10 h-10 rounded-full mr-3 object-cover"
                />
                <span className="text-sm text-gray-700">
                  Evento creado por <strong>{organizerName}</strong>
                </span>
              </div>
              <div className="flex items-center justify-center space-x-6 mt-6">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={triggerLike}
                    className={`flex items-center space-x-1 focus:outline-none ${
                      userLiked ? 'text-red-600' : 'text-gray-400'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${userLiked ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={() => setShowLikesModal(true)}
                    className="text-sm text-blue-600 hover:underline focus:outline-none"
                  >
                    Ver likes
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={triggerAttend}
                    className={`flex items-center space-x-1 focus:outline-none ${
                      userAttending ? 'text-green-600' : 'text-gray-400'
                    }`}
                  >
                    <CalendarIcon className={`w-5 h-5 ${userAttending ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={() => setShowAttendingModal(true)}
                    className="text-sm text-blue-600 hover:underline focus:outline-none"
                  >
                    Ver asistencia
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ReactionModal
        isOpen={showLikesModal}
        onClose={() => setShowLikesModal(false)}
        title={`Me gusta - ${event.title}`}
        users={likes}
        type="likes"
      />
      <ReactionModal
        isOpen={showAttendingModal}
        onClose={() => setShowAttendingModal(false)}
        title={`Asistirán - ${event.title}`}
        users={attending}
        type="attending"
      />
    </>
  );
}

// --- COMPONENTE EVENTLIST ---
// Muestra la lista de eventos con lazy load para ir mostrando más tarjetas
export function EventList({
  events,
  currentUserId,
  onToggleLike,
  onToggleAttending,
}: EventListProps) {
  const [visibleCount, setVisibleCount] = useState(5);

  const loadMore = useCallback(() => {
    setVisibleCount((count) => Math.min(count + 5, events.length));
  }, [events.length]);

  // Listener scroll para cargar más eventos cuando el usuario llega cerca del final
  useEffect(() => {
    function onScroll() {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 300
      ) {
        loadMore();
      }
    }

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [loadMore]);

  // Siempre que cambia la lista de eventos (p.ej. filtrado), resetear visibleCount
  useEffect(() => {
    setVisibleCount(5);
  }, [events]);

  return (
    <div className="space-y-6">
      {events.slice(0, visibleCount).map((event, idx) => (
        <EventCard
          key={event.id}
          event={event}
          currentUserId={currentUserId}
          onToggleLike={onToggleLike}
          onToggleAttending={onToggleAttending}
          index={idx} // <--- le paso index para delay animación
        />
      ))}

      {visibleCount < events.length && (
        <div className="text-center text-gray-500 py-4">
          Desliza hacia abajo para cargar más eventos...
        </div>
      )}
    </div>
  );
}
