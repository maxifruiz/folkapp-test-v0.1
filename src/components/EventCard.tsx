import React, { useState } from 'react';
import { Heart, Calendar as CalendarIcon, MapPin, Clock, DollarSign, User } from 'lucide-react';
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
  
  const isLiked = currentUserId ? event.reactions.likes.includes(currentUserId) : false;
  const isAttending = currentUserId ? event.reactions.attending.includes(currentUserId) : false;
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatPrice = (price: number | 'free') => {
    if (price === 'free') return 'Gratis';
    return `$${price.toLocaleString('es-AR')}`;
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

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-neutral-200 transform hover:-translate-y-1">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={event.multimedia[0]?.url}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          />
          <div className="absolute top-4 left-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getEventTypeColor(event.type)}`}>
              {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xl font-bold text-neutral-800 leading-tight">
              {event.title}
            </h3>
          </div>

          <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
            {event.description}
          </p>

          {/* Event Details */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-neutral-600">
              <Clock className="h-4 w-4 mr-2 text-red-600" />
              <span className="font-medium">{formatDate(event.date)}</span>
            </div>
            
            <div className="flex items-center text-sm text-neutral-600">
              <MapPin className="h-4 w-4 mr-2 text-red-600" />
              <span>{event.location.city}, {event.location.province}</span>
            </div>
            
            <div className="flex items-center text-sm text-neutral-600">
              <DollarSign className="h-4 w-4 mr-2 text-red-600" />
              <span className="font-semibold text-red-700">{formatPrice(event.price)}</span>
            </div>
          </div>

          {/* Organizer */}
          <div className="flex items-center mb-4 pb-4 border-b border-neutral-100">
            <img
              src={event.organizer.avatar}
              alt={event.organizer.name}
              className="w-8 h-8 rounded-full mr-2"
            />
            <div>
              <p className="text-xs text-neutral-500">Organizado por</p>
              <p className="text-sm font-medium text-neutral-700">{event.organizer.name}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              <button
                onClick={() => onLike(event.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  isLiked
                    ? 'bg-red-100 text-red-700 border-2 border-red-200'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-red-50 hover:text-red-600 border-2 border-transparent'
                }`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                <span className="text-sm font-medium">
                  {event.reactions.likes.length}
                </span>
              </button>

              <button
                onClick={() => onAttend(event.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  isAttending
                    ? 'bg-green-100 text-green-700 border-2 border-green-200'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-green-50 hover:text-green-600 border-2 border-transparent'
                }`}
              >
                <CalendarIcon className={`h-4 w-4 ${isAttending ? 'fill-current' : ''}`} />
                <span className="text-sm font-medium">
                  {event.reactions.attending.length}
                </span>
              </button>
            </div>

            <div className="flex space-x-2 text-xs">
              <button
                onClick={() => setShowLikesModal(true)}
                className="text-neutral-500 hover:text-red-600 transition-colors duration-200"
              >
                Ver likes
              </button>
              <button
                onClick={() => setShowAttendingModal(true)}
                className="text-neutral-500 hover:text-green-600 transition-colors duration-200"
              >
                Ver asistentes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ReactionModal
        isOpen={showLikesModal}
        onClose={() => setShowLikesModal(false)}
        title="Les gusta este evento"
        userIds={event.reactions.likes}
        type="likes"
      />

      <ReactionModal
        isOpen={showAttendingModal}
        onClose={() => setShowAttendingModal(false)}
        title="Asistirán al evento"
        userIds={event.reactions.attending}
        type="attending"
      />
    </>
  );
}