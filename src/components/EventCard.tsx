import React, { useState } from 'react';
import {
  Heart,
  Calendar as CalendarIcon,
  X,
  DollarSign,
} from 'lucide-react';
import { ReactionModal } from './ReactionModal';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

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
  index?: number;
  forceOpen?: boolean;
  onClose?: () => void;
}

export function EventCard({
  event,
  currentUserId,
  onToggleLike,
  onToggleAttending,
  index = 0,
  forceOpen = false,
  onClose,
}: EventCardProps) {
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [showAttendingModal, setShowAttendingModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
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
    taller: 'bg-pink-100 text-pink-800',
    convocatoria: 'bg-indigo-100 text-indigo-800',
    funcion: 'bg-yellow-100 text-yellow-800',
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

  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  const cardClickHandler = () => {
    if (!forceOpen) setShowDetail(true);
  };

  const handleCloseDetail = () => {
    if (onClose) onClose();
    else setShowDetail(false);
  };

  React.useEffect(() => {
    if (forceOpen) setShowDetail(true);
    else setShowDetail(false);
  }, [forceOpen]);

  return (
    <>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{
          duration: 1.2,
          ease: 'easeOut',
          delay: index * 0.5,
        }}
        className="relative bg-white rounded-3xl border-2 border-gray-300 shadow-[0_8px_30px_rgba(0,0,0,0.3),0_0_10px_rgba(255,255,255,0.3)_inset] overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-[1.05] hover:shadow-[0_12px_40px_rgba(0,0,0,0.4),0_0_15px_rgba(255,255,255,0.4)_inset]" 
        onClick={cardClickHandler}
      >
        {event.type && (
          <div
            className={`absolute top-0 left-0 px-3 py-1 text-xs font-bold rounded-br-xl ${eventTypeStyle} animate-flamear`}
          >
            {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
          </div>
        )}

        {imageUrl && (
          <img
            src={imageUrl}
            alt={event.title}
            className="w-full h-48 object-cover border-b border-gray-200"
          />
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
            <div className={`flex items-center space-x-1 ${userLiked ? 'text-red-600' : 'text-gray-600'}`}>
              <Heart className={`w-5 h-5 ${userLiked ? 'fill-current' : ''}`} />
              <span className="text-sm">{likes.length}</span>
            </div>
            <div className={`flex items-center space-x-1 ${userAttending ? 'text-green-600' : 'text-gray-600'}`}>
              <CalendarIcon className={`w-5 h-5 ${userAttending ? 'fill-current' : ''}`} />
              <span className="text-sm">{attending.length}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {showDetail && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center animate-fade-in">
          <div className="bg-white max-w-2xl w-full mx-4 rounded-xl shadow-2xl relative animate-slide-up max-h-[90vh] overflow-y-auto">
            <button
              onClick={handleCloseDetail}
              className="absolute top-3 right-3 text-gray-700 hover:text-black text-3xl font-bold bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg"
              aria-label="Cerrar detalle evento"
            >
              <X className="w-6 h-6 text-gray-800" />
            </button>
            {imageUrl && (
              <img
                src={imageUrl}
                alt={event.title}
                className="w-full h-auto max-h-[320px] object-cover cursor-pointer"
                onClick={() => setShowFullImage(true)}
              />
            )}
            <div className="p-6 space-y-4 relative">
              {likeAnimation && (
                <>
                  <img
                    src="/like.gif"
                    alt="like animation"
                    className="absolute w-40 h-40 pointer-events-none z-[999]"
                    style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
                  />
                  <div
                    className="absolute text-4xl font-bold text-red-600 pointer-events-none z-[999] select-none"
                    style={{ top: '60%', left: '50%', transform: 'translate(-50%, 0)' }}
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
                    className="absolute w-40 h-40 pointer-events-none z-[999]"
                    style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
                  />
                  <div
                    className="absolute text-4xl font-bold text-green-600 pointer-events-none z-[999] select-none"
                    style={{ top: '60%', left: '50%', transform: 'translate(-50%, 0)' }}
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

      {showFullImage && imageUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={() => setShowFullImage(false)}
        >
          <img
            src={imageUrl}
            alt="Imagen completa"
            className="max-w-full max-h-full rounded-xl shadow-xl cursor-pointer"
            onClick={() => setShowFullImage(false)}
          />
          <button
            className="absolute top-4 right-4 text-white text-3xl bg-black bg-opacity-50 hover:bg-opacity-80 rounded-full px-4 py-2"
            onClick={() => setShowFullImage(false)}
            aria-label="Cerrar imagen completa"
          >
            ×
          </button>
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
