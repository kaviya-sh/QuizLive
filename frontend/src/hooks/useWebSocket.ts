import { useEffect, useRef, useState } from 'react'
import { Client, IMessage } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws'

interface UseWebSocketOptions {
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Error) => void
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const [isConnected, setIsConnected] = useState(false)
  const clientRef = useRef<Client | null>(null)
  const subscriptionsRef = useRef<Map<string, any>>(new Map())

  useEffect(() => {
    const token = localStorage.getItem('accessToken')

    try {
      const client = new Client({
        webSocketFactory: () => new SockJS(`${WS_URL}?token=${token}`),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,

        onConnect: () => {
          setIsConnected(true)
          options.onConnect?.()
        },

        onDisconnect: () => {
          setIsConnected(false)
          options.onDisconnect?.()
        },

        onStompError: (frame) => {
          // Silently handle STOMP errors
          const error = new Error(frame.headers['message'] || 'STOMP error')
          options.onError?.(error)
        },
      })

      client.activate()
      clientRef.current = client

      return () => {
        subscriptionsRef.current.forEach((sub) => sub.unsubscribe())
        subscriptionsRef.current.clear()
        try {
          client.deactivate()
        } catch (err) {
          // Silently handle deactivation errors
        }
      }
    } catch (err) {
      // Silently handle WebSocket initialization errors
    }
  }, [])

  const subscribe = (destination: string, callback: (message: IMessage) => void) => {
    if (!clientRef.current || !isConnected) {
      return
    }

    const subscription = clientRef.current.subscribe(destination, callback)
    subscriptionsRef.current.set(destination, subscription)

    return () => {
      subscription.unsubscribe()
      subscriptionsRef.current.delete(destination)
    }
  }

  const unsubscribe = (destination: string) => {
    const subscription = subscriptionsRef.current.get(destination)
    if (subscription) {
      subscription.unsubscribe()
      subscriptionsRef.current.delete(destination)
    }
  }

  const publish = (destination: string, body: any) => {
    if (!clientRef.current || !isConnected) {
      return
    }

    clientRef.current.publish({
      destination,
      body: JSON.stringify(body),
    })
  }

  return {
    isConnected,
    subscribe,
    unsubscribe,
    publish,
  }
}
