import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionApi } from '../../api/sessionApi';
import { motion } from 'framer-motion';
import { Trophy, Crown, Medal, Award, Users, Clock, Target, TrendingUp, Loader2, BarChart3 } from 'lucide-react';

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

export const MyResultsPage = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sessionApi.getMyHistory()
      .then(({ data }) => setHistory(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-orange-400" />;
    return <span className="text-lg font-bold text-gray-500">#{rank}</span>;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-50 border-yellow-300 text-yellow-700';
    if (rank === 2) return 'bg-gray-50 border-gray-300 text-gray-700';
    if (rank === 3) return 'bg-orange-50 border-orange-300 text-orange-700';
    return 'bg-blue-50 border-blue-300 text-blue-700';
  };

  const totalQuizzes = history.length;
  const bestScore = history.length > 0 ? Math.max(...history.map(h => h.score)) : 0;
  const bestRank = history.length > 0 ? Math.min(...history.map(h => h.rank)) : 0;
  const avgScore = history.length > 0 
    ? Math.round(history.reduce((sum, h) => sum + h.score, 0) / history.length)
    : 0;
  const topThreeFinishes = history.filter(h => h.rank <= 3).length;

  return (
    <div className="p-8" style={{ fontFamily: '"Inter", sans-serif' }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">My Results</h1>
        <p className="text-gray-500 font-medium">View your quiz history and performance analytics</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-gray-400 py-16 justify-center">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading your results...</span>
        </div>
      ) : history.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-14 text-center">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Quiz History Yet</h3>
          <p className="text-gray-500 font-medium mb-6">
            Join a quiz to see your results and performance here!
          </p>
          <button
            onClick={() => navigate('/participant/join')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md"
          >
            Join Your First Quiz
          </button>
        </div>
      ) : (
        <>
          {/* Performance Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
              className="bg-blue-50 border border-blue-200 rounded-2xl p-5 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm font-semibold text-gray-600">Total Quizzes</span>
              </div>
              <div className="text-3xl font-extrabold text-gray-900">{totalQuizzes}</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-green-50 border border-green-200 rounded-2xl p-5 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm font-semibold text-gray-600">Best Score</span>
              </div>
              <div className="text-3xl font-extrabold text-gray-900">{bestScore}</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-purple-50 border border-purple-200 rounded-2xl p-5 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Crown className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm font-semibold text-gray-600">Best Rank</span>
              </div>
              <div className="text-3xl font-extrabold text-gray-900">#{bestRank}</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-cyan-50 border border-cyan-200 rounded-2xl p-5 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-cyan-600" />
                </div>
                <span className="text-sm font-semibold text-gray-600">Avg Score</span>
              </div>
              <div className="text-3xl font-extrabold text-gray-900">{avgScore}</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Award className="w-5 h-5 text-yellow-600" />
                </div>
                <span className="text-sm font-semibold text-gray-600">Top 3 Finishes</span>
              </div>
              <div className="text-3xl font-extrabold text-gray-900">{topThreeFinishes}</div>
            </motion.div>
          </div>

          {/* Quiz History */}
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-5">Quiz History</h2>
            <div className="space-y-3">
              {history.map((entry, i) => (
                <motion.button
                  key={entry.sessionId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate(`/participant/results/${entry.sessionId}`)}
                  className="w-full bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex items-center gap-5 text-left group"
                >
                  {/* Rank Icon */}
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 border-2 ${getRankBadgeColor(entry.rank)}`}>
                    {getRankIcon(entry.rank)}
                  </div>

                  {/* Quiz Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h3 className="font-bold text-gray-900 text-lg truncate">{entry.quizTitle}</h3>
                      {entry.joinedLate && (
                        <span className="text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-300 px-2 py-0.5 rounded-full">
                          joined late
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 font-medium flex-wrap">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {entry.totalParticipants} players
                      </span>
                      {entry.playedAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(entry.playedAt).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      )}
                      <span className="font-mono text-gray-400">{entry.roomCode}</span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-3xl font-extrabold text-blue-600">{entry.score}</div>
                    <div className="text-sm text-gray-500 font-medium">points</div>
                  </div>

                  {/* View Details Arrow */}
                  <div className="flex-shrink-0">
                    <BarChart3 className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
