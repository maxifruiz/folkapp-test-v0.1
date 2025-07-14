import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../lib/supabaseClient'; // Ajustá la ruta si es necesario
import toast from 'react-hot-toast';

const parseMessage = (msg: string) => {
  const instaRegex = /@([a-zA-Z0-9._]{1,30})/g;
  let html = msg.replace(
    instaRegex,
    (match, user) => {
      if (user.startsWith('.') || user.endsWith('.') || user.includes('..')) return match; // evitar links malformados
      return `<a href="https://instagram.com/${user}" target="_blank" rel="noopener noreferrer" style="color:#1d4ed8;text-decoration:underline">@${user}</a>`;
    }
  );

  html = html.replace(
    /(?:\+?549\d{10})/g,
    (m) => {
      const normalized = m.startsWith('+') ? m.slice(1) : m;
      return `<a href="https://wa.me/${normalized}" target="_blank" rel="noopener noreferrer" style="color:#15803d;text-decoration:underline">${m}</a>`;
    }
  );

  return html;
};

interface Announcement {
  id: string;
  title: string;
  message: string;
  leido: boolean;
}

interface AdminAnnouncementsProps {
  userId?: string;
}

const AdminAnnouncements = ({ userId }: AdminAnnouncementsProps) => {
  const [showModal, setShowModal] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [openedAnnouncement, setOpenedAnnouncement] = useState<Announcement | null>(null);

  // Para animación de cierre del modal del mensaje
  const [closingMessageModal, setClosingMessageModal] = useState(false);

  const fetchAnnouncements = async () => {
    if (!userId) {
      setAnnouncements([]);
      return;
    }

    try {
      const { data: allAnnouncements, error: errorAnnouncements } = await supabase
        .from('announcements')
        .select('id, title, message')
        .order('created_at', { ascending: false });

      if (errorAnnouncements) throw errorAnnouncements;

      const { data: readRows, error: errorRead } = await supabase
        .from('user_announcements')
        .select('announcement_id')
        .eq('user_id', userId);

      if (errorRead) throw errorRead;

      const readIds = readRows ? readRows.map(r => r.announcement_id) : [];

      const combined: Announcement[] = (allAnnouncements ?? []).map(a => ({
        id: a.id,
        title: a.title,
        message: a.message,
        leido: readIds.includes(a.id),
      }));

      setAnnouncements(combined);
    } catch (error) {
      console.error('Error al cargar anuncios:', error);
      toast.error('Error al cargar anuncios');
    }
  };

  useEffect(() => {
    fetchAnnouncements();

    const interval = setInterval(() => {
      fetchAnnouncements();
    }, 1800000);

    return () => clearInterval(interval);
  }, [userId]);

  const markAsRead = async (announcementId: string) => {
    if (!userId) {
      toast.error('Usuario no identificado');
      return;
    }

    try {
      const { error } = await supabase
        .from('user_announcements')
        .upsert(
          { user_id: userId, announcement_id: announcementId },
          { onConflict: ['user_id', 'announcement_id'] }
        );

      if (error) throw error;

      setAnnouncements(prev =>
        prev.map(a => (a.id === announcementId ? { ...a, leido: true } : a))
      );
    } catch (error) {
      console.error('Error al marcar anuncio como leído:', error);
      toast.error('Error al marcar anuncio como leído');
    }
  };

  const unreadCount = announcements.filter(a => !a.leido).length;

  /* Función para cerrar modal mensaje con animación */
  const closeMessageModal = () => {
    setClosingMessageModal(true);
    setTimeout(() => {
      setOpenedAnnouncement(null);
      setClosingMessageModal(false);
    }, 300); // duración animación
  };

  /* JSX del modal principal con listado de títulos */
  const modal = (
    <div
      onClick={() => setShowModal(false)}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.35)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#f5e8d5',
          border: '2px solid #800000',
          borderRadius: '1.25rem',
          boxShadow: '0 6px 16px rgba(128,0,0,.5)',
          padding: '1rem',
          width: '90%',
          maxWidth: 600,
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontSize: '.9rem',
          animation: 'fadeIn .2s ease',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '.5rem',
            color: '#800000',
            fontWeight: 600,
            fontSize: '1.2rem',
          }}
        >
          <span>Anuncios</span>
          <button
            onClick={() => setShowModal(false)}
            style={{
              background: 'none',
              border: 'none',
              color: '#800000',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '1.3rem',
              lineHeight: 1,
            }}
            aria-label="Cerrar modal de anuncios"
          >
            ×
          </button>
        </div>

        {/* Listado de títulos con botón "Abrir" y marcar leído */}
        <div style={{ flexGrow: 1, overflowY: 'auto' }}>
          {announcements.length === 0 && (
            <p style={{ color: '#4b2c1a' }}>No hay anuncios.</p>
          )}
          {announcements.map(a => (
            <div
              key={a.id}
              style={{
                backgroundColor: a.leido ? '#f5e8d5' : '#fff3db',
                border: a.leido ? '2px solid #800000' : '1.5px solid #d1a58b',
                borderRadius: '.5rem',
                padding: '.5rem',
                marginBottom: '.5rem',
                color: '#4b2c1a',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <strong>{a.title}</strong>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {!a.leido && (
                  <button
                    onClick={() => markAsRead(a.id)}
                    style={{
                      fontSize: '.75rem',
                      color: '#2f6b36',
                      fontWeight: 600,
                      backgroundColor: '#e6f3e6',
                      border: '1px solid #2f6b36',
                      borderRadius: '0.25rem',
                      padding: '0.25rem 0.5rem',
                      cursor: 'pointer',
                    }}
                    aria-label={`Marcar anuncio "${a.title}" como leído`}
                    title="Marcar como leído"
                  >
                    Leído ✓
                  </button>
                )}
                <button
                  onClick={() => setOpenedAnnouncement(a)}
                  style={{
                    fontSize: '.75rem',
                    color: '#800000',
                    fontWeight: 600,
                    backgroundColor: '#f0dede',
                    border: '1px solid #800000',
                    borderRadius: '0.25rem',
                    padding: '0.25rem 0.5rem',
                    cursor: 'pointer',
                  }}
                  aria-label={`Abrir anuncio "${a.title}"`}
                >
                  Abrir
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Segundo modal para mostrar el mensaje completo con animación */}
      {openedAnnouncement && (
        <div
          onClick={closeMessageModal}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 11000,
            animation: closingMessageModal ? 'fadeOut .3s ease forwards' : 'fadeIn .3s ease forwards',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#fff3db',
              border: '2px solid #800000',
              borderRadius: '1rem',
              padding: '1rem',
              width: '90%',
              maxWidth: 500,
              maxHeight: '70vh',
              overflowY: 'auto',
              fontSize: '1rem',
              color: '#4b2c1a',
              boxShadow: '0 0 15px rgba(128,0,0,0.6)',
              transform: closingMessageModal ? 'scale(0.95)' : 'scale(1)',
              transition: 'transform 0.3s ease',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '0.5rem',
                fontWeight: '700',
                fontSize: '1.3rem',
                color: '#800000',
              }}
            >
              <span>{openedAnnouncement.title}</span>
              <button
                onClick={closeMessageModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#800000',
                  cursor: 'pointer',
                  lineHeight: 1,
                }}
                aria-label="Cerrar mensaje del anuncio"
              >
                ×
              </button>
            </div>
            <div
              dangerouslySetInnerHTML={{
                __html: parseMessage(openedAnnouncement.message)
              }}
              style={{ 
                lineHeight: '1.5', 
                whiteSpace: 'pre-wrap' 
              }}
            />
          </div>
        </div>
      )}
      <style>{`
        @keyframes fadeIn {
          0% { opacity: 0; transform: scale(.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeOut {
          0% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(.9); }
        }
      `}</style>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="noti-button relative p-2 rounded-full shadow-md"
        title="Mostrar anuncios"
        aria-label="Mostrar anuncios"
      >
        <img src="/anuncio.png" alt="Anuncios" className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {showModal && createPortal(modal, document.body)}
    </>
  );
};

export default AdminAnnouncements;
