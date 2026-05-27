import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionApi } from '../../api/sessionApi';
import { Session } from '../../types/api';
import { useHostSessionsSocket } from '../../hooks/useHostSessionsSocket';
import { motion } from 'framer-motion';
import { Clock, Users, Calendar, BarChart3, Play, CheckCircle2, Loader2 } from 'lucide-react';

const formatDuration = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
};

const formatDate = (ms: number) =>
  new Date(ms).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

const formatTime = (ms: number) =>
  new Date(ms).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

const statusBadge = (status: string) => {
  if (status === 'FINISHED')
    return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Finished</span>;
  if (status === 'ACTIVE')
    return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 animate-pulse">Live</span>;
  return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">Waiting</span>;
};

export const SessionHistoryPage = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = useCallback(() => {
    sessionApi.getSessionHistory()
      .then(({ data }) => setSessions(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Fetch on mount and poll every 10 s so finished sessions appear automatically
  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 10_000);
    return () => clearInterval(interval);
  }, [fetchSessions]);

  // Also refresh immediately when a session finishes via WebSocket
  useHostSessionsSocket(fetchSessions);

  const finished = sessions.filter(s => s.status === 'FINISHED');
  const active   = sessions.filter(s => s.status === 'ACTIVE');

  const totalParticipants = sessions.reduce((sum, s) => sum + (s.participantCount ?? 0), 0);
  const avgDuration = finished.length
    ? Math.round(finished.reduce((sum, s) => sum + (s.durationSeconds ?? 0), 0) / finished.length)
    : 0;

  return (
    <div className="p-8" style={{ fontFamily: '"Inter", sans-serif' }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Session History</h1>
        <p className="text-gray-500 font-medium">All quiz sessions you have conducted</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-8">
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center">
              <Play className="w-4 h-4 text-rose-600" />
            </div>
            <span className="text-xs font-semibold text-gray-600">Total Sessions</span>
          </div>
          <div className="text-2xl font-extrabold text-gray-900">{sessions.length}</div>
        </div>
        
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
            </div>
            <span className="text-xs font-semibold text-gray-600">Finished</span>
          </div>
          <div className="text-2xl font-extrabold text-gray-900">{finished.length}</div>
        </div>
        
        <div className="bg-violet-50 border border-violet-200 rounded-2xl p-5 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-violet-600" />
            </div>
            <span className="text-xs font-semibold text-gray-600">Total Players</span>
          </div>
          <div className="text-2xl font-extrabold text-gray-900">{totalParticipants}</div>
        </div>
        
        <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-5 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-cyan-600" />
            </div>
            <span className="text-xs font-semibold text-gray-600">Avg Duration</span>
          </div>
          <div className="text-2xl font-extrabold text-gray-900">{avgDuration ? formatDuration(avgDuration) : '—'}</div>
        </div>
      </div>

      {/* Active sessions banner */}
      {active.length > 0 && (
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-lg" />
            <span className="font-bold text-blue-900 text-lg">
              {active.length} session{active.length > 1 ? 's' : ''} currently live
            </span>
          </div>
          <button
            onClick={() => navigate(`/host/session/${active[0].roomCode}`)}
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg"
          >
            Go to panel →
          </button>
        </div>
      )}

      {/* Session list */}
      {loading ? (
        <div className="flex items-center gap-3 text-gray-400 py-16 justify-center">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading sessions...</span>
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-14 text-center">
          <Play className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-semibold text-lg">No sessions yet</p>
          <p className="text-gray-400 text-sm mt-1">Start a quiz from the Dashboard to see sessions here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session, i) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`${
                session.status === 'ACTIVE'
                  ? 'bg-gradient-to-br from-blue-50 to-indigo-50'
                  : session.status === 'WAITING'
                  ? 'bg-gradient-to-br from-pink-50 to-rose-50'
                  : 'bg-gradient-to-br from-emerald-50 to-green-50'
              } rounded-2xl p-6 shadow-md hover:shadow-xl transition-all flex items-center gap-5`}
            >
              {/* Date block */}
              <div className="flex-shrink-0 w-16 text-center bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-3 border border-indigo-200">
                {session.startTime ? (
                  <>
                    <div className="text-2xl font-extrabold text-indigo-700 leading-none">
                      {new Date(session.startTime).getDate()}
                    </div>
                    <div className="text-xs font-bold text-indigo-500 uppercase">
                      {new Date(session.startTime).toLocaleString('en-US', { month: 'short' })}
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-gray-400 font-semibold">—</div>
                )}
              </div>

              {/* Divider */}
              <div className="w-px h-14 bg-gradient-to-b from-transparent via-gray-300 to-transparent flex-shrink-0" />

              {/* Main info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-extrabold text-gray-900 truncate text-lg">{session.quiz?.title ?? 'Untitled Quiz'}</span>
                  {statusBadge(session.status)}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 font-semibold flex-wrap">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {session.startTime ? `${formatDate(session.startTime)} at ${formatTime(session.startTime)}` : 'Not started'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {session.durationSeconds ? formatDuration(session.durationSeconds) : '—'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {session.participantCount ?? 0} players
                  </span>
                  <span className="font-mono text-indigo-600 font-bold bg-indigo-50 px-2 py-1 rounded">{session.roomCode}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {session.status === 'ACTIVE' && (
                  <button
                    onClick={() => navigate(`/host/session/${session.roomCode}`)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-md hover:shadow-lg"
                  >
                    Go Live
                  </button>
                )}
                {session.status === 'FINISHED' && (
                  <button
                    onClick={() => navigate(`/analytics/${session.id}`)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 text-indigo-700 text-sm font-bold rounded-xl transition-all border-2 border-indigo-300 shadow-sm hover:shadow-md"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    Analytics
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
