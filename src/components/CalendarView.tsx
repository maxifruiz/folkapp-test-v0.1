import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Event } from '../types';
import { EventCard } from './EventCard';

interface CalendarViewProps {
  events: Event[];
  onLike: (eventId: string) => void;
  onAttend: (eventId: string) => void;
  currentUserId?: string;
}

export function CalendarView({ events, onLike, onAttend, currentUserId }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dayEvents, setDayEvents] = useState<Event[]>([]);
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
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
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
              className={`
                relative min-h-[90px] p-3 rounded-lg border 
                ${date ? 'cursor-pointer hover:bg-neutral-50' : ''}
                ${isToday ? 'bg-red-50 border-red-300' : 'border-neutral-100'}
              `}
              onClick={() => eventsForDay.length > 0 && setDayEvents(eventsForDay)}
              aria-label={date ? `Día ${date.getDate()}` : undefined}
              role={date ? 'button' : undefined}
              tabIndex={date ? 0 : undefined}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && eventsForDay.length > 0) setDayEvents(eventsForDay);
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
                      className={`
                        text-xs px-2 py-1 mb-1 rounded truncate font-semibold
                        ${
                          event.type === 'peña' ? 'bg-red-100 text-red-800' :
                          event.type === 'festival' ? 'bg-orange-100 text-orange-800' :
                          event.type === 'certamen' ? 'bg-purple-100 text-purple-800' :
                          event.type === 'concierto' ? 'bg-blue-100 text-blue-800' :
                          event.type === 'milonga' ? 'bg-pink-100 text-pink-800' :
                          event.type === 'taller' ? 'bg-green-100 text-green-800' :
                          event.type === 'encuentro' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }
                      `}
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

      {/* Modal para seleccionar evento del día si hay varios */}
      {dayEvents.length > 0 && !selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-5">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-lg font-semibold text-neutral-800">Eventos del día</h3>
            {dayEvents.map(event => (
              <button
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className="w-full text-left p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-sm transition"
              >
                {event.title}
              </button>
            ))}
            <button
              onClick={() => setDayEvents([])}
              className="text-sm text-red-600 hover:underline"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Modal con tarjeta del evento seleccionado */}
      {selectedEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-w-3xl w-full max-h-[90vh] overflow-auto rounded-xl shadow-2xl bg-white relative">
            <EventCard
              event={selectedEvent}
              onLike={onLike}
              onAttend={onAttend}
              currentUserId={currentUserId}
            />
            <button
              onClick={() => {
                setSelectedEvent(null);
                setDayEvents([]);
              }}
              aria-label="Cerrar detalle de evento"
              className="absolute top-4 right-4 bg-white bg-opacity-90 p-2 rounded-full hover:bg-opacity-100 transition duration-200"
            >
              <ChevronRight className="h-6 w-6 text-neutral-600 rotate-45" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
