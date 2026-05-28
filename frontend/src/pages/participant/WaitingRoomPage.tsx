import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useParticipantSocket } from '../../hooks/useParticipantSocket';
import { Users, Loader2 } from 'lucide-react';
import { ConnectionStatus } from '../../components/ConnectionStatus';

export const WaitingRoomPage = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const [participantCount, setParticipantCount] = useState(0);

  // Check if quiz is already active
  useEffect(() => {
    const checkSessionStatus = async () => {
      try {
        const response = await fetch(`/api/sessions/${roomCode}`);
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'ACTIVE') {
            navigate(`/play/question/${roomCode}`, { replace: true });
          } else {
            setParticipantCount(data.participantCount || 0);
          }
        }
      } catch (error) {
        // Silently handle error - session might not exist yet
      }
    };

    checkSessionStatus();
  }, [roomCode, navigate]);

  const handleMessage = (msg: any) => {
    console.log('Waiting room received message:', msg);
    if (msg.type === 'QUESTION_START') {
      navigate(`/play/question/${roomCode}`);
    }
    if (msg.type === 'JOINED') {
      setParticipantCount(prev => prev + 1);
    }
  };

  const { connected } = useParticipantSocket(roomCode!, handleMessage);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 50%, #c7cad1 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        width: '250px',
        height: '250px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'pulse 4s ease-in-out infinite'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '15%',
        right: '8%',
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'pulse 5s ease-in-out infinite 1s'
      }}></div>

      <ConnectionStatus connected={connected} />
      
      <div style={{
        textAlign: 'center',
        maxWidth: '52rem',
        width: '100%',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Header Section */}
        <div style={{
          background: 'rgba(173, 216, 230, 0.4)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(173, 216, 230, 0.5)',
          borderRadius: '1.25rem',
          padding: '1.5rem 1.5rem',
          marginBottom: '1.25rem',
          boxShadow: '0 15px 40px rgba(0,0,0,0.2)'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '3.5rem',
            height: '3.5rem',
            background: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '50%',
            marginBottom: '1rem',
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
            animation: 'float 3s ease-in-out infinite',
            border: '2px solid rgba(255,255,255,0.4)'
          }}>
            <Users style={{ width: '1.75rem', height: '1.75rem', color: '#000000' }} />
          </div>
          
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: '800',
            marginBottom: '0.5rem',
            color: '#000000',
            letterSpacing: '-0.02em',
            textShadow: '0 2px 10px rgba(0,0,0,0.2)'
          }}>Waiting Room</h1>
          
          <p style={{
            fontSize: '0.95rem',
            color: 'rgba(0,0,0,0.7)',
            fontWeight: '500'
          }}>Get ready! The quiz will start soon</p>
        </div>

        {/* Main Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          marginBottom: '1.25rem'
        }}>
          {/* Participant Count Card */}
          <div style={{
            background: 'rgba(255, 218, 185, 0.4)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 218, 185, 0.5)',
            padding: '1.25rem',
            borderRadius: '1rem',
            boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
          }}>
            <div style={{
              fontSize: '0.75rem',
              color: 'rgba(0,0,0,0.6)',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.75rem'
            }}>Participants</div>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: '900',
              color: '#000000',
              marginBottom: '0.25rem',
              textShadow: '0 0 25px rgba(0,0,0,0.3)'
            }}>{participantCount}</div>
            <div style={{
              fontSize: '0.75rem',
              color: 'rgba(0,0,0,0.7)',
              fontWeight: '500'
            }}>joined</div>
          </div>

          {/* Room Status Card */}
          <div style={{
            background: 'rgba(221, 160, 221, 0.4)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(221, 160, 221, 0.5)',
            padding: '1.25rem',
            borderRadius: '1rem',
            boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
          }}>
            <div style={{
              fontSize: '0.75rem',
              color: 'rgba(0,0,0,0.6)',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.75rem'
            }}>Status</div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginBottom: '0.25rem'
            }}>
              <div style={{
                width: '10px',
                height: '10px',
                background: '#10B981',
                borderRadius: '50%',
                animation: 'blink 2s ease-in-out infinite',
                boxShadow: '0 0 15px rgba(16,185,129,0.8)'
              }}></div>
              <div style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: '#000000'
              }}>Active</div>
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: 'rgba(0,0,0,0.7)',
              fontWeight: '500'
            }}>waiting</div>
          </div>

          {/* Room Code Card */}
          <div style={{
            background: 'rgba(152, 251, 152, 0.4)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(152, 251, 152, 0.5)',
            padding: '1.25rem',
            borderRadius: '1rem',
            boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
          }}>
            <div style={{
              fontSize: '0.75rem',
              color: 'rgba(0,0,0,0.6)',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.75rem'
            }}>Code</div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: '800',
              color: '#000000',
              marginBottom: '0.25rem',
              letterSpacing: '0.1em',
              fontFamily: 'monospace'
            }}>{roomCode}</div>
            <div style={{
              fontSize: '0.75rem',
              color: 'rgba(0,0,0,0.7)',
              fontWeight: '500'
            }}>session ID</div>
          </div>
        </div>

        {/* Loading Status Bar */}
        <div style={{
          background: 'rgba(255, 255, 224, 0.4)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 224, 0.5)',
          borderRadius: '1rem',
          padding: '1.25rem',
          boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            marginBottom: '1rem'
          }}>
            <Loader2 style={{ 
              width: '1.25rem', 
              height: '1.25rem', 
              animation: 'spin 1s linear infinite', 
              color: '#000000' 
            }} />
            <span style={{ 
              fontSize: '0.95rem', 
              fontWeight: '600', 
              color: '#000000' 
            }}>Preparing your experience...</span>
          </div>

          {/* Progress Dots */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.625rem'
          }}>
            <div style={{
              width: '0.625rem',
              height: '0.625rem',
              background: '#000000',
              borderRadius: '50%',
              animation: 'bounce 1.5s infinite',
              boxShadow: '0 0 12px rgba(0,0,0,0.4)'
            }}></div>
            <div style={{
              width: '0.625rem',
              height: '0.625rem',
              background: '#000000',
              borderRadius: '50%',
              animation: 'bounce 1.5s infinite 0.2s',
              boxShadow: '0 0 12px rgba(0,0,0,0.4)'
            }}></div>
            <div style={{
              width: '0.625rem',
              height: '0.625rem',
              background: '#000000',
              borderRadius: '50%',
              animation: 'bounce 1.5s infinite 0.4s',
              boxShadow: '0 0 12px rgba(0,0,0,0.4)'
            }}></div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(-12px); opacity: 0.7; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(5deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.08); opacity: 0.75; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};
