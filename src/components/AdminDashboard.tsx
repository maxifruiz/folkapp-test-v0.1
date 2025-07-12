import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  MapPin,
  Trash2,
  User,
  Heart,
  Users,
  Layers,
  Search,
  Megaphone
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient'; // Ajusta según donde tengas el cliente Supabase

interface Event {
  id: string;
  title: string;
  date: string;
  province?: string;
  city?: string;
  price_anticipada?: number | null;
  price_general?: number | null;
  organizer?: {
    id?: string;
    full_name?: string;
    avatar?: string;
    email?: string;
  };
  reactions?: {
    likes?: Array<{ id: string; full_name: string }>;
    attending?: Array<{ id: string; full_name: string }>;
  };
  type?: string;
}

interface Profile {
  id: string;
  full_name: string;
  avatar: string;
}

interface AdminDashboardProps {
  events: Event[];
  onDeleteEvent: (eventId: string) => Promise<void>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ events, onDeleteEvent }) => {
  // Estados
  const [search, setSearch] = useState('');
  const [filterProvince, setFilterProvince] = useState('');
  const [filterType, setFilterType] = useState('');
  const [modalOrganizer, setModalOrganizer] = useState<Event['organizer'] | null>(null);
  const [confirmDeleteEventId, setConfirmDeleteEventId] = useState<string | null>(null);

  // Estado y lista para modal usuarios registrados
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  // Estado para modal de anuncio
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');

  useEffect(() => {
    if (!showUsersModal) return;
    const fetchProfiles = async () => {
      const { data, error } = await supabase.from('profiles').select('id, full_name, avatar');
      if (error) {
        toast.error('Error al cargar usuarios registrados');
        return;
      }
      if (data) setProfiles(data);
    };
    fetchProfiles();
  }, [showUsersModal]);

  // Formateo fechas y precios
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString('es-AR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const formatPrice = (price?: number | null | 'free') => {
    if (price === 'free' || price === null || price === undefined || price === 0)
      return 'Evento gratuito';
    return `$${price.toLocaleString('es-AR')}`;
  };

  // Listas únicas para filtros
  const provinces = useMemo(
    () => Array.from(new Set(events.map((e) => e.province).filter(Boolean))),
    [events]
  );
  const types = useMemo(
    () => Array.from(new Set(events.map((e) => e.type).filter(Boolean))),
    [events]
  );

  // Filtrar y buscar eventos
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchSearch = e.title.toLowerCase().includes(search.toLowerCase());
      const matchProvince = filterProvince ? e.province === filterProvince : true;
      const matchType = filterType ? e.type === filterType : true;
      return matchSearch && matchProvince && matchType;
    });
  }, [events, search, filterProvince, filterType]);

  // Totales para dashboard
  const totalLikes = events.reduce((acc, e) => acc + (e.reactions?.likes?.length || 0), 0);
  const totalAttending = events.reduce((acc, e) => acc + (e.reactions?.attending?.length || 0), 0);
  const uniqueOrganizers = new Set(events.map((e) => e.organizer?.id).filter(Boolean));

  // Manejar eliminación con confirmación y toast
  const confirmDelete = async (id: string) => {
    setConfirmDeleteEventId(id);
  };

  const cancelDelete = () => setConfirmDeleteEventId(null);

  const handleDelete = async () => {
    if (!confirmDeleteEventId) return;
    try {
      const { error } = await supabase.from('events').delete().eq('id', confirmDeleteEventId);
      if (error) throw error;

      toast.success('Evento eliminado correctamente');
      setConfirmDeleteEventId(null);

      // Refrescar página y mantener en admin
      setTimeout(() => {
        window.location.reload();
      }, 1000); // Le damos un segundo para que se vea el toast
    } catch (err) {
      toast.error('Error al eliminar el evento');
    }
  };

  // Función para enviar anuncio a Supabase
  const handleSendAnnouncement = async () => {
    if (!announcementTitle || !announcementMessage) {
      toast.error('Completa ambos campos');
      return;
    }
    const { error } = await supabase.from('announcements').insert({
      title: announcementTitle,
      message: announcementMessage,
    });
    if (error) {
      toast.error('Error al enviar anuncio');
    } else {
      toast.success('Anuncio enviado');
      setAnnouncementTitle('');
      setAnnouncementMessage('');
      setShowAnnouncementModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-white p-6 max-w-7xl mx-auto">
      <Toaster position="top-right" />

      <h1 className="text-4xl font-bold mb-8">Panel de Administración</h1>

      {/* Botón para enviar anuncio */}
      <div className="mb-6">
        <button
          onClick={() => setShowAnnouncementModal(true)}
          className="bg-yellow-600 px-4 py-2 rounded hover:bg-yellow-700 flex items-center gap-2"
        >
          <Megaphone className="w-5 h-5" /> Enviar nuevo anuncio
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <StatBox title="Publicaciones" icon={<Layers className="w-6 h-6" />} value={events.length} />
        <StatBox title="Total Likes" icon={<Heart className="w-6 h-6 text-red-500" />} value={totalLikes} />
        <StatBox title="Asistentes" icon={<Users className="w-6 h-6 text-green-500" />} value={totalAttending} />
        <StatBox
          title="Organizadores"
          icon={<User className="w-6 h-6 text-blue-500" />}
          value={uniqueOrganizers.size}
        />
      </div>

      {/* Filtros y Buscador */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="flex items-center bg-gray-800 rounded p-2 flex-grow max-w-md">
          <Search className="w-5 h-5 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Buscar evento por título..."
            className="bg-transparent outline-none text-white w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="bg-gray-800 rounded p-2 text-white outline-none max-w-xs"
          value={filterProvince}
          onChange={(e) => setFilterProvince(e.target.value)}
        >
          <option value="">Todas las provincias</option>
          {provinces.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <select
          className="bg-gray-800 rounded p-2 text-white outline-none max-w-xs"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">Todos los tipos</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Botón para ver usuarios registrados */}
      <div className="mb-6">
        <button
          onClick={() => setShowUsersModal(true)}
          className="bg-teal-600 px-4 py-2 rounded hover:bg-teal-700 flex items-center gap-2"
        >
          <Users className="w-5 h-5" /> Ver usuarios registrados ({profiles.length})
        </button>
      </div>

      {/* Lista de eventos */}
      {filteredEvents.length === 0 ? (
        <p>No hay eventos que coincidan con los filtros.</p>
      ) : (
        <div className="grid gap-6">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="bg-gray-800 p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-semibold">{event.title}</h2>
                <button
                  onClick={() => confirmDelete(event.id)}
                  className="text-red-500 hover:text-red-700"
                  aria-label="Eliminar evento"
                >
                  <Trash2 className="w-6 h-6" />
                </button>
              </div>
              <div className="flex flex-wrap gap-4 mt-2 text-gray-300 text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(event.date)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{[event.province, event.city].filter(Boolean).join(' - ')}</span>
                </div>
                <div>🎟️ Anticipada: {formatPrice(event.price_anticipada)}</div>
                <div>💵 General: {formatPrice(event.price_general)}</div>
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span>{event.reactions?.likes?.length || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-500" />
                  <span>{event.reactions?.attending?.length || 0}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4 cursor-pointer" onClick={() => setModalOrganizer(event.organizer || null)}>
                <img
                  src={event.organizer?.avatar || 'https://via.placeholder.com/40?text=👤'}
                  alt={event.organizer?.full_name || 'Organizador'}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p>Organizador:</p>
                  <p className="font-semibold">{event.organizer?.full_name || 'Desconocido'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal perfil organizador */}
      {modalOrganizer && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-sm w-full relative">
            <button
              onClick={() => setModalOrganizer(null)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
              aria-label="Cerrar modal"
            >
              ✕
            </button>
            <div className="flex flex-col items-center">
              <img
                src={modalOrganizer.avatar || 'https://via.placeholder.com/100?text=👤'}
                alt={modalOrganizer.full_name}
                className="w-24 h-24 rounded-full object-cover mb-4"
              />
              <h3 className="text-2xl font-bold mb-2">{modalOrganizer.full_name}</h3>
              <p className="text-gray-300">{modalOrganizer.email || 'Sin email registrado'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal usuarios registrados */}
      {showUsersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 overflow-auto">
          <div className="bg-gray-800 p-6 rounded-lg max-w-lg w-full relative max-h-[80vh] overflow-y-auto">
            <button
              onClick={() => setShowUsersModal(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
              aria-label="Cerrar modal usuarios"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold mb-4 text-center">Usuarios Registrados ({profiles.length})</h2>
            {profiles.length === 0 ? (
              <p>No hay usuarios registrados.</p>
            ) : (
              <ul className="space-y-4">
                {profiles.map((user) => (
                  <li key={user.id} className="flex items-center gap-4 bg-gray-700 p-3 rounded">
                    <img
                      src={user.avatar || 'https://via.placeholder.com/40?text=👤'}
                      alt={user.full_name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <span>{user.full_name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Confirmación eliminar evento */}
      {confirmDeleteEventId && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-xs w-full">
            <h3 className="text-xl font-semibold mb-4">Confirmar eliminación</h3>
            <p className="mb-6">¿Estás seguro que deseas eliminar este evento? Esta acción no se puede deshacer.</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={cancelDelete}
                className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 text-white"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal enviar anuncio */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Nuevo Anuncio</h2>
            <input
              type="text"
              placeholder="Título"
              className="w-full mb-3 p-2 rounded bg-gray-700 text-white outline-none"
              value={announcementTitle}
              onChange={(e) => setAnnouncementTitle(e.target.value)}
            />
            <textarea
              placeholder="Mensaje del anuncio"
              className="w-full mb-3 p-2 rounded bg-gray-700 text-white outline-none h-32"
              value={announcementMessage}
              onChange={(e) => setAnnouncementMessage(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAnnouncementModal(false)}
                className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleSendAnnouncement}
                className="bg-yellow-600 px-4 py-2 rounded hover:bg-yellow-700 text-white"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatBox = ({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) => (
  <div className="bg-gray-800 p-5 rounded-lg shadow flex items-center space-x-4 hover:scale-105 transform transition-transform duration-200 cursor-default">
    <div className="text-gray-400">{icon}</div>
    <div>
      <div className="text-sm text-gray-400">{title}</div>
      <div className="text-3xl font-bold text-white">{value}</div>
    </div>
  </div>
);
