import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sessionApi } from '../../api/sessionApi';
import { useHostSocket } from '../../hooks/useHostSocket';
import { Session } from '../../types/api';
import toast from 'react-hot-toast';
import { Copy, QrCode, Users, Play, SkipForward, StopCircle, Wifi, WifiOff, CheckCircle2, BarChart3, Check, ArrowLeft } from 'lucide-react';

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
      {/* Top Bar - Professional Dark Blue Header */}
      <div className="px-8 py-5 sticky top-0 z-10" style={{ backdropFilter: 'blur(10px)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Back Button */}
            <button
              onClick={() => navigate('/dashboard')}
              className="hover-lift flex items-center justify-center"
              style={{ width: '48px', height: '48px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(124, 77, 255, 0.3)', background: '#7C4DFF', border: '1px solid #6A3DE8', transition: 'all 0.3s ease' }}
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            
            {/* Room Code Card with Copy */}
            <div className="flex items-center gap-2 px-4 py-2 hover-lift" style={{ background: 'rgba(255, 255, 255, 0.25)', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', transition: '0.3s ease', border: '1px solid rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(10px)' }}>
              <span style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '1.5px', color: '#FFFFFF' }}>{roomCode}</span>
              <button
                onClick={copyRoomCode}
                className="hover-lift"
                style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: copied ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.2)', border: '1px solid rgba(255, 255, 255, 0.3)', transition: 'all 0.3s ease', cursor: 'pointer' }}
                title={copied ? 'Copied!' : 'Copy Room Code'}
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-white" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-white" />
                )}
              </button>
            </div>
            
            {/* QR Button */}
            <button
              onClick={showQR}
              className="hover-lift flex items-center gap-2"
              style={{ padding: '10px 16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', background: 'rgba(255, 255, 255, 0.2)', border: '1px solid rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(10px)' }}
              title="Show QR Code"
            >
              <QrCode className="w-4 h-4 text-white" />
              <span className="text-sm font-semibold text-white">QR Code</span>
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Live Quiz Session Badge with Timer */}
            <div className="flex items-center gap-3 px-4 py-2 rounded-full" style={{ background: 'rgba(252, 211, 77, 0.2)', border: '1px solid rgba(252, 211, 77, 0.4)', backdropFilter: 'blur(10px)' }}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full pulse-dot" style={{ boxShadow: '0 0 8px rgba(252, 211, 77, 0.8)' }}></div>
                <span className="text-sm font-semibold text-white">Live Quiz Session</span>
              </div>
              <div className="w-px h-4 bg-yellow-300"></div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-mono font-semibold text-white">
                  {sessionStartTime ? (() => {
                    const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
                    const minutes = Math.floor(elapsed / 60);
                    const seconds = elapsed % 60;
                    return `${minutes}:${String(seconds).padStart(2, '0')}`;
                  })() : '0:00'}
                </span>
              </div>
            </div>
            
            {/* Participants Count Card */}
            <div className="flex items-center gap-2 hover-lift" style={{ padding: '8px 16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <Users className="w-4 h-4 text-white" />
              <span style={{ fontSize: '16px', fontWeight: '700' }} className="text-white">{session?.participantCount || 0}</span>
              <span style={{ fontWeight: '600', fontSize: '12px' }} className="text-white opacity-90">participants</span>
            </div>
            
            {/* Connected Status */}
            <div className={`flex items-center gap-2 px-5 py-3 rounded-full backdrop-blur-sm`} style={{ 
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              background: connected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              border: connected ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)'
            }}>
              <div className={`w-2 h-2 rounded-full pulse-dot ${connected ? 'bg-green-400' : 'bg-red-400'}`} style={{ boxShadow: connected ? '0 0 8px rgba(16, 185, 129, 0.8)' : '0 0 8px rgba(239, 68, 68, 0.8)' }}></div>
              {connected ? <Wifi className="w-5 h-5 text-white" /> : <WifiOff className="w-5 h-5 text-white" />}
              <span className="text-sm font-bold text-white">
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-89px)] gap-6 p-6">
        {/* Left Panel - Question Progress */}
        <div className="w-80 rounded-2xl p-6 overflow-y-auto" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%)', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.08)', border: '1px solid #bfdbfe' }}>
          <div className="flex items-center gap-2 mb-6">
            <CheckCircle2 className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-bold text-blue-800">Question Progress</h3>
          </div>
          <div className="space-y-3">
            {session && session.quiz?.questions && Array.from({ length: session.quiz.questions.length }).map((_, i) => {
              const isCompleted = session.status === 'FINISHED' || i < session.currentQuestionIndex;
              const isCurrent = i === session.currentQuestionIndex && session.status !== 'FINISHED';
              
              return (
              <div
                key={i}
                className={`p-4 rounded-xl transition-all hover-lift fade-in ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-lg border border-blue-700'
                    : isCompleted
                    ? 'bg-green-50 border border-green-300 text-green-800'
                    : 'bg-white border border-blue-200 text-blue-600'
                }`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isCurrent && (
                      <div className="w-2 h-2 bg-white rounded-full pulse-dot"></div>
                    )}
                    <span className="font-semibold text-sm">Question {i + 1}</span>
                  </div>
                  {isCompleted && (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  )}
                </div>
              </div>
            )})}
          </div>
        </div>

        {/* Main Stage */}
        <div className="flex-1 rounded-2xl p-6 overflow-hidden flex flex-col" style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.08)', border: '1px solid #e9d5ff' }}>
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
              {/* Participant Icon */}
              <div className="w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: '#f5f3ff', boxShadow: '0 4px 16px rgba(139, 92, 246, 0.1)', border: '2px solid #e9d5ff' }}>
                <Users className="w-14 h-14 text-purple-600" />
              </div>
              
              {/* Main Text */}
              <h1 className="text-purple-900 mb-3" style={{ fontSize: '28px', lineHeight: '1.2', fontWeight: '600', fontFamily: '"Inter", sans-serif' }}>
                Waiting for participants...
              </h1>
              
              {/* Subtext */}
              <p className="mb-8" style={{ fontSize: '16px', color: '#7c3aed', fontWeight: '500' }}>
                {session.participantCount} participant{session.participantCount !== 1 ? 's' : ''} joined
              </p>
              
              {/* Start Quiz Button */}
              <button
                onClick={startSession}
                className="inline-flex items-center gap-2 text-white hover-lift"
                style={{ 
                  height: '44px', 
                  padding: '0 24px', 
                  borderRadius: '12px', 
                  fontSize: '16px', 
                  fontWeight: '600',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  transition: 'all 0.3s ease',
                  border: '1px solid #059669'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
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
                  <h2 className="text-base font-bold text-purple-900 mb-2">
                    Question {session.currentQuestionIndex + 1}
                  </h2>
                  <p className="text-base font-medium leading-relaxed text-purple-800" style={{ fontFamily: '"Inter", sans-serif' }}>
                    {session.currentQuestion.text}
                  </p>
                </div>
                <div className={`text-3xl font-bold font-mono px-4 py-1.5 rounded-xl ml-4 flex-shrink-0 ${
                  timer < 5 ? 'text-red-600 bg-red-50 animate-pulse border border-red-400' : 'text-purple-900 bg-purple-50 border border-purple-300'
                }`} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  {timer}<span className="text-lg ml-1">s</span>
                </div>
              </div>

              {/* Live Answer Distribution */}
              <div className="p-3 mb-3 flex-1" style={{ background: '#faf5ff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(139, 92, 246, 0.06)', border: '1px solid #e9d5ff' }}>
                <h3 className="text-sm font-bold mb-2 flex items-center gap-2 text-purple-900">
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
                            <span className="font-semibold text-purple-900 text-xs">{option.text}</span>
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
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 text-xs rounded-lg flex items-center justify-center gap-1.5 hover-lift"
                  style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.1)', width: 'fit-content', paddingLeft: '16px', paddingRight: '16px' }}
                >
                  <SkipForward className="w-3.5 h-3.5" />
                  <span>Next Question</span>
                </button>
                <button
                  onClick={endSession}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 text-xs rounded-lg flex items-center gap-1.5 hover-lift"
                  style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}
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
                <h1 className="text-purple-900 mb-4" style={{ fontSize: '48px', lineHeight: '1.1', fontWeight: '800', letterSpacing: '-1px' }}>
                  Quiz Completed!
                </h1>
                <p className="mb-10 text-purple-700" style={{ fontSize: '20px', fontWeight: '600' }}>
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

        {/* Right Panel - Participants */}
        <div className="w-80 rounded-2xl p-6 overflow-y-auto" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.08)', border: '1px solid #bbf7d0' }}>
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-bold text-green-800">Participants</h3>
          </div>
          <div className="space-y-3">
            {session?.participants?.map((p, index) => (
              <div 
                key={p.id} 
                className="rounded-2xl p-5 hover-lift fade-in" 
                style={{ 
                  background: 'rgba(255,255,255,0.8)',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.08)',
                  border: '1px solid #bbf7d0',
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full pulse-dot"></div>
                    <div className="font-bold truncate text-green-800">{p.displayName}</div>
                    {p.joinedLate && (
                      <span className="text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-300 px-1.5 py-0.5 rounded-full">
                        late
                      </span>
                    )}
                  </div>
                  {p.avatarEmoji && <span className="text-3xl">{p.avatarEmoji}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-green-600">{p.score}</div>
                  <div className="text-xs text-green-600 font-semibold">points</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* QR Modal */}
      {qrModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)' }}
          onClick={() => setQrModalOpen(false)}
        >
          <div 
            className="max-w-sm w-full" 
            onClick={e => e.stopPropagation()} 
            style={{ 
              background: '#f5f5f5', 
              borderRadius: '16px', 
              padding: '24px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
            }}
          >
            {/* Title */}
            <h3 className="text-xl font-bold text-center text-gray-800 mb-4">Scan QR to Join</h3>

            {/* QR Code */}
            <div style={{ 
              background: '#ffffff',
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '20px'
            }}>
              <img src={qrUrl} alt="QR Code" className="w-full" />
            </div>

            {/* Close Button */}
            <button
              onClick={() => setQrModalOpen(false)}
              className="w-full hover-lift"
              style={{ 
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                fontWeight: '600',
                padding: '12px',
                borderRadius: '10px',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                transition: 'all 0.3s ease',
                border: 'none',
                cursor: 'pointer',
                fontSize: '15px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
              }}
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
