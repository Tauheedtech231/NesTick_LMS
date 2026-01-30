// app/lms/Student_Portal/quizzes/page.tsx
'use client';

import { useState } from 'react';
import { Search, Filter, Clock, CheckCircle, XCircle, TrendingUp } from 'lucide-react';

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState([
    {
      id: 1,
      course: 'Mathematics - 10th Grade',
      title: 'Algebra Basics Quiz',
      description: 'Test your understanding of basic algebraic concepts',
      totalQuestions: 15,
      timeLimit: 30,
      passingScore: 70,
      attempts: 2,
      bestScore: 85,
      status: 'completed',
      lastAttempt: '2024-03-15',
    },
    {
      id: 2,
      course: 'Physics - 10th Grade',
      title: 'Mechanics Quiz',
      description: 'Newton\'s Laws and basic mechanics',
      totalQuestions: 20,
      timeLimit: 45,
      passingScore: 75,
      attempts: 3,
      bestScore: 68,
      status: 'attempted',
      lastAttempt: '2024-03-20',
    },
    {
      id: 3,
      course: 'Chemistry - 11th Grade',
      title: 'Periodic Table Quiz',
      description: 'Elements and their properties',
      totalQuestions: 25,
      timeLimit: 35,
      passingScore: 80,
      attempts: 0,
      bestScore: null,
      status: 'available',
      lastAttempt: null,
    },
    {
      id: 4,
      course: 'Biology - 12th Grade',
      title: 'Genetics Quiz',
      description: 'Mendelian genetics and inheritance',
      totalQuestions: 18,
      timeLimit: 40,
      passingScore: 75,
      attempts: 1,
      bestScore: 72,
      status: 'failed',
      lastAttempt: '2024-03-18',
    },
  ]);

  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredQuizzes = quizzes.filter(quiz => {
    if (filter !== 'all' && quiz.status !== filter) return false;
    if (searchTerm && !quiz.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-800';
      case 'attempted':
        return 'bg-amber-100 text-amber-800';
      case 'available':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'attempted':
        return <Clock className="w-4 h-4" />;
      case 'available':
        return <TrendingUp className="w-4 h-4" />;
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getPerformanceText = (score: number | null, passingScore: number) => {
    if (score === null) return 'Not attempted';
    if (score >= passingScore) return 'Passed';
    return 'Needs improvement';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quizzes & Assessments</h1>
          <p className="text-gray-600 mt-2">Test your knowledge and track progress</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full md:w-64"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Quizzes</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{quizzes.length}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">1</p>
            </div>
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">75%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-amber-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">1</p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all' 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Quizzes
        </button>
        <button
          onClick={() => setFilter('available')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'available' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Available
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'completed' 
              ? 'bg-emerald-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Completed
        </button>
        <button
          onClick={() => setFilter('attempted')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'attempted' 
              ? 'bg-amber-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Attempted
        </button>
        <button
          onClick={() => setFilter('failed')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'failed' 
              ? 'bg-red-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Needs Retake
        </button>
      </div>

      {/* Quizzes List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredQuizzes.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredQuizzes.map((quiz) => (
              <div key={quiz.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium text-gray-500">{quiz.course}</span>
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(quiz.status)}`}>
                        {getStatusIcon(quiz.status)}
                        {quiz.status.charAt(0).toUpperCase() + quiz.status.slice(1)}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{quiz.title}</h3>
                    <p className="text-gray-600 mt-1">{quiz.description}</p>
                    <div className="flex flex-wrap gap-4 mt-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{quiz.totalQuestions} questions</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{quiz.timeLimit} minutes</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>Passing: {quiz.passingScore}%</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>Attempts: {quiz.attempts}/3</span>
                      </div>
                    </div>
                    {quiz.bestScore !== null && (
                      <div className="mt-4">
                        <div className="flex items-center gap-3">
                          <div className="text-sm font-medium text-gray-700">Best Score:</div>
                          <div className={`px-3 py-1 rounded-lg font-medium ${
                            quiz.bestScore >= quiz.passingScore
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {quiz.bestScore}%
                          </div>
                          <div className="text-sm text-gray-600">
                            {getPerformanceText(quiz.bestScore, quiz.passingScore)}
                          </div>
                        </div>
                        {quiz.lastAttempt && (
                          <div className="text-sm text-gray-500 mt-2">
                            Last attempt: {quiz.lastAttempt}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    {quiz.status === 'available' && (
                      <button className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors">
                        Start Quiz
                      </button>
                    )}
                    {quiz.status === 'completed' && (
                      <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors">
                        Review Results
                      </button>
                    )}
                    {quiz.status === 'attempted' && (
                      <button className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors">
                        Retake Quiz
                      </button>
                    )}
                    {quiz.status === 'failed' && (
                      <button className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors">
                        Retake Required
                      </button>
                    )}
                    <button className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <TrendingUp className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No quizzes found</h3>
            <p className="text-gray-600">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {/* Quiz Instructions */}
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-purple-900 mb-4">Quiz Instructions</h3>
        <ul className="space-y-3 text-purple-800">
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
            <span>Each quiz has a time limit - make sure to complete within the given time</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
            <span>You can attempt each quiz up to 3 times</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
            <span>Your highest score will be recorded</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
            <span>Passing score is required to complete the module</span>
          </li>
        </ul>
      </div>
    </div>
  );
}