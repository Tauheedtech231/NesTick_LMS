'use client';
/* eslint-disable */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  HiDocumentText, 
  HiClipboardList, 
  HiCheckCircle, 
  HiClock, 
  HiUser,
  HiAcademicCap,
  HiSearch,
  HiDownload,
  HiEye,
  HiX,
  HiCheck,
  HiStar,
  HiChartBar,
  HiCalendar
} from 'react-icons/hi';
import { Loader2 } from 'lucide-react';

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
  purple: '#8B5CF6'
};

// Types
interface AssignmentSubmission {
  id: string;
  student_email: string;
  student_name: string;
  assignment_id: string;
  assignment_title: string;
  course_id: string;
  course_title: string;
  slide_title: string;
  files: any[];
  submitted_at: string;
  status: 'submitted' | 'graded';
  score: number | null;
  feedback: string | null;
  total_marks: number;
  passing_marks: number;
}

interface QuizAttempt {
  id: string;
  student_email: string;
  student_name: string;
  quiz_id: string;
  quiz_title: string;
  course_id: string;
  course_title: string;
  slide_title: string;
  score: number;
  total_possible: number;
  percentage: number;
  passed: boolean;
  completed_at: string;
  answers: any[];
}

interface Course {
  id: string;
  title: string;
}

interface CourseQuizResult {
  quiz_id: string;
  slide_number: number;
  slide_title: string;
  total_attempts: number;
  unique_students: number;
  avg_percentage: number;
  highest_score: number;
  lowest_score: number;
  passed_count: number;
  failed_count: number;
  last_attempt_date: string;
  attempts: QuizAttempt[];
}

type TabType = 'assignments' | 'quizzes';

export default function AssessmentHubPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('assignments');
  
  // Data states
  const [assignments, setAssignments] = useState<AssignmentSubmission[]>([]);
  const [quizzes, setQuizzes] = useState<QuizAttempt[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [courseQuizResults, setCourseQuizResults] = useState<CourseQuizResult[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  // Grading modal states
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<AssignmentSubmission | null>(null);
  const [gradeScore, setGradeScore] = useState<number>(0);
  const [gradeFeedback, setGradeFeedback] = useState('');
  const [submittingGrade, setSubmittingGrade] = useState(false);
  
  // Quiz details modal
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizAttempt | null>(null);
  
  // Stats
  const [stats, setStats] = useState({
    totalAssignments: 0,
    pendingGrading: 0,
    graded: 0,
    avgScore: 0,
    totalQuizzes: 0,
    avgQuizScore: 0,
    passedQuizzes: 0
  });

  useEffect(() => {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      const parsed = JSON.parse(userData);
      if (parsed.role === 'instructor') {
        setUser(parsed);
        loadData();
      } else {
        router.push('/lms/auth/login?type=instructor');
      }
    } else {
      router.push('/lms/auth/login?type=instructor');
    }
  }, [router]);

  useEffect(() => {
    if (selectedCourseId && selectedCourseId !== 'all') {
      loadCourseQuizzes(selectedCourseId);
    } else {
      setCourseQuizResults([]);
      setQuizzes([]);
    }
  }, [selectedCourseId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const coursesRes = await fetch('/api/instructors/course');
      const coursesData = await coursesRes.json();
      if (coursesData.success) {
        setCourses(coursesData.data);
      }

      const assignmentsRes = await fetch('/api/instructor/assignment-submissions');
      const assignmentsData = await assignmentsRes.json();
      if (assignmentsData.success) {
        setAssignments(assignmentsData.data);
      }

      calculateStats(assignmentsData.data || [], []);
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCourseQuizzes = async (courseId: string) => {
    setLoadingQuizzes(true);
    try {
      const simpleRes = await fetch(`/api/instructor/simple-quiz-attempts?courseId=${courseId}`);
      const simpleData = await simpleRes.json();
      console.log('Simple quiz attempts:', simpleData);
      
      const advancedRes = await fetch(`/api/instructor/course-quizzes-results?courseId=${courseId}`);
      const advancedData = await advancedRes.json();
      
      let allAttempts: QuizAttempt[] = [];
      
      if (simpleData.success && simpleData.data && simpleData.data.length > 0) {
        allAttempts = [...allAttempts, ...simpleData.data];
      }
      
      if (advancedData.success && advancedData.data && advancedData.data.length > 0) {
        advancedData.data.forEach((quiz: CourseQuizResult) => {
          if (quiz.attempts && quiz.attempts.length > 0) {
            allAttempts = [...allAttempts, ...quiz.attempts];
          }
        });
      }
      
      setQuizzes(allAttempts);
      
      const quizMap = new Map();
      allAttempts.forEach(attempt => {
        const key = attempt.quiz_id;
        if (!quizMap.has(key)) {
          quizMap.set(key, {
            quiz_id: attempt.quiz_id,
            slide_title: attempt.slide_title || 'Quiz',
            attempts: [],
            total_attempts: 0,
            unique_students: 0,
            avg_percentage: 0,
            highest_score: 0,
            lowest_score: 100,
            passed_count: 0,
            failed_count: 0,
            last_attempt_date: null
          });
        }
        
        const quizData = quizMap.get(key);
        quizData.attempts.push(attempt);
        quizData.total_attempts++;
        quizData.avg_percentage += attempt.percentage;
        quizData.highest_score = Math.max(quizData.highest_score, attempt.percentage);
        quizData.lowest_score = Math.min(quizData.lowest_score, attempt.percentage);
        
        if (attempt.passed) {
          quizData.passed_count++;
        } else {
          quizData.failed_count++;
        }
        
        if (attempt.completed_at && (!quizData.last_attempt_date || attempt.completed_at > quizData.last_attempt_date)) {
          quizData.last_attempt_date = attempt.completed_at;
        }
        
        quizData.unique_students = new Set(quizData.attempts.map((a: any) => a.student_email)).size;
      });
      
      for (const quizData of quizMap.values()) {
        quizData.avg_percentage = Math.round(quizData.avg_percentage / quizData.total_attempts);
      }
      
      const result = Array.from(quizMap.values());
      setCourseQuizResults(result);
      
      const totalQuizzes = result.length;
      const avgQuizScore = result.reduce((sum: number, q: CourseQuizResult) => sum + (q.avg_percentage || 0), 0) / (totalQuizzes || 1);
      const passedQuizzes = result.filter((q: CourseQuizResult) => q.avg_percentage >= 70).length;
      
      setStats(prev => ({
        ...prev,
        totalQuizzes: totalQuizzes,
        avgQuizScore: Math.round(avgQuizScore),
        passedQuizzes
      }));
      
    } catch (error) {
      console.error('Error loading course quizzes:', error);
    } finally {
      setLoadingQuizzes(false);
    }
  };

  const calculateStats = (assignmentsList: AssignmentSubmission[], quizzesList: QuizAttempt[]) => {
    const pendingGrading = assignmentsList.filter(a => a.status === 'submitted').length;
    const graded = assignmentsList.filter(a => a.status === 'graded').length;
    const avgScore = assignmentsList.filter(a => a.score).reduce((sum, a) => sum + (a.score || 0), 0) / (graded || 1);

    setStats({
      totalAssignments: assignmentsList.length,
      pendingGrading,
      graded,
      avgScore: Math.round(avgScore),
      totalQuizzes: quizzesList.length,
      avgQuizScore: 0,
      passedQuizzes: 0
    });
  };

  const handleGradeSubmission = async () => {
    if (!selectedSubmission) return;
    
    setSubmittingGrade(true);
    try {
      const response = await fetch('/api/instructor/grade-assignment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: selectedSubmission.id,
          score: gradeScore,
          feedback: gradeFeedback,
          totalMarks: selectedSubmission.total_marks
        })
      });

      const data = await response.json();
      if (data.success) {
        alert(`✅ Assignment graded! Score: ${gradeScore}/${selectedSubmission.total_marks}`);
        setShowGradingModal(false);
        setSelectedSubmission(null);
        setGradeScore(0);
        setGradeFeedback('');
        loadData();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      alert(`❌ Failed to grade: ${error.message}`);
    } finally {
      setSubmittingGrade(false);
    }
  };

  const getStatusBadge = (status: string, score?: number, passingMarks?: number) => {
    if (status === 'graded') {
      const passed = score && passingMarks && score >= passingMarks;
      return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {passed ? <HiCheckCircle className="w-3 h-3 mr-1" /> : <HiX className="w-3 h-3 mr-1" />}
          {passed ? 'Passed' : 'Failed'}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
        <HiClock className="w-3 h-3 mr-1" />
        Pending
      </span>
    );
  };

  const getQuizStatusBadge = (passed: boolean, percentage: number) => {
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        {passed ? <HiCheckCircle className="w-3 h-3 mr-1" /> : <HiX className="w-3 h-3 mr-1" />}
        {passed ? `Passed (${percentage}%)` : `Failed (${percentage}%)`}
      </span>
    );
  };

  // ✅ Get user answer display
  const getUserAnswerDisplay = (answer: any): string => {
    // For simple quiz format (selectedOption)
    if (answer.selectedOption !== undefined && answer.selectedOption !== -1) {
      if (answer.options && answer.options[answer.selectedOption]) {
        return answer.options[answer.selectedOption];
      }
      return String(answer.selectedOption);
    }
    
    // For advanced quiz format
    if (answer.userAnswer !== undefined && answer.userAnswer !== null && answer.userAnswer !== '') {
      return String(answer.userAnswer);
    }
    
    if (answer.textAnswer) {
      return answer.textAnswer;
    }
    
    if (answer.studentAnswer) {
      return answer.studentAnswer;
    }
    
    return 'No answer';
  };

  // ✅ Get correct answer display - CORRECTED
  const getCorrectAnswerDisplay = (answer: any): string => {
    // Check if answer has correctAnswer field
    if (answer.correctAnswer !== undefined && answer.correctAnswer !== null) {
      // If options exist and correctAnswer is index
      if (answer.options && answer.options[answer.correctAnswer]) {
        return answer.options[answer.correctAnswer];
      }
      // If correctAnswer is a number
      if (typeof answer.correctAnswer === 'number') {
        return String(answer.correctAnswer);
      }
      // If correctAnswer is a string
      if (typeof answer.correctAnswer === 'string') {
        return answer.correctAnswer;
      }
      // If correctAnswer is boolean
      if (typeof answer.correctAnswer === 'boolean') {
        return answer.correctAnswer ? 'True' : 'False';
      }
      return String(answer.correctAnswer);
    }
    
    // Check for correct_option
    if (answer.correct_option !== undefined && answer.correct_option !== null) {
      if (answer.options && answer.options[answer.correct_option]) {
        return answer.options[answer.correct_option];
      }
      return String(answer.correct_option);
    }
    
    // Check for isCorrect flag
    if (answer.isCorrect !== undefined) {
      return answer.isCorrect ? 'Correct' : 'Incorrect';
    }
    
    // For text questions
    if (answer.textAnswer !== undefined || answer.needsGrading === true) {
      return 'Any answer accepted';
    }
    
    return 'Not specified';
  };

  // ✅ Get question text
  const getQuestionText = (answer: any, idx: number, quizTitle?: string): string => {
    if (answer.question) return answer.question;
    if (answer.questionText) return answer.questionText;
    return `Question ${idx + 1}`;
  };

  // ✅ Check if answer is correct
  const isAnswerCorrect = (answer: any): boolean => {
    // Text question - always correct
    if (answer.textAnswer !== undefined || answer.needsGrading === true) {
      return true;
    }
    
    const userAnswer = getUserAnswerDisplay(answer).toLowerCase();
    const correctAnswer = getCorrectAnswerDisplay(answer).toLowerCase();
    
    if (userAnswer === 'no answer') return false;
    return userAnswer === correctAnswer;
  };

  // ✅ Parse answers array safely
  const parseAnswersArray = (answers: any): any[] => {
    if (!answers) return [];
    
    if (typeof answers === 'string') {
      try {
        const parsed = JSON.parse(answers);
        if (parsed.processed && Array.isArray(parsed.processed)) {
          return parsed.processed;
        }
        if (parsed.submitted && Array.isArray(parsed.submitted)) {
          return parsed.submitted;
        }
        if (Array.isArray(parsed)) {
          return parsed;
        }
        return [parsed];
      } catch (e) {
        return [];
      }
    }
    
    if (Array.isArray(answers)) {
      return answers;
    }
    
    if (answers.processed && Array.isArray(answers.processed)) {
      return answers.processed;
    }
    
    if (answers.submitted && Array.isArray(answers.submitted)) {
      return answers.submitted;
    }
    
    return [answers];
  };

  const filteredAssignments = assignments.filter(a => {
    const matchesSearch = a.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.student_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.assignment_title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourseId === 'all' || a.course_id === selectedCourseId;
    const matchesStatus = selectedStatus === 'all' || a.status === selectedStatus;
    return matchesSearch && matchesCourse && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: BRAND_COLORS.deepRed }} />
          <p className="text-gray-600">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assessment Hub</h1>
            <p className="text-gray-500 mt-1">Grade assignments and review quiz submissions</p>
          </div>
          <div className="flex gap-2">
            <button onClick={loadData} className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center gap-2">
              <HiDownload className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards - No Icons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
          <div>
            <p className="text-sm text-gray-500">Pending Grading</p>
            <p className="text-2xl font-bold text-gray-900">{stats.pendingGrading}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
          <div>
            <p className="text-sm text-gray-500">Graded Assignments</p>
            <p className="text-2xl font-bold text-gray-900">{stats.graded}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
          <div>
            <p className="text-sm text-gray-500">Avg Assignment Score</p>
            <p className="text-2xl font-bold text-purple-600">{stats.avgScore}%</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-teal-500">
          <div>
            <p className="text-sm text-gray-500">Quiz Attempts</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalQuizzes}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button onClick={() => setActiveTab('assignments')} className={`px-6 py-3 text-sm font-medium transition-all ${activeTab === 'assignments' ? 'border-b-2 text-red-600 border-red-600' : 'text-gray-500 hover:text-gray-700'}`}>
          <HiDocumentText className="w-4 h-4 inline mr-2" /> Assignments ({assignments.length})
        </button>
        <button onClick={() => setActiveTab('quizzes')} className={`px-6 py-3 text-sm font-medium transition-all ${activeTab === 'quizzes' ? 'border-b-2 text-red-600 border-red-600' : 'text-gray-500 hover:text-gray-700'}`}>
          <HiClipboardList className="w-4 h-4 inline mr-2" /> Quiz Results ({courseQuizResults.length} quizzes)
        </button>
      </div>

      {/* Assignments Table */}
      {activeTab === 'assignments' && (
        <>
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex flex-wrap gap-4">
              <div className="w-64">
                <select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20">
                  <option value="all">All Courses</option>
                  {courses.map(course => (<option key={course.id} value={course.id}>{course.title}</option>))}
                </select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input type="text" placeholder="Search by student name, email or assignment..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20" />
                </div>
              </div>
              <div className="w-48">
                <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20">
                  <option value="all">All Status</option>
                  <option value="submitted">Pending Grading</option>
                  <option value="graded">Graded</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assignment</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th><th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAssignments.length === 0 ? (
                    <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">No assignment submissions found</td></tr>
                  ) : (
                    filteredAssignments.map((submission) => (
                      <tr key={submission.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4"><div><p className="font-medium text-gray-900">{submission.student_name || 'N/A'}</p><p className="text-xs text-gray-500">{submission.student_email}</p></div></td>
                        <td className="px-6 py-4"><p className="text-sm text-gray-900">{submission.assignment_title}</p><p className="text-xs text-gray-500">{submission.slide_title}</p></td>
                        <td className="px-6 py-4 text-sm text-gray-600">{submission.course_title}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(submission.submitted_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4">{getStatusBadge(submission.status, submission.score || undefined, submission.passing_marks)}</td>
                        <td className="px-6 py-4">{submission.status === 'graded' ? <span className="font-medium text-gray-900">{submission.score}/{submission.total_marks}</span> : <span className="text-gray-400">—</span>}</td>
                        <td className="px-6 py-4 text-center">
                          <button onClick={() => { setSelectedSubmission(submission); setGradeScore(submission.score || 0); setGradeFeedback(submission.feedback || ''); setShowGradingModal(true); }} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                            {submission.status === 'graded' ? 'View & Edit' : 'Grade'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Quizzes Tab */}
      {activeTab === 'quizzes' && (
        <>
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="w-64">
                <select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20">
                  <option value="all">-- Select a Course --</option>
                  {courses.map(course => (<option key={course.id} value={course.id}>{course.title}</option>))}
                </select>
              </div>
              {loadingQuizzes && (<div className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin text-blue-600" /><span className="text-sm text-gray-500">Loading quizzes...</span></div>)}
            </div>
          </div>

          {selectedCourseId !== 'all' && courseQuizResults.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-r from-purple-50 to-white rounded-xl p-4 border border-purple-100"><p className="text-xs text-gray-500">Total Quizzes</p><p className="text-2xl font-bold text-purple-600">{courseQuizResults.length}</p></div>
              <div className="bg-gradient-to-r from-green-50 to-white rounded-xl p-4 border border-green-100"><p className="text-xs text-gray-500">Avg Score</p><p className="text-2xl font-bold text-green-600">{Math.round(courseQuizResults.reduce((sum, q) => sum + (q.avg_percentage || 0), 0) / courseQuizResults.length)}%</p></div>
              <div className="bg-gradient-to-r from-blue-50 to-white rounded-xl p-4 border border-blue-100"><p className="text-xs text-gray-500">Total Attempts</p><p className="text-2xl font-bold text-blue-600">{courseQuizResults.reduce((sum, q) => sum + (q.total_attempts || 0), 0)}</p></div>
              <div className="bg-gradient-to-r from-emerald-50 to-white rounded-xl p-4 border border-emerald-100"><p className="text-xs text-gray-500">Unique Students</p><p className="text-2xl font-bold text-emerald-600">{new Set(courseQuizResults.flatMap(q => q.attempts?.map(a => a.student_email) || [])).size}</p></div>
            </div>
          )}

          {selectedCourseId === 'all' ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center"><HiAcademicCap className="w-16 h-16 mx-auto text-gray-300 mb-4" /><p className="text-gray-500">Select a course to view quiz results</p></div>
          ) : loadingQuizzes ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" /><p className="text-gray-500 mt-2">Loading quiz results...</p></div>
          ) : courseQuizResults.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center"><HiClipboardList className="w-16 h-16 mx-auto text-gray-300 mb-4" /><p className="text-gray-500">No quiz attempts found for this course</p></div>
          ) : (
            <div className="space-y-6">
              {courseQuizResults.map((quiz, idx) => (
                <div key={`${quiz.quiz_id}-${idx}`} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                  <div className="bg-gradient-to-r from-purple-50 to-white p-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <div><h3 className="font-semibold text-gray-900">{quiz.slide_title || 'Quiz'} {quiz.slide_number ? `(Slide ${quiz.slide_number})` : ''}</h3><p className="text-xs text-gray-500 mt-1">Quiz ID: {quiz.quiz_id}</p></div>
                      <div className="text-right"><p className="text-sm font-medium text-purple-600">Avg Score: {Math.round(quiz.avg_percentage || 0)}%</p><p className="text-xs text-gray-500">{quiz.total_attempts} attempts • {quiz.unique_students} students</p></div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr><th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Student</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Score</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Percentage</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Completed At</th><th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Action</th> </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {quiz.attempts && quiz.attempts.map((attempt, attemptIdx) => (
                          <tr key={`${quiz.quiz_id}-attempt-${attempt.id || attemptIdx}`} className="hover:bg-gray-50">
                            <td className="px-4 py-2"><div><p className="text-sm font-medium text-gray-900">{attempt.student_name || 'N/A'}</p><p className="text-xs text-gray-500">{attempt.student_email}</p></div></td>
                            <td className="px-4 py-2 text-sm text-gray-700">{attempt.score}/{attempt.total_possible}</td>
                            <td className="px-4 py-2"><span className={`text-sm font-medium ${attempt.percentage >= 70 ? 'text-green-600' : 'text-red-600'}`}>{attempt.percentage}%</span></td>
                            <td className="px-4 py-2">{getQuizStatusBadge(attempt.passed, attempt.percentage)}</td>
                            <td className="px-4 py-2 text-sm text-gray-500">{new Date(attempt.completed_at).toLocaleDateString()}</td>
                            <td className="px-4 py-2 text-center">
                              <button onClick={() => { setSelectedQuiz(attempt); setShowQuizModal(true); }} className="px-2 py-1 bg-purple-50 text-purple-600 rounded text-xs font-medium hover:bg-purple-100">
                                <HiEye className="w-3 h-3 inline mr-1" /> Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Grading Modal */}
      {showGradingModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-600 to-blue-700">
              <h3 className="text-lg font-semibold text-white">Grade Assignment</h3>
              <button onClick={() => setShowGradingModal(false)} className="p-1 hover:bg-white/20 rounded-lg"><HiX className="w-5 h-5 text-white" /></button>
            </div>
            <div className="p-6 overflow-auto max-h-[calc(90vh-100px)] space-y-4">
              <div className="bg-gray-50 rounded-lg p-4"><p className="text-sm text-gray-500">Student</p><p className="font-medium">{selectedSubmission.student_name}</p><p className="text-sm text-gray-500 mt-2">Assignment</p><p className="font-medium">{selectedSubmission.assignment_title}</p><p className="text-sm text-gray-500 mt-2">Course</p><p className="font-medium">{selectedSubmission.course_title}</p></div>
              {selectedSubmission.files && selectedSubmission.files.length > 0 && (<div className="border rounded-lg p-4"><h4 className="font-medium mb-2">Submitted Files</h4>{selectedSubmission.files.map((file, idx) => (<a key={idx} href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline py-1"><HiDocumentText className="w-4 h-4" />{file.name}</a>))}</div>)}
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Score (out of {selectedSubmission.total_marks})</label><input type="number" value={gradeScore} onChange={(e) => setGradeScore(Number(e.target.value))} min="0" max={selectedSubmission.total_marks} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Feedback</label><textarea value={gradeFeedback} onChange={(e) => setGradeFeedback(e.target.value)} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Provide feedback to the student..." /></div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowGradingModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={handleGradeSubmission} disabled={submittingGrade} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {submittingGrade ? <Loader2 className="w-4 h-4 animate-spin" /> : <HiCheck className="w-4 h-4" />}
                  {submittingGrade ? 'Saving...' : 'Submit Grade'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Details Modal - FIXED */}
      {showQuizModal && selectedQuiz && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-purple-600 to-purple-700">
              <h3 className="text-lg font-semibold text-white">Quiz Details</h3>
              <button onClick={() => setShowQuizModal(false)} className="p-1 hover:bg-white/20 rounded-lg"><HiX className="w-5 h-5 text-white" /></button>
            </div>
            <div className="p-6 overflow-auto max-h-[calc(90vh-100px)]">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-500">Student</p><p className="font-medium">{selectedQuiz.student_name}</p>
                <p className="text-sm text-gray-500 mt-2">Quiz</p><p className="font-medium">{selectedQuiz.quiz_title || selectedQuiz.slide_title || 'Quiz'}</p>
                <div className="mt-4 flex gap-4">
                  <div><p className="text-sm text-gray-500">Score</p><p className="text-xl font-bold">{selectedQuiz.score}/{selectedQuiz.total_possible}</p></div>
                  <div><p className="text-sm text-gray-500">Percentage</p><p className="text-xl font-bold" style={{ color: selectedQuiz.passed ? '#10B981' : '#EF4444' }}>{selectedQuiz.percentage}%</p></div>
                </div>
              </div>

              <h4 className="font-medium mb-3">Answers</h4>
              {(() => {
                const answersArray = parseAnswersArray(selectedQuiz.answers);
                const quizTitle = selectedQuiz.quiz_title || selectedQuiz.slide_title;
                
                if (answersArray.length === 0) {
                  return (
                    <div className="text-center py-8 text-gray-500">
                      <p>No answers data available</p>
                    </div>
                  );
                }
                
                return answersArray.map((answer, idx) => {
                  const userAnswer = getUserAnswerDisplay(answer);
                  const correctAnswer = getCorrectAnswerDisplay(answer);
                  const questionText = getQuestionText(answer, idx, quizTitle);
                  const isCorrect = isAnswerCorrect(answer);
                  
                  return (
                    <div key={idx} className={`border rounded-lg p-4 mb-3 ${isCorrect ? 'border-green-200' : 'border-red-200'}`}>
                      <p className="font-medium text-sm mb-2">Question {idx + 1}</p>
                      <p className="text-sm text-gray-700 mb-3">{questionText}</p>
                      
                      <div className={`rounded-lg p-3 ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                        <p className="text-xs text-gray-500 mb-1">Student's Answer:</p>
                        <p className={`text-sm font-medium ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                          {userAnswer}
                        </p>
                      </div>
                      
                      {!isCorrect && correctAnswer !== 'Any answer accepted' && (
                        <div className="bg-green-50 rounded-lg p-3 mt-2">
                          <p className="text-xs text-green-600 mb-1">Correct Answer:</p>
                          <p className="text-sm text-green-700">{correctAnswer}</p>
                        </div>
                      )}
                      
                      {correctAnswer === 'Any answer accepted' && (
                        <div className="bg-green-50 rounded-lg p-3 mt-2">
                          <p className="text-xs text-green-600 mb-1">Note:</p>
                          <p className="text-sm text-green-700">This is a text question - any answer is accepted</p>
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}