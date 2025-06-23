import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin } from 'lucide-react';
import { Event } from '../types';

interface CalendarViewProps {
  events: Event[];
}

export function CalendarView({ events }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
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
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
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
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const formatEventTime = (date: Date) => {
    return new Intl.DateTimeFormat('es-AR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-neutral-800">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 rounded-lg hover:bg-neutral-100 transition-colors duration-200"
          >
            <ChevronLeft className="h-5 w-5 text-neutral-600" />
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 rounded-lg hover:bg-neutral-100 transition-colors duration-200"
          >
            <ChevronRight className="h-5 w-5 text-neutral-600" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {/* Day headers */}
        {dayNames.map(day => (
          <div key={day} className="p-3 text-center text-sm font-medium text-neutral-600">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {days.map((date, index) => {
          const dayEvents = getEventsForDate(date);
          const isToday = date && date.toDateString() === new Date().toDateString();
          
          return (
            <div
              key={index}
              className={`relative min-h-[80px] p-2 border border-neutral-100 ${
                date ? 'hover:bg-neutral-50 cursor-pointer' : ''
              } ${isToday ? 'bg-red-50 border-red-200' : ''}`}
              onClick={() => {
                if (dayEvents.length > 0) {
                  setSelectedEvent(dayEvents[0]);
                }
              }}
            >
              {date && (
                <>
                  <div className={`text-sm font-medium mb-1 ${
                    isToday ? 'text-red-700' : 'text-neutral-700'
                  }`}>
                    {date.getDate()}
                  </div>
                  
                  {dayEvents.slice(0, 2).map((event, eventIndex) => (
                    <div
                      key={event.id}
                      className={`text-xs p-1 mb-1 rounded truncate ${
                        event.type === 'peña' ? 'bg-red-100 text-red-800' :
                        event.type === 'festival' ? 'bg-orange-100 text-orange-800' :
                        event.type === 'certamen' ? 'bg-purple-100 text-purple-800' :
                        'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {event.title}
                    </div>
                  ))}
                  
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-neutral-500">
                      +{dayEvents.length - 2} más
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="relative h-48">
              <img
                src={selectedEvent.multimedia[0]?.url}
                alt={selectedEvent.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 bg-white bg-opacity-90 p-2 rounded-full hover:bg-opacity-100 transition-all duration-200"
              >
                <ChevronRight className="h-4 w-4 text-neutral-600 transform rotate-45" />
              </button>
            </div>
            
            <div className="p-6">
              <h3 className="text-xl font-bold text-neutral-800 mb-2">
                {selectedEvent.title}
              </h3>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-neutral-600">
                  <Clock className="h-4 w-4 mr-2 text-red-600" />
                  <span>{formatEventTime(selectedEvent.date)}</span>
                </div>
                
                <div className="flex items-center text-sm text-neutral-600">
                  <MapPin className="h-4 w-4 mr-2 text-red-600" />
                  <span>{selectedEvent.location.city}, {selectedEvent.location.province}</span>
                </div>
              </div>
              
              <p className="text-neutral-600 text-sm">
                {selectedEvent.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}