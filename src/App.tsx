import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { EventCard } from './components/EventCard';
import { EventFilter } from './components/EventFilter';
import { CalendarView } from './components/CalendarView';
import { EventForm } from './components/EventForm';
import { Login } from './components/Login';
import { AdminDashboard } from './components/AdminDashboard';
import { useAuth } from './hooks/useAuth';
import { useEvents } from './hooks/useEvents';
import { Music2, Calendar as CalendarIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { UserProfile } from './components/UserProfile';
import { motion, AnimatePresence } from 'framer-motion';
import { ResetPassword } from './components/ResetPassword';  // <-- import ResetPassword
import  Market  from './components/Market';

function App() {
  const { user, loading, login, register, logout } = useAuth();
  const {
    events,
    allEvents,
    filters,
    addEvent,
    toggleLike,
    toggleAttending,
    deleteEvent,
    setSelectedType,
    setSelectedProvince,
    setSelectedCity,
    clearFilters,
  } = useEvents();

  // agregué 'resetpassword' en el tipo
  const [currentPage, setCurrentPage] = useState<
    'cartelera' | 'calendario' | 'publicar' | 'perfil' | 'admin' | 'resetpassword' | 'market'
  >('cartelera');

  const [visibleCount, setVisibleCount] = useState(8);
  const [upcomingExpanded, setUpcomingExpanded] = useState(false);

  // Detectar parámetro URL para mostrar ResetPassword
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reset = params.get('resetpassword');
    const token = params.get('access_token');

    if (reset === '1' && token) {
      setCurrentPage('resetpassword');
    }
  }, []);

  useEffect(() => {
    if (currentPage !== 'cartelera') return;

    function onScroll() {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 300
      ) {
        setVisibleCount((prev) => Math.min(prev + 4, events.length));
      }
    }

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [currentPage, events.length]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-700 text-xl">
        <p>Cargando...</p>
      </div>
    );
  }

  if (!user && currentPage !== 'resetpassword') {
    return <Login onLogin={login} onRegister={register} />;
  }

  const handleEventSubmit = async (eventData: any) => {
    try {
      await addEvent(eventData);
      setCurrentPage('cartelera');
      setVisibleCount(8);
    } catch (error) {
      console.error('Error al publicar el evento:', error);
      alert('Hubo un problema al publicar el evento. Intentá nuevamente.');
    }
  };

  const handleLike = async (eventId: string) => {
    await toggleLike(eventId, user.id);
  };

  const handleAttend = async (eventId: string) => {
    await toggleAttending(eventId, user.id);
  };

  const handleDeleteEvent = (eventId: string) => {
    deleteEvent(eventId);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'cartelera': {
        const today = new Date();
        const currentDay = today.getDay();
        const monday = new Date(today);
        monday.setDate(today.getDate() - ((currentDay + 6) % 7));
        monday.setHours(0, 0, 0, 0);

        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);

        const sortedEvents = [...events].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        const thisWeekEvents = sortedEvents.filter((e) => {
          const date = new Date(e.date);
          return date >= monday && date <= sunday;
        });

        const upcomingEvents = sortedEvents.filter((e) => {
          const date = new Date(e.date);
          return date > sunday;
        });

        return (
          <div>
            <div className="text-center mb-8">
              <div className="flex justify-center items-center space-x-2 mb-4"></div>
              <h1 className="text-3xl font-bold text-neutral-800 mb-2">
                Cartelera de eventos
              </h1>
              <p className="text-neutral-600">
                Descubrí los mejores eventos de folklore en todo el país
              </p>
            </div>

            <EventFilter
              selectedType={filters?.selectedType || ''}
              selectedProvince={filters?.selectedProvince || ''}
              selectedCity={filters?.selectedCity || ''}
              onTypeChange={setSelectedType}
              onProvinceChange={setSelectedProvince}
              onCityChange={setSelectedCity}
              onClearFilters={clearFilters}
            />

            {allEvents.length === 0 ? (
              <div className="text-center py-12">
                <Music2 className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-neutral-600 mb-2">
                  ¡Sé el primero en anunciar tu evento!
                </h3>
                <p className="text-neutral-500 mb-4">
                  Aún no hay eventos publicados. ¡Comenzá vos compartiendo tu evento folklórico!
                </p>
                <button
                  onClick={() => setCurrentPage('publicar')}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Publicar evento
                </button>
              </div>
            ) : (
              <>
                {thisWeekEvents.length > 0 && (
                  <>
                    <h2
                      className="flex items-center text-black font-bold mb-4 px-2 text-xl select-none animate-fade-up"
                      style={{ animationDuration: '700ms' }}
                    >
                      <CalendarIcon className="mr-2" /> Esta semana
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-2 mb-10">
                      {thisWeekEvents.map((event, index) => (
                        <EventCard
                          key={event.id}
                          event={event}
                          onToggleLike={handleLike}
                          onToggleAttending={handleAttend}
                          currentUserId={user.id}
                          index={index}  // animación escalonada
                          className="animate-fade-up-delay"
                          style={{ animationDelay: `${index * 0.5}s` }} // más lenta
                        />
                      ))}
                    </div>
                  </>
                )}

                {upcomingEvents.length > 0 && (
                  <>
                    <div className="flex items-center justify-between px-2 mb-2">
                      <h2
                        className="flex items-center text-black font-bold text-xl select-none animate-fade-up"
                        style={{ animationDuration: '700ms' }}
                      >
                        <CalendarIcon className="mr-2" /> Próximos eventos
                      </h2>
                      <button
                        onClick={() => setUpcomingExpanded((v) => !v)}
                        className="flex items-center text-black font-semibold hover:text-red-600 transition-colors duration-200 focus:outline-none"
                        aria-expanded={upcomingExpanded}
                        aria-label={upcomingExpanded ? "Contraer próximos eventos" : "Expandir próximos eventos"}
                      >
                        {upcomingExpanded ? (
                          <>
                            Contraer <ChevronUp className="ml-1" />
                          </>
                        ) : (
                          <>
                            Expandir <ChevronDown className="ml-1" />
                          </>
                        )}
                      </button>
                    </div>

                    {upcomingExpanded && (
                      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-2">
                        {upcomingEvents.slice(0, visibleCount).map((event, index) => (
                          <EventCard
                            key={event.id}
                            event={event}
                            onToggleLike={handleLike}
                            onToggleAttending={handleAttend}
                            currentUserId={user.id}
                            index={index}  // animación escalonada
                            className="animate-fade-up-delay"
                            style={{ animationDelay: `${index * 0.5}s` }} // más lenta
                          />
                        ))}
                      </div>
                    )}
                    {visibleCount < upcomingEvents.length && upcomingExpanded && (
                      <div className="text-center text-gray-500 py-4">
                        Desliza hacia abajo para cargar más eventos...
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        );
      }

      case 'calendario':
        return (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-neutral-800 mb-2">
                Calendario de Eventos
              </h1>
              <p className="text-neutral-600">Planificá tu agenda folklórica</p>
            </div>
            <CalendarView
              events={allEvents}
              onLike={handleLike}
              onAttend={handleAttend}
              currentUserId={user.id}
              currentUserFullName={user.full_name}
              currentUserAvatar={user.avatar}
            />
          </div>
        );

      case 'publicar':
        return (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-neutral-800 mb-2">
                Compartí tu Evento
              </h1>
              <p className="text-neutral-600">
                Ayudá a que más gente descubra el folklore
              </p>
            </div>
            <EventForm onSubmit={handleEventSubmit} currentUser={user} />
          </div>
        );

      case 'admin':
        if (!user?.role || user.role !== 'admin') {
          return (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-neutral-600 mb-2">
                Acceso Denegado
              </h3>
              <p className="text-neutral-500">
                No tenés permisos para acceder a esta sección
              </p>
            </div>
          );
        }
        return (
          <AdminDashboard events={allEvents} onDeleteEvent={handleDeleteEvent} />
        );

      case 'perfil':
        return <UserProfile />;

      case 'resetpassword':
        return <ResetPassword />;

      default:
        return null;
      
      case 'market':
        return <Market />; 
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-neutral-100">
      <Layout currentPage={currentPage} onPageChange={setCurrentPage} user={user}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </Layout>
    </div>
  );
}

export default App;
