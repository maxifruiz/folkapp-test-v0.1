import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

interface Event {
  id: string;
  title: string;
  description: string;
  type: string;
  province: string;
  city: string;
  address: string;
  date: string;
  is_free: boolean;
  price_anticipada: number | null;
  price_general: number | null;
  multimedia: any[];
  organizer_id: string;
  created_at: string;
  profiles?: {
    full_name: string;
    avatar: string;
  };
  reactions?: {
    likes: string[];
    attending: string[];
  };
}

interface Filters {
  selectedType: string;
  selectedProvince: string;
  selectedCity: string;
}

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [filters, setFilters] = useState<Filters>({
    selectedType: '',
    selectedProvince: '',
    selectedCity: '',
  });

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`*, profiles:organizer_id(full_name, avatar)`) // alias para datos de organizador
        .order('date', { ascending: true });

      if (error) throw error;
      if (data) {
        const enrichedEvents = data.map((event: any) => ({
          ...event,
          price: {
            anticipada: event.price_anticipada,
            general: event.price_general,
          },
          organizer: event.profiles,
        }));
        setAllEvents(enrichedEvents);
        applyFilters(enrichedEvents);
      }
    } catch (error) {
      console.error('Error al cargar eventos:', error);
    }
  };

  const applyFilters = (eventsList: Event[]) => {
    let filtered = [...eventsList];
    if (filters.selectedType) {
      filtered = filtered.filter(e => e.type === filters.selectedType);
    }
    if (filters.selectedProvince) {
      filtered = filtered.filter(e => e.province === filters.selectedProvince);
    }
    if (filters.selectedCity) {
      filtered = filtered.filter(e => e.city.toLowerCase().includes(filters.selectedCity.toLowerCase()));
    }
    setEvents(filtered);
  };

  const setSelectedType = (type: string) => {
    setFilters(prev => ({ ...prev, selectedType: type }));
  };
  const setSelectedProvince = (province: string) => {
    setFilters(prev => ({ ...prev, selectedProvince: province }));
  };
  const setSelectedCity = (city: string) => {
    setFilters(prev => ({ ...prev, selectedCity: city }));
  };

  const clearFilters = () => {
    setFilters({ selectedType: '', selectedProvince: '', selectedCity: '' });
  };

  const addEvent = async (eventData: any, user: any) => {
    const eventToInsert = {
      ...eventData,
      organizer_id: user.id,
    };
    const { data, error } = await supabase.from('events').insert([eventToInsert]);
    if (error) throw error;
    await fetchEvents();
    return data;
  };

  const toggleLike = (eventId: string, userId: string) => {
    console.log(`toggleLike: evento ${eventId} usuario ${userId}`);
  };

  const toggleAttending = (eventId: string, userId: string) => {
    console.log(`toggleAttending: evento ${eventId} usuario ${userId}`);
  };

  const deleteEvent = async (eventId: string) => {
    const { error } = await supabase.from('events').delete().eq('id', eventId);
    if (error) throw error;
    await fetchEvents();
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    applyFilters(allEvents);
  }, [filters, allEvents]);

  return {
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
  };
}
