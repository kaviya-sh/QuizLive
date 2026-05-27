import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useParticipantSocket } from '../../hooks/useParticipantSocket';
import { sessionApi } from '../../api/sessionApi';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Crown } from 'lucide-react';
import { ConnectionStatus } from '../../components/ConnectionStatus';

interface LeaderboardEntry {
  displayName: string;
  score: number;
  rank: number;
  avatarEmoji?: string;
  joinedLate?: boolean;
}

export const LeaderboardPage = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch leaderboard on mount — handles the case where the WS message
  // was already received before this page mounted
  useEffect(() => {
    sessionApi.getLeaderboard(roomCode!)
      .then(({ data }) => {
        if (data.length > 0) setLeaderboard(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [roomCode]);

  const handleMessage = (msg: any) => {
    if (msg.type === 'LEADERBOARD') {
      setLeaderboard(msg.data);
    }
    if (msg.type === 'QUESTION_START') {
      navigate(`/play/question/${roomCode}`);
    }
    if (msg.type === 'SESSION_ENDED' || msg.type === 'QUIZ_ENDED' || msg.status === 'FINISHED') {
      navigate(`/results/${roomCode}`, { replace: true });
    }
  };

  const { connected } = useParticipantSocket(roomCode!, handleMessage);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-8 h-8 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-8 h-8 text-gray-400" />;
    if (rank === 3) return <Award className="w-8 h-8 text-orange-400" />;
    return <div className="w-8 h-8 flex items-center justify-center font-bold text-2xl text-gray-400">{rank}</div>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500';
    if (rank === 3) return 'bg-gradient-to-r from-orange-400 to-orange-600';
    return 'bg-white';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-accent-600 p-4">
      <ConnectionStatus connected={connected} />
      
      <div className="max-w-3xl mx-auto py-8">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-display font-bold text-white mb-2">Leaderboard</h1>
          <p className="text-xl text-white/90">Current standings</p>
        </motion.div>

        <div className="space-y-3">
          {loading ? (
            <div className="text-center text-white/80 py-12">
              <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-3" />
              <p>Loading standings...</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center text-white/70 py-12">No scores yet</div>
          ) : (
            leaderboard.map((entry, index) => (
              <motion.div
                key={entry.displayName}
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-2xl p-6 flex items-center justify-between shadow-lg transition-all ${
                  entry.rank <= 3
                    ? `${getRankBg(entry.rank)} text-white`
                    : 'bg-white text-gray-900'
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex-shrink-0">
                    {getRankIcon(entry.rank)}
                  </div>
                  <div className="flex items-center gap-3 flex-1">
                    {entry.avatarEmoji && (
                      <div className="text-3xl">{entry.avatarEmoji}</div>
                    )}
                    <div className="flex-1">
                      <div className={`text-xl font-bold ${
                        entry.rank <= 3 ? 'text-white' : 'text-gray-900'
                      }`}>
                        {entry.displayName}
                        {entry.joinedLate && (
                          <span className="ml-2 text-xs font-semibold bg-yellow-400/30 text-yellow-200 border border-yellow-400/50 px-2 py-0.5 rounded-full align-middle">
                            joined late
                          </span>
                        )}
                      </div>
                      <div className={`text-sm ${
                        entry.rank <= 3 ? 'text-white/80' : 'text-gray-600'
                      }`}>
                        Rank #{entry.rank}
                      </div>
                    </div>
                  </div>
                </div>
                <div className={`text-4xl font-bold ${
                  entry.rank <= 3 ? 'text-white' : 'text-primary-600'
                }`}>
                  {entry.score}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Next Question Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-center text-white"
        >
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Next question coming up...</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
