import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { sessionApi } from '../../api/sessionApi';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export const CreateSessionPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const quizId = searchParams.get('quizId');

  useEffect(() => {
    if (!quizId) {
      toast.error('Quiz ID is required');
      navigate('/dashboard');
      return;
    }

    createSession();
  }, [quizId]);

  const createSession = async () => {
    try {
      console.log('Creating session for quiz:', quizId);
      const { data } = await sessionApi.createSession({ quizId: quizId! });
      console.log('Session created:', data);
      toast.success('Session created!');
      navigate(`/host/session/${data.roomCode}`);
    } catch (error: any) {
      console.error('Failed to create session:', error);
      toast.error(error.response?.data?.message || 'Failed to create session');
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      <div className="text-center bg-blue-50 rounded-2xl shadow-xl p-12 border border-indigo-700">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-900 font-semibold text-lg">Creating session...</p>
      </div>
    </div>
  );
};
