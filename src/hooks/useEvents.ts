import { useState, useCallback, useEffect } from 'react';
import { Event, EventType } from '../types';

export function useEvents() {
  // Start with empty events array
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedType, setSelectedType] = useState<EventType | 'all'>('all');
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');

  // Load events from localStorage on initialization
  useEffect(() => {
    const storedEvents = localStorage.getItem('folki_events');
    if (storedEvents) {
      try {
        const parsedEvents = JSON.parse(storedEvents).map((event: any) => ({
          ...event,
          date: new Date(event.date),
          createdAt: new Date(event.createdAt)
        }));
        setEvents(parsedEvents);
      } catch (error) {
        console.error('Failed to parse stored events:', error);
      }
    }
  }, []);

  // Save events to localStorage whenever events change
  useEffect(() => {
    localStorage.setItem('folki_events', JSON.stringify(events));
  }, [events]);

  // Filter events based on criteria
  useEffect(() => {
    let filtered = events;

    if (selectedType !== 'all') {
      filtered = filtered.filter(event => event.type === selectedType);
    }

    if (selectedProvince) {
      filtered = filtered.filter(event => event.location.province === selectedProvince);
    }

    if (selectedCity) {
      filtered = filtered.filter(event => event.location.city === selectedCity);
    }

    // Sort by date (nearest first)
    filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setFilteredEvents(filtered);
  }, [events, selectedType, selectedProvince, selectedCity]);

  const addEvent = useCallback((eventData: any, currentUser: any) => {
    // Check for duplicate events (same title, location, and date)
    const isDuplicate = events.some(event => 
      event.title.toLowerCase() === eventData.title.toLowerCase() &&
      event.location.province === eventData.province &&
      event.location.city === eventData.city &&
      event.date.toDateString() === eventData.date.toDateString()
    );

    if (isDuplicate) {
      throw new Error('Ya existe un evento con el mismo título, ubicación y fecha');
    }

    const newEvent: Event = {
      id: Date.now().toString(),
      title: eventData.title,
      description: eventData.description,
      type: eventData.type,
      location: {
        province: eventData.province,
        city: eventData.city,
        address: eventData.address,
        coordinates: { lat: 0, lng: 0 } // Would be geocoded in real app
      },
      date: eventData.date,
      price: eventData.price,
      multimedia: eventData.files.map((file: File, index: number) => ({
        id: `${Date.now()}-${index}`,
        type: file.type.startsWith('image/') ? 'image' : 'video',
        url: URL.createObjectURL(file) // In real app, would upload to cloud storage
      })),
      organizer: currentUser,
      reactions: {
        likes: [],
        attending: []
      },
      createdAt: new Date()
    };

    setEvents(prev => [newEvent, ...prev]);
    return newEvent;
  }, [events]);

  const toggleLike = useCallback((eventId: string, userId: string) => {
    setEvents(prev => prev.map(event => {
      if (event.id === eventId) {
        const likes = event.reactions.likes.includes(userId)
          ? event.reactions.likes.filter(id => id !== userId)
          : [...event.reactions.likes, userId];
        
        return {
          ...event,
          reactions: {
            ...event.reactions,
            likes
          }
        };
      }
      return event;
    }));
  }, []);

  const toggleAttending = useCallback((eventId: string, userId: string) => {
    setEvents(prev => prev.map(event => {
      if (event.id === eventId) {
        const attending = event.reactions.attending.includes(userId)
          ? event.reactions.attending.filter(id => id !== userId)
          : [...event.reactions.attending, userId];
        
        return {
          ...event,
          reactions: {
            ...event.reactions,
            attending
          }
        };
      }
      return event;
    }));
  }, []);

  const deleteEvent = useCallback((eventId: string) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedType('all');
    setSelectedProvince('');
    setSelectedCity('');
  }, []);

  return {
    events: filteredEvents,
    allEvents: events,
    filters: {
      selectedType,
      selectedProvince,
      selectedCity
    },
    addEvent,
    toggleLike,
    toggleAttending,
    deleteEvent,
    setSelectedType,
    setSelectedProvince,
    setSelectedCity,
    clearFilters
  };
}