import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useParticipantSocket } from '../../hooks/useParticipantSocket';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ConnectionStatus } from '../../components/ConnectionStatus';
import { CheckCircle2, XCircle, Loader2, Users } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  options: Array<{ id: string; text: string }>;
  timeLimitSeconds: number;
}

export const QuestionPage = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [timer, setTimer] = useState(30);
  const [isWaiting, setIsWaiting] = useState(true);
  const [isLateJoiner] = useState(() => sessionStorage.getItem('lateJoiner') === 'true');

  const handleMessage = (msg: any) => {
    if (msg.type === 'QUESTION_START') {
      setIsWaiting(false);
      const startTime = msg.startTime || Date.now();
      setQuestion({
        id: msg.id,
        text: msg.text,
        options: msg.options,
        timeLimitSeconds: msg.timeLimitSeconds,
        startTime: startTime
      } as any);
      setTimer(msg.timeLimitSeconds);
      setAnswered(false);
      setSelectedOption(null);
      setFeedback(null);
    }
    if (msg.type === 'PERSONAL_FEEDBACK') {
      setFeedback(msg);
      if (msg.isCorrect) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
    if (msg.type === 'LEADERBOARD') {
      navigate(`/play/leaderboard/${roomCode}`);
    }
    if (msg.status === 'FINISHED' || msg.type === 'SESSION_ENDED' || msg.type === 'QUIZ_ENDED') {
      navigate(`/results/${roomCode}`, { replace: true });
    }
  };

  const { sendAnswer, connected } = useParticipantSocket(roomCode!, handleMessage);

  // Fetch current question on mount if session is already active
  useEffect(() => {
    const fetchCurrentQuestion = async () => {
      try {
        console.log('Fetching current question for room:', roomCode);
        const response = await fetch(`/api/sessions/${roomCode}`);
        
        if (!response.ok) {
          console.error('Failed to fetch session:', response.status);
          return;
        }
        
        const data = await response.json();
        console.log('Session data:', data);
        
        if (data.status === 'FINISHED') {
          console.log('Session already finished, navigating to results');
          navigate(`/results/${roomCode}`);
          return;
        }
        
        if (data.status === 'ACTIVE' && data.currentQuestion) {
          console.log('Setting current question:', data.currentQuestion);
          setIsWaiting(false);
          setQuestion({
            id: data.currentQuestion.id,
            text: data.currentQuestion.text,
            options: data.currentQuestion.options,
            timeLimitSeconds: data.currentQuestion.timeLimitSeconds,
          });
          setTimer(data.currentQuestion.timeLimitSeconds);
        } else if (data.status === 'WAITING') {
          console.log('Session is waiting for host to start');
          setIsWaiting(true);
        } else {
          console.log('Session not active or no current question. Status:', data.status);
        }
      } catch (error) {
        console.error('Failed to fetch current question:', error);
      }
    };

    fetchCurrentQuestion();
  }, [roomCode]);

  useEffect(() => {
    if (question && !isWaiting) {
      const startTime = (question as any).startTime || Date.now();
      const duration = question.timeLimitSeconds;
      
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = Math.max(0, duration - elapsed);
        setTimer(remaining);
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [question, isWaiting]);

  const handleAnswer = (optionId: string) => {
    if (answered) return;
    
    setSelectedOption(optionId);
    setAnswered(true);
    sendAnswer(question!.id, optionId);
  };

  const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  const getOptionStyle = (optionId: string, index: number) => {
    // If feedback received, show correct answer in green and wrong in red
    if (feedback) {
      if (optionId === feedback.correctOptionId) {
        return { background: '#10B981' };
      }
      if (optionId === feedback.selectedOptionId && !feedback.isCorrect) {
        return { background: '#EF4444' };
      }
    }

    // If selected but no feedback yet
    if (selectedOption === optionId && !feedback) {
      return { background: CHART_COLORS[index], boxShadow: `0 0 0 4px ${CHART_COLORS[index]}40` };
    }

    // Default state
    return answered ? { background: CHART_COLORS[index], opacity: 0.75 } : { background: CHART_COLORS[index] };
  };

  // Waiting screen
  if (isWaiting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-accent-600 flex items-center justify-center px-4">
        <ConnectionStatus connected={connected} />
        
        <div className="text-center text-white max-w-2xl animate-fade-in">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-white/20 backdrop-blur-sm rounded-full mb-6 animate-pulse">
              <Users className="w-16 h-16" />
            </div>
            <h1 className="text-5xl font-display font-bold mb-4">Get Ready!</h1>
            <p className="text-2xl text-white/90">Waiting for host to start the quiz...</p>
          </div>

          <div className="flex items-center justify-center gap-3 mt-8">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-lg">The quiz will begin shortly</span>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2">
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4" style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)' }}>
      <ConnectionStatus connected={connected} />
      
      {!question ? (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Loader2 className="w-16 h-16 animate-spin text-primary-400 mx-auto mb-4" />
            <p className="text-xl text-gray-400">Loading question...</p>
          </div>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto py-8">
          {/* Timer */}
          <div className="flex justify-center mb-8">
            <div className={`relative ${
              timer < 5 ? 'animate-pulse' : ''
            }`}>
              <div className={`text-7xl font-bold font-mono ${
                timer < 5 ? 'text-danger-500' : 'text-primary-400'
              }`}>
                {timer}
              </div>
              <div className="text-center text-sm text-gray-400 mt-2">seconds</div>
            </div>
          </div>

          {isLateJoiner && (
            <div className="flex justify-center mb-4">
              <div className="flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 px-4 py-2 rounded-full text-sm font-semibold">
                <span>🕐</span>
                <span>You joined late — your score will be marked accordingly on the leaderboard.</span>
              </div>
            </div>
          )}

          {/* Question */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-8 mb-8 text-center rounded-2xl"
            style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #EFF6FF 100%)', border: '2px solid #BFDBFE', boxShadow: '0 8px 24px rgba(59,130,246,0.15)' }}
          >
            <h2 className="text-3xl font-bold leading-relaxed" style={{ color: '#1E40AF' }}>{question.text}</h2>
          </motion.div>

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {question.options.map((option, index) => (
              <motion.button
                key={option.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleAnswer(option.id)}
                disabled={answered}
                style={{
                  ...getOptionStyle(option.id, index),
                  color: 'white',
                  padding: '2rem',
                  borderRadius: '1rem',
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  transition: 'all 0.3s',
                  transform: selectedOption === option.id && !feedback ? 'scale(1.05)' : 'scale(1)',
                  cursor: answered ? 'not-allowed' : 'pointer',
                  border: 'none'
                }}
                onMouseEnter={(e) => !answered && (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseLeave={(e) => !answered && selectedOption !== option.id && (e.currentTarget.style.transform = 'scale(1)')}
              >
                <div className="flex items-center justify-between">
                  <span className="flex-1 text-left">{option.text}</span>
                  {selectedOption === option.id && answered && !feedback && (
                    <Loader2 className="w-6 h-6 animate-spin ml-4" />
                  )}
                  {selectedOption === option.id && feedback && (
                    feedback.isCorrect ? (
                      <CheckCircle2 className="w-6 h-6 ml-4" />
                    ) : (
                      <XCircle className="w-6 h-6 ml-4" />
                    )
                  )}
                </div>
              </motion.button>
            ))}
          </div>

          {/* Feedback */}
          {feedback && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-8 text-center rounded-2xl"
              style={{
                background: feedback.isCorrect ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                border: `4px solid ${feedback.isCorrect ? '#10B981' : '#EF4444'}`,
                boxShadow: `0 8px 24px ${feedback.isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
              }}
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                {feedback.isCorrect ? (
                  <CheckCircle2 className="w-12 h-12" style={{ color: '#10B981' }} />
                ) : (
                  <XCircle className="w-12 h-12" style={{ color: '#EF4444' }} />
                )}
                <div className={`text-5xl font-bold`} style={{ color: feedback.isCorrect ? '#10B981' : '#EF4444' }}>
                  {feedback.isCorrect ? 'Correct!' : 'Wrong'}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-3xl font-bold" style={{ color: '#1E40AF' }}>+{feedback.pointsEarned} points</div>
                <div className="text-xl" style={{ color: '#1E3A8A' }}>Total: {feedback.totalScore} points</div>
                {feedback.streak > 1 && (
                  <div className="inline-block px-4 py-2 rounded-full text-sm font-semibold mt-2" style={{ background: '#F59E0B', color: 'white' }}>
                    🔥 {feedback.streak} streak!
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};
