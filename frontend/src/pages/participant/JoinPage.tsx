import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { sessionApi } from '../../api/sessionApi';
import toast from 'react-hot-toast';
import { Zap, ArrowRight } from 'lucide-react';

const AVATAR_EMOJIS = ['😀', '😎', '🤓', '🥳', '🤩', '😇', '🦄', '🐶', '🐱', '🦊', '🐼', '🐨', '🦁', '🐯', '🐸', '🐙'];

export const JoinPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [roomCode, setRoomCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState(AVATAR_EMOJIS[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('accessToken', token);
      navigate('/join', { replace: true });
    }
  }, []);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roomCode.trim() || !displayName.trim()) {
      toast.error('Please enter room code and display name');
      return;
    }

    setLoading(true);
    try {
      const { data } = await sessionApi.joinSession(roomCode.toUpperCase(), {
        displayName,
        avatarEmoji: selectedEmoji,
      });
      
      sessionStorage.setItem('participantId', data.participantId);
      sessionStorage.setItem('sessionId', data.sessionId);
      sessionStorage.setItem('guestToken', data.guestToken);
      sessionStorage.setItem('roomCode', roomCode.toUpperCase());
      if (data.spectator) sessionStorage.setItem('lateJoiner', 'true');
      else sessionStorage.removeItem('lateJoiner');
      
      toast.success(`Joined ${data.quizTitle}!`);
      
      if (data.status === 'ACTIVE') {
        navigate(`/play/question/${roomCode.toUpperCase()}`);
      } else {
        navigate(`/play/waiting/${roomCode.toUpperCase()}`);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to join session';
      if (errorMessage.includes('Session not found')) {
        toast.error('No session found with this room code');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-accent-600 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-display font-bold text-white">QuizLive</h1>
          </div>
          <p className="text-xl text-white/90">Join the quiz and compete!</p>
        </div>

        {/* Join Form Card */}
        <div className="card p-8 animate-scale-in">
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-6 text-center">
            Enter Quiz Code
          </h2>

          <form onSubmit={handleJoin} className="space-y-6">
            {/* Room Code Input */}
            <div>
              <label htmlFor="roomCode" className="block text-sm font-semibold text-gray-700 mb-2">
                Room Code
              </label>
              <input
                id="roomCode"
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                maxLength={6}
                className="w-full px-6 py-4 text-center text-3xl font-bold border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent uppercase tracking-wider transition-all"
              />
            </div>

            {/* Display Name Input */}
            <div>
              <label htmlFor="displayName" className="block text-sm font-semibold text-gray-700 mb-2">
                Your Name
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
                className="input-field"
              />
            </div>

            {/* Avatar Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Choose Your Avatar
              </label>
              <div className="grid grid-cols-8 gap-2">
                {AVATAR_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setSelectedEmoji(emoji)}
                    className={`text-3xl p-3 rounded-xl transition-all duration-200 ${
                      selectedEmoji === emoji
                        ? 'bg-primary-100 ring-2 ring-primary-500 scale-110 shadow-md'
                        : 'hover:bg-gray-100 hover:scale-105'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Join Button */}
            <button
              type="submit"
              disabled={loading || !roomCode.trim() || !displayName.trim()}
              className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Joining...</span>
                </>
              ) : (
                <>
                  <span>Join Quiz</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-white/80 text-sm mt-6">
          Don't have a code? Ask your host to share it with you
        </p>
      </div>
    </div>
  );
};
