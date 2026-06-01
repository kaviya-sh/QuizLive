import { Outlet } from 'react-router-dom';
import { Sidebar } from '../../components/Sidebar';
import { LayoutDashboard, PlusCircle, Trophy } from 'lucide-react';
import { useState } from 'react';
import { ParticipantSettings } from '../../components/ParticipantSettings';

const PARTICIPANT_NAV = [
  { label: 'Dashboard', path: '/participant/dashboard', icon: LayoutDashboard },
  { label: 'Join Quiz', path: '/participant/join', icon: PlusCircle },
  { label: 'My Results', path: '/participant/results', icon: Trophy },
];

export const ParticipantLayout = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar navItems={PARTICIPANT_NAV} brandLabel="sparklo.in" onSettingsClick={() => setSettingsOpen(true)} />
      <main className="flex-1 lg:ml-60 min-h-screen overflow-y-auto bg-gray-50">
        <Outlet />
      </main>
      <ParticipantSettings isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
};
