import { Outlet } from 'react-router-dom';
import { Sidebar } from '../../components/Sidebar';
import { LayoutDashboard, BarChart3, PlusCircle, History } from 'lucide-react';
import { useState } from 'react';
import { HostSettings } from '../../components/HostSettings';

const HOST_NAV = [
  { label: 'Dashboard',       path: '/dashboard',          icon: LayoutDashboard },
  { label: 'Create Quiz',     path: '/quiz/create',        icon: PlusCircle },
  { label: 'Live Sessions',   path: '/host/sessions',      icon: History },
  { label: 'Analytics',       path: '/analytics',          icon: BarChart3 },
];

export const HostLayout = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar navItems={HOST_NAV} onSettingsClick={() => setSettingsOpen(true)} />
      <main className="flex-1 ml-60 min-h-screen overflow-y-auto bg-gray-50">
        <Outlet />
      </main>
      <HostSettings isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
};
