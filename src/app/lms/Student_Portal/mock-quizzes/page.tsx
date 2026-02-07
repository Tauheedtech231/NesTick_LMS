// app/mock-quizzes/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  HiSearch, 
  HiFilter, 
  HiBookOpen, 
  HiClock, 
  HiCheckCircle, 
  HiXCircle,
  HiPlay,
  HiChartBar
} from 'react-icons/hi';
import QuizBlock from '../components/QuizBlock';

type Quiz = {
  id: string;
  title: string;
  description: string;
  course: string;
  questions: Question[];
  passingScore: number;
  studentScore?: number;
  isPassed: boolean;
  attempts: number;
  timeLimit: number;
};

type Question = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

type QuizResult = {
  quizId: string;
  score: number;
  isPassed: boolean;
  attempts: number;
  lastAttempt: string;
};

export default function MockQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([
    {
      id: 'quiz-1',
      title: 'Pipe Fitting Fundamentals',
      description: 'Test your basic knowledge of pipe fitting concepts',
      course: 'Industrial Pipe Fitting',
      questions: [
        {
          id: 'q1',
          question: 'What is the purpose of pipe threading?',
          options: [
            'To decorate the pipe',
            'To create leak-proof connections',
            'To increase pipe diameter',
            'To reduce pipe weight'
          ],
          correctAnswer: 1,
          explanation: 'Threading creates leak-proof connections between pipes'
        },
        {
          id: 'q2',
          question: 'Which tool is used for precise pipe cutting?',
          options: [
            'Hacksaw',
            'Pipe Cutter',
            'Angle Grinder',
            'All of the above'
          ],
          correctAnswer: 1,
          explanation: 'Pipe cutter provides the most precise cuts'
        }
      ],
      passingScore: 70,
      studentScore: 85,
      isPassed: true,
      attempts: 2,
      timeLimit: 30
    },
    {
      id: 'quiz-2',
      title: 'Welding Safety Quiz',
      description: 'Test your knowledge of welding safety procedures',
      course: 'Professional Welding',
      questions: [
        {
          id: 'q1',
          question: 'What type of helmet is required for welding?',
          options: [
            'Regular safety glasses',
            'Auto-darkening welding helmet',
            'Sunglasses',
            'Face shield only'
          ],
          correctAnswer: 1,
          explanation: 'Auto-darkening welding helmet protects eyes from arc flash'
        }
      ],
      passingScore: 70,
      studentScore: 78,
      isPassed: true,
      attempts: 1,
      timeLimit: 20
    },
    {
      id: 'quiz-3',
      title: 'OSHA Regulations',
      description: 'Test your knowledge of OSHA safety regulations',
      course: 'Safety Inspector Certification',
      questions: [
        {
          id: 'q1',
          question: 'What does OSHA stand for?',
          options: [
            'Occupational Safety and Health Administration',
            'Operational Safety and Health Authority',
            'Organization for Safety and Health Advancement',
            'Official Safety and Health Association'
          ],
          correctAnswer: 0,
          explanation: 'OSHA stands for Occupational Safety and Health Administration'
        }
      ],
      passingScore: 70,
      studentScore: 92,
      isPassed: true,
      attempts: 1,
      timeLimit: 25
    },
    {
      id: 'practice-1',
      title: 'Pipe Materials Practice',
      description: 'Practice quiz on different pipe materials',
      course: 'Industrial Pipe Fitting',
      questions: [
        {
          id: 'p1',
          question: 'Which material is best for high-pressure applications?',
          options: ['PVC', 'Copper', 'Steel', 'Aluminum'],
          correctAnswer: 2,
          explanation: 'Steel is best for high-pressure applications'
        }
      ],
      passingScore: 70,
      studentScore: undefined,
      isPassed: false,
      attempts: 0,
      timeLimit: 15
    },
    {
      id: 'practice-2',
      title: 'Welding Techniques Practice',
      description: 'Practice different welding techniques',
      course: 'Professional Welding',
      questions: [
        {
          id: 'p1',
          question: 'Which welding technique is best for thin materials?',
          options: ['MIG', 'TIG', 'Arc', 'Spot'],
          correctAnswer: 1,
          explanation: 'TIG welding is best for thin materials'
        }
      ],
      passingScore: 70,
      studentScore: undefined,
      isPassed: false,
      attempts: 0,
      timeLimit: 15
    }
  ]);

  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [quizTime, setQuizTime] = useState<number>(0);
  const [quizTimer, setQuizTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setFilteredQuizzes(quizzes);
    
    // Load quiz results from localStorage
    const savedResults = localStorage.getItem('quizResults');
    if (savedResults) {
      setQuizResults(JSON.parse(savedResults));
    }
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = quizzes;

    if (searchTerm) {
      filtered = filtered.filter(quiz =>
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCourse !== 'all') {
      filtered = filtered.filter(quiz => quiz.course === selectedCourse);
    }

    if (selectedStatus !== 'all') {
      if (selectedStatus === 'passed') {
        filtered = filtered.filter(quiz => quiz.isPassed);
      } else if (selectedStatus === 'failed') {
        filtered = filtered.filter(quiz => quiz.studentScore !== undefined && !quiz.isPassed);
      } else if (selectedStatus === 'not_attempted') {
        filtered = filtered.filter(quiz => quiz.studentScore === undefined);
      }
    }

    setFilteredQuizzes(filtered);
  }, [searchTerm, selectedCourse, selectedStatus, quizzes]);

  const courses = Array.from(new Set(quizzes.map(q => q.course)));
  const totalQuizzes = quizzes.length;
  const passedQuizzes = quizzes.filter(q => q.isPassed).length;
  const averageScore = quizzes.length > 0 
    ? Math.round(quizzes.reduce((sum, q) => sum + (q.studentScore || 0), 0) / quizzes.length)
    : 0;
  const totalAttempts = quizzes.reduce((sum, q) => sum + q.attempts, 0);

  const handleStartQuiz = (quizId: string) => {
    const quiz = quizzes.find(q => q.id === quizId);
    if (quiz) {
      setActiveQuiz(quiz);
      setUserAnswers({});
      setQuizTime(quiz.timeLimit * 60); // Convert minutes to seconds
      
      // Start timer
      const timer = setInterval(() => {
        setQuizTime(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      setQuizTimer(timer);
    }
  };

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleSubmitQuiz = () => {
    if (!activeQuiz || quizTimer) {
      if (quizTimer) clearInterval(quizTimer);
      setQuizTimer(null);
    }

    if (!activeQuiz) return;

    // Calculate score
    let correctAnswers = 0;
    activeQuiz.questions.forEach(question => {
      if (userAnswers[question.id] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / activeQuiz.questions.length) * 100);
    const isPassed = score >= activeQuiz.passingScore;

    // Update quiz result
    const newResult: QuizResult = {
      quizId: activeQuiz.id,
      score,
      isPassed,
      attempts: 1,
      lastAttempt: new Date().toISOString()
    };

    const updatedResults = [...quizResults, newResult];
    setQuizResults(updatedResults);
    localStorage.setItem('quizResults', JSON.stringify(updatedResults));

    // Update quizzes
    const updatedQuizzes = quizzes.map(quiz => {
      if (quiz.id === activeQuiz.id) {
        return {
          ...quiz,
          studentScore: score,
          isPassed,
          attempts: quiz.attempts + 1
        };
      }
      return quiz;
    });

    setQuizzes(updatedQuizzes);
    
    // Show result
    alert(`Quiz submitted!\nYour score: ${score}%\n${isPassed ? '🎉 Congratulations! You passed!' : '❌ You need more practice.'}`);
    
    // Reset
    setActiveQuiz(null);
    setUserAnswers({});
    setQuizTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
     <div className="bg-gray-50 rounded-xl p-6 flex flex-col sm:flex-row gap-6">
  {/* Stat items */}
  {[
    { label: 'Total Quizzes', value: totalQuizzes, color: 'purple' },
    { label: 'Passed Quizzes', value: passedQuizzes, color: 'green' },
    { label: 'Average Score', value: `${averageScore}%`, color: 'blue' },
    { label: 'Total Attempts', value: totalAttempts, color: 'yellow' },
  ].map((stat, idx) => (
    <div key={idx} className="flex-1 flex flex-col">
      {/* Top: Label */}
      <span className="text-sm text-gray-500">{stat.label}</span>
      
      {/* Center: Value */}
      <span className={`text-2xl font-bold text-gray-900 mt-1`}>{stat.value}</span>
      
    
    </div>
  ))}
</div>


      {/* Search and Filter */}
    <div className="rounded-xl border border-gray-200 p-6">
  <div className="flex flex-col md:flex-row gap-4">
    {/* Search Input */}
    <div className="flex-1">
      <div className="relative">
        <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search quizzes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
        />
      </div>
    </div>

    {/* Filters */}
    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
      <select
        value={selectedCourse}
        onChange={(e) => setSelectedCourse(e.target.value)}
        className="w-full sm:w-auto px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
      >
        <option value="all">All Courses</option>
        {courses.map(course => (
          <option key={course} value={course}>{course}</option>
        ))}
      </select>

      <select
        value={selectedStatus}
        onChange={(e) => setSelectedStatus(e.target.value)}
        className="w-full sm:w-auto px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
      >
        <option value="all">All Status</option>
        <option value="passed">Passed</option>
        <option value="failed">Failed</option>
        <option value="not_attempted">Not Attempted</option>
      </select>

      <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
        <HiFilter className="w-5 h-5" />
        <span className="font-medium">Filter</span>
      </button>
    </div>
  </div>
</div>


      {/* Quizzes Grid */}
      <div className="space-y-6">
        {filteredQuizzes.map(quiz => (
          <QuizBlock
            key={quiz.id}
            {...quiz}
            onStartQuiz={handleStartQuiz}
          />
        ))}
      </div>

      {filteredQuizzes.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <HiBookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes found</h3>
          <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCourse('all');
              setSelectedStatus('all');
            }}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-900 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Active Quiz Modal */}
      {activeQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{activeQuiz.title}</h2>
                <p className="text-sm text-gray-600">{activeQuiz.course}</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg font-mono font-bold">
                  {formatTime(quizTime)}
                </div>
                <button
                  onClick={() => {
                    if (quizTimer) clearInterval(quizTimer);
                    setActiveQuiz(null);
                    setUserAnswers({});
                    setQuizTime(0);
                  }}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 overflow-auto max-h-[70vh]">
              <div className="space-y-6">
                {activeQuiz.questions.map((question, index) => (
                  <div key={question.id} className="p-4 border border-gray-200 rounded-lg">
                    <p className="font-medium text-gray-900 mb-4">
                      Q{index + 1}: {question.question}
                    </p>
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <button
                          key={optionIndex}
                          onClick={() => handleAnswerSelect(question.id, optionIndex)}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            userAnswers[question.id] === optionIndex
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center">
                            <div className={`w-6 h-6 rounded-full border mr-3 flex items-center justify-center ${
                              userAnswers[question.id] === optionIndex
                                ? 'border-purple-500 bg-purple-500'
                                : 'border-gray-300'
                            }`}>
                              {userAnswers[question.id] === optionIndex && (
                                <div className="w-2 h-2 bg-white rounded-full" />
                              )}
                            </div>
                            <span className="text-gray-700">{option}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">
                  Answered: {Object.keys(userAnswers).length} / {activeQuiz.questions.length}
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    if (quizTimer) clearInterval(quizTimer);
                    setActiveQuiz(null);
                    setUserAnswers({});
                    setQuizTime(0);
                  }}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitQuiz}
                  disabled={Object.keys(userAnswers).length !== activeQuiz.questions.length}
                  className={`px-6 py-2.5 rounded-lg font-medium ${
                    Object.keys(userAnswers).length === activeQuiz.questions.length
                      ? 'bg-gradient-to-r from-green-600 to-green-800 text-white hover:from-green-700 hover:to-green-900'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Submit Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}