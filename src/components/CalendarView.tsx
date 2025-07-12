import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { EventCard } from './EventCard';
import { Event, EventType } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { EventFilter } from './EventFilter';

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
  /* ------------------------- ESTADO FILTROS ------------------------- */
  const [selectedType, setSelectedType] = useState<EventType | 'all'>('all');
  const [selectedProvince, setSelectedProvince] = useState('');

  const clearFilters = () => {
    setSelectedType('all');
    setSelectedProvince('');
  };

  /* --------------------- EVENTOS FILTRADOS -------------------------- */
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchType = selectedType === 'all' || event.type === selectedType;
      const matchProvince =
        selectedProvince === '' || event.province === selectedProvince;
      return matchType && matchProvince;
    });
  }, [events, selectedType, selectedProvince]);

  /* --------------------- CALENDARIO & MODALES ---------------------- */
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dayEvents, setDayEvents] = useState<Event[]>([]);
  const [showDayEventsModal, setShowDayEventsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [modalDate, setModalDate] = useState<Date | null>(null);

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const getDaysInMonth = (date: Date) => {
    const y = date.getFullYear();
    const m = date.getMonth();
    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0);
    const days: (Date | null)[] = [];

    for (let i = 0; i < first.getDay(); i++) days.push(null);
    for (let d = 1; d <= last.getDate(); d++) days.push(new Date(y, m, d));

    return days;
  };

  const getEventsForDate = (d: Date | null) => {
    if (!d) return [];
    return filteredEvents
      .filter(e => new Date(e.date).toDateString() === d.toDateString())
      .sort(
        (a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
      );
  };

  const navigateMonth = (dir: 'prev' | 'next') =>
    setCurrentDate(prev => {
      const n = new Date(prev);
      dir === 'prev' ? n.setMonth(n.getMonth() - 1) : n.setMonth(n.getMonth() + 1);
      return n;
    });

  const openDayModal = (d: Date) => {
    setDayEvents(getEventsForDate(d));
    setModalDate(d);
    setShowDayEventsModal(true);
    setSelectedEvent(null);
  };

  const openEventDetail = (e: Event) => {
    const full = filteredEvents.find(ev => ev.id === e.id);
    if (full) {
      setSelectedEvent(full);
      setShowDayEventsModal(false);
    }
  };

  const closeEventDetail = () => {
    setSelectedEvent(null);
    setShowDayEventsModal(true);
  };

  const handleToggleLike = async (id: string) => {
    if (!currentUserId) return;
    await onLike(id, currentUserId);
  };

  const handleToggleAttend = async (id: string) => {
    if (!currentUserId) return;
    await onAttend(id, currentUserId);
  };

  const formatModalDate = (d: Date | null) => {
    if (!d) return '';
    const names = [
      'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado',
    ];
    const dd = d.getDate().toString().padStart(2, '0');
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    const yy = d.getFullYear().toString().slice(-2);
    return `${names[d.getDay()]} ${dd}/${mm}/${yy}`;
  };

  const days = getDaysInMonth(currentDate);

  /* --------------------------- RENDER ------------------------------ */
  return (
    <>
      {/* ------------ FILTRO ARRIBA (fuera del cuadro) --------------- */}
      <EventFilter
        selectedType={selectedType}
        selectedProvince={selectedProvince}
        onTypeChange={setSelectedType}
        onProvinceChange={setSelectedProvince}
        onClearFilters={clearFilters}
      />

      {/* ----------------- TARJETA DEL CALENDARIO -------------------- */}
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
        {/* Header calendario */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-neutral-800">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex space-x-3">
            <button
              onClick={() => navigateMonth('prev')}
              aria-label="Mes anterior"
              className="p-2 rounded-lg hover:bg-neutral-100"
            >
              <ChevronLeft className="h-6 w-6 text-neutral-600" />
            </button>
            <button
              onClick={() => navigateMonth('next')}
              aria-label="Mes siguiente"
              className="p-2 rounded-lg hover:bg-neutral-100"
            >
              <ChevronRight className="h-6 w-6 text-neutral-600" />
            </button>
          </div>
        </div>

        {/* Días de la semana */}
        <div className="grid grid-cols-7 gap-1 mb-3">
          {dayNames.map(n => (
            <div
              key={n}
              className="p-3 text-center text-sm font-semibold text-neutral-600"
            >
              {n}
            </div>
          ))}
        </div>

        {/* Días del mes */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((d, i) => {
            const today = d && d.toDateString() === new Date().toDateString();
            const dayEventsForD = getEventsForDate(d);

            return (
              <div
                key={i}
                className={`relative min-h-[90px] p-3 rounded-lg border
                  ${d ? 'cursor-pointer hover:bg-neutral-50' : ''}
                  ${
                    today ? 'bg-red-50 border-red-300' : 'border-neutral-100'
                  }`}
                onClick={() =>
                  d && dayEventsForD.length && openDayModal(d)
                }
              >
                {d && (
                  <>
                    <div
                      className={`text-sm font-semibold mb-2 ${
                        today ? 'text-red-700' : 'text-neutral-800'
                      }`}
                    >
                      {d.getDate()}
                    </div>

                    {dayEventsForD.slice(0, 2).map(ev => (
                      <div
                        key={ev.id}
                        className={`text-xs px-2 py-1 mb-1 rounded truncate font-semibold
                          ${
                            ev.type === 'peña'
                              ? 'bg-red-100 text-red-800'
                              : ev.type === 'festival'
                              ? 'bg-orange-100 text-orange-800'
                              : ev.type === 'certamen'
                              ? 'bg-purple-100 text-purple-800'
                              : ev.type === 'recital'
                              ? 'bg-blue-100 text-blue-800'
                              : ev.type === 'clase'
                              ? 'bg-green-100 text-green-800'
                              : ev.type === 'taller'
                              ? 'bg-pink-100 text-pink-800'
                              : ev.type === 'convocatoria'
                              ? 'bg-indigo-100 text-indigo-800'
                              : ev.type === 'funcion'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        title={ev.title}
                      >
                        {ev.title}
                      </div>
                    ))}

                    {dayEventsForD.length > 2 && (
                      <div className="text-xs text-neutral-500">
                        +{dayEventsForD.length - 2} más
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ---------------- MODAL: eventos del día ---------------- */}
      <AnimatePresence>
        {showDayEventsModal && !selectedEvent && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5"
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
                <h3 className="text-lg font-semibold text-neutral-800">
                  Eventos del día
                </h3>
                <span className="text-sm text-neutral-600 ml-2">
                  {formatModalDate(modalDate)}
                </span>
              </div>

              {dayEvents.map(ev => {
                const style =
                  {
                    peña: 'bg-red-100 text-red-800',
                    certamen: 'bg-purple-100 text-purple-800',
                    festival: 'bg-orange-100 text-orange-800',
                    recital: 'bg-blue-100 text-blue-800',
                    clase: 'bg-green-100 text-green-800',
                    taller: 'bg-pink-100 text-pink-800',
                    convocatoria: 'bg-indigo-100 text-indigo-800',
                    funcion: 'bg-yellow-100 text-yellow-800',
                  }[ev.type || ''] || 'bg-gray-100 text-gray-800';

                return (
                  <button
                    key={ev.id}
                    onClick={() => openEventDetail(ev)}
                    className="w-full flex justify-between items-center p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-sm"
                  >
                    <span className="truncate max-w-[75%]">
                      {ev.title}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded ${style}`}
                    >
                      {ev.type}
                    </span>
                  </button>
                );
              })}

              <button
                onClick={() => setShowDayEventsModal(false)}
                className="text-sm text-red-600 hover:underline"
              >
                Cerrar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------------- MODAL: detalle evento ---------------- */}
      {selectedEvent && (
        <EventCard
          event={selectedEvent}
          currentUserId={currentUserId || ''}
          onToggleLike={handleToggleLike}
          onToggleAttending={handleToggleAttend}
          forceOpen
          onClose={closeEventDetail}
        />
      )}
    </>
  );
}
