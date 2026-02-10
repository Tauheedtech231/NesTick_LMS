// app/lms/Student_Portal/assignments/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  HiDocumentText, 
  HiCalendar, 
  HiClock, 
  HiCheckCircle, 
  HiExclamationCircle,
  HiArrowRight,
  HiSearch,
  HiFilter,
  HiUser,
  HiBookOpen,
  HiStar,
  HiDownload,
  HiEye,
  HiOutlineAcademicCap
} from 'react-icons/hi';

const BRAND_COLORS = {
  darkNavy: '#0B1C3D',
  darkRoyalBlue: '#1E3A8A',
  deepRed: '#B11217',
  white: '#FFFFFF',
  lightGrey: '#F4F6F8',
  softGrey: '#E5E7EB',
  darkGrey: '#1F2933',
  teal: '#1FB6CB'
};

interface Assignment {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseTitle: string;
  instructorId: string;
  instructorName: string;
  dueDate: string;
  totalPoints: number;
  submissions: number;
  graded: number;
  status: 'draft' | 'published' | 'closed';
  createdAt: string;
  updatedAt: string;
  studentStatus?: 'not_started' | 'submitted' | 'graded' | 'late';
  studentScore?: number;
  submittedAt?: string;
  feedback?: string;
}
/* eslint-disable */
export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');
  const [user, setUser] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  useEffect(() => {
    const loadData = () => {
      try {
        // Load user data
        const currentUserStr = localStorage.getItem('currentUser');
        if (currentUserStr) {
          const userData = JSON.parse(currentUserStr);
          setUser(userData);
          
          // Load student courses
          const studentCoursesStr = localStorage.getItem('studentCourses');
          if (studentCoursesStr) {
            const courses = JSON.parse(studentCoursesStr);
            
            // Load assignments
            loadStudentAssignments(courses, userData);
          }
        }
      } catch (error) {
        console.error('Error loading assignments:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const loadStudentAssignments = (courses: any[], studentData: any) => {
    try {
      const allAssignments = JSON.parse(localStorage.getItem('instructor_assignments') || '[]');
      const studentSubmissions = JSON.parse(localStorage.getItem('student_submissions') || '[]');
      const allInstructors = JSON.parse(localStorage.getItem('lms_instructors') || '[]');
      
      const studentEmail = studentData.email;
      const studentId = studentData.id || studentData.learnerId;
      
      let studentAssignments: Assignment[] = [];

      courses.forEach(course => {
        const courseAssignments = allAssignments
          .filter((assignment: any) => {
            // Match by course ID or title
            const matchesCourseId = assignment.courseId === course.id;
            const matchesCourseTitle = assignment.courseTitle?.toLowerCase() === course.title?.toLowerCase();
            return (matchesCourseId || matchesCourseTitle) && assignment.status === 'published';
          })
          .map((assignment: any) => {
            // Find instructor
            const instructor = allInstructors.find((inst: any) => 
              inst.id === assignment.instructorId
            ) || { name: assignment.instructorName || '' };
            
            // Check student submission
            const submission = studentSubmissions.find((sub: any) => 
              sub.assignmentId === assignment.id && 
              (sub.studentEmail === studentEmail || sub.studentId === studentId)
            );
            
            // Determine status
            let studentStatus: 'not_started' | 'submitted' | 'graded' | 'late' = 'not_started';
            if (submission) {
              studentStatus = submission.status === 'graded' ? 'graded' : 'submitted';
            } else if (new Date(assignment.dueDate) < new Date()) {
              studentStatus = 'late';
            }
            
            return {
              ...assignment,
              courseTitle: course.title,
              instructorName: instructor.name,
              studentStatus,
              studentScore: submission?.score,
              submittedAt: submission?.submittedAt,
              feedback: submission?.feedback
            };
          });
        
        studentAssignments.push(...courseAssignments);
      });

      // Sort by due date (soonest first)
      studentAssignments.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      
      setAssignments(studentAssignments);
      setFilteredAssignments(studentAssignments);
      
    } catch (error) {
      console.error('Error loading student assignments:', error);
    }
  };

  useEffect(() => {
    let filtered = assignments;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(assignment =>
        assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.instructorName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (filter === 'pending') {
      filtered = filtered.filter(a => a.studentStatus === 'not_started' || a.studentStatus === 'late');
    } else if (filter === 'submitted') {
      filtered = filtered.filter(a => a.studentStatus === 'submitted');
    } else if (filter === 'graded') {
      filtered = filtered.filter(a => a.studentStatus === 'graded');
    }
    
    setFilteredAssignments(filtered);
  }, [searchTerm, filter, assignments]);

  const getStatusBadge = (status: Assignment['studentStatus']) => {
    switch (status) {
      case 'not_started':
        return {
          text: 'Not Started',
          color: 'bg-gray-100 text-gray-800 border border-gray-200',
          icon: <HiClock className="w-3 h-3" />
        };
      case 'submitted':
        return {
          text: 'Submitted',
          color: 'bg-blue-100 text-blue-800 border border-blue-200',
          icon: <HiDocumentText className="w-3 h-3" />
        };
      case 'graded':
        return {
          text: 'Graded',
          color: 'bg-green-100 text-green-800 border border-green-200',
          icon: <HiCheckCircle className="w-3 h-3" />
        };
      case 'late':
        return {
          text: 'Late',
          color: 'bg-red-100 text-red-800 border border-red-200',
          icon: <HiExclamationCircle className="w-3 h-3" />
        };
      default:
        return {
          text: 'Unknown',
          color: 'bg-gray-100 text-gray-800 border border-gray-200',
          icon: <HiClock className="w-3 h-3" />
        };
    }
  };

  const getGradeColor = (score: number, totalPoints: number) => {
    const percentage = (score / totalPoints) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGradeLetter = (score: number, totalPoints: number) => {
    const percentage = (score / totalPoints) * 100;
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTimeRemaining = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffMs = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `Overdue ${Math.abs(diffDays)} days ago`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
  };

  const downloadGradeReport = (assignment: Assignment) => {
    if (!assignment.studentScore) return;
    
    let content = `Assignment Grade Report\n`;
    content += `======================\n\n`;
    content += `Student: ${user?.name || user?.email}\n`;
    content += `Assignment: ${assignment.title}\n`;
    content += `Course: ${assignment.courseTitle}\n`;
    content += `Instructor: ${assignment.instructorName}\n`;
    content += `Due Date: ${formatDate(assignment.dueDate)}\n`;
    content += `Submitted: ${assignment.submittedAt ? formatDate(assignment.submittedAt) : 'Not submitted'}\n`;
    content += `Status: ${assignment.studentStatus}\n`;
    content += `Score: ${assignment.studentScore}/${assignment.totalPoints}\n`;
    content += `Percentage: ${((assignment.studentScore / assignment.totalPoints) * 100).toFixed(1)}%\n`;
    content += `Grade: ${getGradeLetter(assignment.studentScore, assignment.totalPoints)}\n\n`;
    
    if (assignment.feedback) {
      content += `Instructor Feedback:\n`;
      content += `-------------------\n`;
      content += assignment.feedback + '\n';
    }
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${assignment.title.replace(/\s+/g, '_')}_grade_report.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-12 bg-gray-100 rounded-lg mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-3 sm:p-4 md:p-6">
      {/* Mobile Header */}
      <div className="lg:hidden mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold mb-1" style={{ color: BRAND_COLORS.darkNavy }}>
                My Assignments
              </h1>
              <p className="text-xs text-gray-600">
                {assignments.length} total • {filteredAssignments.length} shown
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                className="p-2 text-gray-600 hover:text-darkRoyalBlue hover:bg-gray-50 rounded-lg"
              >
                {viewMode === 'list' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          {/* Mobile Search */}
          <div className="relative mb-4">
            <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          
          {/* Mobile Filter Tabs */}
          <div className="flex overflow-x-auto -mx-1 pb-2">
            <div className="flex gap-1 flex-nowrap px-1">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${filter === 'pending' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilter('submitted')}
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${filter === 'submitted' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                Submitted
              </button>
              <button
                onClick={() => setFilter('graded')}
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${filter === 'graded' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                Graded
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-2" style={{ color: BRAND_COLORS.darkNavy }}>
                My Assignments
              </h1>
              <p className="text-gray-600">
                Manage and submit your course assignments
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-sm text-gray-500">
                  {assignments.length} total assignments
                </span>
                {filteredAssignments.length !== assignments.length && (
                  <div className="text-xs text-gray-400">
                    {filteredAssignments.length} filtered
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                  className="p-2 text-gray-600 hover:text-darkRoyalBlue hover:bg-gray-50 rounded-lg"
                >
                  {viewMode === 'list' ? 'Grid View' : 'List View'}
                </button>
              </div>
            </div>
          </div>
          
          {/* Desktop Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search assignments by title, course, or instructor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2.5 rounded-lg font-medium ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2.5 rounded-lg font-medium ${filter === 'pending' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilter('submitted')}
                className={`px-4 py-2.5 rounded-lg font-medium ${filter === 'submitted' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Submitted
              </button>
              <button
                onClick={() => setFilter('graded')}
                className={`px-4 py-2.5 rounded-lg font-medium ${filter === 'graded' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Graded
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Stats Summary */}
      <div className="lg:hidden grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Total</p>
              <h3 className="text-lg font-bold mt-1" style={{ color: BRAND_COLORS.darkNavy }}>
                {assignments.length}
              </h3>
            </div>
            <HiDocumentText className="w-6 h-6" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Pending</p>
              <h3 className="text-lg font-bold mt-1" style={{ color: BRAND_COLORS.darkNavy }}>
                {assignments.filter(a => a.studentStatus === 'not_started' || a.studentStatus === 'late').length}
              </h3>
            </div>
            <HiClock className="w-6 h-6 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Submitted</p>
              <h3 className="text-lg font-bold mt-1" style={{ color: BRAND_COLORS.darkNavy }}>
                {assignments.filter(a => a.studentStatus === 'submitted').length}
              </h3>
            </div>
            <HiDocumentText className="w-6 h-6 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Graded</p>
              <h3 className="text-lg font-bold mt-1" style={{ color: BRAND_COLORS.darkNavy }}>
                {assignments.filter(a => a.studentStatus === 'graded').length}
              </h3>
            </div>
            <HiCheckCircle className="w-6 h-6 text-green-500" />
          </div>
        </div>
      </div>

      {/* Desktop Stats Summary */}
      <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <h3 className="text-2xl font-bold mt-1" style={{ color: BRAND_COLORS.darkNavy }}>
                {assignments.length}
              </h3>
            </div>
            <HiDocumentText className="w-8 h-8" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <h3 className="text-2xl font-bold mt-1" style={{ color: BRAND_COLORS.darkNavy }}>
                {assignments.filter(a => a.studentStatus === 'not_started' || a.studentStatus === 'late').length}
              </h3>
            </div>
            <HiClock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Submitted</p>
              <h3 className="text-2xl font-bold mt-1" style={{ color: BRAND_COLORS.darkNavy }}>
                {assignments.filter(a => a.studentStatus === 'submitted').length}
              </h3>
            </div>
            <HiDocumentText className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Graded</p>
              <h3 className="text-2xl font-bold mt-1" style={{ color: BRAND_COLORS.darkNavy }}>
                {assignments.filter(a => a.studentStatus === 'graded').length}
              </h3>
            </div>
            <HiCheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Assignments List - Grid View (Mobile) */}
      {viewMode === 'grid' && (
        <div className="lg:hidden grid grid-cols-1 gap-3 mb-6">
          {filteredAssignments.length > 0 ? (
            filteredAssignments.map(assignment => {
              const statusBadge = getStatusBadge(assignment.studentStatus);
              const timeRemaining = getTimeRemaining(assignment.dueDate);
              
              return (
                <div 
                  key={assignment.id} 
                  className="bg-white rounded-xl border border-gray-200 p-4"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${statusBadge.color}`}>
                          {statusBadge.icon}
                          {statusBadge.text}
                        </span>
                        <h3 className="font-bold mt-2 text-sm" style={{ color: BRAND_COLORS.darkNavy }}>
                          {assignment.title.length > 40 ? assignment.title.substring(0, 40) + '...' : assignment.title}
                        </h3>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold" style={{ color: BRAND_COLORS.deepRed }}>
                          {assignment.totalPoints} pts
                        </div>
                      </div>
                    </div>
                    
                    {/* Grade Display for Graded Assignments */}
                    {assignment.studentStatus === 'graded' && assignment.studentScore && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs text-gray-600">Your Score</div>
                            <div className={`text-lg font-bold ${getGradeColor(assignment.studentScore, assignment.totalPoints)}`}>
                              {assignment.studentScore}/{assignment.totalPoints}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              Grade: {getGradeLetter(assignment.studentScore, assignment.totalPoints)}
                            </div>
                          </div>
                          <HiOutlineAcademicCap className="w-8 h-8 text-green-500" />
                        </div>
                      </div>
                    )}
                    
                    {/* Course Info */}
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="flex items-center gap-1">
                        <HiBookOpen className="w-3 h-3" />
                        <span className="truncate">{assignment.courseTitle}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <HiCalendar className="w-3 h-3" />
                        <span>Due: {formatDate(assignment.dueDate)}</span>
                      </div>
                      <div className={`text-xs font-medium ${timeRemaining.includes('Overdue') ? 'text-red-600' : 'text-gray-600'}`}>
                        {timeRemaining}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="pt-2 border-t border-gray-100">
                      {assignment.studentStatus === 'not_started' || assignment.studentStatus === 'late' ? (
                        <Link
                          href={`/lms/Student_Portal/assignments/${assignment.id}/submit`}
                          className="w-full py-2 px-3 rounded-lg font-medium text-white text-sm flex items-center justify-center gap-2"
                          style={{ backgroundColor: BRAND_COLORS.deepRed }}
                        >
                          {assignment.studentStatus === 'late' ? 'Submit Late' : 'Submit'}
                          <HiArrowRight className="w-3 h-3" />
                        </Link>
                      ) : assignment.studentStatus === 'submitted' ? (
                        <button
                          disabled
                          className="w-full py-2 px-3 rounded-lg font-medium bg-blue-100 text-blue-800 text-sm"
                        >
                          Awaiting Grade
                        </button>
                      ) : (
                        <Link
                          href={`/lms/Student_Portal/assignments/${assignment.id}/grade`}
                          className="w-full py-2 px-3 rounded-lg font-medium text-white text-sm flex items-center justify-center gap-2"
                          style={{ backgroundColor: BRAND_COLORS.darkRoyalBlue }}
                        >
                          View Grade
                          <HiEye className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 bg-white rounded-xl border border-gray-200">
              <HiDocumentText className="w-12 h-12 mx-auto mb-3" style={{ color: BRAND_COLORS.softGrey }} />
              <h3 className="text-lg font-medium mb-2">No assignments found</h3>
              <p className="text-gray-600 text-sm mb-4">
                {searchTerm ? 'Try a different search term' : 'No assignments available'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Assignments List - List View */}
      {(viewMode === 'list' || window.innerWidth >= 1024) && (
        <div className="space-y-4">
          {filteredAssignments.length > 0 ? (
            filteredAssignments.map(assignment => {
              const statusBadge = getStatusBadge(assignment.studentStatus);
              const timeRemaining = getTimeRemaining(assignment.dueDate);
              
              return (
                <div 
                  key={assignment.id} 
                  className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${statusBadge.color}`}>
                              {statusBadge.icon}
                              {statusBadge.text}
                            </span>
                            
                            {/* Grade Display */}
                            {assignment.studentStatus === 'graded' && assignment.studentScore && (
                              <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-1 rounded-full ${getGradeColor(assignment.studentScore, assignment.totalPoints)} font-bold border`}>
                                  {assignment.studentScore}/{assignment.totalPoints}
                                </span>
                                <span className={`text-xs font-bold ${getGradeColor(assignment.studentScore, assignment.totalPoints)}`}>
                                  {getGradeLetter(assignment.studentScore, assignment.totalPoints)}
                                </span>
                                <button
                                  onClick={() => downloadGradeReport(assignment)}
                                  className="p-1 text-gray-400 hover:text-gray-600"
                                  title="Download Grade Report"
                                >
                                  <HiDownload className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                          
                          <h3 className="text-lg md:text-xl font-bold mb-2" style={{ color: BRAND_COLORS.darkNavy }}>
                            {assignment.title}
                          </h3>
                          <p className="text-gray-600 mb-4 text-sm md:text-base line-clamp-2">
                            {assignment.description}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-base md:text-lg font-bold" style={{ color: BRAND_COLORS.deepRed }}>
                            {assignment.totalPoints} points
                          </div>
                          <div className={`text-xs md:text-sm font-medium ${
                            timeRemaining.includes('Overdue') ? 'text-red-600' : 
                            timeRemaining.includes('today') ? 'text-orange-600' : 
                            'text-gray-600'
                          }`}>
                            {timeRemaining}
                          </div>
                        </div>
                      </div>
                      
                      {/* Course Info - Mobile Stacked */}
                      <div className="lg:hidden space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <HiBookOpen className="w-4 h-4 mr-2" />
                          <span className="font-medium">{assignment.courseTitle}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <HiUser className="w-4 h-4 mr-2" />
                          <span className="truncate">{assignment.instructorName}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <HiCalendar className="w-4 h-4 mr-2" />
                          <span>Due: {formatDate(assignment.dueDate)}</span>
                        </div>
                      </div>
                      
                      {/* Course Info - Desktop Grid */}
                      <div className="hidden lg:grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <HiBookOpen className="w-4 h-4 mr-2" />
                          <span className="font-medium">{assignment.courseTitle}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <HiUser className="w-4 h-4 mr-2" />
                          <span>{assignment.instructorName}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <HiCalendar className="w-4 h-4 mr-2" />
                          <span>Due: {formatDate(assignment.dueDate)}</span>
                        </div>
                      </div>
                      
                      {assignment.submittedAt && (
                        <div className="text-sm text-gray-500">
                          Submitted on: {formatDate(assignment.submittedAt)}
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons - Mobile Full Width */}
                    <div className="lg:hidden flex flex-col gap-2">
                      {assignment.studentStatus === 'not_started' || assignment.studentStatus === 'late' ? (
                        <Link
                          href={`/lms/Student_Portal/assignments/${assignment.id}/submit`}
                          className="w-full py-2.5 px-4 rounded-lg font-medium text-white text-center flex items-center justify-center gap-2"
                          style={{ backgroundColor: BRAND_COLORS.deepRed }}
                        >
                          {assignment.studentStatus === 'late' ? 'Submit Late' : 'Submit Assignment'}
                          <HiArrowRight className="w-4 h-4" />
                        </Link>
                      ) : assignment.studentStatus === 'submitted' ? (
                        <button
                          disabled
                          className="w-full py-2.5 px-4 rounded-lg font-medium bg-blue-100 text-blue-800 text-center text-sm"
                        >
                          Awaiting Grade
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <Link
                            href={`/lms/Student_Portal/assignments/${assignment.id}/grade`}
                            className="flex-1 py-2.5 px-4 rounded-lg font-medium text-white text-center flex items-center justify-center gap-2 text-sm"
                            style={{ backgroundColor: BRAND_COLORS.darkRoyalBlue }}
                          >
                            View Grade
                          </Link>
                          <button
                            onClick={() => downloadGradeReport(assignment)}
                            className="p-2.5 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
                            title="Download Report"
                          >
                            <HiDownload className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      
                      <Link
                        href={`/lms/Student_Portal/assignments/${assignment.id}/view`}
                        className="w-full py-2.5 px-4 rounded-lg font-medium border border-gray-300 text-gray-700 text-center hover:bg-gray-50 text-sm"
                      >
                        View Details
                      </Link>
                    </div>
                    
                    {/* Action Buttons - Desktop Side */}
                    <div className="hidden lg:flex lg:w-48 flex-col gap-2">
                      {assignment.studentStatus === 'not_started' || assignment.studentStatus === 'late' ? (
                        <Link
                          href={`/lms/Student_Portal/assignments/${assignment.id}/submit`}
                          className="w-full py-2.5 px-4 rounded-lg font-medium text-white text-center flex items-center justify-center gap-2 transition-colors"
                          style={{ backgroundColor: BRAND_COLORS.deepRed }}
                        >
                          {assignment.studentStatus === 'late' ? 'Submit Late' : 'Submit Assignment'}
                          <HiArrowRight className="w-4 h-4" />
                        </Link>
                      ) : assignment.studentStatus === 'submitted' ? (
                        <button
                          disabled
                          className="w-full py-2.5 px-4 rounded-lg font-medium bg-blue-100 text-blue-800 text-center"
                        >
                          Awaiting Grade
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <Link
                            href={`/lms/Student_Portal/assignments/${assignment.id}/grade`}
                            className="flex-1 py-2.5 px-4 rounded-lg font-medium text-white text-center flex items-center justify-center gap-2"
                            style={{ backgroundColor: BRAND_COLORS.darkRoyalBlue }}
                          >
                            View Grade
                            <HiArrowRight className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => downloadGradeReport(assignment)}
                            className="p-2.5 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
                            title="Download Grade Report"
                          >
                            <HiDownload className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      
                      <Link
                        href={`/lms/Student_Portal/assignments/${assignment.id}/view`}
                        className="w-full py-2.5 px-4 rounded-lg font-medium border border-gray-300 text-gray-700 text-center hover:bg-gray-50 transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <HiDocumentText className="w-16 h-16 mx-auto mb-4" style={{ color: BRAND_COLORS.softGrey }} />
              <h3 className="text-xl font-medium mb-2" style={{ color: BRAND_COLORS.darkGrey }}>
                No assignments found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ? 'Try a different search term' : 'No assignments available at the moment'}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-6 py-2 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}