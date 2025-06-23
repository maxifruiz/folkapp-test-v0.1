import React, { useState } from 'react';
import { Shield, Trash2, Users, Calendar, TrendingUp, AlertTriangle } from 'lucide-react';
import { Event, User } from '../types';

interface AdminDashboardProps {
  events: Event[];
  onDeleteEvent: (eventId: string) => void;
}

export function AdminDashboard({ events, onDeleteEvent }: AdminDashboardProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const totalEvents = events.length;
  const totalLikes = events.reduce((sum, event) => sum + event.reactions.likes.length, 0);
  const totalAttending = events.reduce((sum, event) => sum + event.reactions.attending.length, 0);
  const uniqueOrganizers = new Set(events.map(event => event.organizer.id)).size;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-AR', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatPrice = (price: number | 'free') => {
    if (price === 'free') return 'Gratis';
    return `$${price.toLocaleString('es-AR')}`;
  };

  const handleDeleteEvent = (eventId: string) => {
    onDeleteEvent(eventId);
    setShowDeleteConfirm(null);
    setSelectedEvent(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900 to-red-800 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="h-8 w-8" />
          <div>
            <h1 className="text-2xl font-bold">Panel de Administración</h1>
            <p className="text-red-200">Gestión completa de Folki App</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Total Eventos</p>
              <p className="text-2xl font-bold text-neutral-800">{totalEvents}</p>
            </div>
            <Calendar className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Organizadores</p>
              <p className="text-2xl font-bold text-neutral-800">{uniqueOrganizers}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Total Likes</p>
              <p className="text-2xl font-bold text-neutral-800">{totalLikes}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Asistentes</p>
              <p className="text-2xl font-bold text-neutral-800">{totalAttending}</p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Events Management */}
      <div className="bg-white rounded-xl shadow-lg border border-neutral-200">
        <div className="p-6 border-b border-neutral-200">
          <h2 className="text-xl font-bold text-neutral-800">Gestión de Eventos</h2>
          <p className="text-neutral-600">Administrar todos los eventos publicados</p>
        </div>

        <div className="p-6">
          {events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-600 mb-2">
                No hay eventos publicados
              </h3>
              <p className="text-neutral-500">
                Los eventos aparecerán aquí cuando los usuarios comiencen a publicar
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-3 px-4 font-semibold text-neutral-700">Evento</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-700">Organizador</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-700">Fecha</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-700">Ubicación</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-700">Precio</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-700">Reacciones</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={event.multimedia[0]?.url}
                            alt={event.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-medium text-neutral-800">{event.title}</p>
                            <p className="text-sm text-neutral-500 capitalize">{event.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <img
                            src={event.organizer.avatar}
                            alt={event.organizer.name}
                            className="w-8 h-8 rounded-full"
                          />
                          <div>
                            <p className="text-sm font-medium text-neutral-800">{event.organizer.name}</p>
                            <p className="text-xs text-neutral-500">{event.organizer.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-neutral-800">{formatDate(event.date)}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-neutral-800">{event.location.city}</p>
                        <p className="text-xs text-neutral-500">{event.location.province}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm font-medium text-neutral-800">{formatPrice(event.price)}</p>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-4 text-sm">
                          <span className="text-red-600">❤️ {event.reactions.likes.length}</span>
                          <span className="text-green-600">📅 {event.reactions.attending.length}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedEvent(event)}
                            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                          >
                            Ver
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(event.id)}
                            className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-96 overflow-y-auto">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-neutral-800">{selectedEvent.title}</h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-neutral-500 hover:text-neutral-700"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <img
                    src={selectedEvent.multimedia[0]?.url}
                    alt={selectedEvent.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Descripción</p>
                    <p className="text-neutral-800">{selectedEvent.description}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Fecha y Hora</p>
                    <p className="text-neutral-800">{formatDate(selectedEvent.date)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Ubicación</p>
                    <p className="text-neutral-800">{selectedEvent.location.address}</p>
                    <p className="text-neutral-600">{selectedEvent.location.city}, {selectedEvent.location.province}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Precio</p>
                    <p className="text-neutral-800 font-semibold">{formatPrice(selectedEvent.price)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <h3 className="text-xl font-bold text-neutral-800">Confirmar Eliminación</h3>
              </div>
              
              <p className="text-neutral-600 mb-6">
                ¿Estás seguro de que querés eliminar este evento? Esta acción no se puede deshacer.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDeleteEvent(showDeleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}