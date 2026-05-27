import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionApi } from '../../api/sessionApi';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';
import { Trophy, Crown, Medal, Award, Target, PlusCircle, Users, Clock } from 'lucide-react';

interface HistoryEntry {
  sessionId: string;
  roomCode: string;
  quizTitle: string;
  score: number;
  rank: number;
  totalParticipants: number;
  joinedLate: boolean;
  playedAt: string;
}

export const ParticipantDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    sessionApi.getMyHistory()
      .then(({ data }) => setHistory(data))
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-orange-400" />;
    return <span className="text-sm font-bold text-gray-500">#{rank}</span>;
  };

  return (
    <div className="p-8" style={{ fontFamily: '"Inter", sans-serif' }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">
          Welcome back, {user?.displayName}! 👋
        </h1>
        <p className="text-gray-500 font-medium">Ready to play? Join a quiz or check your past results.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Trophy className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-semibold text-gray-600">Quizzes Played</span>
          </div>
          <div className="text-3xl font-extrabold text-gray-900">{history.length}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm font-semibold text-gray-600">Best Score</span>
          </div>
          <div className="text-3xl font-extrabold text-gray-900">
            {history.length > 0 ? Math.max(...history.map(h => h.score)) : '—'}
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Crown className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm font-semibold text-gray-600">Best Rank</span>
          </div>
          <div className="text-3xl font-extrabold text-gray-900">
            {history.length > 0 ? `#${Math.min(...history.map(h => h.rank))}` : '—'}
          </div>
        </div>
      </div>

      {/* Join Quiz CTA */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/participant/join')}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <PlusCircle className="w-5 h-5" />
          Join a Quiz
        </button>
      </div>

      {/* Past Quiz History */}
      <div>
        <h2 className="text-xl font-extrabold text-gray-900 mb-4">Recent Quizzes</h2>

        {loadingHistory ? (
          <div className="flex items-center gap-3 text-gray-500 py-8">
            <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <span>Loading history...</span>
          </div>
        ) : history.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-10 text-center">
            <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No quizzes played yet.</p>
            <p className="text-gray-400 text-sm mt-1">Join a quiz to see your results here!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.slice(0, 5).map((entry, i) => (
              <motion.div
                key={entry.sessionId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    {getRankIcon(entry.rank)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-gray-900 truncate">{entry.quizTitle}</p>
                      {entry.joinedLate && (
                        <span className="text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-300 px-2 py-0.5 rounded-full">
                          joined late
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 font-medium flex-wrap">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {entry.totalParticipants} players
                      </span>
                      {entry.playedAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(entry.playedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-2xl font-extrabold text-blue-600">{entry.score}</div>
                  <div className="text-xs text-gray-500 font-medium">pts</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
