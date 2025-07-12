import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

interface Profile {
  id: string;
  full_name: string;
  avatar: string;
}

interface UserSearchModalProps {
  onClose: () => void;
}

export default function UserSearchModal({ onClose }: UserSearchModalProps) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Profile[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (search.length > 1) {
        fetchUsers(search);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  const fetchUsers = async (query: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, avatar')
      .ilike('full_name', `%${query}%`);

    if (!error && data) setResults(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="bg-amber-200 w-full max-w-lg mx-4 rounded-xl shadow-2xl p-6 max-h-[80vh] overflow-y-auto border-4 border-folkiAmber"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-folkiRed">Buscar usuario</h2>
          <button
            onClick={onClose}
            className="text-folkiRed hover:text-folkiAmber transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <input
          type="text"
          placeholder="Escribí un nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-folkiAmber rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-folkiRed"
        />

        {results.length === 0 && search.length > 1 ? (
          <p className="text-sm text-gray-500">No se encontraron usuarios.</p>
        ) : (
          <ul className="space-y-3">
            {results.map((user) => (
              <li
                key={user.id}
                className="flex items-center p-3 bg-folkiCream border border-folkiAmber rounded-lg shadow-sm hover:scale-[1.02] transition-transform cursor-pointer"
              >
                <img
                  src={user.avatar || '/default-avatar.png'}
                  alt={user.full_name}
                  className="w-12 h-12 rounded-full border-2 border-folkiRed object-cover mr-4"
                />
                <span className="text-folkiRed font-semibold text-lg">{user.full_name}</span>
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    </div>
  );
}
