import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionApi } from '../../api/sessionApi';
import { analyticsApi } from '../../api/analyticsApi';
import { Session } from '../../types/api';
import { useHostSessionsSocket } from '../../hooks/useHostSessionsSocket';
import { motion } from 'framer-motion';
import { BarChart3, Users, Clock, ChevronRight, Loader2, TrendingUp, Award, Target, Calendar } from 'lucide-react';

const formatDuration = (s: number) => {
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return sec > 0 ? `${m}m ${sec}s` : `${m}m`;
};

const formatDate = (ms: number) =>
  new Date(ms).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

const formatTime = (ms: number) =>
  new Date(ms).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

interface SessionWithStats extends Session {
  avgScore?: number;
  completionRate?: number;
  loadingStats?: boolean;
}

export const AnalyticsListPage = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<SessionWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchedStatsRef = useRef<Set<string>>(new Set());

  const fetchSessions = useCallback(() => {
    sessionApi.getSessionHistory()
      .then(({ data }) => {
        const finished = data.filter(s => s.status === 'FINISHED');
        setSessions(prev => {
          const existingMap = new Map(prev.map(s => [s.id, s]));
          return finished.map(s => existingMap.get(s.id) ?? { ...s, loadingStats: true });
        });
        finished.forEach(s => {
          if (fetchedStatsRef.current.has(s.id)) return;
          fetchedStatsRef.current.add(s.id);
          analyticsApi.getSummary(s.id)
            .then(({ data: summary }) => {
              setSessions(prev => prev.map(p =>
                p.id === s.id
                  ? { ...p, avgScore: summary.averageScore, completionRate: summary.completionRate, loadingStats: false }
                  : p
              ));
            })
            .catch(() => {
              setSessions(prev => prev.map(p =>
                p.id === s.id ? { ...p, loadingStats: false } : p
              ));
            });
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 10_000);
    return () => clearInterval(interval);
  }, [fetchSessions]);

  useHostSessionsSocket(fetchSessions);

  // Calculate overall stats
  const totalSessions = sessions.length;
  const totalParticipants = sessions.reduce((sum, s) => sum + (s.participantCount ?? 0), 0);
  const avgScore = sessions.length > 0
    ? Math.round(sessions.reduce((sum, s) => sum + (s.avgScore ?? 0), 0) / sessions.length)
    : 0;
  const avgCompletion = sessions.length > 0
    ? Math.round(sessions.reduce((sum, s) => sum + (s.completionRate ?? 0), 0) / sessions.length)
    : 0;

  return (
    <div className="p-8" style={{ fontFamily: '"Inter", sans-serif' }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Analytics Dashboard</h1>
        <p className="text-gray-500 font-medium">Complete scorecard and quiz history with detailed insights</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-gray-400 py-16 justify-center">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading analytics...</span>
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-14 text-center">
          <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-semibold text-lg">No completed sessions yet</p>
          <p className="text-gray-400 text-sm mt-1">Finish a quiz session to see analytics here.</p>
        </div>
      ) : (
        <>
          {/* Overall Stats Scorecard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
              className="bg-violet-50 rounded-2xl shadow-xl p-6 border border-violet-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-violet-600" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-extrabold text-gray-900">{totalSessions}</div>
                </div>
              </div>
              <div className="text-sm font-bold text-gray-600">Total Sessions</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-sky-50 rounded-2xl shadow-xl p-6 border border-sky-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-sky-600" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-extrabold text-gray-900">{totalParticipants}</div>
                </div>
              </div>
              <div className="text-sm font-bold text-gray-600">Total Participants</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-lime-50 rounded-2xl shadow-xl p-6 border border-lime-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-lime-100 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-lime-600" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-extrabold text-gray-900">{avgScore}</div>
                </div>
              </div>
              <div className="text-sm font-bold text-gray-600">Avg Score</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-pink-50 rounded-2xl shadow-xl p-6 border border-pink-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-pink-600" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-extrabold text-gray-900">{avgCompletion}%</div>
                </div>
              </div>
              <div className="text-sm font-bold text-gray-600">Avg Completion</div>
            </motion.div>
          </div>

          {/* Quiz History Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Quiz History</h2>
            <p className="text-gray-500 font-medium">Click any session to view detailed performance insights</p>
          </div>

          {/* Session List */}
          <div className="space-y-3">
            {sessions.map((session, i) => (
              <motion.button
                key={session.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => navigate(`/analytics/${session.id}`)}
                className="w-full bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all text-left flex items-center gap-5 group"
              >
                {/* Date block */}
                <div className="flex-shrink-0 w-16 text-center">
                  {session.startTime ? (
                    <>
                      <div className="text-2xl font-extrabold text-gray-900 leading-none">
                        {new Date(session.startTime).getDate()}
                      </div>
                      <div className="text-xs font-semibold text-gray-400 uppercase mt-1">
                        {new Date(session.startTime).toLocaleString('en-US', { month: 'short' })}
                      </div>
                    </>
                  ) : (
                    <div className="text-xs text-gray-400">—</div>
                  )}
                </div>

                {/* Icon */}
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
                  <BarChart3 className="w-6 h-6 text-indigo-600" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate mb-1">{session.quiz?.title ?? 'Untitled Quiz'}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 font-medium flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {session.startTime ? `${formatDate(session.startTime)} at ${formatTime(session.startTime)}` : '—'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {session.durationSeconds ? formatDuration(session.durationSeconds) : '—'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {session.participantCount ?? 0} players
                    </span>
                    <span className="font-mono text-gray-400">{session.roomCode}</span>
                  </div>
                </div>

                {/* Stats pills */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  {session.loadingStats ? (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-300" />
                  ) : (
                    <>
                      {session.avgScore !== undefined && (
                        <div className="text-center">
                          <div className="text-lg font-extrabold text-indigo-600">{Math.round(session.avgScore)}</div>
                          <div className="text-xs text-gray-400 font-medium">avg score</div>
                        </div>
                      )}
                      {session.completionRate !== undefined && (
                        <div className="text-center">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                            <span className="text-lg font-extrabold text-green-600">
                              {Math.round(session.completionRate)}%
                            </span>
                          </div>
                          <div className="text-xs text-gray-400 font-medium">completion</div>
                        </div>
                      )}
                    </>
                  )}
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-400 transition-colors" />
                </div>
              </motion.button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
