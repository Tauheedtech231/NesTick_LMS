// app/lms/Student_Portal/mock-quizzes/[id]/result/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  HiArrowLeft,
  HiCheckCircle,
  HiXCircle,
  HiClock,
  HiChartBar,
  HiDocumentText,
  HiCalendar,
  HiUser,
  HiBookOpen,
  HiRefresh
} from 'react-icons/hi';
/* eslint-disable */
const BRAND_COLORS = {
  darkNavy: '#0B1C3D',
  darkRoyalBlue: '#1E3A8A',
  deepRed: '#B11217',
  white: '#FFFFFF',
  lightGrey: '#F4F6F8',
  softGrey: '#E5E7EB',
  darkGrey: '#1F2933',
  teal: '#1FB6CB',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444'
};

interface QuizResult {
  id: string;
  quizId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  isPassed: boolean;
  timeSpent: number;
  submittedAt: string;
  answers: Array<{
    questionId: string;
    selectedOption: number;
    isCorrect: boolean;
    pointsEarned: number;
  }>;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  course: string;
  instructorName: string;
  passingScore: number;
  timeLimit: number;
}

export default function QuizResultPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;

  const [result, setResult] = useState<QuizResult | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

  useEffect(() => {
    const loadData = () => {
      try {
        // Load the latest result for this quiz
        const allResults = JSON.parse(localStorage.getItem('student_quiz_results') || '[]');
        
        // Find the most recent result for this quiz
        const userStr = localStorage.getItem('currentUser');
        const user = userStr ? JSON.parse(userStr) : null;
        
        const userResults = allResults.filter((r: QuizResult) => 
          r.quizId === quizId && 
          (r.studentId === user?.id || r.studentId === user?.learnerId || r.studentEmail === user?.email)
        );
        
        if (userResults.length > 0) {
          // Get the most recent result
          const latestResult = userResults.sort((a: QuizResult, b: QuizResult) => 
            new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
          )[0];
          
          setResult(latestResult);
          
          // Load quiz details
          const allQuizzes = JSON.parse(localStorage.getItem('instructor_quizzes') || '[]');
          const foundQuiz = allQuizzes.find((q: any) => q.id === quizId);
          
          if (foundQuiz) {
            const allInstructors = JSON.parse(localStorage.getItem('lms_instructors') || '[]');
            const instructor = allInstructors.find((inst: any) => 
              inst.id === foundQuiz.instructorId
            ) || { name: foundQuiz.instructorName || 'Instructor' };

            setQuiz({
              id: foundQuiz.id,
              title: foundQuiz.title,
              description: foundQuiz.description || '',
              course: foundQuiz.courseTitle || 'Course',
              instructorName: instructor.name,
              passingScore: foundQuiz.passingScore || 70,
              timeLimit: foundQuiz.timeLimit || 30
            });
          }
        }
      } catch (error) {
        console.error('Error loading quiz result:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [quizId]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleQuestionExpansion = (index: number) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-100 rounded-lg mb-6"></div>
          <div className="h-96 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!result || !quiz) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="text-center py-12">
          <HiDocumentText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold mb-2">Result Not Found</h1>
          <p className="text-gray-600 mb-6">No quiz result found. Please complete the quiz first.</p>
          <Link
            href={`/lms/Student_Portal/mock-quizzes/${quizId}`}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-white mr-3"
            style={{ backgroundColor: BRAND_COLORS.deepRed }}
          >
            <HiArrowLeft className="w-4 h-4" />
            Back to Quiz
          </Link>
          <Link
            href="/lms/Student_Portal/mock-quizzes"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-gray-700 border border-gray-300 hover:bg-gray-50"
          >
            View All Quizzes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                href="/lms/Student_Portal/mock-quizzes"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <HiArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back to Quizzes</span>
              </Link>
              <div>
                <h1 className="text-lg font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
                  Quiz Results: {quiz.title}
                </h1>
                <p className="text-sm text-gray-600">{quiz.course}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className={`px-3 py-1.5 rounded-full font-medium ${
                result.isPassed 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {result.isPassed ? 'Passed' : 'Failed'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 lg:p-6">
        {/* Result Summary Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Score Circle */}
            <div className="flex flex-col items-center lg:w-1/3">
              <div className="relative w-48 h-48 mb-4">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="8"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={result.isPassed ? BRAND_COLORS.success : BRAND_COLORS.danger}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - result.score / 100)}`}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-4xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
                    {result.score}%
                  </div>
                  <div className="text-sm text-gray-600">Final Score</div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold mb-1" style={{ color: result.isPassed ? BRAND_COLORS.success : BRAND_COLORS.danger }}>
                  {result.isPassed ? 'Congratulations!' : 'Keep Practicing!'}
                </div>
                <p className="text-gray-600 mb-4">
                  Passing Score: {quiz.passingScore}%
                </p>
              </div>
            </div>
            
            {/* Stats Grid */}
            <div className="lg:w-2/3">
              <h3 className="text-lg font-bold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
                Performance Summary
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <HiCheckCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Correct Answers</div>
                      <div className="text-2xl font-bold">{result.correctAnswers}/{result.totalQuestions}</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full"
                      style={{ 
                        width: `${(result.correctAnswers / result.totalQuestions) * 100}%`,
                        backgroundColor: BRAND_COLORS.success
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-purple-100">
                      <HiChartBar className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Accuracy</div>
                      <div className="text-2xl font-bold">{Math.round((result.correctAnswers / result.totalQuestions) * 100)}%</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full"
                      style={{ 
                        width: `${(result.correctAnswers / result.totalQuestions) * 100}%`,
                        backgroundColor: '#8B5CF6'
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-yellow-100">
                      <HiClock className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Time Spent</div>
                      <div className="text-2xl font-bold">{formatTime(result.timeSpent)}</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    out of {quiz.timeLimit} minutes limit
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-green-100">
                      <HiCalendar className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Submitted On</div>
                      <div className="text-lg font-medium">{formatDate(result.submittedAt)}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="font-medium mb-1">Instructor</div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <HiUser className="w-4 h-4" />
                      {quiz.instructorName}
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Link
                      href={`/lms/Student_Portal/mock-quizzes/${quizId}`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white"
                      style={{ backgroundColor: BRAND_COLORS.deepRed }}
                    >
                      <HiRefresh className="w-4 h-4" />
                      Retake Quiz
                    </Link>
                    <Link
                      href="/lms/Student_Portal/mock-quizzes"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-gray-700 border border-gray-300 hover:bg-gray-50"
                    >
                      <HiBookOpen className="w-4 h-4" />
                      More Quizzes
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Detailed Results */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
            Detailed Review
          </h3>
          
          <div className="space-y-4">
            {result.answers.map((answer, index) => {
              const isExpanded = expandedQuestions.has(index);
              
              return (
                <div 
                  key={index} 
                  className={`border rounded-lg overflow-hidden transition-all ${
                    answer.isCorrect 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <button
                    onClick={() => toggleQuestionExpansion(index)}
                    className="w-full text-left p-4 flex items-center justify-between hover:bg-opacity-80"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        answer.isCorrect 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {answer.isCorrect ? (
                          <HiCheckCircle className="w-5 h-5" />
                        ) : (
                          <HiXCircle className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">Question {index + 1}</div>
                        <div className="text-sm text-gray-600">
                          {answer.isCorrect ? 'Correct' : 'Incorrect'} • {answer.pointsEarned} point{answer.pointsEarned !== 1 ? 's' : ''} earned
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {isExpanded ? 'Hide Details' : 'Show Details'}
                    </div>
                  </button>
                  
                  {isExpanded && (
                    <div className="p-4 border-t border-gray-200 bg-white">
                      <div className="text-sm text-gray-600 mb-3">
                        {/* Here you would show question details if available */}
                        Selected option: {answer.selectedOption !== -1 ? `Option ${String.fromCharCode(65 + answer.selectedOption)}` : 'Not answered'}
                      </div>
                      <div className="text-xs text-gray-500">
                        Question ID: {answer.questionId}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <HiChartBar className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-medium text-blue-900">Performance Insights</div>
                <div className="text-sm text-blue-700">
                  {result.score >= 90 ? 'Excellent work! You have mastered this topic.' :
                   result.score >= 75 ? 'Good job! You have a solid understanding.' :
                   result.score >= 60 ? 'You passed! Review the incorrect answers to improve.' :
                   'Keep practicing! Focus on the areas where you made mistakes.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}