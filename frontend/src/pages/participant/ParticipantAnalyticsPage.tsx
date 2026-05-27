import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { analyticsApi, AnalyticsSummary } from '../../api/analyticsApi';
import toast from 'react-hot-toast';
import { ArrowLeft, Users, Target, Clock, TrendingDown, Award, Zap } from 'lucide-react';

export const ParticipantAnalyticsPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [sessionId]);

  const loadData = async () => {
    try {
      const summaryRes = await analyticsApi.getSummary(sessionId!);
      setSummary(summaryRes.data);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8" style={{ fontFamily: '"Inter", sans-serif' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate('/participant/results')}
          className="p-2 hover:bg-gray-200 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Quiz Analytics</h1>
          <p className="text-gray-500 font-medium">Detailed performance breakdown</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-semibold text-gray-600">Participants</span>
          </div>
          <div className="text-3xl font-extrabold text-gray-900">{summary?.totalParticipants}</div>
        </div>

        <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-cyan-600" />
            </div>
            <span className="text-sm font-semibold text-gray-600">Avg Score</span>
          </div>
          <div className="text-3xl font-extrabold text-gray-900">
            {summary?.averageScore.toFixed(0)}
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Award className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm font-semibold text-gray-600">Completion</span>
          </div>
          <div className="text-3xl font-extrabold text-gray-900">
            {summary?.completionRate.toFixed(1)}%
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-sm font-semibold text-gray-600">Duration</span>
          </div>
          <div className="text-3xl font-extrabold text-gray-900">
            {Math.floor((summary?.durationSeconds || 0) / 60)}m
          </div>
        </div>
      </div>

      {/* Question Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {summary?.hardestQuestion && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-xl font-extrabold text-gray-900">Most Challenging</h2>
            </div>
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <p className="text-gray-900 font-semibold mb-2">{summary.hardestQuestion.text}</p>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-extrabold text-red-600">
                  {summary.hardestQuestion.accuracy.toFixed(1)}%
                </div>
                <div className="text-sm text-red-600 font-semibold">accuracy</div>
              </div>
            </div>
          </div>
        )}

        {summary?.fastestQuestion && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-xl font-extrabold text-gray-900">Fastest Response</h2>
            </div>
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
              <p className="text-gray-900 font-semibold mb-2">{summary.fastestQuestion.text}</p>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-extrabold text-green-600">
                  {(summary.fastestQuestion.avgResponseTimeMs / 1000).toFixed(1)}s
                </div>
                <div className="text-sm text-green-600 font-semibold">avg time</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Engagement Insights */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <h2 className="text-xl font-extrabold text-gray-900 mb-6">Engagement Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <div className="text-3xl font-extrabold text-blue-600 mb-2">
              {summary?.totalParticipants}
            </div>
            <div className="text-sm text-gray-600 font-semibold">Participants Joined</div>
          </div>
          <div className="text-center p-4 bg-cyan-50 rounded-xl">
            <div className="text-3xl font-extrabold text-cyan-600 mb-2">
              {Math.round((summary?.completionRate || 0) * (summary?.totalParticipants || 0) / 100)}
            </div>
            <div className="text-sm text-gray-600 font-semibold">Completed Quiz</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <div className="text-3xl font-extrabold text-green-600 mb-2">
              {summary?.averageScore.toFixed(0)}
            </div>
            <div className="text-sm text-gray-600 font-semibold">Avg Points Earned</div>
          </div>
        </div>
      </div>
    </div>
  );
};
