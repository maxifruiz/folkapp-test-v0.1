import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';
import { useEvents } from '../hooks/useEvents';
import { EventCard } from '../components/EventCard';
import { ChevronDown, ChevronUp } from 'lucide-react';

const ImageModal = ({ imageUrl, onClose }: { imageUrl: string; onClose: () => void }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
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
  const { allEvents, toggleLike, toggleAttendance } = useEvents();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const [eventsExpanded, setEventsExpanded] = useState(false);

  useEffect(() => {
    if (user) fetchAvatar();
  }, [user]);

  async function fetchAvatar() {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('avatar')
      .eq('id', user.id)
      .maybeSingle(); // <-- cambio para evitar error 406

    if (error) {
      console.error(error);
      setAvatarUrl(null);
    } else {
      setAvatarUrl(data?.avatar || null);
    }
  }

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    try {
      // Primero borramos el avatar anterior (si existe)
      await supabase.storage.from('avatars').remove([filePath]);
      // Subimos el nuevo avatar
      await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
      // Obtenemos la url pública
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      // Actualizamos el perfil con la url pública
      await supabase.from('profiles').update({ avatar: data.publicUrl }).eq('id', user.id);
      setAvatarUrl(data.publicUrl);
    } catch (error) {
      console.error('Error subiendo avatar:', error);
    } finally {
      setUploading(false);
    }
  }

  if (!user) return null;

  const myEvents = allEvents.filter((e) => e.organizer?.id === user.id);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto mt-10 text-neutral-800">
      <h2 className="text-2xl font-bold text-red-600 mb-4 select-none">Mi Perfil</h2>

      <div className="flex items-center justify-center space-x-6 mb-6">
        <div
          className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-red-200 bg-gray-300 flex items-center justify-center cursor-pointer hover:brightness-90 transition"
          onClick={() => avatarUrl && setShowFullImage(true)}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-500 select-none">avatar</span>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center text-white font-semibold">
              Subiendo...
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor="avatarUpload"
            className="cursor-pointer px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition select-none"
          >
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

      <div className="space-y-2 mb-6 select-text">
        <p><strong>Nombre completo:</strong> {user.fullName}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Instagram:</strong> {user.instagram || 'No cargado'}</p>
        <p><strong>Fecha de nacimiento:</strong> {user.birthdate}</p>
        <p><strong>Rol:</strong> {user.role === 'admin' ? 'Administrador' : 'Usuario'}</p>
        <p className="text-sm text-neutral-500">
          Miembro desde {new Date(user.createdAt).toLocaleDateString('es-AR')}
        </p>
      </div>

      <button
        onClick={() => setEventsExpanded((v) => !v)}
        className="flex items-center justify-between w-full bg-red-600 hover:bg-red-700 transition text-white font-semibold rounded-lg px-4 py-3 mb-4 select-none"
        aria-expanded={eventsExpanded}
        aria-controls="user-events-list"
      >
        <span>Eventos activos ({myEvents.length})</span>
        {eventsExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      <div
        id="user-events-list"
        className={`transition-opacity duration-500 ease-in-out ${
          eventsExpanded ? 'opacity-100 block' : 'opacity-0 hidden'
        }`}
      >
        {myEvents.length === 0 ? (
          <p className="text-center text-gray-600 mb-4 select-text">No tenés eventos activos.</p>
        ) : (
          <div className="grid gap-4">
            {myEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                currentUserId={user.id}
                onToggleLike={toggleLike}
                onToggleAttending={toggleAttendance}
              />
            ))}
          </div>
        )}
      </div>

      <button
        onClick={logout}
        className="mt-6 w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition select-none"
      >
        Cerrar sesión
      </button>

      {showFullImage && avatarUrl && (
        <ImageModal imageUrl={avatarUrl} onClose={() => setShowFullImage(false)} />
      )}
    </div>
  );
};
