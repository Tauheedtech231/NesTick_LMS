// app/lms/Student_Portal/mock-quizzes/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  HiSearch,
  HiBookOpen,
  HiClock,
  HiCheckCircle,
  HiXCircle,
  HiPlay,
  HiChartBar,
  HiUser,
  HiCalendar,
  HiArrowRight,
  HiDownload,
} from 'react-icons/hi';
import Link from 'next/link';
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
};

interface Quiz {
  id: string;
  title: string;
  description: string;
  course: string;
  courseId: string;
  instructorName: string;
  totalQuestions: number;
  passingScore: number;
  studentScore?: number;
  isPassed: boolean;
  attempts: number;
  timeLimit: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  createdAt: string;
  status: 'not_attempted' | 'in_progress' | 'completed';
  lastAttempt?: string;
  averageScore?: number;
}

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
  answers: {
    questionId: string;
    selectedOption: number;
    isCorrect: boolean;
    pointsEarned: number;
  }[];
}

export default function StudentMockQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'not_attempted' | 'completed' | 'failed'>('all');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    completedQuizzes: 0,
    averageScore: 0,
    totalAttempts: 0,
    passingRate: 0,
    totalStudyTime: 0,
  });

  useEffect(() => {
    const loadData = () => {
      try {
        const currentUserStr = localStorage.getItem('currentUser');
        if (currentUserStr) {
          const userData = JSON.parse(currentUserStr);
          setUser(userData);

          // Fetch all published quizzes created by instructors
          const allQuizzes = JSON.parse(localStorage.getItem('instructor_quizzes') || '[]');
          const allInstructors = JSON.parse(localStorage.getItem('lms_instructors') || '[]');
          const allQuizResults = JSON.parse(localStorage.getItem('student_quiz_results') || '[]');
          setQuizResults(allQuizResults);

          // Filter only published quizzes (all students can see all published quizzes)
          const publishedQuizzes = allQuizzes.filter((quiz: any) => quiz.status === 'published');

          const studentQuizData: Quiz[] = publishedQuizzes.map((quiz: any) => {
            const instructor = allInstructors.find((inst: any) => inst.id === quiz.instructorId) || {
              name: quiz.instructorName || 'Instructor',
            };

            // Get all attempts by this student for this quiz
            const studentAttempts = allQuizResults.filter(
              (result: any) =>
                result.quizId === quiz.id &&
                (result.studentEmail === userData.email || result.studentId === userData.id)
            );

            let status: 'not_attempted' | 'in_progress' | 'completed' = 'not_attempted';
            let studentScore = undefined;
            let isPassed = false;
            const attempts = studentAttempts.length;
            let lastAttempt = undefined;

            // Get the most recent attempt
            if (studentAttempts.length > 0) {
              const latestAttempt = studentAttempts.sort(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (a: any, b: any) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
              )[0];
              status = 'completed';
              studentScore = latestAttempt.score;
              isPassed = latestAttempt.isPassed;
              lastAttempt = latestAttempt.submittedAt;
            }

            return {
              id: quiz.id,
              title: quiz.title,
              description: quiz.description || 'Test your knowledge with this quiz',
              course: quiz.courseTitle || 'General',
              courseId: quiz.courseId || 'general',
              instructorName: instructor.name,
              totalQuestions: quiz.totalQuestions || quiz.questions?.length || 10,
              passingScore: quiz.passingScore || 70,
              studentScore,
              isPassed,
              attempts,
              timeLimit: quiz.timeLimit || 30,
              difficulty: quiz.difficulty || 'medium',
              tags: quiz.tags || ['assessment'],
              createdAt: quiz.createdAt || new Date().toISOString(),
              status,
              lastAttempt,
              averageScore: quiz.averageScore || 0,
            };
          });

          if (studentQuizData.length === 0) {
            // Sample quizzes (same as before)
            const sampleQuizzes: Quiz[] = [
              {
                id: 'quiz-1',
                title: 'Pipe Fitting Fundamentals',
                description: 'Test your basic knowledge of pipe fitting concepts and tools',
                course: 'Industrial Pipe Fitting',
                courseId: 'course-1',
                instructorName: 'John Smith',
                totalQuestions: 15,
                passingScore: 70,
                attempts: 0,
                timeLimit: 30,
                difficulty: 'easy',
                tags: ['pipe fitting', 'basics', 'tools'],
                createdAt: '2024-01-15',
                status: 'not_attempted',
                averageScore: 0,
                isPassed: false,
              },
              {
                id: 'quiz-2',
                title: 'Welding Safety Certification',
                description: 'Advanced welding safety procedures and protocols',
                course: 'Professional Welding',
                courseId: 'course-2',
                instructorName: 'Sarah Johnson',
                totalQuestions: 20,
                passingScore: 80,
                studentScore: 85,
                isPassed: true,
                attempts: 1,
                timeLimit: 45,
                difficulty: 'medium',
                tags: ['welding', 'safety', 'certification'],
                createdAt: '2024-01-20',
                status: 'completed',
                lastAttempt: '2024-01-25',
                averageScore: 78,
              },
              {
                id: 'quiz-3',
                title: 'OSHA Regulations Assessment',
                description: 'Comprehensive OSHA safety regulations test',
                course: 'Safety Inspector Certification',
                courseId: 'course-3',
                instructorName: 'Michael Brown',
                totalQuestions: 25,
                passingScore: 75,
                studentScore: 65,
                isPassed: false,
                attempts: 1,
                timeLimit: 60,
                difficulty: 'hard',
                tags: ['OSHA', 'regulations', 'safety'],
                createdAt: '2024-02-01',
                status: 'completed',
                lastAttempt: '2024-02-05',
                averageScore: 72,
              },
              {
                id: 'quiz-4',
                title: 'Electrical Circuits Practice',
                description: 'Practice quiz on electrical circuits and components',
                course: 'Industrial Pipe Fitting',
                courseId: 'course-1',
                instructorName: 'John Smith',
                totalQuestions: 10,
                passingScore: 60,
                attempts: 0,
                timeLimit: 20,
                difficulty: 'easy',
                tags: ['electrical', 'circuits', 'practice'],
                createdAt: '2024-02-10',
                status: 'not_attempted',
                averageScore: 0,
                isPassed: false,
              },
            ];
            setQuizzes(sampleQuizzes);
            setFilteredQuizzes(sampleQuizzes);
          } else {
            setQuizzes(studentQuizData);
            setFilteredQuizzes(studentQuizData);
          }

          // Calculate stats
          const completedQuizzes = studentQuizData.filter((q) => q.status === 'completed');
          const passedQuizzes = completedQuizzes.filter((q) => q.isPassed);
          const totalScore = completedQuizzes.reduce((sum, q) => sum + (q.studentScore || 0), 0);
          const totalAttempts = studentQuizData.reduce((sum, q) => sum + q.attempts, 0);
          const averageScore = completedQuizzes.length > 0 ? Math.round(totalScore / completedQuizzes.length) : 0;
          const passingRate = completedQuizzes.length > 0 ? Math.round((passedQuizzes.length / completedQuizzes.length) * 100) : 0;

          setStats({
            totalQuizzes: studentQuizData.length,
            completedQuizzes: completedQuizzes.length,
            averageScore,
            totalAttempts,
            passingRate,
            totalStudyTime: totalAttempts * 30,
          });
        }
      } catch (error) {
        console.error('Error loading quizzes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    let filtered = quizzes;

    if (searchTerm) {
      filtered = filtered.filter(
        (quiz) =>
          quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quiz.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quiz.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quiz.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filter === 'not_attempted') {
      filtered = filtered.filter((q) => q.status === 'not_attempted');
    } else if (filter === 'completed') {
      filtered = filtered.filter((q) => q.status === 'completed' && q.isPassed);
    } else if (filter === 'failed') {
      filtered = filtered.filter((q) => q.status === 'completed' && !q.isPassed);
    }

    if (selectedCourse !== 'all') {
      filtered = filtered.filter((q) => q.course === selectedCourse);
    }

    setFilteredQuizzes(filtered);
  }, [searchTerm, filter, selectedCourse, quizzes]);

  const getStatusBadge = (quiz: Quiz) => {
    if (quiz.status === 'not_attempted') {
      return {
        text: 'Not Attempted',
        color: 'bg-gray-100 text-gray-800 border border-gray-200',
        icon: <HiClock className="w-3 h-3" />,
      };
    } else if (quiz.status === 'completed' && quiz.isPassed) {
      return {
        text: 'Passed',
        color: 'bg-green-100 text-green-800 border border-green-200',
        icon: <HiCheckCircle className="w-3 h-3" />,
      };
    } else {
      return {
        text: 'Failed',
        color: 'bg-red-100 text-red-800 border border-red-200',
        icon: <HiXCircle className="w-3 h-3" />,
      };
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return {
          text: 'Easy',
          color: 'bg-green-50 text-green-700 border border-green-200',
        };
      case 'medium':
        return {
          text: 'Medium',
          color: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
        };
      case 'hard':
        return {
          text: 'Hard',
          color: 'bg-red-50 text-red-700 border border-red-200',
        };
      default:
        return {
          text: 'Medium',
          color: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
        };
    }
  };

  const getTimeString = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const downloadQuizReport = (quiz: Quiz) => {
    const quizResult = quizResults.find((r) => r.quizId === quiz.id);
    let content = `Quiz Report\n===========\n\n`;
    content += `Quiz: ${quiz.title}\n`;
    content += `Course: ${quiz.course}\n`;
    content += `Instructor: ${quiz.instructorName}\n`;
    content += `Difficulty: ${quiz.difficulty}\n`;
    content += `Time Limit: ${quiz.timeLimit} minutes\n`;
    content += `Passing Score: ${quiz.passingScore}%\n\n`;

    if (quizResult) {
      content += `Student: ${quizResult.studentName} (${quizResult.studentEmail})\n`;
      content += `Score: ${quizResult.score}%\n`;
      content += `Status: ${quizResult.isPassed ? 'PASSED' : 'FAILED'}\n`;
      content += `Correct Answers: ${quizResult.correctAnswers}/${quizResult.totalQuestions}\n`;
      content += `Time Spent: ${Math.floor(quizResult.timeSpent / 60)}:${(quizResult.timeSpent % 60)
        .toString()
        .padStart(2, '0')}\n`;
      content += `Submitted: ${new Date(quizResult.submittedAt).toLocaleString()}\n\n`;
      content += `Answer Summary:\n---------------\n`;
      quizResult.answers.forEach((answer, index) => {
        content += `Q${index + 1}: ${answer.isCorrect ? '✓' : '✗'} (${answer.pointsEarned} points)\n`;
      });
    } else {
      content += `Status: Not Attempted\n`;
      content += `This quiz has not been attempted yet.\n`;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${quiz.title.replace(/\s+/g, '_')}_report.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getCourses = () => {
    return Array.from(new Set(quizzes.map((q) => q.course)));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-100 rounded-lg mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      {/* ========== HEADER ========== */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
              Mock Quizzes
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Practice and assess your knowledge across courses
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {quizzes.length} total quizzes • {filteredQuizzes.length} shown
          </div>
        </div>
      </div>

      {/* ========== STATS CARDS ========== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Total Quizzes</p>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mt-1" style={{ color: BRAND_COLORS.darkNavy }}>
                {stats.totalQuizzes}
              </h3>
            </div>
            <HiBookOpen className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Completed</p>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mt-1" style={{ color: BRAND_COLORS.darkNavy }}>
                {stats.completedQuizzes}
              </h3>
              <p className="text-xs text-gray-500 mt-1">{stats.passingRate}% pass rate</p>
            </div>
            <HiCheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Avg. Score</p>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mt-1" style={{ color: BRAND_COLORS.darkNavy }}>
                {stats.averageScore}%
              </h3>
              <p className="text-xs text-gray-500 mt-1">{stats.totalAttempts} attempts</p>
            </div>
            <HiChartBar className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Study Time</p>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mt-1" style={{ color: BRAND_COLORS.darkNavy }}>
                {Math.floor(stats.totalStudyTime / 60)}h {stats.totalStudyTime % 60}m
              </h3>
              <p className="text-xs text-gray-500 mt-1">Total spent</p>
            </div>
            <HiClock className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: BRAND_COLORS.teal }} />
          </div>
        </div>
      </div>

      {/* ========== SEARCH & FILTERS ========== */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, course, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Course Select */}
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-3 py-2 sm:px-4 sm:py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="all">All Courses</option>
              {getCourses().map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>

            {/* Status filters */}
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg font-medium text-xs sm:text-sm transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('not_attempted')}
              className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg font-medium text-xs sm:text-sm transition-colors ${
                filter === 'not_attempted'
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Not Attempted
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg font-medium text-xs sm:text-sm transition-colors ${
                filter === 'completed'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Passed
            </button>
            <button
              onClick={() => setFilter('failed')}
              className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg font-medium text-xs sm:text-sm transition-colors ${
                filter === 'failed'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Failed
            </button>
          </div>
        </div>
      </div>

      {/* ========== QUIZZES LIST ========== */}
      {filteredQuizzes.length > 0 ? (
        <div className="space-y-4">
          {filteredQuizzes.map((quiz) => {
            const statusBadge = getStatusBadge(quiz);
            const difficultyBadge = getDifficultyBadge(quiz.difficulty);
            return (
              <div
                key={quiz.id}
                className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Left content */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full inline-flex items-center gap-1 ${statusBadge.color}`}
                      >
                        {statusBadge.icon}
                        {statusBadge.text}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${difficultyBadge.color}`}
                      >
                        {difficultyBadge.text}
                      </span>
                      {quiz.status === 'completed' && quiz.studentScore !== undefined && (
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-bold ${
                            quiz.isPassed
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-red-100 text-red-800 border border-red-200'
                          }`}
                        >
                          Score: {quiz.studentScore}%
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-bold mb-2" style={{ color: BRAND_COLORS.darkNavy }}>
                      {quiz.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{quiz.description}</p>

                    {/* Metadata grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <HiBookOpen className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{quiz.course}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <HiUser className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{quiz.instructorName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <HiCalendar className="w-4 h-4 flex-shrink-0" />
                        <span>Passing: {quiz.passingScore}%</span>
                      </div>
                    </div>

                    {/* Tags */}
                    {quiz.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {quiz.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {quiz.lastAttempt && (
                      <div className="text-xs text-gray-500">
                        Last attempt: {new Date(quiz.lastAttempt).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {/* Right actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:w-48">
                    {quiz.status === 'not_attempted' ? (
                      <Link
                        href={`/lms/Student_Portal/mock-quizzes/${quiz.id}/attempt`}
                        className="w-full py-2.5 px-4 rounded-lg font-medium text-white text-center inline-flex items-center justify-center gap-2 text-sm transition-colors"
                        style={{ backgroundColor: BRAND_COLORS.deepRed }}
                      >
                        <HiPlay className="w-4 h-4" />
                        Start Quiz
                      </Link>
                    ) : quiz.status === 'completed' && quiz.isPassed ? (
                      <>
                        <Link
                          href={`/lms/Student_Portal/mock-quizzes/${quiz.id}/result`}
                          className="w-full py-2.5 px-4 rounded-lg font-medium text-white text-center inline-flex items-center justify-center gap-2 text-sm transition-colors"
                          style={{ backgroundColor: BRAND_COLORS.darkRoyalBlue }}
                        >
                          <HiChartBar className="w-4 h-4" />
                          View Results
                        </Link>
                        <button
                          onClick={() => downloadQuizReport(quiz)}
                          className="w-full py-2.5 px-4 rounded-lg font-medium border border-gray-300 text-gray-700 text-center hover:bg-gray-50 inline-flex items-center justify-center gap-2 text-sm"
                        >
                          <HiDownload className="w-4 h-4" />
                          Download Report
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href={`/lms/Student_Portal/mock-quizzes/${quiz.id}/attempt`}
                          className="w-full py-2.5 px-4 rounded-lg font-medium text-white text-center inline-flex items-center justify-center gap-2 text-sm transition-colors"
                          style={{ backgroundColor: BRAND_COLORS.deepRed }}
                        >
                          <HiPlay className="w-4 h-4" />
                          Retake Quiz
                        </Link>
                        <Link
                          href={`/lms/Student_Portal/mock-quizzes/${quiz.id}/review`}
                          className="w-full py-2.5 px-4 rounded-lg font-medium border border-gray-300 text-gray-700 text-center hover:bg-gray-50 text-sm"
                        >
                          Review Answers
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <HiBookOpen className="w-16 h-16 mx-auto mb-4" style={{ color: BRAND_COLORS.softGrey }} />
          <h3 className="text-lg sm:text-xl font-medium mb-2" style={{ color: BRAND_COLORS.darkGrey }}>
            No quizzes found
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            {searchTerm || filter !== 'all' || selectedCourse !== 'all'
              ? 'Try adjusting your filters'
              : 'No quizzes available for your courses'}
          </p>
          {(searchTerm || filter !== 'all' || selectedCourse !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilter('all');
                setSelectedCourse('all');
              }}
              className="px-6 py-2 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}