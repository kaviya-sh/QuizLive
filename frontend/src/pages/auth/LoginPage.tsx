import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { useAuthStore } from '../../store/authStore';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';

export const LoginPage = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { success, error } = useNotificationStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'HOST' | 'PARTICIPANT'>('PARTICIPANT');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [roleError, setRoleError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [sendingReset, setSendingReset] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setEmailError('');
    setPasswordError('');
    setRoleError('');

    try {
      const { data } = await authApi.login({ email, password });
      
      // Check if the role matches
      const userRole = data.user.role === 'ROLE_HOST' ? 'HOST' : 'PARTICIPANT';
      if (userRole !== role) {
        setRoleError(`Invalid role. You are registered as ${userRole === 'HOST' ? 'Host' : 'Participant'}`);
        setLoading(false);
        return;
      }
      
      setAuth(data.user, data.accessToken);
      success('Welcome back!');
      navigate(data.user.role === 'ROLE_HOST' ? '/dashboard' : '/participant/dashboard');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '';
      
      if (errorMessage.toLowerCase().includes('email') || errorMessage.toLowerCase().includes('user not found') || errorMessage.toLowerCase().includes('user does not exist')) {
        setEmailError('Invalid email address');
      } else if (errorMessage.toLowerCase().includes('password') || errorMessage.toLowerCase().includes('incorrect password')) {
        setPasswordError('Invalid password');
      } else {
        setPasswordError('Invalid password');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      error('Please enter your email');
      return;
    }

    setSendingReset(true);
    try {
      await authApi.forgotPassword(forgotEmail);
      success('Password reset link sent to your email!');
      setShowForgotPassword(false);
      setForgotEmail('');
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setSendingReset(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      {/* Left Side - Quiz Illustration */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center relative bg-white">
        <div className="bg-[#FFF9F0] px-12" style={{ paddingTop: '6.25rem', paddingBottom: '6.25rem' }}>
          <div className="relative z-10 max-w-2xl w-full">
            <img 
              src="image/quizz.png"
              className="w-full h-auto object-contain"
              alt="Quiz Illustration"
            />
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-2">
              <img src="/image/image.png" alt="Sparklo Logo" className="w-10 h-10 object-contain" style={{ background: 'transparent', mixBlendMode: 'multiply' }} />
              <h1 className="text-3xl font-extrabold" style={{ fontFamily: '"Raleway", "Helvetica Neue", sans-serif', fontWeight: '800' }}>
                <span style={{ color: '#1e3a8a' }}>sparklo.in</span>
              </h1>
            </div>
            <p className="font-semibold mt-6 mx-auto whitespace-nowrap" style={{ fontFamily: '"Inter", sans-serif', fontSize: '20px', color: '#1a1a1a' }}>Login to continue</p>
          </div>

          {!showForgotPassword ? (
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <form onSubmit={handleSubmit} className="space-y-6">
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
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError('');
                      }}
                      className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 ${
                        emailError ? 'border-red-500' : 'border-gray-200'
                      }`}
                      placeholder="you@example.com"
                    />
                  </div>
                  {emailError && (
                    <p className="mt-1 text-sm text-red-600">{emailError}</p>
                  )}
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
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordError('');
                      }}
                      className={`w-full pl-12 pr-12 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 ${
                        passwordError ? 'border-red-500' : 'border-gray-200'
                      }`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="mt-1 text-sm text-red-600">{passwordError}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">
                    Login as
                  </label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setRole('HOST');
                        setRoleError('');
                      }}
                      className={`flex-1 py-3 px-4 rounded-xl border-2 font-semibold transition-all duration-200 ${
                        role === 'HOST'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Host
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRole('PARTICIPANT');
                        setRoleError('');
                      }}
                      className={`flex-1 py-3 px-4 rounded-xl border-2 font-semibold transition-all duration-200 ${
                        role === 'PARTICIPANT'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Participant
                    </button>
                  </div>
                  {roleError && (
                    <p className="mt-2 text-sm text-red-600">{roleError}</p>
                  )}
                </div>

                <div className="flex items-center justify-end">
                  <Link
                    to="/forgot-password"
                    className="text-sm font-normal text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600 text-sm font-normal">
                  Don't have an account?{' '}
                  <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">
                    Sign up for free
                  </Link>
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
                <p className="text-gray-600">Enter your email and we'll send you a reset link</p>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-6">
                <div>
                  <label htmlFor="forgotEmail" className="block text-sm font-bold text-gray-900 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="forgotEmail"
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={sendingReset}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingReset ? 'Sending...' : 'Send Reset Link'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotEmail('');
                  }}
                  className="w-full text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Back to Sign In
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
