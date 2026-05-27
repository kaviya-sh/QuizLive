import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sessionApi } from '../../api/sessionApi';
import { useHostSocket } from '../../hooks/useHostSocket';
import { Session } from '../../types/api';
import toast from 'react-hot-toast';
import { Copy, QrCode, Users, Play, SkipForward, StopCircle, Wifi, WifiOff, CheckCircle2, BarChart3, Check } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

export const HostPanelPage = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [answerDistribution, setAnswerDistribution] = useState<Record<string, number>>({});
  const [questionStartTime, setQuestionStartTime] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const isInitialLoad = useRef(true);
  const sessionStartTimeRef = useRef<number | null>(null);
  const questionStartTimeRef = useRef<number | null>(null);

  const setSessionStartTimeSynced = (v: number | null) => {
    sessionStartTimeRef.current = v;
    setSessionStartTime(v);
  };
  const setQuestionStartTimeSynced = (v: number | null) => {
    questionStartTimeRef.current = v;
    setQuestionStartTime(v);
  };

  const loadSession = useCallback(async () => {
    if (isInitialLoad.current) setLoading(true);
    try {
      const { data } = await sessionApi.getSession(roomCode!);
      setSession(data);
      if (data.startTime && !sessionStartTimeRef.current) {
        setSessionStartTimeSynced(data.startTime);
      }
      if (data.status === 'ACTIVE' && data.currentQuestion && !questionStartTimeRef.current) {
        setQuestionStartTimeSynced(Date.now());
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load session');
      navigate('/dashboard');
    } finally {
      if (isInitialLoad.current) {
        setLoading(false);
        isInitialLoad.current = false;
      }
    }
  }, [roomCode, navigate]);

  const handleMessage = useCallback((msg: any) => {
    console.log('Host received message:', msg);
    
    if (msg.type === 'QUESTION_START' && msg.startTime) {
      console.log('Question started with startTime:', msg.startTime);
      setQuestionStartTimeSynced(msg.startTime);
      loadSession();
    }
    
    if (msg.type === 'JOINED') {
      console.log('Participant joined, reloading session');
      const name = msg.participant?.displayName || 'A participant';
      toast.success(`🎉 ${name} joined the quiz!`, {
        duration: 3000,
        style: { background: '#10b981', color: '#ffffff' },
      });
      loadSession();
    }

    if (msg.type === 'LATE_JOINER') {
      const name = msg.participant?.displayName || 'Someone';
      toast(`👀 ${name} joined mid-session as a spectator`, {
        icon: '🕐',
        style: { background: '#fef3c7', color: '#92400e', border: '1px solid #f59e0b' },
        duration: 4000,
      });
      loadSession();
    }
    
    if (msg.type === 'ANSWER_SUBMITTED') {
      console.log('Answer submitted, reloading session');
      loadSession();
    }
    
    const hasUuidKeys = Object.keys(msg).some(k => k.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i));
    if (hasUuidKeys && !msg.type) {
      console.log('Distribution update received:', msg);
      setAnswerDistribution(msg);
    }
  }, [loadSession]);

  const { connected } = useHostSocket(roomCode!, handleMessage);

  useEffect(() => {
    if (!roomCode) {
      setError('No room code provided');
      toast.error('No room code provided');
      navigate('/dashboard');
      return;
    }
    loadSession();
  }, [roomCode]);

  useEffect(() => {
    if (session?.status === 'ACTIVE' && session.currentQuestion && questionStartTime) {
      const duration = session.currentQuestion.timeLimitSeconds || 30;
      
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - questionStartTime) / 1000);
        const remaining = Math.max(0, duration - elapsed);
        setTimer(remaining);
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [session?.status, session?.currentQuestion, questionStartTime]);

  useEffect(() => {
    if (session?.status === 'ACTIVE' && timer === 0 && session.currentQuestion) {
      console.log('Timer expired, auto-advancing to next question');
      const autoAdvance = setTimeout(async () => {
        try {
          await nextQuestion();
        } catch (error) {
          console.error('Auto-advance failed:', error);
        }
      }, 2000);
      
      return () => clearTimeout(autoAdvance);
    }
  }, [timer, session?.status, session?.currentQuestion]);



  useEffect(() => {
    if (sessionStartTime) {
      const interval = setInterval(() => {
        setSessionStartTime(prev => prev);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [sessionStartTime]);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode!);
    setCopied(true);
    toast.success('Room code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const showQR = async () => {
    try {
      const { data } = await sessionApi.getQRCode(roomCode!);
      setQrUrl(URL.createObjectURL(data));
      setQrModalOpen(true);
    } catch (error) {
      toast.error('Failed to generate QR code');
    }
  };

  const startSession = async () => {
    try {
      await sessionApi.startSession(roomCode!);
      setSessionStartTimeSynced(Date.now());
      toast.success('Session started!');
      loadSession();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to start session');
    }
  };

  const nextQuestion = async () => {
    try {
      setQuestionStartTimeSynced(null);
      await sessionApi.nextQuestion(roomCode!);
      loadSession();
    } catch (error) {
      toast.error('Failed to move to next question');
    }
  };

  const endSession = async () => {
    if (!confirm('End the session? This cannot be undone.')) return;
    try {
      await sessionApi.endSession(roomCode!);
      toast.success('Session ended successfully');
      navigate(`/analytics/${session?.id}`);
    } catch (error) {
      toast.error('Failed to end session');
    }
  };

  const chartData = session?.currentQuestion?.options?.map(o => ({
    name: o.text.substring(0, 20),
    count: session.answerDistribution?.[o.id] || 0,
  })) || [];

  const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", background: 'linear-gradient(135deg, #EFF6FF 0%, #F3F4F6 100%)' }}>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .float-animation {
          animation: float 3s ease-in-out infinite;
        }
        .pulse-dot {
          animation: pulse-dot 1.5s infinite;
        }
        .fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 999px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        .glass-effect {
          backdrop-filter: blur(12px);
          background: rgba(255, 255, 255, 0.6);
        }
        .hover-lift {
          transition: all 0.3s ease;
        }
        .hover-lift:hover {
          transform: translateY(-2px);
        }
      `}</style>

      {error ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center glass-effect rounded-3xl shadow-2xl p-12 border-2 border-blue-200">
            <p className="text-red-600 font-semibold text-lg mb-4">{error}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all hover-lift"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      ) : (
        <>
      {/* Top Bar - White to Pink Gradient Header */}
      <div className="px-8 py-5 sticky top-0 z-10" style={{ backdropFilter: 'blur(10px)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', borderBottom: '1px solid rgba(251,207,232,0.3)', background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF5F7 40%, #FFE4E8 70%, #FBCFE8 100%)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Room Code Card - Teal/Cyan */}
            <div className="flex items-center gap-3 text-white px-6 py-3 hover-lift" style={{ background: 'linear-gradient(135deg, #14B8A6 0%, #06B6D4 100%)', borderRadius: '16px', boxShadow: '0 6px 20px rgba(20,184,166,0.3)', transition: '0.3s ease' }}>
              <span style={{ fontSize: '26px', fontWeight: '700', letterSpacing: '2px' }}>{roomCode}</span>
            </div>
            
            {/* Copy Button - Soft Peach */}
            <button
              onClick={copyRoomCode}
              className="hover-lift"
              style={{ width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(251,146,60,0.2)', background: copied ? 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)' : 'linear-gradient(135deg, #FFEDD5 0%, #FED7AA 100%)', border: copied ? '2px solid #6EE7B7' : '2px solid #FDBA74', transition: 'all 0.3s ease' }}
              title={copied ? 'Copied!' : 'Copy Room Code'}
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-700" />
              ) : (
                <Copy className="w-4 h-4 text-orange-700" />
              )}
            </button>
            
            {/* QR Button - Soft Lime */}
            <button
              onClick={showQR}
              className="hover-lift flex items-center gap-2"
              style={{ padding: '10px 16px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(163,230,53,0.2)', background: 'linear-gradient(135deg, #F7FEE7 0%, #ECFCCB 100%)', border: '2px solid #D9F99D' }}
              title="Show QR Code"
            >
              <QrCode className="w-4 h-4 text-lime-700" />
              <span className="text-sm font-semibold text-lime-700">QR Code</span>
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Live Quiz Session Badge with Timer - Soft Cyan/Aqua */}
            <div className="flex items-center gap-3 px-4 py-2 rounded-full" style={{ background: 'linear-gradient(135deg, #ECFEFF 0%, #CFFAFE 100%)', border: '2px solid #A5F3FC' }}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-500 rounded-full pulse-dot"></div>
                <span className="text-sm font-semibold text-cyan-700">Live Quiz Session</span>
              </div>
              <div className="w-px h-4 bg-cyan-300"></div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-mono font-semibold text-cyan-700">
                  {sessionStartTime ? (() => {
                    const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
                    const minutes = Math.floor(elapsed / 60);
                    const seconds = elapsed % 60;
                    return `${minutes}:${String(seconds).padStart(2, '0')}`;
                  })() : '0:00'}
                </span>
              </div>
            </div>
            
            {/* Participants Count Card - Soft Violet */}
            <div className="flex items-center gap-2 hover-lift" style={{ padding: '12px 20px', borderRadius: '16px', boxShadow: '0 4px 16px rgba(139,92,246,0.2)', background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)', border: '2px solid #DDD6FE' }}>
              <Users className="w-5 h-5 text-violet-600" />
              <span style={{ fontSize: '20px', fontWeight: '700' }} className="text-violet-900">{session?.participantCount || 0}</span>
              <span style={{ fontWeight: '600', fontSize: '13px' }} className="text-violet-700">participants</span>
            </div>
            
            {/* Connected Status - Soft Amber/Orange with glow */}
            <div className={`flex items-center gap-2 px-5 py-3 rounded-full backdrop-blur-sm border-2 ${
              connected ? 'border-amber-400' : 'border-orange-400'
            }`} style={{ 
              boxShadow: connected ? '0 0 20px rgba(245,158,11,0.4)' : '0 0 20px rgba(249,115,22,0.4)',
              background: connected ? 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)' : 'linear-gradient(135deg, #FFEDD5 0%, #FED7AA 100%)'
            }}>
              <div className={`w-2 h-2 rounded-full pulse-dot ${connected ? 'bg-amber-500' : 'bg-orange-500'}`}></div>
              {connected ? <Wifi className="w-5 h-5 text-amber-700" /> : <WifiOff className="w-5 h-5 text-orange-700" />}
              <span className={`text-sm font-bold ${connected ? 'text-amber-700' : 'text-orange-700'}`}>
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-89px)] gap-6 p-6">
        {/* Left Panel - Question Progress */}
        <div className="w-80 rounded-3xl p-6 overflow-y-auto" style={{ background: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)', boxShadow: '0 8px 24px rgba(59, 130, 246, 0.15)' }}>
          <div className="flex items-center gap-2 mb-6">
            <CheckCircle2 className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-extrabold text-blue-900">Question Progress</h3>
          </div>
          <div className="space-y-3">
            {session && session.quiz?.questions && Array.from({ length: session.quiz.questions.length }).map((_, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl transition-all hover-lift fade-in ${
                  i === session.currentQuestionIndex
                    ? 'bg-blue-600 text-white shadow-lg border-2 border-blue-700'
                    : i < session.currentQuestionIndex
                    ? 'bg-green-100 border-2 border-green-400 text-green-800 shadow-md'
                    : 'bg-white/70 border-2 border-blue-200 text-gray-700 shadow-sm'
                }`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {i === session.currentQuestionIndex && (
                      <div className="w-2 h-2 bg-white rounded-full pulse-dot"></div>
                    )}
                    <span className="font-semibold text-sm">Question {i + 1}</span>
                  </div>
                  {i < session.currentQuestionIndex && (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Stage - Soft Pink */}
        <div className="flex-1 rounded-3xl p-6 overflow-hidden flex flex-col" style={{ background: 'linear-gradient(135deg, #FCE7F3 0%, #FBCFE8 100%)', boxShadow: '0 8px 24px rgba(236, 72, 153, 0.12)' }}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center rounded-3xl shadow-2xl p-16 max-w-md" style={{ background: 'linear-gradient(135deg, #F9FAFB 0%, #FFFFFF 100%)', border: '2px solid', borderImage: 'linear-gradient(135deg, #9333ea, #3b82f6, #ec4899) 1' }}>
                <div className="w-16 h-16 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
                <p className="text-gray-900 font-semibold text-xl">Loading session...</p>
              </div>
            </div>
          ) : !session ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center rounded-3xl shadow-2xl p-16 max-w-md" style={{ background: 'linear-gradient(135deg, #F9FAFB 0%, #FFFFFF 100%)', border: '2px solid', borderImage: 'linear-gradient(135deg, #9333ea, #3b82f6, #ec4899) 1' }}>
                <p className="text-gray-900 font-semibold text-xl">No session found</p>
              </div>
            </div>
          ) : session?.status === 'WAITING' ? (
            <div className="flex flex-col items-center justify-center h-full fade-in">
              {/* Participant Icon - Stable (removed float animation) */}
              <div className="w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', boxShadow: '0 8px 24px rgba(245,158,11,0.2)' }}>
                <Users className="w-14 h-14 text-amber-600" />
              </div>
              
              {/* Main Text - Changed Font */}
              <h1 className="text-gray-900 mb-3" style={{ fontSize: '28px', lineHeight: '1.2', fontWeight: '600', fontFamily: '"Inter", sans-serif' }}>
                Waiting for participants...
              </h1>
              
              {/* Subtext - Reduced */}
              <p className="mb-8" style={{ fontSize: '16px', color: '#78716c', fontWeight: '500' }}>
                {session.participantCount} participant{session.participantCount !== 1 ? 's' : ''} joined
              </p>
              
              {/* Start Quiz Button - Smaller */}
              <button
                onClick={startSession}
                className="inline-flex items-center gap-2 text-white hover-lift"
                style={{ 
                  height: '44px', 
                  padding: '0 24px', 
                  borderRadius: '14px', 
                  fontSize: '16px', 
                  fontWeight: '600',
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  boxShadow: '0 4px 16px rgba(34,197,94,0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.03)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(34,197,94,0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(34,197,94,0.3)';
                }}
              >
                <Play className="w-4 h-4" />
                <span>Start Quiz</span>
              </button>
            </div>
          ) : session?.status === 'ACTIVE' ? (
            session.currentQuestion ? (
            <div className="fade-in flex flex-col h-full">
              {/* Question Header with Timer */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h2 className="text-base font-bold text-pink-900 mb-2">
                    Question {session.currentQuestionIndex + 1}
                  </h2>
                  <p className="text-base font-medium leading-relaxed text-pink-900" style={{ fontFamily: '"Inter", sans-serif' }}>
                    {session.currentQuestion.text}
                  </p>
                </div>
                <div className={`text-3xl font-bold font-mono px-4 py-1.5 rounded-xl ml-4 flex-shrink-0 ${
                  timer < 5 ? 'text-red-600 bg-red-50 animate-pulse border-2 border-red-300' : 'text-blue-600 bg-blue-50 border-2 border-blue-300'
                }`} style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
                  {timer}<span className="text-lg ml-1">s</span>
                </div>
              </div>

              {/* Live Answer Distribution */}
              <div className="p-3 mb-3 flex-1" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #FCE7F3 100%)', borderRadius: '14px', boxShadow: '0 4px 16px rgba(236, 72, 153, 0.08)' }}>
                <h3 className="text-sm font-extrabold mb-2 flex items-center gap-2 text-pink-800">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full pulse-dot" style={{ boxShadow: '0 0 8px rgba(34,197,94,0.6)' }}></div>
                  Live Responses
                </h3>
                <div className="space-y-2">
                  {session.currentQuestion.options.map((option, index) => {
                    const count = answerDistribution[option.id] || 0;
                    const total = Object.values(answerDistribution).reduce((a, b) => a + b, 0) || 1;
                    const percentage = Math.round((count / total) * 100) || 0;
                    return (
                      <div key={option.id} className="fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-md flex items-center justify-center font-bold text-white text-xs" style={{ background: CHART_COLORS[index % 4] }}>
                              {String.fromCharCode(65 + index)}
                            </div>
                            <span className="font-semibold text-pink-900 text-xs">{option.text}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-base font-bold" style={{ color: CHART_COLORS[index % 4] }}>{count}</span>
                            <span className="text-xs font-semibold text-gray-500 w-8 text-right">{percentage}%</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500 ease-out"
                            style={{ 
                              width: `${percentage}%`, 
                              background: CHART_COLORS[index % 4],
                              boxShadow: `0 0 10px ${CHART_COLORS[index % 4]}40`
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Controls */}
              <div className="flex gap-2">
                <button
                  onClick={nextQuestion}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 text-xs rounded-lg flex items-center justify-center gap-1.5 hover-lift"
                  style={{ boxShadow: '0 3px 12px rgba(59,130,246,0.3)', width: 'fit-content', paddingLeft: '16px', paddingRight: '16px' }}
                >
                  <SkipForward className="w-3.5 h-3.5" />
                  <span>Next Question</span>
                </button>
                <button
                  onClick={endSession}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2 text-xs rounded-lg flex items-center gap-1.5 hover-lift"
                  style={{ boxShadow: '0 3px 12px rgba(239,68,68,0.3)' }}
                >
                  <StopCircle className="w-3.5 h-3.5" />
                  <span>End Quiz</span>
                </button>
              </div>
            </div>
          ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center rounded-3xl shadow-2xl p-16 max-w-md" style={{ background: 'linear-gradient(135deg, #F9FAFB 0%, #FFFFFF 100%)', border: '2px solid', borderImage: 'linear-gradient(135deg, #9333ea, #3b82f6, #ec4899) 1' }}>
                  <div className="w-16 h-16 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
                  <p className="text-gray-900 font-semibold text-xl">Loading first question...</p>
                </div>
              </div>
            )
          ) : session?.status === 'FINISHED' ? (
            <div className="flex items-center justify-center h-full fade-in">
              <div className="text-center w-full max-w-2xl px-8">
                <div className="w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8 float-animation" style={{ background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', boxShadow: '0 8px 24px rgba(34,197,94,0.2)' }}>
                  <CheckCircle2 className="w-16 h-16 text-green-600" />
                </div>
                <h1 className="text-pink-900 mb-4" style={{ fontSize: '48px', lineHeight: '1.1', fontWeight: '800', letterSpacing: '-1px' }}>
                  Quiz Completed!
                </h1>
                <p className="mb-10 text-pink-700" style={{ fontSize: '20px', fontWeight: '600' }}>
                  Session has ended successfully
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => navigate(`/analytics/${session.id}`)}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-8 rounded-xl hover-lift flex items-center gap-2"
                    style={{ boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }}
                  >
                    <BarChart3 className="w-5 h-5" />
                    View Analytics
                  </button>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-bold py-3 px-8 rounded-xl hover-lift"
                    style={{ boxShadow: '0 4px 16px rgba(217,70,239,0.3)' }}
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center w-full max-w-md px-8">
                <p className="text-purple-900 font-semibold text-xl mb-3">Unknown session status</p>
                <p className="text-purple-700 text-base mb-6">Status: {session?.status || 'undefined'}</p>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-bold py-3 px-8 rounded-xl hover-lift"
                  style={{ boxShadow: '0 4px 16px rgba(217,70,239,0.3)' }}
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Participants - Soft Mint/Seafoam */}
        <div className="w-80 rounded-3xl p-6 overflow-y-auto" style={{ background: 'linear-gradient(135deg, #F0FDFA 0%, #CCFBF1 100%)', boxShadow: '0 8px 24px rgba(20, 184, 166, 0.12)' }}>
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-6 h-6 text-teal-600" />
            <h3 className="text-xl font-extrabold text-teal-900">Participants</h3>
          </div>
          <div className="space-y-3">
            {session?.participants?.map((p, index) => (
              <div 
                key={p.id} 
                className="rounded-2xl p-5 hover-lift fade-in" 
                style={{ 
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #F0FDFA 100%)',
                  boxShadow: '0 4px 16px rgba(20, 184, 166, 0.1)',
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full pulse-dot"></div>
                    <div className="font-bold truncate text-teal-900">{p.displayName}</div>
                    {p.joinedLate && (
                      <span className="text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-300 px-1.5 py-0.5 rounded-full">
                        late
                      </span>
                    )}
                  </div>
                  {p.avatarEmoji && <span className="text-3xl">{p.avatarEmoji}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-extrabold text-teal-600">{p.score}</div>
                  <div className="text-xs text-teal-700 font-semibold">points</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* QR Modal */}
      {qrModalOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setQrModalOpen(false)}
        >
          <div className="rounded-3xl shadow-2xl p-10 max-w-md w-full" onClick={e => e.stopPropagation()} style={{ background: 'linear-gradient(135deg, #F9FAFB 0%, #FFFFFF 100%)', borderRadius: '28px', border: '2px solid', borderImage: 'linear-gradient(135deg, #9333ea, #3b82f6, #ec4899) 1' }}>
            <h3 className="text-3xl font-extrabold mb-8 text-center text-gray-900">Scan to Join</h3>
            <div className="bg-white p-8 rounded-2xl mb-8 shadow-inner">
              <img src={qrUrl} alt="QR Code" className="w-full" />
            </div>
            <button
              onClick={() => setQrModalOpen(false)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition-all w-full hover-lift"
              style={{ boxShadow: '0 4px 16px rgba(59,130,246,0.3)' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};
