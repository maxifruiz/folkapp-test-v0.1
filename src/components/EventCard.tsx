import React, { useState } from 'react';
import { Heart, Calendar as CalendarIcon, MapPin, Clock, DollarSign, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Event } from '../types';
import { ReactionModal } from './ReactionModal';

interface EventCardProps {
  event: Event;
  onLike: (eventId: string) => void;
  onAttend: (eventId: string) => void;
  currentUserId?: string;
}

export function EventCard({ event, onLike, onAttend, currentUserId }: EventCardProps) {
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [showAttendingModal, setShowAttendingModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  const isLiked = currentUserId ? event.reactions?.likes?.includes(currentUserId) ?? false : false;
  const isAttending = currentUserId ? event.reactions?.attending?.includes(currentUserId) ?? false : false;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const formatPriceDetailed = (price: any) => {
    if (price === 'free') return 'Gratis';
    if (price && typeof price === 'object') {
      return (
        <>
          <p>Valor anticipada: <strong>${price?.anticipada ?? 'N/A'}</strong></p>
          <p>Valor general: <strong>${price?.general ?? 'N/A'}</strong></p>
        </>
      );
    }
    if (typeof price === 'number') {
      return <p><strong>${price}</strong></p>;
    }
    return <p>Sin precio</p>;
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      peña: 'bg-red-100 text-red-800 border-red-200',
      festival: 'bg-orange-100 text-orange-800 border-orange-200',
      certamen: 'bg-purple-100 text-purple-800 border-purple-200',
      concierto: 'bg-blue-100 text-blue-800 border-blue-200',
      milonga: 'bg-pink-100 text-pink-800 border-pink-200',
      taller: 'bg-green-100 text-green-800 border-green-200',
      encuentro: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      otro: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[type as keyof typeof colors] || colors.otro;
  };

  const goToNextMedia = () => {
    setCurrentMediaIndex((prevIndex) => (prevIndex + 1) % event.multimedia.length);
  };

  const goToPrevMedia = () => {
    setCurrentMediaIndex((prevIndex) =>
      prevIndex === 0 ? event.multimedia.length - 1 : prevIndex - 1
    );
  };

  return (
    <>
      <div
        className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-transform duration-300 overflow-hidden border border-neutral-200 transform hover:-translate-y-1 cursor-pointer"
        onClick={() => setIsExpanded(true)}
      >
        <div className="relative h-48 overflow-hidden rounded-t-xl">
          <img
            src={event.multimedia?.[0]?.url}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          />
          <div className="absolute top-4 left-4">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getEventTypeColor(event.type)}`}>
              {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
            </span>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-xl font-bold text-neutral-900 leading-tight mb-2">
            {event.title}
          </h3>

          <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
            {event.description}
          </p>

          <div className="space-y-2 mb-5">
            <div className="flex items-center text-sm text-neutral-600">
              <Clock className="h-5 w-5 mr-2 text-red-600" />
              <span className="font-medium">{formatDate(event.date)}</span>
            </div>

            <div className="flex items-center text-sm text-neutral-600">
              <MapPin className="h-5 w-5 mr-2 text-red-600" />
              <span>{event.city}, {event.province}</span>
            </div>

            <div className="flex items-center text-sm text-neutral-600">
              <DollarSign className="h-5 w-5 mr-2 text-red-600" />
              <span className="font-semibold text-red-700">
                {formatPriceDetailed(event.price)}
              </span>
            </div>
          </div>

          <div className="flex items-center mb-5 pb-5 border-b border-neutral-100">
            <img
              src={event.organizer?.avatar}
              alt={event.organizer?.full_name}
              className="w-9 h-9 rounded-full mr-3"
            />
            <div>
              <p className="text-xs text-neutral-500">Evento creado por</p>
              <p className="text-sm font-medium text-neutral-800">{event.organizer?.full_name ?? 'Organizador desconocido'}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex space-x-5">
              <button
                onClick={(e) => { e.stopPropagation(); onLike(event.id); }}
                className={`flex items-center space-x-2 px-5 py-2 rounded-lg transition-all duration-300 text-sm font-medium ${
                  isLiked
                    ? 'bg-red-100 text-red-700 border-2 border-red-200'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-red-50 hover:text-red-600 border-2 border-transparent'
                }`}
              >
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                <span>{event.reactions?.likes?.length ?? 0}</span>
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); onAttend(event.id); }}
                className={`flex items-center space-x-2 px-5 py-2 rounded-lg transition-all duration-300 text-sm font-medium ${
                  isAttending
                    ? 'bg-green-100 text-green-700 border-2 border-green-200'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-green-50 hover:text-green-600 border-2 border-transparent'
                }`}
              >
                <CalendarIcon className={`h-5 w-5 ${isAttending ? 'fill-current' : ''}`} />
                <span>{event.reactions?.attending?.length ?? 0}</span>
              </button>
            </div>

            <div className="flex space-x-3 text-xs">
              <button
                onClick={(e) => { e.stopPropagation(); setShowLikesModal(true); }}
                className="text-neutral-500 hover:text-red-600"
              >
                Ver likes
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setShowAttendingModal(true); }}
                className="text-neutral-500 hover:text-green-600"
              >
                Ver asistentes
              </button>
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4 transition-all animate-fadeInSlow">
          <div className="bg-white max-w-3xl w-full rounded-xl p-6 relative animate-slideUpSlow">
            <button
              className="absolute top-3 right-3 text-neutral-500 hover:text-red-600"
              onClick={() => setIsExpanded(false)}
            >
              <XCircle className="w-6 h-6" />
            </button>
            <div className="mb-4 relative">
              {event.multimedia?.length > 1 && (
                <>
                  <button
                    className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-white rounded-full shadow p-1"
                    onClick={goToPrevMedia}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-white rounded-full shadow p-1"
                    onClick={goToNextMedia}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
              {event.multimedia?.[currentMediaIndex]?.type === 'video' ? (
                <video src={event.multimedia[currentMediaIndex].url} controls className="w-full rounded-lg" />
              ) : (
                <img src={event.multimedia?.[currentMediaIndex]?.url} alt={event.title} className="w-full rounded-lg" />
              )}
            </div>
            <h2 className="text-2xl font-bold mb-2 text-neutral-800">{event.title}</h2>
            <p className="text-neutral-600 mb-4">{event.description}</p>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-neutral-600">
                <Clock className="h-5 w-5 mr-2 text-red-600" />
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center text-sm text-neutral-600">
                <MapPin className="h-5 w-5 mr-2 text-red-600" />
                <span>{event.city}, {event.province} - {event.address}</span>
              </div>
              <div className="flex items-start text-sm text-neutral-600">
                <DollarSign className="h-5 w-5 mr-2 text-red-600 mt-1" />
                <div>{formatPriceDetailed(event.price)}</div>
              </div>
              <div className="flex items-center mt-4">
                <img
                  src={event.organizer?.avatar}
                  alt={event.organizer?.full_name}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <p className="text-xs text-neutral-500">Evento creado por</p>
                  <p className="text-sm font-medium text-neutral-800">{event.organizer?.full_name ?? 'Organizador desconocido'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ReactionModal
        isOpen={showLikesModal}
        onClose={() => setShowLikesModal(false)}
        title="Les gusta este evento"
        userIds={event.reactions?.likes ?? []}
        type="likes"
      />

      <ReactionModal
        isOpen={showAttendingModal}
        onClose={() => setShowAttendingModal(false)}
        title="Asistirán al evento"
        userIds={event.reactions?.attending ?? []}
        type="attending"
      />
    </>
  );
}
