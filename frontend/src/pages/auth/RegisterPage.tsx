import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { Users, Presentation, Mail, Lock, User } from 'lucide-react';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    role: 'ROLE_HOST',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await authApi.register(formData);
      setAuth(data.user, data.accessToken);
      toast.success('Account created successfully!');
      navigate(data.user.role === 'ROLE_HOST' ? '/dashboard' : '/join');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-2xl mx-8">
          <div className="text-center pt-8 pb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <img src="/image/image.png" alt="Sparklo Logo" className="w-10 h-10 object-contain" style={{ background: 'transparent', mixBlendMode: 'multiply' }} />
              <h1 className="text-3xl font-extrabold" style={{ fontFamily: '"Raleway", "Helvetica Neue", sans-serif', fontWeight: '800' }}>
                <span style={{ color: '#1e3a8a' }}>sparklo.in</span>
              </h1>
            </div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', paddingTop: '2rem', paddingBottom: '2rem', paddingLeft: '0.4rem', paddingRight: '0.4rem', borderRadius: '1rem' }}>
            <p className="font-semibold text-center mb-8" style={{ fontFamily: '"Inter", sans-serif', fontSize: '20px', color: '#1a1a1a' }}>Get started with sparklo.in</p>
            <div className="rounded-2xl shadow-xl p-8 border border-gray-100 max-w-md mx-auto" style={{ backgroundColor: '#EFF6FF' }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="displayName" className="block text-sm font-bold text-gray-900 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="displayName"
                  type="text"
                  required
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                  style={{ backgroundColor: '#FFFFFF !important', WebkitBoxShadow: '0 0 0 1000px white inset' }}
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-900 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                  style={{ backgroundColor: '#FFFFFF !important', WebkitBoxShadow: '0 0 0 1000px white inset' }}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-900 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                  style={{ backgroundColor: '#FFFFFF !important', WebkitBoxShadow: '0 0 0 1000px white inset' }}
                  placeholder="Minimum 6 characters"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                I want to
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'ROLE_HOST' })}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    formData.role === 'ROLE_HOST'
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <Presentation className={`w-6 h-6 mx-auto mb-2 ${
                    formData.role === 'ROLE_HOST' ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <div className={`font-bold text-sm ${
                    formData.role === 'ROLE_HOST' ? 'text-blue-700' : 'text-gray-700'
                  }`}>Host Quizzes</div>
                  <div className="text-xs text-gray-500 mt-1">Create & manage</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'ROLE_PARTICIPANT' })}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    formData.role === 'ROLE_PARTICIPANT'
                      ? 'border-cyan-500 bg-cyan-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <Users className={`w-6 h-6 mx-auto mb-2 ${
                    formData.role === 'ROLE_PARTICIPANT' ? 'text-cyan-600' : 'text-gray-400'
                  }`} />
                  <div className={`font-bold text-sm ${
                    formData.role === 'ROLE_PARTICIPANT' ? 'text-cyan-700' : 'text-gray-700'
                  }`}>Join Quizzes</div>
                  <div className="text-xs text-gray-500 mt-1">Play & compete</div>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm font-normal">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};
