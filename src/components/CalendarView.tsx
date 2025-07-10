import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { EventCard } from './EventCard';
import { Event } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface CalendarViewProps {
  events: Event[];
  onLike: (eventId: string, userId: string) => Promise<void>;
  onAttend: (eventId: string, userId: string) => Promise<void>;
  currentUserId?: string;
  currentUserFullName?: string;
  currentUserAvatar?: string;
}

export function CalendarView({
  events,
  onLike,
  onAttend,
  currentUserId,
  currentUserFullName,
  currentUserAvatar,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dayEvents, setDayEvents] = useState<Event[]>([]);
  const [showDayEventsModal, setShowDayEventsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getEventsForDate = (date: Date | null) => {
    if (!date) return [];
    return events
      .filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.toDateString() === date.toDateString();
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      direction === 'prev'
        ? newDate.setMonth(newDate.getMonth() - 1)
        : newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const days = getDaysInMonth(currentDate);

  // Guarda la fecha seleccionada para mostrar en el modal
  const [modalDate, setModalDate] = useState<Date | null>(null);

  const openDayEventsModal = (date: Date) => {
    const eventsForDay = getEventsForDate(date);
    setDayEvents(eventsForDay);
    setModalDate(date);
    setShowDayEventsModal(true);
    setSelectedEvent(null);
  };

  const openEventDetail = (event: Event) => {
    const fullEvent = events.find(e => e.id === event.id);
    if (fullEvent) {
      setSelectedEvent(fullEvent);
      setShowDayEventsModal(false);
    } else {
      console.warn('[CalendarView] Evento no encontrado:', event.id);
    }
  };

  const closeEventDetail = () => {
    setSelectedEvent(null);
    setShowDayEventsModal(true);
  };

  const handleToggleLike = async (eventId: string) => {
    if (!currentUserId) return;

    await onLike(eventId, currentUserId);

    if (selectedEvent && selectedEvent.id === eventId) {
      const userLiked = selectedEvent.reactions.likes.some(u => u?.id === currentUserId);
      let updatedLikes;

      if (userLiked) {
        updatedLikes = selectedEvent.reactions.likes.filter(u => u?.id !== currentUserId);
      } else {
        updatedLikes = [
          ...selectedEvent.reactions.likes,
          {
            id: currentUserId,
            full_name: currentUserFullName || '',
            avatar: currentUserAvatar || '',
          },
        ];
      }

      setSelectedEvent({
        ...selectedEvent,
        reactions: {
          ...selectedEvent.reactions,
          likes: updatedLikes,
        },
      });
    }
  };

  const handleToggleAttend = async (eventId: string) => {
    if (!currentUserId) return;

    await onAttend(eventId, currentUserId);

    if (selectedEvent && selectedEvent.id === eventId) {
      const userAttending = selectedEvent.reactions.attending.some(u => u?.id === currentUserId);
      let updatedAttending;

      if (userAttending) {
        updatedAttending = selectedEvent.reactions.attending.filter(u => u?.id !== currentUserId);
      } else {
        updatedAttending = [
          ...selectedEvent.reactions.attending,
          {
            id: currentUserId,
            full_name: currentUserFullName || '',
            avatar: currentUserAvatar || '',
          },
        ];
      }

      setSelectedEvent({
        ...selectedEvent,
        reactions: {
          ...selectedEvent.reactions,
          attending: updatedAttending,
        },
      });
    }
  };

  // Función para formatear fecha en modal (Ej: Domingo 06/07/25)
  const formatModalDate = (date: Date | null) => {
    if (!date) return '';
    const dayName = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][date.getDay()];
    const dd = date.getDate().toString().padStart(2, '0');
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const yy = date.getFullYear().toString().slice(-2);
    return `${dayName} ${dd}/${mm}/${yy}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-neutral-800">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex space-x-3">
          <button
            onClick={() => navigateMonth('prev')}
            aria-label="Mes anterior"
            className="p-2 rounded-lg hover:bg-neutral-100 transition-colors duration-200"
          >
            <ChevronLeft className="h-6 w-6 text-neutral-600" />
          </button>
          <button
            onClick={() => navigateMonth('next')}
            aria-label="Mes siguiente"
            className="p-2 rounded-lg hover:bg-neutral-100 transition-colors duration-200"
          >
            <ChevronRight className="h-6 w-6 text-neutral-600" />
          </button>
        </div>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1 mb-3">
        {dayNames.map(day => (
          <div
            key={day}
            className="p-3 text-center text-sm font-semibold text-neutral-600 select-none"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Días del calendario */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, idx) => {
          const eventsForDay = getEventsForDate(date);
          const isToday = date && date.toDateString() === new Date().toDateString();

          return (
            <div
              key={idx}
              className={`relative min-h-[90px] p-3 rounded-lg border 
                ${date ? 'cursor-pointer hover:bg-neutral-50' : ''}
                ${isToday ? 'bg-red-50 border-red-300' : 'border-neutral-100'}`}
              onClick={() => {
                if (eventsForDay.length > 0 && date) {
                  openDayEventsModal(date);
                }
              }}
              aria-label={date ? `Día ${date.getDate()}` : undefined}
              role={date ? 'button' : undefined}
              tabIndex={date ? 0 : undefined}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && eventsForDay.length > 0 && date) {
                  openDayEventsModal(date);
                }
              }}
            >
              {date && (
                <>
                  <div
                    className={`text-sm font-semibold mb-2 ${
                      isToday ? 'text-red-700' : 'text-neutral-800'
                    }`}
                  >
                    {date.getDate()}
                  </div>

                  {eventsForDay.slice(0, 2).map(event => (
                    <div
                      key={event.id}
                      className={`text-xs px-2 py-1 mb-1 rounded truncate font-semibold
                      ${
                        event.type === 'peña'
                          ? 'bg-red-100 text-red-800'
                          : event.type === 'festival'
                          ? 'bg-orange-100 text-orange-800'
                          : event.type === 'certamen'
                          ? 'bg-purple-100 text-purple-800'
                          : event.type === 'recital'
                          ? 'bg-blue-100 text-blue-800'
                          : event.type === 'clase'
                          ? 'bg-green-100 text-green-800'
                          : event.type === 'taller'
                          ? 'bg-pink-100 text-pink-800'
                          : event.type === 'convocatoria'
                          ? 'bg-indigo-100 text-indigo-800'
                          : event.type === 'funcion'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}

                  {eventsForDay.length > 2 && (
                    <div className="text-xs text-neutral-500 select-none">
                      +{eventsForDay.length - 2} más
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal lista eventos del día con animación */}
      <AnimatePresence>
        {showDayEventsModal && !selectedEvent && (
          <motion.div
            key="dayEventsModal"
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 space-y-4"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="flex items-baseline justify-between">
                <h3 className="text-lg font-semibold text-neutral-800">Eventos del día</h3>
                <span className="text-sm text-neutral-600 ml-2">{formatModalDate(modalDate)}</span>
              </div>

              {dayEvents.map(event => {
                const eventTypeStyle =
                  {
                    peña: 'bg-red-100 text-red-800',
                    certamen: 'bg-purple-100 text-purple-800',
                    festival: 'bg-orange-100 text-orange-800',
                    recital: 'bg-blue-100 text-blue-800',
                    clase: 'bg-green-100 text-green-800',
                    taller: 'bg-pink-100 text-pink-800',
                    convocatoria: 'bg-indigo-100 text-indigo-800',
                    funcion: 'bg-yellow-100 text-yellow-800',
                  }[event.type || ''] || 'bg-gray-100 text-gray-800';

                return (
                  <button
                    key={event.id}
                    onClick={() => openEventDetail(event)}
                    className="w-full flex justify-between items-center p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-sm transition"
                  >
                    <span className="truncate max-w-[75%]">{event.title}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${eventTypeStyle}`}>
                      {event.type}
                    </span>
                  </button>
                );
              })}
              <button
                onClick={() => setShowDayEventsModal(false)}
                className="text-sm text-red-600 hover:underline"
              >
                Cancelar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal detalle evento con EventCard */}
      {selectedEvent && (
        <EventCard
          event={selectedEvent}
          currentUserId={currentUserId || ''}
          onToggleLike={handleToggleLike}
          onToggleAttending={handleToggleAttend}
          forceOpen={true}
          onClose={closeEventDetail}
        />
      )}
    </div>
  );
}
