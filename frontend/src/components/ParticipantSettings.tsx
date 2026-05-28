import { useState } from 'react';
import { X, Volume2, VolumeX, Zap, ZapOff, Palette, User, Mail } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { userApi } from '../api/userApi';
import toast from 'react-hot-toast';

interface ParticipantSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ParticipantSettings = ({ isOpen, onClose }: ParticipantSettingsProps) => {
  const { user } = useAuthStore();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [animations, setAnimations] = useState(true);
  const [theme, setTheme] = useState<'default' | 'dark' | 'colorful'>('default');
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async () => {
    if (!displayName.trim()) {
      toast.error('Display name is required');
      return;
    }
    
    setSaving(true);
    try {
      await userApi.updateProfile({ displayName: displayName.trim(), email: email.trim() });
      // Update local auth store
      if (user) {
        useAuthStore.setState({
          user: { ...user, displayName: displayName.trim(), email: email.trim() }
        });
      }
      toast.success('Profile saved successfully!', {
        duration: 3000,
        style: {
          background: '#10B981',
          color: '#fff',
        },
      });
      setTimeout(() => onClose(), 500);
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Profile Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Profile
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>

          <div className="border-t border-gray-200"></div>

          {/* Preferences Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Preferences</h3>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                {soundEnabled ? <Volume2 className="w-5 h-5 text-blue-600" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
                <div>
                  <div className="font-semibold text-gray-900">Sound Effects</div>
                  <div className="text-sm text-gray-500">Play feedback sounds</div>
                </div>
              </div>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`w-12 h-6 rounded-full transition ${soundEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition transform ${soundEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                {animations ? <Zap className="w-5 h-5 text-blue-600" /> : <ZapOff className="w-5 h-5 text-gray-400" />}
                <div>
                  <div className="font-semibold text-gray-900">Animations</div>
                  <div className="text-sm text-gray-500">Enable visual effects</div>
                </div>
              </div>
              <button
                onClick={() => setAnimations(!animations)}
                className={`w-12 h-6 rounded-full transition ${animations ? 'bg-blue-500' : 'bg-gray-300'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition transform ${animations ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <Palette className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-semibold text-gray-900">Theme</div>
                  <div className="text-sm text-gray-500">Choose your style</div>
                </div>
              </div>
              <div className="flex gap-2">
                {(['default', 'dark', 'colorful'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition ${
                      theme === t ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
