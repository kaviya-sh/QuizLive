import { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

interface ConnectionStatusBannerProps {
  connected: boolean;
}

export const ConnectionStatusBanner = ({ connected }: ConnectionStatusBannerProps) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!connected) {
      setShow(true);
    } else {
      const timer = setTimeout(() => setShow(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [connected]);

  if (!show) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 py-3 px-4 text-center text-white transition-all ${
        connected ? 'bg-green-600' : 'bg-red-600'
      }`}
    >
      <div className="flex items-center justify-center gap-2">
        {connected ? (
          <>
            <Wifi className="w-5 h-5" />
            <span>Connected</span>
          </>
        ) : (
          <>
            <WifiOff className="w-5 h-5" />
            <span>Connection lost. Reconnecting...</span>
          </>
        )}
      </div>
    </div>
  );
};
