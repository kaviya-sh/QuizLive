import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LucideIcon, LogOut, Settings } from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

interface SidebarProps {
  navItems: NavItem[];
  brandLabel?: string;
  onSettingsClick?: () => void;
}

export const Sidebar = ({ navItems, brandLabel, onSettingsClick }: SidebarProps) => {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <aside
      className="fixed left-0 top-0 h-full w-60 flex flex-col z-20"
      style={{
        background: 'linear-gradient(180deg, #1e3a5f 0%, #1a2f4e 100%)',
        boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
      }}
    >
      {/* Brand */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-white/10">
        <img
          src="/image/image.png"
          alt="Logo"
          className="w-8 h-8 object-contain"
        />
        <span
          className="text-lg font-extrabold"
          style={{
            background: 'linear-gradient(135deg, #FCD34D 0%, #EF4444 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontFamily: '"Raleway", sans-serif',
          }}
        >
          {brandLabel ?? 'sparklo.in'}
        </span>
      </div>

      {/* User info */}
      <div className="px-5 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.displayName?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm truncate">{user?.displayName}</p>
            <p className="text-white/50 text-xs truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        {onSettingsClick && (
          <button
            onClick={onSettingsClick}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white transition-all duration-150"
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            Settings
          </button>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white/70 hover:bg-red-500/20 hover:text-red-300 transition-all duration-150"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          Logout
        </button>
      </div>
    </aside>
  );
};
