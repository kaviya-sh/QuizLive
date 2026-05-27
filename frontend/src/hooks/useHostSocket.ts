import { useEffect, useRef, useState, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useAuthStore } from '../store/authStore';

export const useHostSocket = (roomCode: string, onMessage: (message: any) => void) => {
  const clientRef = useRef<Client | null>(null);
  const [connected, setConnected] = useState(false);
  const accessToken = useAuthStore((state) => state.accessToken);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!roomCode || !accessToken) {
      console.log('WebSocket not initialized: missing roomCode or token');
      return;
    }

    console.log('Initializing WebSocket for room:', roomCode);
    const wsUrl = `${import.meta.env.VITE_WS_URL}/ws?token=${accessToken}`;
    console.log('WebSocket URL:', wsUrl);
    
    try {
      const socket = new SockJS(wsUrl);
      const client = new Client({
        webSocketFactory: () => socket as any,
        onConnect: () => {
          console.log('WebSocket connected for room:', roomCode);
          setConnected(true);
          
          client.subscribe(`/topic/session/${roomCode}/state`, (message) => {
            onMessageRef.current(JSON.parse(message.body));
          });
          
          client.subscribe(`/topic/session/${roomCode}/participants`, (message) => {
            onMessageRef.current(JSON.parse(message.body));
          });
          
          client.subscribe(`/topic/session/${roomCode}/distribution`, (message) => {
            onMessageRef.current(JSON.parse(message.body));
          });
          
          client.subscribe(`/topic/session/${roomCode}/question`, (message) => {
            console.log('Host received question:', message.body);
            onMessageRef.current(JSON.parse(message.body));
          });
        },
        onDisconnect: () => {
          console.log('WebSocket disconnected');
          setConnected(false);
        },
        onStompError: (frame) => {
          // Silently handle STOMP errors
        },
        debug: () => {},
      });

      client.activate();
      clientRef.current = client;
    } catch (error) {
      // Silently handle WebSocket initialization errors
    }

    return () => {
      if (clientRef.current) {
        try {
          clientRef.current.deactivate();
        } catch (err) {
          // Silently handle deactivation errors
        }
      }
    };
  }, [roomCode, accessToken]);

  return { connected };
};
