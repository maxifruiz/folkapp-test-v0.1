import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { EventCard } from './components/EventCard';
import { EventFilter } from './components/EventFilter';
import { CalendarView } from './components/CalendarView';
import { EventForm } from './components/EventForm';
import { Login } from './components/Login';
import { AdminDashboard } from './components/AdminDashboard';
import { useAuth } from './hooks/useAuth';
import { useEvents } from './hooks/useEvents';
import { Music2, Sparkles } from 'lucide-react';
import { UserProfile } from './components/UserProfile';

type Page = 'cartelera' | 'calendario' | 'publicar' | 'perfil' | 'admin';

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

  const [currentPage, setCurrentPage] = useState<Page>('cartelera');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-700 text-xl">
        Cargando...
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={login} onRegister={register} />;
  }

  const handleEventSubmit = async (eventData: any) => {
    try {
      await addEvent(eventData, user);
      setCurrentPage('cartelera');
    } catch (error) {
      console.error('Error al publicar el evento:', error);
      alert('Hubo un problema al publicar el evento. Intentá nuevamente.');
    }
  };

  const handleLike = (eventId: string) => {
    toggleLike(eventId, user.id);
  };

  const handleAttend = (eventId: string) => {
    toggleAttending(eventId, user.id);
  };

  const handleDeleteEvent = (eventId: string) => {
    deleteEvent(eventId);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'cartelera':
        return (
          <div>
            <div className="text-center mb-8">
              <div className="flex justify-center items-center space-x-2 mb-4">
                <Music2 className="h-8 w-8 text-red-600" />
                <Sparkles className="h-6 w-6 text-amber-500" />
              </div>
              <h1 className="text-3xl font-bold text-neutral-800 mb-2">Cartelera Folklórica</h1>
              <p className="text-neutral-600">Descubrí los mejores eventos de folklore en todo el país</p>
            </div>

            <EventFilter
              selectedType={filters.selectedType}
              selectedProvince={filters.selectedProvince}
              selectedCity={filters.selectedCity}
              onTypeChange={setSelectedType}
              onProvinceChange={setSelectedProvince}
              onCityChange={setSelectedCity}
              onClearFilters={clearFilters}
            />

            {events.length === 0 ? (
              <div className="text-center py-12">
                <Music2 className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-neutral-600 mb-2">
                  {allEvents.length === 0
                    ? '¡Sé el primero en anunciar tu peña!'
                    : 'No hay eventos que coincidan con tu búsqueda'}
                </h3>
                <p className="text-neutral-500 mb-4">
                  {allEvents.length === 0
                    ? 'Aún no hay eventos publicados. ¡Comenzá vos compartiendo tu evento folklórico!'
                    : 'Probá ajustando los filtros o ¡sé el primero en anunciar tu peña!'}
                </p>
                <button
                  onClick={() => setCurrentPage('publicar')}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Publicar evento
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onLike={handleLike}
                    onAttend={handleAttend}
                    currentUserId={user.id}
                  />
                ))}
              </div>
            )}
          </div>
        );

      case 'calendario':
        return (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-neutral-800 mb-2">Calendario de Eventos</h1>
              <p className="text-neutral-600">Planificá tu agenda folklórica</p>
            </div>
            <CalendarView events={allEvents} />
          </div>
        );

      case 'publicar':
        return (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-neutral-800 mb-2">Compartí tu Evento</h1>
              <p className="text-neutral-600">Ayudá a que más gente descubra el folklore</p>
            </div>
            <EventForm onSubmit={handleEventSubmit} currentUser={user} />
          </div>
        );

      case 'admin':
        if (!user?.role || user.role !== 'admin') {
          return (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-neutral-600 mb-2">Acceso Denegado</h3>
              <p className="text-neutral-500">No tenés permisos para acceder a esta sección</p>
            </div>
          );
        }
        return <AdminDashboard events={allEvents} onDeleteEvent={handleDeleteEvent} />;

      case 'perfil':
        return <UserProfile />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-neutral-100">
      <Layout currentPage={currentPage} onPageChange={setCurrentPage} user={user}>
        {renderContent()}
      </Layout>
    </div>
  );
}

export default App;
