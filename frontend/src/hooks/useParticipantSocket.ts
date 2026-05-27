import { useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

export const useParticipantSocket = (roomCode: string, onMessage: (message: any) => void) => {
  const clientRef = useRef<Client | null>(null);
  const [connected, setConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const onMessageRef = useRef(onMessage);
  const isConnectingRef = useRef(false);

  // Update the message handler ref without triggering reconnection
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!roomCode || isConnectingRef.current) return;

    const connectWebSocket = () => {
      const guestToken = sessionStorage.getItem('guestToken');
      const participantId = sessionStorage.getItem('participantId');
      
      if (!guestToken) {
        console.error('No guest token found');
        return;
      }

      if (isConnectingRef.current) {
        console.log('Already connecting, skipping...');
        return;
      }

      isConnectingRef.current = true;

      try {
        const wsUrl = `${import.meta.env.VITE_WS_URL}/ws?token=${guestToken}`;
        console.log('Connecting to WebSocket:', wsUrl);
        
        const socket = new SockJS(wsUrl);
        const client = new Client({
          webSocketFactory: () => socket as any,
          reconnectDelay: 0, // Disable auto-reconnect, we'll handle it manually
          heartbeatIncoming: 10000,
          heartbeatOutgoing: 10000,
          onConnect: () => {
            console.log('WebSocket connected successfully');
            setConnected(true);
            reconnectAttemptsRef.current = 0;
            isConnectingRef.current = false;
            
            // Subscribe to session topics
            client.subscribe(`/topic/session/${roomCode}/question`, (message) => {
              console.log('Received question:', message.body);
              onMessageRef.current({ type: 'QUESTION_START', ...JSON.parse(message.body) });
            });
            
            client.subscribe(`/topic/session/${roomCode}/leaderboard`, (message) => {
              console.log('Received leaderboard:', message.body);
              onMessageRef.current({ type: 'LEADERBOARD', data: JSON.parse(message.body) });
            });
            
            client.subscribe(`/topic/session/${roomCode}/state`, (message) => {
              console.log('Received state update:', message.body);
              onMessageRef.current(JSON.parse(message.body));
            });

            // Subscribe to personal feedback
            if (participantId) {
              client.subscribe(`/topic/session/${roomCode}/participant/${participantId}/feedback`, (message) => {
                console.log('Received personal feedback:', message.body);
                onMessageRef.current({ type: 'PERSONAL_FEEDBACK', ...JSON.parse(message.body) });
              });
            }
          },
          onDisconnect: () => {
            console.log('WebSocket disconnected');
            setConnected(false);
            isConnectingRef.current = false;
          },
          onStompError: (frame) => {
            // Silently handle STOMP errors
            setConnected(false);
            isConnectingRef.current = false;
            
            // Attempt reconnection
            if (reconnectAttemptsRef.current < maxReconnectAttempts) {
              reconnectAttemptsRef.current++;
              reconnectTimeoutRef.current = setTimeout(() => {
                connectWebSocket();
              }, 3000);
            }
          },
          onWebSocketError: (error) => {
            // Silently handle WebSocket errors
            setConnected(false);
            isConnectingRef.current = false;
          },
          onWebSocketClose: () => {
            // Silently handle WebSocket close
            setConnected(false);
            isConnectingRef.current = false;
          },
          debug: () => {},
        });

        client.activate();
        clientRef.current = client;
      } catch (error) {
        // Silently handle WebSocket initialization errors
        setConnected(false);
        isConnectingRef.current = false;
      }
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (clientRef.current?.connected) {
        try {
          clientRef.current.deactivate();
        } catch (err) {
          // Silently handle deactivation errors
        }
      }
      isConnectingRef.current = false;
    };
  }, [roomCode]); // Only depend on roomCode, not onMessage

  const sendAnswer = (questionId: string, optionId: string) => {
    if (clientRef.current?.connected) {
      const participantId = sessionStorage.getItem('participantId');
      const sessionId = sessionStorage.getItem('sessionId');
      console.log('Sending answer:', { sessionId, questionId, optionId, participantId });
      
      clientRef.current.publish({
        destination: `/app/session/${roomCode}/answer`,
        body: JSON.stringify({
          sessionId,
          participantId,
          questionId,
          optionId,
          answeredAtMs: Date.now(),
        }),
      });
    } else {
      console.error('Cannot send answer: WebSocket not connected');
    }
  };

  return { connected, sendAnswer };
};
