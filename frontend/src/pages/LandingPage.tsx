import { Link } from 'react-router-dom';
import { Play, Users, BarChart3, Zap } from 'lucide-react';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/image/image.png" alt="Sparklo" className="w-8 h-8" />
            <span className="text-2xl font-extrabold text-blue-900">sparklo.in</span>
          </div>
          <div className="flex gap-3">
            <Link to="/login" className="px-6 py-2 text-blue-600 font-semibold hover:text-blue-700 transition">
              Login
            </Link>
            <Link to="/register" className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
          Interactive Quiz Platform<br />for Everyone
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Create, host, and participate in live quizzes. Real-time engagement with instant results and analytics.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register" className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-xl transition text-lg">
            Get Started Free
          </Link>
          <Link to="/login" className="px-8 py-4 bg-white border-2 border-blue-500 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition text-lg">
            Try Demo
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">Live Quizzes</h3>
            <p className="text-gray-600 text-sm">Host real-time interactive quiz sessions</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-cyan-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">Easy Join</h3>
            <p className="text-gray-600 text-sm">Participants join with a simple room code</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">Analytics</h3>
            <p className="text-gray-600 text-sm">Track performance with detailed insights</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">Instant Results</h3>
            <p className="text-gray-600 text-sm">Real-time leaderboards and scoring</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-20 py-8 text-center text-gray-600">
        <p>&copy; 2024 sparklo.in. All rights reserved.</p>
      </footer>
    </div>
  );
};
