import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Trophy, Share2, RotateCcw, Award, Target, TrendingUp, Crown, Home } from 'lucide-react';

interface ResultData {
  rank: number;
  score: number;
  totalScore: number;
  accuracy: number;
  correctAnswers: number;
  totalQuestions: number;
}

export const ResultsPage = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (result && result.rank <= 3) {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
      });
    }
  }, [result]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const participantId = sessionStorage.getItem('participantId');
        if (!participantId) {
          console.error('No participant ID found');
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/sessions/${roomCode}/results?participantId=${participantId}`);
        if (!response.ok) {
          console.error('Failed to fetch results');
          setLoading(false);
          return;
        }

        const data = await response.json();
        setResult({
          rank: data.rank || 0,
          score: data.score || 0,
          totalScore: data.totalScore || 0,
          accuracy: data.accuracy || 0,
          correctAnswers: data.correctAnswers || 0,
          totalQuestions: data.totalQuestions || 0,
        });
      } catch (error) {
        console.error('Error fetching results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [roomCode]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'QuizLive Results',
        text: `I scored ${result?.score} points and ranked #${result?.rank}! 🏆`,
        url: window.location.href,
      });
    }
  };

  const getRankInfo = (rank: number) => {
    if (rank === 1) return { icon: Crown, text: 'Champion!', emoji: '🏆', gradient: 'from-yellow-400 to-yellow-600' };
    if (rank === 2) return { icon: Trophy, text: 'Runner-up!', emoji: '🥈', gradient: 'from-gray-300 to-gray-500' };
    if (rank === 3) return { icon: Award, text: 'Third Place!', emoji: '🥉', gradient: 'from-orange-400 to-orange-600' };
    return { icon: Award, text: 'Great Job!', emoji: '🎉', gradient: 'from-blue-500 to-blue-700' };
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #EFF6FF 0%, #F3F4F6 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', color: '#1f2937' }}>
          <div style={{
            width: '4rem',
            height: '4rem',
            border: '4px solid #3b82f6',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ fontSize: '1.25rem', fontWeight: '600' }}>Loading results...</p>
        </div>
        <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
      </div>
    );
  }

  if (!result) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #EFF6FF 0%, #F3F4F6 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '1.5rem',
          padding: '3rem',
          textAlign: 'center',
          maxWidth: '28rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
        }}>
          <p style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '1.5rem' }}>
            No results found
          </p>
          <button
            onClick={() => navigate('/join')}
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: 'white',
              fontWeight: '600',
              padding: '0.75rem 2rem',
              borderRadius: '0.75rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(59,130,246,0.3)'
            }}
          >
            Join Another Quiz
          </button>
        </div>
      </div>
    );
  }

  const rankInfo = getRankInfo(result.rank);
  const RankIcon = rankInfo.icon;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)',
      padding: '1.5rem 1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ maxWidth: '48rem', width: '100%' }}>
        {/* Rank Badge - Always show for top 3 */}
        {result.rank <= 3 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            style={{ textAlign: 'center', marginBottom: '1.25rem' }}
          >
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '7rem',
              height: '7rem',
              background: result.rank === 1 ? 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)' : 
                          result.rank === 2 ? 'linear-gradient(135deg, #D1D5DB 0%, #9CA3AF 100%)' :
                          'linear-gradient(135deg, #FDBA74 0%, #F97316 100%)',
              borderRadius: '50%',
              marginBottom: '1rem',
              boxShadow: '0 15px 30px rgba(0,0,0,0.2)',
              animation: 'float 3s ease-in-out infinite'
            }}>
              <RankIcon style={{ width: '3.5rem', height: '3.5rem', color: 'white' }} />
            </div>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '800',
              color: '#881337',
              marginBottom: '0',
              fontFamily: 'Poppins, sans-serif'
            }}>
              {rankInfo.emoji} {rankInfo.text}
            </h1>
          </motion.div>
        )}

        {/* For rank > 3, show a congratulations message */}
        {result.rank > 3 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            style={{ textAlign: 'center', marginBottom: '1.25rem' }}
          >
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '7rem',
              height: '7rem',
              background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
              borderRadius: '50%',
              marginBottom: '1rem',
              boxShadow: '0 15px 30px rgba(139,92,246,0.3)',
              animation: 'float 3s ease-in-out infinite'
            }}>
              <RankIcon style={{ width: '3.5rem', height: '3.5rem', color: 'white' }} />
            </div>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '800',
              color: '#881337',
              marginBottom: '0',
              fontFamily: 'Poppins, sans-serif'
            }}>
              {rankInfo.emoji} {rankInfo.text}
            </h1>
          </motion.div>
        )}

        {/* Score Card */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{
            background: 'white',
            borderRadius: '1.25rem',
            padding: '1.5rem',
            boxShadow: '0 8px 24px rgba(244,63,94,0.15)',
            border: '2px solid #FECDD3'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <div style={{
              fontSize: '3rem',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #F43F5E 0%, #EC4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '0.25rem'
            }}>{result.score}</div>
            <div style={{ color: '#9F1239', fontSize: '0.875rem', fontWeight: '600' }}>Total Score</div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.625rem',
            marginBottom: '1.25rem'
          }}>
            <div style={{
              textAlign: 'center',
              padding: '0.875rem',
              background: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)',
              borderRadius: '0.625rem',
              border: '2px solid #93C5FD'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', marginBottom: '0.375rem' }}>
                <Trophy style={{ width: '0.875rem', height: '0.875rem', color: '#1E40AF' }} />
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1E40AF' }}>#{result.rank}</div>
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#6B7280', fontWeight: '600' }}>Rank</div>
            </div>
            <div style={{
              textAlign: 'center',
              padding: '0.875rem',
              background: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
              borderRadius: '0.625rem',
              border: '2px solid #6EE7B7'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', marginBottom: '0.375rem' }}>
                <Target style={{ width: '0.875rem', height: '0.875rem', color: '#047857' }} />
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#047857' }}>{result.accuracy}%</div>
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#6B7280', fontWeight: '600' }}>Accuracy</div>
            </div>
            <div style={{
              textAlign: 'center',
              padding: '0.875rem',
              background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
              borderRadius: '0.625rem',
              border: '2px solid #FCD34D'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', marginBottom: '0.375rem' }}>
                <TrendingUp style={{ width: '0.875rem', height: '0.875rem', color: '#B45309' }} />
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#B45309' }}>
                  {result.correctAnswers}/{result.totalQuestions}
                </div>
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#6B7280', fontWeight: '600' }}>Correct</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.625rem' }}>
            <button
              onClick={() => navigate('/participant/dashboard')}
              style={{
                flex: 1,
                background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
                color: 'white',
                fontWeight: '600',
                padding: '0.625rem',
                borderRadius: '0.625rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.375rem',
                fontSize: '0.8125rem',
                boxShadow: '0 4px 12px rgba(139,92,246,0.3)'
              }}
            >
              <Home style={{ width: '0.875rem', height: '0.875rem' }} />
              <span>Dashboard</span>
            </button>
            <button
              onClick={handleShare}
              style={{
                flex: 1,
                background: 'white',
                color: '#F43F5E',
                fontWeight: '600',
                padding: '0.625rem',
                borderRadius: '0.625rem',
                border: '2px solid #F43F5E',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.375rem',
                fontSize: '0.8125rem'
              }}
            >
              <Share2 style={{ width: '0.875rem', height: '0.875rem' }} />
              <span>Share</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
