import { motion } from 'framer-motion';
import { Trophy, Medal, Award, TrendingUp, TrendingDown } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  displayName: string;
  score: number;
  rank: number;
  previousRank?: number;
  avatarEmoji?: string;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

export const Leaderboard = ({ entries, currentUserId }: LeaderboardProps) => {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-orange-400" />;
    return <div className="w-6 h-6 flex items-center justify-center font-bold text-gray-600">{rank}</div>;
  };

  const getRankChange = (entry: LeaderboardEntry) => {
    if (!entry.previousRank) return null;
    const change = entry.previousRank - entry.rank;
    if (change > 0) {
      return (
        <div className="flex items-center text-green-600 text-sm">
          <TrendingUp className="w-4 h-4" />
          <span className="ml-1">+{change}</span>
        </div>
      );
    } else if (change < 0) {
      return (
        <div className="flex items-center text-red-600 text-sm">
          <TrendingDown className="w-4 h-4" />
          <span className="ml-1">{change}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-2">
      {entries.map((entry, index) => (
        <motion.div
          key={entry.id}
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: index * 0.05, type: 'spring' }}
          className={`flex items-center justify-between p-4 rounded-xl transition ${
            entry.id === currentUserId
              ? 'bg-primary bg-opacity-10 ring-2 ring-primary'
              : entry.rank <= 3
              ? 'bg-yellow-50'
              : 'bg-white'
          } shadow-sm`}
        >
          <div className="flex items-center gap-4">
            {getRankIcon(entry.rank)}
            <div className="flex items-center gap-3">
              {entry.avatarEmoji && (
                <div className="text-2xl">{entry.avatarEmoji}</div>
              )}
              <div>
                <div className="font-semibold text-gray-900">{entry.displayName}</div>
                {entry.id === currentUserId && (
                  <div className="text-xs text-primary font-medium">You</div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {getRankChange(entry)}
            <div className="text-2xl font-bold text-primary">{entry.score}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
