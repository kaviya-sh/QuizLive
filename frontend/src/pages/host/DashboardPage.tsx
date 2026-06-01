import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { quizApi } from '../../api/quizApi';
import { sessionApi } from '../../api/sessionApi';
import { useAuthStore } from '../../store/authStore';
import { useHostSessionsSocket } from '../../hooks/useHostSessionsSocket';
import { Quiz, Session } from '../../types/api';
import { Plus, Play, Edit, Trash2, BarChart3, Clock, Users } from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { user } = useAuthStore();
  const { success, error } = useNotificationStore();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeSessions, setActiveSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('accessToken', token);
      navigate('/dashboard', { replace: true });
    }
    loadQuizzes();
    loadActiveSessions();
  }, [searchParams, location.state]); // Reload when location state changes

  // Tick every second for the live session elapsed timer
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const loadQuizzes = useCallback(async () => {
    try {
      const { data } = await quizApi.getQuizzes();
      setQuizzes(data.content);
    } catch (err) {
      // Only show error notification if it's a critical failure
      console.error('Failed to load quizzes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadActiveSessions = useCallback(async () => {
    try {
      const { data } = await sessionApi.getActiveSessions();
      setActiveSessions(data);
    } catch {
      // Silently handle error - active sessions are not critical for dashboard
    }
  }, []);

  // Poll every 10 s
  useEffect(() => {
    const interval = setInterval(loadActiveSessions, 10_000);
    return () => clearInterval(interval);
  }, [loadActiveSessions]);

  // Refresh both quizzes and sessions when a session finishes
  const handleSessionUpdate = useCallback(() => {
    loadActiveSessions();
    loadQuizzes();
  }, [loadActiveSessions, loadQuizzes]);

  useHostSessionsSocket(handleSessionUpdate);

  const handleDeleteQuiz = async (id: string) => {
    if (!confirm('Delete this quiz? This action cannot be undone.')) return;
    try {
      await quizApi.deleteQuiz(id);
      success('Quiz deleted successfully');
      loadQuizzes();
    } catch {
      error('Failed to delete quiz');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>

      {/* Welcome */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">Welcome back, {user?.displayName}!</h2>
          <p className="text-sm sm:text-base text-gray-600 font-normal">Manage your quizzes and track your sessions</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-6 sm:pb-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 rounded-2xl shadow-xl p-6 border border-blue-200">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-3xl font-extrabold text-gray-900 mb-1">{quizzes.length}</div>
            <div className="text-sm font-semibold text-gray-600">Total Quizzes</div>
          </div>

          <div className="bg-emerald-50 rounded-2xl shadow-xl p-6 border border-emerald-200">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="text-3xl font-extrabold text-gray-900 mb-1">{activeSessions.length}</div>
            <div className="text-sm font-semibold text-gray-600">Active Sessions</div>
            {activeSessions.length > 0 && activeSessions[0].startTime && (
              <div className="mt-2 text-xs font-mono font-bold text-emerald-600">
                {(() => {
                  const elapsed = Math.floor((currentTime - activeSessions[0].startTime!) / 1000);
                  return `${Math.floor(elapsed / 60)}m ${elapsed % 60}s`;
                })()}
              </div>
            )}
          </div>

          <div className="bg-amber-50 rounded-2xl shadow-xl p-6 border border-amber-200">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div className="text-3xl font-extrabold text-gray-900 mb-1">
              {quizzes.filter(q => q.status === 'PUBLISHED').length}
            </div>
            <div className="text-sm font-semibold text-gray-600">Published</div>
          </div>
        </div>

        {/* My Quizzes header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">My Quizzes</h2>
            <p className="text-sm sm:text-base text-gray-600 font-normal">Create and manage your interactive quizzes</p>
          </div>
          <button
            onClick={() => navigate('/quiz/create')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <Plus className="w-5 h-5" />
            <span>Create Quiz</span>
          </button>
        </div>

        {/* Quizzes grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : quizzes.length === 0 ? (
          <div className="bg-orange-50 rounded-2xl shadow-xl p-12 text-center border border-indigo-300">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-10 h-10 text-orange-600" />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 mb-2">No quizzes yet</h3>
            <p className="text-gray-600 font-normal mb-6 max-w-md mx-auto">
              Get started by creating your first interactive quiz. It only takes a few minutes!
            </p>
            <button
              onClick={() => navigate('/quiz/create')}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span>Create Your First Quiz</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <div 
                key={quiz.id} 
                className="relative rounded-lg shadow-sm p-6 hover:shadow-lg transition-shadow duration-200 ease-in-out cursor-pointer overflow-hidden group"
                style={{ 
                  background: 'linear-gradient(123deg, rgba(209, 70, 0, 0.1) 0%, rgba(195, 0, 224, 0.1) 50%, rgba(104, 66, 255, 0.1) 100%)',
                  border: '2px solid transparent',
                  backgroundClip: 'padding-box'
                }}
              >
                <div 
                  className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ 
                    background: 'linear-gradient(123deg, #d14600 0%, #c300e0 50%, #6842ff 100%)',
                    margin: '-2px',
                    zIndex: -1
                  }}
                ></div>
                
                <div className="relative z-10">
                  <div className="mb-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="text-2xl font-bold text-gray-900 leading-tight flex-1">
                        {quiz.title}
                      </h3>
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${
                        quiz.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {quiz.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 font-medium leading-relaxed line-clamp-2">{quiz.description}</p>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-700 font-semibold mb-5 pb-5 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-gray-600" />
                      <span>{quiz.questions?.length || 0} questions</span>
                    </div>
                    {quiz.category && (
                      <span className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-bold text-gray-700">
                        {quiz.category}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/host/session/create?quizId=${quiz.id}`);
                      }}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 rounded-lg transition-all duration-200 text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                    >
                      <Play className="w-4 h-4" />
                      <span>Start</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/quiz/edit/${quiz.id}`);
                      }}
                      className="p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                      title="Edit quiz"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteQuiz(quiz.id);
                      }}
                      className="p-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                      title="Delete quiz"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
