import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {Background, Controls, useNodesState, useEdgesState, addEdge, Node,
  Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import UserProfileModal from './UserProfileModal';

interface CommunityModalProps {
  userId: string;
  onClose: () => void;
}

export const CommunityModal: React.FC<CommunityModalProps> = ({
  userId,
  onClose,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [followers, setFollowers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [profilesMap, setProfilesMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  /* ───────────────────  ESTADOS DE EXPANSIÓN ─────────────────── */
  const [expanded, setExpanded] = useState<{
    followers: boolean;
    events: boolean;
    likesSection: Record<string, boolean>;
    attendSection: Record<string, boolean>;
  }>({
    followers: false,
    events: false,
    likesSection: {},
    attendSection: {},
  });

  const baseX = 0;
  const baseY = 0;

  const onConnectHandler = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  /* ───────────────────  FETCH DATOS INICIALES ─────────────────── */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      /* 1. Perfil propio */
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setLoading(false);
        return;
      }

      /* 2. Followers */
      const { data: followersData, error: followersError } = await supabase
        .from('communities')
        .select('user_id')
        .eq('community_leader_id', userId);

      if (followersError) {
        console.error('Error fetching community followers:', followersError);
        setLoading(false);
        return;
      }

      const followerIds = followersData?.map((f) => f.user_id) || [];

      /* 3. Perfiles followers */
      let followersProfiles: any[] = [];
      if (followerIds.length) {
        const { data: followersProfilesData, error: followersProfilesError } =
          await supabase
            .from('profiles')
            .select('id, full_name, avatar')
            .in('id', followerIds);

        if (followersProfilesError) {
          console.error(
            'Error fetching followers profiles:',
            followersProfilesError
          );
          setLoading(false);
          return;
        }
        followersProfiles = followersProfilesData || [];
      }
      setFollowers(followersProfiles);

      /* 4. Eventos organizados */
      const { data: myEvents, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .eq('organizer_id', userId);

      if (eventsError) {
        console.error('Error fetching events:', eventsError);
        setLoading(false);
        return;
      }

      const eventIds = (myEvents || []).map((e) => e.id);

      /* 5. Likes y asistencias */
      let allLikes: any[] = [];
      let allAttends: any[] = [];
      if (eventIds.length) {
        const { data: likesData, error: likesError } = await supabase
          .from('likes')
          .select('event_id, user_id')
          .in('event_id', eventIds);

        if (likesError) {
          console.error('Error fetching likes:', likesError);
          setLoading(false);
          return;
        }
        allLikes = likesData || [];

        const { data: attendsData, error: attendsError } = await supabase
          .from('attendances')
          .select('event_id, user_id')
          .in('event_id', eventIds);

        if (attendsError) {
          console.error('Error fetching attendances:', attendsError);
          setLoading(false);
          return;
        }
        allAttends = attendsData || [];
      }

      /* 6. Unificar perfiles */
      const likeUserIds = allLikes.map((l) => l.user_id);
      const attendUserIds = allAttends.map((a) => a.user_id);
      const uniqueIds = Array.from(
        new Set([...followerIds, ...likeUserIds, ...attendUserIds, userId])
      );

      const { data: extraProfilesData, error: extraProfilesError } =
        await supabase
          .from('profiles')
          .select('id, full_name, avatar')
          .in('id', uniqueIds);

      if (extraProfilesError) {
        console.error('Error fetching extra profiles:', extraProfilesError);
        setLoading(false);
        return;
      }

      const profilesArray = extraProfilesData || [];
      const profilesLookup: Record<string, any> = {};
      profilesArray.forEach((p) => {
        profilesLookup[p.id] = p;
      });
      setProfilesMap(profilesLookup);

      /* 7. Eventos con likes/asistencias */
      const fullEvents = (myEvents || []).map((event) => {
        const likes = allLikes.filter((l) => l.event_id === event.id);
        const attending = allAttends.filter((a) => a.event_id === event.id);
        return { ...event, likes, attending };
      });

      setEvents(fullEvents);
      setLoading(false);
    };

    fetchData();
  }, [userId]);

  /* ───────────────────  TOGGLES ─────────────────── */
  const toggleFollowers = () =>
    setExpanded((prev) => ({ ...prev, followers: !prev.followers }));

  const toggleEvents = () =>
    setExpanded((prev) => ({ ...prev, events: !prev.events }));

  const toggleLikesSection = (eventId: string) =>
    setExpanded((prev) => ({
      ...prev,
      likesSection: {
        ...prev.likesSection,
        [eventId]: !prev.likesSection[eventId],
      },
    }));

  const toggleAttendsSection = (eventId: string) =>
    setExpanded((prev) => ({
      ...prev,
      attendSection: {
        ...prev.attendSection,
        [eventId]: !prev.attendSection[eventId],
      },
    }));

  /* ───────────────────  NODES & EDGES ─────────────────── */
  useEffect(() => {
    if (loading) return;

    const baseNodes: Node[] = [
      /* Mi Usuario */
      {
        id: 'user',
        data: {
          label: (
            <div className="flex items-center gap-2 cursor-default select-none">
              <img
                src={profilesMap[userId]?.avatar || '/default-avatar.png'}
                alt={profilesMap[userId]?.full_name}
                className="w-6 h-6 rounded-full border border-white object-cover"
              />
              <span className="text-white font-semibold">
                {profilesMap[userId]?.full_name || 'Mi Usuario'}
              </span>
            </div>
          ),
        },
        position: { x: baseX, y: baseY },
        style: {
          backgroundColor: '#800000',
          padding: 10,
          borderRadius: 12,
          color: 'white',
          cursor: 'default',
        },
        sourcePosition: 'right',
      },

      /* Mi Red */
      {
        id: 'my-network',
        data: {
          label: (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFollowers();
              }}
              className="font-semibold"
            >
              👥 Mi Red
            </button>
          ),
        },
        position: { x: baseX, y: baseY + 100 },
        style: {
          backgroundColor: '#FCE8B2',
          padding: 8,
          borderRadius: 10,
          cursor: 'pointer',
        },
        targetPosition: 'top',
      },

      /* Mis Eventos */
      {
        id: 'my-events',
        data: {
          label: (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleEvents();
              }}
              className="font-semibold"
            >
              🎤 Mis Eventos
            </button>
          ),
        },
        position: { x: baseX + 200, y: baseY },
        style: {
          backgroundColor: '#FCE8B2',
          padding: 8,
          borderRadius: 10,
          cursor: 'pointer',
        },
        targetPosition: 'left',
      },
    ];

    const baseEdges: Edge[] = [
      {
        id: 'edge-user-network',
        source: 'user',
        target: 'my-network',
        type: 'straight',
        animated: true,
        sourcePosition: 'bottom',
        targetPosition: 'top',
      },
      {
        id: 'edge-user-events',
        source: 'user',
        target: 'my-events',
        type: 'straight',
        animated: true,
        sourcePosition: 'right',
        targetPosition: 'left',
      },
    ];

    /* Followers */
    if (expanded.followers) {
      followers.forEach((follower, i) => {
        const followerY = baseY + 180 + i * 70;
        baseNodes.push({
          id: `f-${follower.id}`,
          data: {
            label: (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedUser(follower);
                }}
                className="flex items-center gap-2 text-left hover:text-folkiAmber"
              >
                <img
                  src={follower.avatar || '/default-avatar.png'}
                  alt={follower.full_name}
                  className="w-6 h-6 rounded-full border border-gray-300 object-cover"
                />
                <span>{follower.full_name}</span>
              </button>
            ),
          },
          position: { x: baseX, y: followerY },
          style: { backgroundColor: '#fff', padding: 6, borderRadius: 8 },
        });
        baseEdges.push({
          id: `edge-f-${follower.id}`,
          source: 'my-network',
          target: `f-${follower.id}`,
          type: 'straight',
        });
      });
    }

    /* Eventos con Likes y Asistencias alineados horizontalmente */
    if (expanded.events) {
      const eventOffsetY = 120;
      events.forEach((event, i) => {
        const eventY = baseY + eventOffsetY + i * 150;
        const eventX = baseX + 200;
        const eId = event.id;

        /* Nodo del Evento */
        baseNodes.push({
          id: `e-${eId}`,
          data: {
            label: (
              <div className="font-semibold">
                🎪{' '}
                {event.title.length > 25
                  ? `${event.title.slice(0, 25)}…`
                  : event.title}
              </div>
            ),
          },
          position: { x: eventX, y: eventY },
          style: { backgroundColor: '#fff', padding: 6, borderRadius: 8 },
          sourcePosition: 'right',
          targetPosition: 'top',
        });

        baseEdges.push({
          id: `edge-e-${eId}`,
          source: 'my-events',
          target: `e-${eId}`,
          type: 'straight',
          sourcePosition: 'bottom',
          targetPosition: 'top',
        });

        /* Nodo Likes */
        const likesNodeId = `e-${eId}-likes`;
        const likesX = eventX + 250;
        baseNodes.push({
          id: likesNodeId,
          data: {
            label: (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLikesSection(eId);
                }}
                className="flex items-center gap-1"
              >
                ❤️ Likes ({event.likes.length})
              </button>
            ),
          },
          position: { x: likesX, y: eventY },
          style: { backgroundColor: '#fff3f3', padding: 6, borderRadius: 8 },
          targetPosition: 'left',
          sourcePosition: 'bottom',
        });

        baseEdges.push({
          id: `edge-${likesNodeId}`,
          source: `e-${eId}`,
          target: likesNodeId,
          type: 'straight',
          sourcePosition: 'right',
          targetPosition: 'left',
        });

        /* Nodo Asistiré */
        const attendsNodeId = `e-${eId}-attends`;
        const attendsX = likesX + 250;
        baseNodes.push({
          id: attendsNodeId,
          data: {
            label: (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleAttendsSection(eId);
                }}
                className="flex items-center gap-1"
              >
                ✅ Asistiré ({event.attending.length})
              </button>
            ),
          },
          position: { x: attendsX, y: eventY },
          style: { backgroundColor: '#f3fff3', padding: 6, borderRadius: 8 },
          targetPosition: 'left',
          sourcePosition: 'bottom',
        });

        baseEdges.push({
          id: `edge-${attendsNodeId}`,
          source: `e-${eId}`,
          target: attendsNodeId,
          type: 'straight',
          sourcePosition: 'right',
          targetPosition: 'left',
        });

        /* Usuarios que dieron Like (línea hacia abajo desde Likes) */
        if (expanded.likesSection[eId]) {
          event.likes.forEach((like, j) => {
            const userNodeId = `like-u-${eId}-${like.user_id}`;
            baseNodes.push({
              id: userNodeId,
              data: {
                label: (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedUser(profilesMap[like.user_id]);
                    }}
                    className="flex items-center gap-2 text-left hover:text-folkiAmber"
                  >
                    <img
                      src={profilesMap[like.user_id]?.avatar ||'/default-avatar.png'}
                      alt={profilesMap[like.user_id]?.full_name}
                      className="w-5 h-5 rounded-full border border-folkiRed object-cover"
                    />
                    <span className="text-xs">{profilesMap[like.user_id]?.full_name || 'user'}</span>
                    </button>
                ),
              },
              position: { x: likesX, y: eventY + 40 + j * 40 },
              style: { backgroundColor: '#fff', padding: 4, borderRadius: 6 },
              targetPosition: 'top',
            });
            baseEdges.push({
              id: `edge-${likesNodeId}-${userNodeId}`,
              source: likesNodeId,
              target: userNodeId,
              type: 'straight',
              sourcePosition: 'bottom',
              targetPosition: 'top',
            });
          });
        }

        /* Usuarios que asistirán (línea hacia abajo desde Asistiré) */
        if (expanded.attendSection[eId]) {
          event.attending.forEach((att, k) => {
            const userNodeId = `att-u-${eId}-${att.user_id}`;
            baseNodes.push({
              id: userNodeId,
              data: {
                label: (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedUser(profilesMap[att.user_id]);
                    }}
                    className="flex items-center gap-2 text-left hover:text-folkiAmber"
                  >
                    <img
                      src={profilesMap[att.user_id]?.avatar ||'/default-avatar.png'}
                      alt={profilesMap[att.user_id]?.full_name}
                      className="w-5 h-5 rounded-full border border-folkiRed object-cover"
                    />
                    <span className="text-xs">{profilesMap[att.user_id]?.full_name || 'user'}</span>
                    </button>
                ),
              },
              position: { x: attendsX, y: eventY + 40 + k * 40 },
              style: { backgroundColor: '#fff', padding: 4, borderRadius: 6 },
              targetPosition: 'top',
            });
            baseEdges.push({
              id: `edge-${attendsNodeId}-${userNodeId}`,
              source: attendsNodeId,
              target: userNodeId,
              type: 'straight',
              sourcePosition: 'bottom',
              targetPosition: 'top',
            });
          });
        }
      });
    }

    setNodes(baseNodes);
    setEdges(baseEdges);
  }, [expanded, followers, events, profilesMap, loading]);

  /* ───────────────────  RENDER ─────────────────── */
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
      onClick={onClose}
    >
      <div
        className="bg-folkiCream w-full h-[80vh] max-w-6xl rounded-2xl p-4 relative shadow-lg flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold text-folkiRed">Mi Comunidad</h2>
          <button
            onClick={onClose}
            className="text-folkiRed hover:text-folkiAmber text-xl font-bold"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        <div className="text-sm text-gray-600 mb-3">
          Explorá tu comunidad de forma visual y jerárquica.
        </div>

        {/* Canvas */}
        {loading ? (
          <div className="flex justify-center items-center h-full text-folkiRed font-semibold text-xl">
            Diseñando tu comunidad...
          </div>
        ) : (
          <div 
            className="w-full flex-1 border border-folkiRed rounded-xl relative"
            style={{ padding: 0, margin: 0, boxSizing: 'border-box', backgroundColor: '#FCE8B2' /* el beige */ }}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnectHandler}
              panOnDrag
              zoomOnScroll={false}
              zoomOnPinch={false}
              defaultViewport={{ x: 0, y: 0, zoom: 1 }}
              style={{ width: '100%', height: '100%', margin: 0, padding: 0, border: 'none' }}
            >
              <Background />
              <Controls showInteractive={false} />
            </ReactFlow>

            {/* Sidebar */}
            {selectedUser && (
              <UserProfileModal
                userId={selectedUser.id}
                onClose={() => setSelectedUser(null)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};