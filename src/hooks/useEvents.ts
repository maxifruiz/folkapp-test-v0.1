import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

interface User {
  id: string;
  full_name: string;
  avatar: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  type?: string;
  province?: string;
  city?: string;
  address?: string;
  price_anticipada?: number;
  price_general?: number;
  multimedia?: { id: string; type: string; url: string }[];
  organizer?: {
    id?: string;
    full_name?: string;
    avatar?: string;
  } | null;
  reactions: {
    likes: User[];
    attending: User[];
  };
}

export function useEvents() {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Estados para filtros
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          organizer:profiles!fk_events_organizer(
            id,
            full_name,
            avatar
          ),
          likes(
            id,
            user_id,
            full_name,
            avatar
          ),
          attendances(
            id,
            user_id,
            full_name,
            avatar
          )
        `);

      if (error) throw error;

      const formatted = data.map((ev: any) => ({
        ...ev,
        organizer: ev.organizer || null,
        reactions: {
          likes: ev.likes?.map((l: any) => ({
            id: l.user_id,
            full_name: l.full_name,
            avatar: l.avatar,
          })) || [],
          attending: ev.attendances?.map((a: any) => ({
            id: a.user_id,
            full_name: a.full_name,
            avatar: a.avatar,
          })) || [],
        },
      }));

      console.log(`fetchEvents: ${data?.length || 0} eventos cargados`);

      const oldString = JSON.stringify(allEvents);
      const newString = JSON.stringify(formatted);

      if (oldString !== newString) {
        setAllEvents(formatted);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error al cargar eventos:', error);
      setLoading(false);
    }
  };

  // Aplica filtros a allEvents y guarda en events
  useEffect(() => {
    let filtered = allEvents;

    if (selectedType && selectedType !== 'all') {
      filtered = filtered.filter(ev => ev.type === selectedType);
    }
    if (selectedProvince) {
      filtered = filtered.filter(ev => ev.province === selectedProvince);
    }
    if (selectedCity) {
      filtered = filtered.filter(ev => ev.city === selectedCity);
    }

    setEvents(filtered);
  }, [allEvents, selectedType, selectedProvince, selectedCity]);

  useEffect(() => {
    fetchEvents();

    const interval = setInterval(() => {
      fetchEvents();
    }, 60000); // cada 60 segundos

    return () => clearInterval(interval);
  }, []);

  const updateReactions = async (
    eventId: string,
    type: 'likes' | 'attendances'
  ) => {
    try {
      const { data, error } = await supabase
        .from(type)
        .select('user_id, full_name, avatar')
        .eq('event_id', eventId);

      if (error) throw error;

      const formattedUsers = data.map((r: any) => ({
        id: r.user_id,
        full_name: r.full_name,
        avatar: r.avatar,
      }));

      setAllEvents((prev) =>
        prev.map((ev) =>
          ev.id === eventId
            ? {
                ...ev,
                reactions: {
                  ...ev.reactions,
                  [type === 'likes' ? 'likes' : 'attending']: formattedUsers,
                },
              }
            : ev
        )
      );
    } catch (error) {
      console.error(`Error actualizando ${type}:`, error);
    }
  };

  const toggleLike = async (eventId: string, userId: string) => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, avatar')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profile) throw new Error('Perfil no encontrado');

      const { data: existing, error: errExisting } = await supabase
        .from('likes')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .maybeSingle();

      if (errExisting) throw errExisting;

      if (existing) {
        const { error: errDelete } = await supabase
          .from('likes')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', userId);
        if (errDelete) throw errDelete;
      } else {
        const { error: errInsert } = await supabase
          .from('likes')
          .insert([
            {
              event_id: eventId,
              user_id: userId,
              full_name: profile.full_name,
              avatar: profile.avatar,
            },
          ]);
        if (errInsert) throw errInsert;
      }

      await updateReactions(eventId, 'likes');
    } catch (error) {
      console.error('Error en toggleLike:', error);
    }
  };

  const toggleAttending = async (eventId: string, userId: string) => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, avatar')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profile) throw new Error('Perfil no encontrado');

      const { data: existing, error: errExisting } = await supabase
        .from('attendances')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .maybeSingle();

      if (errExisting) throw errExisting;

      if (existing) {
        const { error: errDelete } = await supabase
          .from('attendances')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', userId);
        if (errDelete) throw errDelete;
      } else {
        const { error: errInsert } = await supabase
          .from('attendances')
          .insert([
            {
              event_id: eventId,
              user_id: userId,
              full_name: profile.full_name,
              avatar: profile.avatar,
            },
          ]);
        if (errInsert) throw errInsert;
      }

      await updateReactions(eventId, 'attendances');
    } catch (error) {
      console.error('Error en toggleAttending:', error);
    }
  };

  const addEvent = async (eventData: any) => {
    try {
      const { data: insertData, error: insertError } = await supabase
        .from('events')
        .insert([{ ...eventData }])
        .select('id')
        .single();

      if (insertError) throw insertError;

      await fetchEvents();
    } catch (error) {
      console.error('Error agregando evento:', error);
      throw error;
    }
  };

  const deleteEvent = async (eventId: string) => {
    await supabase.from('events').delete().eq('id', eventId);
    setAllEvents((prev) => prev.filter((ev) => ev.id !== eventId));
    setEvents((prev) => prev.filter((ev) => ev.id !== eventId));
  };

  const clearFilters = () => {
    setSelectedType('all');
    setSelectedProvince('');
    setSelectedCity('');
  };

  return {
    events,
    allEvents,
    filters: { selectedType, selectedProvince, selectedCity },
    addEvent,
    toggleLike,
    toggleAttending,
    deleteEvent,
    setSelectedType,
    setSelectedProvince,
    setSelectedCity,
    clearFilters,
    loading,
  };
}
