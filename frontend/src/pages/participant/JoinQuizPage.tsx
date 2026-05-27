import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionApi } from '../../api/sessionApi';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Users, Clock, Trophy } from 'lucide-react';

const AVATAR_EMOJIS = ['😀','😎','🤓','🥳','🤩','😇','🦄','🐶','🐱','🦊','🐼','🐨','🦁','🐯','🐸','🐙'];

export const JoinQuizPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [roomCode, setRoomCode] = useState('');
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [selectedEmoji, setSelectedEmoji] = useState(AVATAR_EMOJIS[0]);
  const [joining, setJoining] = useState(false);
  const [validatingRoom, setValidatingRoom] = useState(false);
  const [isRoomValid, setIsRoomValid] = useState<boolean | null>(null);

  // Validate room code when it changes
  useEffect(() => {
    const validateRoomCode = async () => {
      if (roomCode.length === 6) {
        setValidatingRoom(true);
        try {
          const response = await fetch(`/api/sessions/${roomCode.toUpperCase()}`);
          if (response.ok) {
            const data = await response.json();
            // Check if session exists and is not finished
            if (data && data.status !== 'FINISHED') {
              setIsRoomValid(true);
            } else {
              setIsRoomValid(false);
            }
          } else {
            setIsRoomValid(false);
          }
        } catch (error) {
          setIsRoomValid(false);
        } finally {
          setValidatingRoom(false);
        }
      } else {
        setIsRoomValid(null);
      }
    };

    const debounceTimer = setTimeout(validateRoomCode, 500);
    return () => clearTimeout(debounceTimer);
  }, [roomCode]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim() || !displayName.trim()) {
      toast.error('Please enter room code and your name');
      return;
    }
    setJoining(true);
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
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to join session');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="p-8" style={{ fontFamily: '"Inter", sans-serif' }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Join a Quiz</h1>
        <p className="text-gray-500 font-medium">Enter the room code to join a live quiz session</p>
      </div>

      <div className="max-w-2xl">
        {/* Join Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl shadow-lg p-8"
          style={{ background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)', border: '2px solid #E5E7EB' }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)' }}>
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900">Enter Quiz Details</h2>
          </div>

          <form onSubmit={handleJoin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Room Code</label>
              <div className="relative">
                <input
                  type="text"
                  value={roomCode}
                  onChange={e => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  maxLength={6}
                  className="w-full px-6 py-4 text-center text-3xl font-bold border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase tracking-widest transition-all"
                  style={{ 
                    borderColor: isRoomValid === false ? '#EF4444' : isRoomValid === true ? '#10B981' : '#E5E7EB', 
                    background: 'white' 
                  }}
                />
                {validatingRoom && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                {!validatingRoom && isRoomValid === true && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
                {!validatingRoom && isRoomValid === false && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
              {isRoomValid === false && (
                <p className="mt-2 text-sm text-red-600 font-semibold">Invalid room code. Please check and try again.</p>
              )}
              {isRoomValid === true && (
                <p className="mt-2 text-sm text-green-600 font-semibold">✓ Valid room code</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Your Name</label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                style={{ borderColor: '#E5E7EB', background: 'white' }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Choose Your Avatar</label>
              <div className="grid grid-cols-8 gap-2">
                {AVATAR_EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setSelectedEmoji(emoji)}
                    className={`text-3xl p-3 rounded-xl transition-all ${
                      selectedEmoji === emoji
                        ? 'bg-teal-100 ring-2 ring-teal-500 scale-110'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={joining || !isRoomValid || !displayName.trim()}
              className="w-full text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover-lift"
              style={{ 
                background: (joining || !isRoomValid || !displayName.trim()) 
                  ? 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)' 
                  : 'linear-gradient(135deg, #14B8A6 0%, #06B6D4 100%)',
                cursor: (joining || !isRoomValid || !displayName.trim()) ? 'not-allowed' : 'pointer',
                opacity: (joining || !isRoomValid || !displayName.trim()) ? 0.6 : 1
              }}
            >
              {joining ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Join Quiz</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-blue-50 border border-blue-200 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">Compete Live</span>
            </div>
            <p className="text-xs text-gray-600">Play against other participants in real-time</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-green-50 border border-green-200 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-green-600" />
              <span className="text-sm font-semibold text-gray-700">Timed Questions</span>
            </div>
            <p className="text-xs text-gray-600">Answer quickly to earn more points</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-purple-50 border border-purple-200 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-semibold text-gray-700">Win Rewards</span>
            </div>
            <p className="text-xs text-gray-600">Top the leaderboard and earn bragging rights</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
