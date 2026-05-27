import { useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useAuthStore } from '../store/authStore';

/**
 * Subscribes to /topic/host/{hostId}/sessions and calls onSessionFinished
 * whenever a SESSION_FINISHED event arrives. Used by SessionHistoryPage and
 * AnalyticsListPage to refresh immediately when a session ends.
 */
export const useHostSessionsSocket = (onSessionFinished: () => void) => {
  const { accessToken, user } = useAuthStore();
  const callbackRef = useRef(onSessionFinished);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    callbackRef.current = onSessionFinished;
  }, [onSessionFinished]);

  useEffect(() => {
    if (!accessToken || !user?.id) return;

    try {
      const wsUrl = `${import.meta.env.VITE_WS_URL}/ws?token=${accessToken}`;
      const socket = new SockJS(wsUrl);
      const client = new Client({
        webSocketFactory: () => socket as any,
        reconnectDelay: 5000,
        onConnect: () => {
          client.subscribe(`/topic/host/${user.id}/sessions`, (msg) => {
            const data = JSON.parse(msg.body);
            if (data.type === 'SESSION_FINISHED') {
              callbackRef.current();
            }
          });
        },
        onStompError: () => {
          // Silently handle STOMP errors
        },
        onWebSocketError: () => {
          // Silently handle WebSocket errors
        },
        debug: () => {},
      });

      client.activate();
      clientRef.current = client;

      return () => { 
        if (clientRef.current) {
          try {
            clientRef.current.deactivate();
          } catch (err) {
            // Silently handle deactivation errors
          }
        }
      };
    } catch (err) {
      // Silently handle WebSocket initialization errors
      console.error('WebSocket initialization failed:', err);
    }
  }, [accessToken, user?.id]);
};
