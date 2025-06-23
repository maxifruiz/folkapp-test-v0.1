import React, { useEffect, useState } from 'react';
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

type Page = 'cartelera' | 'calendario' | 'publicar' | 'perfil' | 'admin';

function App() {
  const { user, isLoading, login, logout, initializeAuth } = useAuth();
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
    clearFilters 
  } = useEvents();
  
  const [currentPage, setCurrentPage] = useState<Page>('cartelera');

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 to-amber-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={login} />;
  }

  const handleEventSubmit = (eventData: any) => {
    try {
      addEvent(eventData, user);
      setCurrentPage('cartelera');
    } catch (error: any) {
      // Error is handled in the form component
      throw error;
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
              <h1 className="text-3xl font-bold text-neutral-800 mb-2">
                Cartelera Folklórica
              </h1>
              <p className="text-neutral-600">
                Descubrí los mejores eventos de folklore en todo el país
              </p>
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
                    ? "¡Sé el primero en anunciar tu peña!" 
                    : "No hay eventos que coincidan con tu búsqueda"
                  }
                </h3>
                <p className="text-neutral-500 mb-4">
                  {allEvents.length === 0 
                    ? "Aún no hay eventos publicados. ¡Comenzá vos compartiendo tu evento folklórico!"
                    : "Probá ajustando los filtros o ¡sé el primero en anunciar tu peña!"
                  }
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
              <h1 className="text-3xl font-bold text-neutral-800 mb-2">
                Calendario de Eventos
              </h1>
              <p className="text-neutral-600">
                Planificá tu agenda folklórica
              </p>
            </div>
            <CalendarView events={allEvents} />
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
        if (user.role !== 'admin') {
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
        return <AdminDashboard events={allEvents} onDeleteEvent={handleDeleteEvent} />;

      case 'perfil':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-red-200"
              />
              <h2 className="text-2xl font-bold text-neutral-800 mb-2">{user.name}</h2>
              <p className="text-neutral-600 mb-2">{user.email}</p>
              {user.role === 'admin' && (
                <span className="inline-block px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full mb-4">
                  Administrador
                </span>
              )}
              <p className="text-sm text-neutral-500 mb-6">
                Miembro desde {new Date(user.createdAt).toLocaleDateString('es-AR')}
              </p>
              <button
                onClick={logout}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout 
      currentPage={currentPage} 
      onPageChange={setCurrentPage}
      user={user}
    >
      {renderContent()}
    </Layout>
  );
}

export default App;