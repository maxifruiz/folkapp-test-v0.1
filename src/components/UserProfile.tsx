import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';
import { useEvents } from '../hooks/useEvents';
import { EventCard } from '../components/EventCard';
import { ChevronDown, ChevronUp, Edit2, X, Trash2 } from 'lucide-react';
import { EventForm } from '../components/EventForm';
import {CommunityModal} from '../components/CommunityModal'; // el componente nuevo

const ImageModal = ({ imageUrl, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative transition-transform duration-300 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
      >
        <button
          onClick={onClose}
          className="absolute top-[-1.5rem] right-[-1.5rem] text-white text-3xl bg-black bg-opacity-40 hover:bg-opacity-70 rounded-full px-3 py-1 transition"
        >
          ×
        </button>
        <img src={imageUrl} alt="avatar" className="max-w-[90vw] max-h-[90vh] rounded-xl shadow-2xl" />
      </div>
    </div>
  );
};

export const UserProfile = () => {
  const { user, logout } = useAuth();
  const { allEvents, toggleLike, toggleAttendance, refreshEvents } = useEvents();
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const [eventsExpanded, setEventsExpanded] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [communityModalOpen, setCommunityModalOpen] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState(null);
  const [deletingLoading, setDeletingLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');


  useEffect(() => {
    if (user) fetchProfileData();
  }, [user]);

  async function fetchProfileData() {
    if (!user) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('avatar, full_name, instagram, birthdate, role, created_at')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error al obtener perfil:', error);
      setAvatarUrl(null);
      setProfileData(null);
    } else {
      setAvatarUrl(data?.avatar || null);
      setProfileData(data);
    }
  }

  async function uploadAvatar(event) {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const fileName = `avatar_${timestamp}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    try {
      const { data: listData } = await supabase.storage.from('avatars').list(user.id);
      const oldFiles = listData?.filter(f => f.name.startsWith('avatar_')) || [];
      const oldPaths = oldFiles.map(f => `${user.id}/${f.name}`);

      if (oldPaths.length) {
        await supabase.storage.from('avatars').remove(oldPaths);
      }

      await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = `${data.publicUrl}?t=${timestamp}`;

      await supabase.from('profiles').update({ avatar: publicUrl }).eq('id', user.id);

      setAvatarUrl(publicUrl);
      setProfileData((prev) => ({ ...prev, avatar: publicUrl }));
    } catch (error) {
      console.error('Error subiendo avatar:', error);
    } finally {
      setUploading(false);
    }
  }

  const myEvents = Array.isArray(allEvents) ? allEvents.filter(e => e.organizer_id === user?.id) : [];

  const handleUpdateEvent = async (updatedEventData) => {
    setFormSubmitting(true);
    setFormError('');
    try {
      const { error } = await supabase.from('events').update({
        title: updatedEventData.title,
        description: updatedEventData.description,
        type: updatedEventData.type,
        province: updatedEventData.province,
        city: updatedEventData.city,
        address: updatedEventData.address,
        date: updatedEventData.date,
        is_free: updatedEventData.is_free,
        price_anticipada: updatedEventData.price_anticipada,
        price_general: updatedEventData.price_general,
        multimedia: updatedEventData.multimedia,
      }).eq('id', editingEvent.id);

      if (error) throw error;
      if (refreshEvents) await refreshEvents();

      setEditingEvent(null);
      setShowSuccessModal(true);
    } catch (error) {
      setFormError('Error actualizando evento, intentá nuevamente.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!deletingEvent) return;
    setDeletingLoading(true);
    setDeleteError('');
    try {
      const { error } = await supabase.from('events').delete().eq('id', deletingEvent.id);
      if (error) setDeleteError('Error eliminando evento, intentá nuevamente.');
      else {
        setDeletingEvent(null);
        window.location.reload();
      }
    } catch {
      setDeleteError('Error eliminando evento, intentá nuevamente.');
    } finally {
      setDeletingLoading(false);
    }
  };

  if (!user || !profileData) return null;

  return (
    <div className="bg-folkiCream rounded-2xl shadow-xl p-6 max-w-2xl mx-auto mt-10 text-folkiRed">
      <h2 className="text-3xl font-extrabold mb-6 text-center">Mi Perfil</h2>

      <div className="flex items-center justify-center gap-6 mb-6">
        <div
          className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-folkiAmber bg-gray-200 cursor-pointer hover:brightness-90"
          onClick={() => avatarUrl && setShowFullImage(true)}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-500">avatar</span>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center text-white font-semibold">
              Subiendo...
            </div>
          )}
        </div>
        <div>
          <label htmlFor="avatarUpload" className="cursor-pointer px-4 py-2 bg-folkiRed text-folkiCream rounded-xl hover:bg-folkiAmber transition">
            Cambiar foto
          </label>
          <input
            id="avatarUpload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={uploadAvatar}
            disabled={uploading}
          />
        </div>
      </div>

      <div className="space-y-2 mb-6">
        <p><strong>Nombre completo:</strong> {profileData.full_name || 'No disponible'}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Instagram:</strong> {profileData.instagram || 'No cargado'}</p>
        <p><strong>Fecha de nacimiento:</strong> {profileData.birthdate || 'No cargada'}</p>
        <p><strong>Rol:</strong> {profileData.role === 'admin' ? 'Administrador' : 'Usuario'}</p>
        <p className="text-sm text-neutral-600">
          Miembro desde {new Date(profileData.created_at || user.created_at).toLocaleDateString('es-AR')}
        </p>
      </div>

    {/* BOTÓN COMUNIDAD */}
    <button
      onClick={() => setCommunityModalOpen(true)}
      className="mb-4 w-full px-5 py-3 bg-folkiAmber text-folkiRed rounded-xl font-semibold hover:bg-folkiRed hover:text-folkiCream transition"
    >
      Comunidad
    </button>      

      <button
        onClick={() => setEventsExpanded((v) => !v)}
        className="w-full flex items-center justify-between bg-folkiRed text-folkiCream hover:bg-folkiAmber hover:text-folkiRed transition font-semibold rounded-xl px-5 py-3 mb-4"
      >
        <span>Eventos activos ({myEvents.length})</span>
        {eventsExpanded ? <ChevronUp /> : <ChevronDown />}
      </button>

      <div className={`${eventsExpanded ? 'block' : 'hidden'} transition-all duration-500`}>
        {myEvents.length === 0 ? (
          <p className="text-center text-gray-600 mb-4">No tenés eventos activos.</p>
        ) : (
          <div className="grid gap-4">
            {myEvents.map((event) => (
              <div key={event.id} className="relative">
                <EventCard
                  event={event}
                  currentUserId={user.id}
                  onToggleLike={toggleLike}
                  onToggleAttending={toggleAttendance}
                />
                <button
                  onClick={() => setEditingEvent(event)}
                  className="absolute top-2 right-12 bg-folkiRed text-folkiCream hover:bg-folkiAmber hover:text-folkiRed p-2 rounded-full shadow"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setDeletingEvent(event)}
                  className="absolute top-2 right-2 bg-folkiRed text-folkiCream hover:bg-folkiAmber hover:text-folkiRed p-2 rounded-full shadow"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={async () => {
          const success = await logout();
          if (success) window.location.reload();
        }}
        className="mt-6 w-full px-6 py-3 bg-folkiRed text-folkiCream rounded-xl transition"
      >
        Cerrar sesión
      </button>

      {showFullImage && avatarUrl && <ImageModal imageUrl={avatarUrl} onClose={() => setShowFullImage(false)} />}

      {editingEvent && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 overflow-auto"
          onClick={() => !formSubmitting && setEditingEvent(null)}
        >
          <div
            className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-gray-700 hover:text-black"
              onClick={() => !formSubmitting && setEditingEvent(null)}
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-semibold mb-4">Editar evento</h3>
            <EventForm
              currentUser={user}
              onSubmit={handleUpdateEvent}
              initialData={editingEvent}
              isEditing={true}
              isSubmitting={formSubmitting}
              error={formError}
            />
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6 text-center">
            <h2 className="text-2xl font-bold text-folkiRed mb-4">Evento actualizado</h2>
            <p className="text-gray-700 mb-6">Tu evento fue editado con éxito.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-folkiRed hover:bg-folkiAmber text-folkiCream px-6 py-2 rounded-lg transition"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
      
      {/* MODAL COMUNIDAD */}
      {communityModalOpen && (
        <CommunityModal
          onClose={() => setCommunityModalOpen(false)}
          userId={user.id}
        />
      )}      

      {deletingEvent && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => !deletingLoading && setDeletingEvent(null)}
        >
          <div
            className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-folkiRed mb-4">Eliminar evento</h2>
            <p className="text-gray-700 mb-6">¿Estás seguro que querés eliminar este evento? Esta acción no se puede deshacer.</p>
            {deleteError && <p className="text-red-600 mb-4">{deleteError}</p>}
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleDeleteEvent}
                disabled={deletingLoading}
                className="bg-folkiRed hover:bg-folkiAmber text-folkiCream px-6 py-2 rounded-lg transition"
              >
                {deletingLoading ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
              <button
                onClick={() => setDeletingEvent(null)}
                disabled={deletingLoading}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
