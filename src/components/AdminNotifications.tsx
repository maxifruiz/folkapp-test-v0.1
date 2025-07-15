// components/AdminNotifications.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Bell, Trash2, EyeOff } from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  content: string;
  created_at: string;
  read: boolean;
}

export default function AdminNotifications({ currentUser }: { currentUser: any }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (currentUser?.email === 'maxif.ruiz@gmail.com') {
      fetchNotifications();
    }
  }, [currentUser]);

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from('admin_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) console.error('Error al traer notis:', error);
    else setNotifications(data || []);
  };

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('admin_notifications')
      .update({ read: true })
      .eq('id', id);

    if (error) {
      console.error('Error al marcar como leído:', error);
    }
    fetchNotifications();
  };

  const markAllAsRead = async () => {
    const { error } = await supabase
      .from('admin_notifications')
      .update({ read: true })
      .eq('read', false);

    if (error) {
      console.error('Error al marcar todas como leídas:', error);
    }
    fetchNotifications();
  };

  const clearReadNotifications = async () => {
    const { error } = await supabase
      .from('admin_notifications')
      .delete()
      .eq('read', true);

    if (error) {
      console.error('Error al limpiar leídas:', error);
    }
    fetchNotifications();
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const readCount = notifications.filter(n => n.read).length;

  if (currentUser?.email !== 'maxif.ruiz@gmail.com') return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShow(!show)}
        className="relative flex items-center gap-1 text-[#7c1d1d] font-semibold hover:text-[#a71919] transition"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 text-xs bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
        <span className="ml-1">Admin</span>
      </button>

      {show && (
        <div className="absolute z-50 right-0 mt-2 w-96 bg-[#fdfaf6] border border-red-200 shadow-xl rounded-2xl p-4 text-sm text-gray-800">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-red-900">Notificaciones Admin</h3>
            <div className="flex gap-2 items-center">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-xs text-gray-600 hover:text-green-600 transition"
                  title="Marcar todas como leídas"
                >
                  <EyeOff className="w-4 h-4" />
                  Marcar todas
                </button>
              )}
              {readCount > 0 && (
                <button
                  onClick={clearReadNotifications}
                  className="flex items-center gap-1 text-xs text-gray-600 hover:text-red-600 transition"
                  title="Eliminar notificaciones leídas"
                >
                  <Trash2 className="w-4 h-4" />
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {notifications.length === 0 ? (
            <p className="text-sm text-gray-500">Sin notificaciones</p>
          ) : (
            <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {notifications.map(n => (
                <li
                  key={n.id}
                  className={`p-3 rounded-xl border ${
                    n.read ? 'bg-gray-100 border-gray-200' : 'bg-[#fff8e6] border-red-200'
                  }`}
                >
                  <p className="text-sm">{n.content}</p>
                  <p className="text-xs text-gray-500">{new Date(n.created_at).toLocaleString()}</p>
                  {!n.read && (
                    <button
                      onClick={() => markAsRead(n.id)}
                      className="text-blue-600 text-xs mt-1 hover:underline"
                    >
                      Marcar como leído
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
