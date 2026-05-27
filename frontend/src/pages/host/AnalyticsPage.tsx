import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { analyticsApi, AnalyticsSummary } from '../../api/analyticsApi';
import toast from 'react-hot-toast';
import { Download, Users, Target, Clock, TrendingDown, Award, Zap as Lightning, ArrowLeft } from 'lucide-react';

export const AnalyticsPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, [sessionId]);

  const loadSummary = async () => {
    try {
      const { data } = await analyticsApi.getSummary(sessionId!);
      setSummary(data);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      const { data } = await analyticsApi.downloadCSV(sessionId!);
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics-${sessionId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('CSV downloaded successfully');
    } catch (error) {
      toast.error('Failed to download CSV');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page title + export */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/analytics')}
              className="p-2 hover:bg-gray-200 rounded-xl transition-colors"
              title="Back to Analytics"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Session Analytics</h1>
              <p className="text-sm text-gray-500 mt-0.5">Detailed performance insights</p>
            </div>
          </div>
          <button
            onClick={handleDownloadCSV}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-md flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-rose-50 rounded-2xl shadow-xl p-6 border border-rose-200 hover:shadow-2xl transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-rose-600" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-extrabold text-gray-900">{summary?.totalParticipants}</div>
              </div>
            </div>
            <div className="text-sm font-bold text-gray-600">Total Participants</div>
          </div>

          <div className="bg-cyan-50 rounded-2xl shadow-xl p-6 border border-cyan-200 hover:shadow-2xl transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-cyan-600" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-extrabold text-gray-900">
                  {summary?.averageScore.toFixed(0)}
                </div>
              </div>
            </div>
            <div className="text-sm font-bold text-gray-600">Average Score</div>
          </div>

          <div className="bg-emerald-50 rounded-2xl shadow-xl p-6 border border-emerald-200 hover:shadow-2xl transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-extrabold text-gray-900">
                  {summary?.completionRate.toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="text-sm font-bold text-gray-600">Completion Rate</div>
          </div>

          <div className="bg-amber-50 rounded-2xl shadow-xl p-6 border border-amber-200 hover:shadow-2xl transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-extrabold text-gray-900">
                  {Math.floor((summary?.durationSeconds || 0) / 60)}m
                </div>
              </div>
            </div>
            <div className="text-sm font-bold text-gray-600">Session Duration</div>
          </div>
        </div>

        {/* Insights Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hardest Question */}
          {summary?.hardestQuestion && (
            <div className="bg-red-50 rounded-2xl shadow-xl p-6 border border-red-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-xl font-extrabold text-gray-900" style={{ fontFamily: '"Inter", sans-serif' }}>Most Challenging</h2>
              </div>
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                <p className="text-gray-900 font-semibold mb-2">{summary.hardestQuestion.text}</p>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-extrabold text-red-600">
                    {summary.hardestQuestion.accuracy.toFixed(1)}%
                  </div>
                  <div className="text-sm text-red-600 font-semibold">accuracy rate</div>
                </div>
              </div>
            </div>
          )}

          {/* Fastest Question */}
          {summary?.fastestQuestion && (
            <div className="bg-green-50 rounded-2xl shadow-xl p-6 border border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Lightning className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-xl font-extrabold text-gray-900" style={{ fontFamily: '"Inter", sans-serif' }}>Fastest Response</h2>
              </div>
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                <p className="text-gray-900 font-semibold mb-2">{summary.fastestQuestion.text}</p>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-extrabold text-green-600">
                    {(summary.fastestQuestion.avgResponseTimeMs / 1000).toFixed(1)}s
                  </div>
                  <div className="text-sm text-green-600 font-semibold">average response time</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Engagement Insights */}
        <div className="bg-purple-50 rounded-2xl shadow-xl p-6 border border-purple-200 mt-6">
          <h2 className="text-xl font-extrabold text-gray-900 mb-6" style={{ fontFamily: '"Inter", sans-serif' }}>Engagement Insights</h2>
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
      </main>
    </div>
  );
};
