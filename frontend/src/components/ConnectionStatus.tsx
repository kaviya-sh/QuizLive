import { WifiOff } from 'lucide-react';

interface ConnectionStatusProps {
  connected: boolean;
}

export const ConnectionStatus = ({ connected }: ConnectionStatusProps) => {
  if (connected) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
        <WifiOff className="w-5 h-5" />
        <span className="font-medium">Connection lost. Reconnecting...</span>
      </div>
    </div>
  );
};
