import React from 'react';
import { X, Heart, Calendar } from 'lucide-react';

interface ReactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  userIds: string[];
  type: 'likes' | 'attending';
}

export function ReactionModal({ isOpen, onClose, title, userIds, type }: ReactionModalProps) {
  // Mock users data - in a real app, you'd fetch this from your API based on userIds
  const mockUsers = [
    { id: '1', name: 'Usuario Ejemplo 1', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
    { id: '2', name: 'Usuario Ejemplo 2', avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
    { id: '3', name: 'Usuario Ejemplo 3', avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
    { id: '4', name: 'Usuario Ejemplo 4', avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
    { id: '5', name: 'Usuario Ejemplo 5', avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' }
  ];

  const users = mockUsers.filter(user => userIds.includes(user.id));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-96 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <div className="flex items-center space-x-2">
            {type === 'likes' ? (
              <Heart className="h-5 w-5 text-red-600" />
            ) : (
              <Calendar className="h-5 w-5 text-green-600" />
            )}
            <h3 className="text-lg font-semibold text-neutral-800">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700 transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-neutral-500">
                {type === 'likes' ? 'Nadie ha marcado "me gusta" aún' : 'Nadie marcó que asistirá aún'}
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {users.map((user) => (
                <div key={user.id} className="flex items-center space-x-3 hover:bg-neutral-50 p-2 rounded-lg transition-colors duration-200">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-neutral-800">{user.name}</p>
                  </div>
                  {type === 'likes' ? (
                    <Heart className="h-4 w-4 text-red-500 fill-current" />
                  ) : (
                    <Calendar className="h-4 w-4 text-green-500 fill-current" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-neutral-50 border-t border-neutral-200">
          <p className="text-sm text-neutral-600 text-center">
            {users.length} {users.length === 1 ? 'persona' : 'personas'}
          </p>
        </div>
      </div>
    </div>
  );
}