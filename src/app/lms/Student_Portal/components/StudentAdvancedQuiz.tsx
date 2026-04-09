'use client';

import { useState, useEffect } from 'react';
import { Loader2, CheckCircle, XCircle, Trophy } from 'lucide-react';
/* eslint-disable */
interface AdvancedQuestion {
  id: string;
  type: 'true_false' | 'fill_blanks';
  question: string;
  correctAnswer: number | string[];
  points: number;
}

interface AnswerResult {
  questionId: string;
  question: string;
  type: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  pointsEarned: number;
  totalPoints: number;
}

interface StudentAdvancedQuizProps {
  slideId: string;
  courseId: string;
  enrollmentId: string;
  studentEmail: string;
  onQuizComplete?: (score: number, totalPoints: number, passed: boolean) => void;
}

export default function StudentAdvancedQuiz({ 
  slideId, 
  courseId, 
  enrollmentId, 
  studentEmail,
  onQuizComplete 
}: StudentAdvancedQuizProps) {
  const [questions, setQuestions] = useState<AdvancedQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [quizResult, setQuizResult] = useState<{ 
    score: number; 
    total: number; 
    percentage: number;
    passed: boolean;
    answers: AnswerResult[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasLoadedResult, setHasLoadedResult] = useState(false);

  // Check if already attempted - Load existing result
  useEffect(() => {
    const checkExistingAttempt = async () => {
      if (!slideId || !studentEmail) return;
      
      try {
        const response = await fetch(`/api/students/advanced-quiz/check?slideId=${slideId}&studentEmail=${studentEmail}`);
        const result = await response.json();
        
        if (result.success && result.data && result.data.hasAttempted) {
          // Already attempted, show result directly
          setQuizResult({
            score: result.data.score,
            total: result.data.total,
            percentage: result.data.percentage,
            passed: result.data.passed,
            answers: result.data.answers
          });
          setHasLoadedResult(true);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('Error checking existing attempt:', error);
      }
      
      // If not attempted, load questions
      loadQuestions();
    };
    
    checkExistingAttempt();
  }, [slideId, studentEmail]);

  const loadQuestions = async () => {
    if (!slideId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/students/advanced-quiz?slideId=${slideId}`);
      const result = await response.json();
      
      if (result.success && result.data && Array.isArray(result.data)) {
        setQuestions(result.data);
        
        const initialAnswers: Record<string, any> = {};
        result.data.forEach((q: AdvancedQuestion) => {
          if (q.type === 'true_false') {
            initialAnswers[q.id] = null;
          } else if (q.type === 'fill_blanks') {
            const blankCount = Array.isArray(q.correctAnswer) ? q.correctAnswer.length : 1;
            initialAnswers[q.id] = Array(blankCount).fill('');
          }
        });
        setAnswers(initialAnswers);
      }
    } catch (error) {
      console.error('Error loading advanced quiz:', error);
      setError('Failed to load quiz questions');
    } finally {
      setLoading(false);
    }
  };

  const handleTrueFalseChange = (questionId: string, value: string) => {
    if (quizResult) return; // Don't allow changes after submission
    setAnswers(prev => ({
      ...prev,
      [questionId]: value === 'true' ? 0 : 1
    }));
  };

  const handleFillBlankChange = (questionId: string, blankIndex: number, value: string) => {
    if (quizResult) return; // Don't allow changes after submission
    setAnswers(prev => {
      const currentAnswers = prev[questionId] || [];
      const newAnswers = [...currentAnswers];
      newAnswers[blankIndex] = value;
      return {
        ...prev,
        [questionId]: newAnswers
      };
    });
  };

  const handleSubmit = async () => {
    if (questions.length === 0) {
      setError('No questions available');
      return;
    }

    if (quizResult) {
      return; // Already submitted
    }

    const allAnswered = questions.every(q => {
      const answer = answers[q.id];
      if (q.type === 'true_false') {
        return answer !== null && answer !== undefined;
      } else if (q.type === 'fill_blanks') {
        return Array.isArray(answer) && answer.length > 0 && answer.every(a => a && a.trim() !== '');
      }
      return false;
    });

    if (!allAnswered) {
      setError('Please answer all questions before submitting');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/students/advanced-quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slideId,
          courseId,
          enrollmentId,
          studentEmail,
          answers
        })
      });

      const result = await response.json();

      if (result.success) {
        setQuizResult({
          score: result.data.score,
          total: result.data.total,
          percentage: result.data.percentage,
          passed: result.data.passed,
          answers: result.data.answers
        });
        onQuizComplete?.(result.data.score, result.data.total, result.data.passed);
      } else {
        setError(result.error || 'Failed to submit quiz');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      setError('Failed to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-red-600" />
        <p className="text-sm text-gray-500 mt-2">Loading quiz...</p>
      </div>
    );
  }

  // If already attempted, show result directly
  if (quizResult) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className={`text-center p-6 rounded-lg mb-6 ${quizResult.passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          {quizResult.passed ? (
            <Trophy className="w-12 h-12 text-green-600 mx-auto mb-3" />
          ) : (
            <XCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
          )}
          <h3 className={`text-xl font-semibold mb-2 ${quizResult.passed ? 'text-green-700' : 'text-red-700'}`}>
            {quizResult.passed ? 'Congratulations! Quiz Passed!' : 'Quiz Failed'}
          </h3>
          <p className="text-3xl font-bold text-gray-800 mb-2">
            {quizResult.score} / {quizResult.total}
          </p>
          <p className="text-gray-600">
            Score: {quizResult.percentage}% {quizResult.passed ? '✅' : '❌'}
          </p>
          
          <div className="mt-4 max-w-md mx-auto">
            <div className="flex justify-between text-sm mb-1">
              <span>Your Score</span>
              <span>{quizResult.percentage}%</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  quizResult.passed ? 'bg-green-600' : 'bg-red-600'
                }`}
                style={{ width: `${quizResult.percentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Passing score: 70%
            </p>
          </div>
        </div>

        <h4 className="font-semibold text-gray-800 mb-3">Detailed Results</h4>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {quizResult.answers.map((ans, idx) => (
            <div key={idx} className={`border rounded-lg p-3 ${ans.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${ans.isCorrect ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'}`}>
                      {ans.isCorrect ? '✓ Correct' : '✗ Wrong'}
                    </span>
                    <span className="text-xs text-gray-500">({ans.pointsEarned}/{ans.totalPoints} points)</span>
                  </div>
                  <p className="text-sm font-medium text-gray-800">{idx + 1}. {ans.question}</p>
                  <div className="mt-2 text-sm">
                    <p><span className="text-gray-500">Your answer:</span> <span className={ans.isCorrect ? 'text-green-700' : 'text-red-700'}>{ans.userAnswer || '(Not answered)'}</span></p>
                    {!ans.isCorrect && (
                      <p><span className="text-gray-500">Correct answer:</span> <span className="text-green-700">{ans.correctAnswer}</span></p>
                    )}
                  </div>
                </div>
                <div>
                  {ans.isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return null;
  }

  // Show quiz form
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Advanced Quiz (True/False & Fill in Blanks)</h3>
      <p className="text-sm text-gray-500 mb-4">Total Questions: {questions.length} | Total Points: {questions.reduce((sum, q) => sum + (q.points || 1), 0)}</p>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-6 max-h-96 overflow-y-auto">
        {questions.map((q, qIndex) => (
          <div key={q.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-2 mb-3">
              <span className="font-medium text-gray-700">{qIndex + 1}.</span>
              <span className="text-sm text-gray-800">{q.question}</span>
              <span className="text-xs text-gray-400 ml-auto">({q.points || 1} point{(q.points || 1) > 1 ? 's' : ''})</span>
            </div>

            {q.type === 'true_false' && (
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`q_${q.id}`}
                    value="true"
                    checked={answers[q.id] === 0}
                    onChange={(e) => handleTrueFalseChange(q.id, e.target.value)}
                    className="w-4 h-4 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm">True</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`q_${q.id}`}
                    value="false"
                    checked={answers[q.id] === 1}
                    onChange={(e) => handleTrueFalseChange(q.id, e.target.value)}
                    className="w-4 h-4 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm">False</span>
                </label>
              </div>
            )}

            {q.type === 'fill_blanks' && (
              <div className="space-y-3 mt-2">
                {Array.isArray(q.correctAnswer) && q.correctAnswer.map((_, blankIdx) => (
                  <div key={blankIdx} className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500 w-8">
                      {blankIdx + 1}.
                    </span>
                    <input
                      type="text"
                      value={answers[q.id]?.[blankIdx] || ''}
                      onChange={(e) => handleFillBlankChange(q.id, blankIdx, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                      placeholder={`Answer for blank ${blankIdx + 1}`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="mt-6 w-full py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Quiz'
        )}
      </button>
    </div>
  );
}