import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { X, ArrowLeft, Calendar, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Profile {
  id: string;
  full_name: string;
  avatar: string;
  instagram?: string;
}

interface Event {
  id: string;
  title: string;
  type: string;
  date: string;
  province: string;
  city: string;
}

interface UserSearchModalProps {
  onClose: () => void;
}

const eventTypeColors: Record<string, string> = {
  peña: 'bg-red-100 text-red-800',
  certamen: 'bg-purple-100 text-purple-800',
  festival: 'bg-orange-100 text-orange-800',
  recital: 'bg-blue-100 text-blue-800',
  clase: 'bg-green-100 text-green-800',
  taller: 'bg-pink-100 text-pink-800',
  convocatoria: 'bg-indigo-100 text-indigo-800',
  funcion: 'bg-yellow-100 text-yellow-800',
};

export default function UserSearchModal({ onClose }: UserSearchModalProps) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Profile[]>([]);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const [imageOpen, setImageOpen] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [joinAnimation, setJoinAnimation] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const session = supabase.auth.getSession().then(({ data }) => data.session);

  useEffect(() => {
    const checkCommunity = async () => {
      const currentSession = await supabase.auth.getSession();
      const currentUserId = currentSession.data.session?.user?.id;
      if (!selectedUser || !currentUserId) return;

      const { data } = await supabase
        .from('communities')
        .select('id')
        .eq('user_id', currentUserId)
        .eq('community_leader_id', selectedUser.id)
        .maybeSingle();

      setIsMember(!!data);
    };

    checkCommunity();
  }, [selectedUser]);

  const handleJoin = async () => {
    const currentSession = await supabase.auth.getSession();
    const currentUserId = currentSession.data.session?.user?.id;
    if (!selectedUser || !currentUserId) return;

    const { error } = await supabase.from('communities').insert({
      user_id: currentUserId,
      community_leader_id: selectedUser.id,
    });

    if (!error) {
      setIsMember(true);
      setJoinAnimation(true);
      setTimeout(() => setJoinAnimation(false), 1200);
    }
  };

  const handleLeave = async () => {
    const currentSession = await supabase.auth.getSession();
    const currentUserId = currentSession.data.session?.user?.id;
    if (!selectedUser || !currentUserId) return;

    const { error } = await supabase
      .from('communities')
      .delete()
      .match({ user_id: currentUserId, community_leader_id: selectedUser.id });

    if (!error) setIsMember(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!imageOpen && modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, imageOpen]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (search.length > 1) {
        fetchUsers(search);
      } else {
        setResults([]);
        setSelectedUser(null);
        setUserEvents([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  const fetchUsers = async (query: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, avatar, instagram')
      .ilike('full_name', `%${query}%`);

    if (!error && data) setResults(data);
  };

  const fetchUserEvents = async (userId: string) => {
    const { data, error } = await supabase
      .from('events')
      .select('id, title, type, date, province, city')
      .eq('organizer_id', userId)
      .order('date', { ascending: true });

    if (!error && data) setUserEvents(data);
  };

  const handleUserClick = (user: Profile) => {
    setSelectedUser(user);
    fetchUserEvents(user.id);
  };

  const handleBack = () => {
    setSelectedUser(null);
    setUserEvents([]);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="bg-amber-200 w-full max-w-md mx-4 rounded-xl shadow-2xl p-4 max-h-[90vh] overflow-y-auto border-4 border-folkiAmber relative"
        >
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold text-folkiRed">
              {selectedUser ? 'Perfil del usuario' : 'Buscar usuario'}
            </h2>
            <button onClick={onClose} className="text-folkiRed hover:text-folkiAmber transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {!selectedUser && (
            <>
              <input
                type="text"
                placeholder="Escribí un nombre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-folkiAmber rounded-lg px-3 py-2 mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-folkiRed"
              />

              <ul className="space-y-2">
                {results.map((user) => (
                  <li
                    key={user.id}
                    onClick={() => handleUserClick(user)}
                    className="flex items-center p-2 bg-folkiCream border border-folkiAmber rounded-lg shadow-sm hover:scale-[1.02] transition-transform cursor-pointer"
                  >
                    <img
                      src={user.avatar || '/default-avatar.png'}
                      alt={user.full_name}
                      className="w-10 h-10 rounded-full border-2 border-folkiRed object-cover mr-3"
                    />
                    <span className="text-folkiRed font-medium text-sm">{user.full_name}</span>
                  </li>
                ))}
              </ul>
            </>
          )}

          <AnimatePresence>
            {selectedUser && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                <button
                  onClick={handleBack}
                  className="flex items-center text-sm text-folkiRed hover:text-folkiAmber transition mb-2"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Volver
                </button>

                <div className="bg-folkiCream border border-folkiAmber rounded-lg p-3 shadow-md flex items-center gap-3">
                  <img
                    onClick={() => setImageOpen(true)}
                    src={selectedUser.avatar || '/default-avatar.png'}
                    alt={selectedUser.full_name}
                    className="w-12 h-12 rounded-full border-2 border-folkiRed object-cover cursor-pointer"
                  />
                  <div className="flex justify-between items-center w-full gap-2 flex-wrap">
                    <div>
                      <p className="text-sm font-bold text-folkiRed leading-none">{selectedUser.full_name}</p>
                      {selectedUser.instagram && (
                        <p className="text-xs text-folkiRed">
                          <span className="font-semibold mr-1">Insta :</span>
                          <a
                            href={`https://instagram.com/${selectedUser.instagram.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-folkiAmber transition underline"
                          >
                            {selectedUser.instagram}
                          </a>
                        </p>
                      )}
                    </div>

                    {/* Botón de comunidad */}
                    <div className="relative flex flex-col items-center gap-1">
                      <div className="text-[10px] font-semibold text-folkiRed">
                        {isMember ? 'Dejar comunidad' : 'Unite a su comunidad'}
                      </div>
                        
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={isMember ? handleLeave : handleJoin}
                        className={`text-sm font-semibold px-3 py-1 rounded-full transition duration-300 shadow-sm ${
                          isMember
                            ? 'bg-gray-300 text-folkiRed'
                            : 'bg-folkiRed text-folkiCream hover:bg-folkiAmber hover:text-folkiRed'
                        }`}
                      >
                        {isMember ? 'Dejar' : 'Unirme'}
                      </motion.button>
                      {joinAnimation && (
                        <motion.div
                          className="absolute inset-0 rounded-full border-2 border-folkiAmber opacity-70 pointer-events-none"
                          initial={{ scale: 1, opacity: 0.8 }}
                          animate={{ scale: 2.2, opacity: 0 }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                      )}
                    </div>
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-folkiRed mb-2">Eventos activos</h3>
                {userEvents.length === 0 ? (
                  <p className="text-xs text-gray-500">Este usuario no tiene eventos activos.</p>
                ) : (
                  <ul className="space-y-2">
                    {userEvents.map((event) => {
                      const colors = eventTypeColors[event.type] || 'bg-gray-100 text-gray-800';
                      const borderColor = colors.split(' ')[0].replace('bg-', '').replace('-100', '');

                      return (
                        <li
                          key={event.id}
                          className="p-2 bg-white rounded-md shadow-sm text-sm border-l-4"
                          style={{ borderColor }}
                        >
                          <div className="flex justify-between items-center">
                            <span className={`text-[10px] uppercase px-2 py-0.5 rounded font-semibold ${colors}`}>
                              {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                            </span>
                            <span className="text-gray-700">{event.title}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-gray-600">
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(event.date).toLocaleDateString('es-AR', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                            <span className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {event.city}, {event.province}
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <AnimatePresence>
        {imageOpen && selectedUser && (
          <motion.div
            key="imageModal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black bg-opacity-90 flex items-center justify-center p-4"
            onClick={() => setImageOpen(false)}
          >
            <motion.div onClick={(e) => e.stopPropagation()} className="relative">
              <motion.img
                src={selectedUser.avatar || '/default-avatar.png'}
                alt={selectedUser.full_name}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="max-w-full max-h-[90vh] rounded-lg shadow-lg cursor-zoom-out"
              />
              <button
                onClick={() => setImageOpen(false)}
                className="absolute top-2 right-2 text-white bg-folkiRed rounded-full p-1 hover:bg-folkiAmber transition"
                aria-label="Cerrar imagen"
              >
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}