import { useEffect } from 'react';
import client from '../api/client';

const PING_INTERVAL = 10 * 60 * 1000; // 10 minutes

export function useKeepAlive() {
  useEffect(() => {
    const ping = () => client.get('/health').catch(() => {});
    ping(); // ping immediately on mount
    const id = setInterval(ping, PING_INTERVAL);
    return () => clearInterval(id);
  }, []);
}
