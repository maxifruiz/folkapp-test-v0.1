export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: 'google' | 'instagram';
  role: 'admin' | 'user';
  createdAt: Date;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  type: EventType;
  location: {
    province: string;
    city: string;
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  date: Date;
  price: number | 'free';
  multimedia: MediaFile[];
  organizer: User;
  reactions: {
    likes: string[]; // user IDs
    attending: string[]; // user IDs
  };
  createdAt: Date;
}

export interface MediaFile {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
}

export type EventType = 
  | 'peña'
  | 'certamen'
  | 'festival'
  | 'recital'
  | 'clase'
  | 'taller'
  | 'encuentro';

export interface Province {
  id: string;
  name: string;
  cities: string[];
}

export interface Notification {
  id: string;
  userId: string;
  eventId: string;
  type: 'event_reminder';
  message: string;
  read: boolean;
  createdAt: Date;
}