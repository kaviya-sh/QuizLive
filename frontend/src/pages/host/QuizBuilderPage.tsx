import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { quizApi, CreateQuizRequest, QuestionRequest, OptionRequest } from '../../api/quizApi';
import { Plus, Trash2, Save, ArrowLeft, Clock, Award, CheckCircle2, Circle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';

export const QuizBuilderPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, accessToken } = useAuthStore();
  const { success, error } = useNotificationStore();
  const isEditMode = !!id;
  const [quiz, setQuiz] = useState<CreateQuizRequest>({
    title: '',
    description: '',
    category: '',
    questions: [],
  });
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditMode);
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    questions?: { [key: number]: { text?: string; options?: string; correctAnswer?: string } };
  }>({});

  useEffect(() => {
    if (isEditMode) {
      loadQuiz();
    }
  }, [id]);

  const loadQuiz = async () => {
    try {
      const { data } = await quizApi.getQuiz(id!);
      setQuiz({
        title: data.title,
        description: data.description || '',
        category: data.category || '',
        questions: data.questions || [],
      });
    } catch (err) {
      error('Failed to load quiz');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    const newQuestion: QuestionRequest = {
      type: 'MCQ',
      text: '',
      timeLimitSeconds: 30,
      points: 100,
      speedBonusEnabled: true,
      orderIndex: quiz.questions?.length || 0,
      options: [
        { text: '', isCorrect: false, orderIndex: 0 },
        { text: '', isCorrect: false, orderIndex: 1 },
        { text: '', isCorrect: false, orderIndex: 2 },
        { text: '', isCorrect: false, orderIndex: 3 },
      ],
    };
    setQuiz({ ...quiz, questions: [...(quiz.questions || []), newQuestion] });
    setSelectedQuestionIndex((quiz.questions?.length || 0));
  };

  const updateQuestion = (index: number, updates: Partial<QuestionRequest>) => {
    const questions = [...(quiz.questions || [])];
    questions[index] = { ...questions[index], ...updates };
    setQuiz({ ...quiz, questions });
  };

  const updateOption = (questionIndex: number, optionIndex: number, updates: Partial<OptionRequest>) => {
    const questions = [...(quiz.questions || [])];
    const options = [...(questions[questionIndex].options || [])];
    options[optionIndex] = { ...options[optionIndex], ...updates };
    questions[questionIndex] = { ...questions[questionIndex], options };
    setQuiz({ ...quiz, questions });
  };

  const deleteQuestion = (index: number) => {
    const questions = quiz.questions?.filter((_, i) => i !== index) || [];
    setQuiz({ ...quiz, questions });
    setSelectedQuestionIndex(null);
  };

  const handleSave = async () => {
    // Clear previous errors
    setErrors({});
    const newErrors: typeof errors = {};

    // Check authentication
    if (!user || !accessToken) {
      error('Please log in to save the quiz');
      navigate('/login');
      return;
    }

    if (!quiz.title.trim()) {
      newErrors.title = 'Please enter a quiz title';
      error('Please enter a quiz title');
    }

    if (!quiz.description?.trim()) {
      newErrors.description = 'Please enter a quiz description';
      error('Please enter a quiz description');
    }

    if (!quiz.questions || quiz.questions.length === 0) {
      error('Please add at least one question');
      setErrors(newErrors);
      return;
    }

    // Validate each question
    const questionErrors: { [key: number]: { text?: string; options?: string; correctAnswer?: string } } = {};
    for (let i = 0; i < quiz.questions.length; i++) {
      const question = quiz.questions[i];
      
      if (!question.text.trim()) {
        questionErrors[i] = { ...questionErrors[i], text: 'Please enter the question text' };
        error(`Question ${i + 1}: Please enter the question text`);
      }

      const filledOptions = question.options?.filter(opt => opt.text.trim()) || [];
      if (filledOptions.length < 2) {
        questionErrors[i] = { ...questionErrors[i], options: 'Please provide at least two answer options' };
        error(`Question ${i + 1}: Please provide at least two answer options`);
      }

      const hasCorrectAnswer = question.options?.some(opt => opt.isCorrect) || false;
      if (!hasCorrectAnswer) {
        questionErrors[i] = { ...questionErrors[i], correctAnswer: 'Please mark one option as the correct answer' };
        error(`Question ${i + 1}: Please mark one option as the correct answer`);
      }
    }

    if (Object.keys(questionErrors).length > 0) {
      newErrors.questions = questionErrors;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      if (isEditMode) {
        await quizApi.updateQuiz(id!, quiz);
        success('Quiz updated successfully!');
      } else {
        await quizApi.createQuiz(quiz);
        success('Quiz created successfully!');
      }
      navigate('/dashboard');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to save quiz';
      error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const selectedQuestion = selectedQuestionIndex !== null ? quiz.questions?.[selectedQuestionIndex] : null;

  // Check if current question is valid for enabling save button
  const isCurrentQuestionValid = () => {
    if (!selectedQuestion) return false;
    
    const hasQuestionText = selectedQuestion.text.trim().length > 0;
    const filledOptions = selectedQuestion.options?.filter(opt => opt.text.trim()) || [];
    const hasTwoOptions = filledOptions.length >= 2;
    
    return hasQuestionText && hasTwoOptions;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-3">
                <img src="/image/image.png" alt="Logo" className="w-9 h-9 object-contain" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{isEditMode ? 'Edit Quiz' : 'Create New Quiz'}</h1>
                  <p className="text-xs text-gray-500">Build engaging quizzes for your audience</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Top Row - Quiz Details and Questions List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Quiz Details Section */}
          <div className="h-full">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm p-6 border border-blue-200 h-full">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Quiz Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Quiz Title *</label>
                  <input
                    type="text"
                    value={quiz.title}
                    onChange={(e) => {
                      setQuiz({ ...quiz, title: e.target.value });
                      if (errors.title) setErrors({ ...errors, title: undefined });
                    }}
                    placeholder="Enter quiz title"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-sm text-gray-900 bg-white ${
                      errors.title ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  />
                  {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Description *</label>
                  <textarea
                    value={quiz.description || ''}
                    onChange={(e) => {
                      setQuiz({ ...quiz, description: e.target.value });
                      if (errors.description) setErrors({ ...errors, description: undefined });
                    }}
                    placeholder="Brief description"
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent resize-none text-sm text-gray-900 bg-white ${
                      errors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  />
                  {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Category</label>
                  <input
                    type="text"
                    value={quiz.category || ''}
                    onChange={(e) => setQuiz({ ...quiz, category: e.target.value })}
                    placeholder="e.g., Science"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Questions List */}
          <div className="h-full">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-sm p-6 border border-purple-200 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Questions ({quiz.questions?.length || 0})</h2>
                <button
                  onClick={addQuestion}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-1.5 px-3 rounded-lg transition-all shadow-sm hover:shadow-md flex items-center gap-1.5 text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>
              <div className="space-y-2 overflow-y-auto flex-1">
                {quiz.questions?.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Plus className="w-6 h-6 text-purple-600" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700">No questions yet</p>
                    <p className="text-xs text-gray-500 mt-1">Click Add to create</p>
                  </div>
                ) : (
                  quiz.questions?.map((q, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedQuestionIndex(index)}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 group border ${
                        selectedQuestionIndex === index
                          ? 'bg-white border-purple-400 shadow-md'
                          : 'bg-white/60 hover:bg-white border-transparent hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className={`text-xs font-bold mb-1 ${
                            selectedQuestionIndex === index ? 'text-purple-600' : 'text-gray-500'
                          }`}>
                            Q{index + 1}
                          </div>
                          <div className="text-xs font-medium text-gray-700 line-clamp-2">
                            {q.text || 'Empty question'}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteQuestion(index);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-red-500 hover:bg-red-50 rounded transition-all flex-shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row - Question Editor (Full Width) */}
        <div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-sm border border-green-200 p-6 min-h-[400px]">
            {selectedQuestion ? (
              <div className="space-y-4">
                {/* Question Text with Save Button */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-bold text-gray-900">
                      Question {selectedQuestionIndex! + 1}
                    </label>
                    <button
                      onClick={handleSave}
                      disabled={saving || !isCurrentQuestionValid()}
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-2 px-4 rounded-lg transition-all shadow-sm hover:shadow-md inline-flex items-center gap-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'Saving...' : isEditMode ? 'Update Quiz' : 'Save Quiz'}
                    </button>
                  </div>
                  <textarea
                    value={selectedQuestion.text}
                    onChange={(e) => {
                      updateQuestion(selectedQuestionIndex!, { text: e.target.value });
                      if (errors.questions?.[selectedQuestionIndex!]?.text) {
                        const newErrors = { ...errors };
                        if (newErrors.questions) {
                          delete newErrors.questions[selectedQuestionIndex!].text;
                          if (Object.keys(newErrors.questions[selectedQuestionIndex!]).length === 0) {
                            delete newErrors.questions[selectedQuestionIndex!];
                          }
                        }
                        setErrors(newErrors);
                      }
                    }}
                    placeholder="Type your question here..."
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent resize-none text-sm text-gray-900 bg-white ${
                      errors.questions?.[selectedQuestionIndex!]?.text ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                    }`}
                  />
                  {errors.questions?.[selectedQuestionIndex!]?.text && (
                    <p className="text-xs text-red-600 mt-1">{errors.questions[selectedQuestionIndex!].text}</p>
                  )}
                </div>

                {/* Settings and Answer Options in 2 columns */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Settings */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-3">Settings</h3>
                    <div className="space-y-3">
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <label className="text-xs font-semibold text-gray-700">Time Limit</label>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                          <input
                            type="number"
                            value={selectedQuestion.timeLimitSeconds}
                            onChange={(e) => updateQuestion(selectedQuestionIndex!, { timeLimitSeconds: parseInt(e.target.value) })}
                            className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
                            min="5"
                            max="300"
                          />
                          <span className="text-xs text-gray-600">seconds</span>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Award className="w-4 h-4 text-green-600" />
                          <label className="text-xs font-semibold text-gray-700">Points</label>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                          <input
                            type="number"
                            value={selectedQuestion.points}
                            onChange={(e) => updateQuestion(selectedQuestionIndex!, { points: parseInt(e.target.value) })}
                            className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-sm text-gray-900"
                            min="10"
                            max="1000"
                            step="10"
                          />
                          <span className="text-xs text-gray-600">points</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Answer Options */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-3">Answer Options</h3>
                    <div className="space-y-2">
                      {selectedQuestion.options?.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const questions = [...(quiz.questions || [])];
                              const options = [...(questions[selectedQuestionIndex!].options || [])];
                              options.forEach((opt, i) => {
                                opt.isCorrect = i === optionIndex;
                              });
                              questions[selectedQuestionIndex!] = { ...questions[selectedQuestionIndex!], options };
                              setQuiz({ ...quiz, questions });
                            }}
                            className="flex-shrink-0"
                          >
                            {option.isCorrect ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-400 hover:text-gray-500" />
                            )}
                          </button>
                          <div className="flex-1 relative">
                            <input
                              type="text"
                              value={option.text}
                              onChange={(e) => updateOption(selectedQuestionIndex!, optionIndex, { text: e.target.value })}
                              placeholder={`Option ${optionIndex + 1}`}
                              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all text-sm ${
                                option.isCorrect 
                                  ? 'border-green-400 bg-green-50 focus:ring-green-500 text-gray-900 font-medium' 
                                  : 'border-gray-300 bg-white focus:ring-green-500 text-gray-900'
                              }`}
                            />
                            {option.isCorrect && (
                              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <span className="text-xs font-bold text-green-700 bg-green-200 px-2 py-0.5 rounded-full">
                                  ✓
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {errors.questions?.[selectedQuestionIndex!]?.options && (
                      <p className="text-xs text-red-600 mt-2">{errors.questions[selectedQuestionIndex!].options}</p>
                    )}
                    {errors.questions?.[selectedQuestionIndex!]?.correctAnswer && (
                      <p className="text-xs text-red-600 mt-2">{errors.questions[selectedQuestionIndex!].correctAnswer}</p>
                    )}
                    <p className="text-xs text-gray-600 mt-3 flex items-center gap-1.5 bg-white/50 px-3 py-2 rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                      Click circle to mark correct answer
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center flex items-center justify-center min-h-[400px]">
                <div>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Plus className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">No Question Selected</h3>
                  <p className="text-xs text-gray-600 mb-4">Select a question or create new</p>
                  <button
                    onClick={addQuestion}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-2 px-4 rounded-lg transition-all shadow-sm hover:shadow-md inline-flex items-center gap-1.5 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Create Question
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
