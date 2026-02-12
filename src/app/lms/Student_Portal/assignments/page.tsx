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
  HiUser,
  HiBookOpen,
  HiDownload,
  HiEye,
  HiOutlineAcademicCap,
} from 'react-icons/hi';

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

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadData = () => {
      try {
        const currentUserStr = localStorage.getItem('currentUser');
        if (currentUserStr) {
          const userData = JSON.parse(currentUserStr);
          setUser(userData);

          const studentCoursesStr = localStorage.getItem('studentCourses');
          if (studentCoursesStr) {
            const courses = JSON.parse(studentCoursesStr);
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

      courses.forEach((course) => {
        const courseAssignments = allAssignments
          .filter((assignment: any) => {
            const matchesCourseId = assignment.courseId === course.id;
            const matchesCourseTitle =
              assignment.courseTitle?.toLowerCase() === course.title?.toLowerCase();
            return (matchesCourseId || matchesCourseTitle) && assignment.status === 'published';
          })
          .map((assignment: any) => {
            const instructor = allInstructors.find(
              (inst: any) => inst.id === assignment.instructorId
            ) || { name: assignment.instructorName || '' };

            const submission = studentSubmissions.find(
              (sub: any) =>
                sub.assignmentId === assignment.id &&
                (sub.studentEmail === studentEmail || sub.studentId === studentId)
            );

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
              feedback: submission?.feedback,
            };
          });

        studentAssignments.push(...courseAssignments);
      });

      studentAssignments.sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      );

      setAssignments(studentAssignments);
      setFilteredAssignments(studentAssignments);
    } catch (error) {
      console.error('Error loading student assignments:', error);
    }
  };

  useEffect(() => {
    let filtered = assignments;

    if (searchTerm) {
      filtered = filtered.filter(
        (assignment) =>
          assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          assignment.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          assignment.instructorName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filter === 'pending') {
      filtered = filtered.filter((a) => a.studentStatus === 'not_started' || a.studentStatus === 'late');
    } else if (filter === 'submitted') {
      filtered = filtered.filter((a) => a.studentStatus === 'submitted');
    } else if (filter === 'graded') {
      filtered = filtered.filter((a) => a.studentStatus === 'graded');
    }

    setFilteredAssignments(filtered);
  }, [searchTerm, filter, assignments]);

  const getStatusBadge = (status: Assignment['studentStatus']) => {
    switch (status) {
      case 'not_started':
        return {
          text: 'Not Started',
          color: 'bg-gray-100 text-gray-800 border border-gray-200',
          icon: <HiClock className="w-3 h-3" />,
        };
      case 'submitted':
        return {
          text: 'Submitted',
          color: 'bg-blue-100 text-blue-800 border border-blue-200',
          icon: <HiDocumentText className="w-3 h-3" />,
        };
      case 'graded':
        return {
          text: 'Graded',
          color: 'bg-green-100 text-green-800 border border-green-200',
          icon: <HiCheckCircle className="w-3 h-3" />,
        };
      case 'late':
        return {
          text: 'Late',
          color: 'bg-red-100 text-red-800 border border-red-200',
          icon: <HiExclamationCircle className="w-3 h-3" />,
        };
      default:
        return {
          text: 'Unknown',
          color: 'bg-gray-100 text-gray-800 border border-gray-200',
          icon: <HiClock className="w-3 h-3" />,
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
      year: 'numeric',
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
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const pendingCount = assignments.filter(
    (a) => a.studentStatus === 'not_started' || a.studentStatus === 'late'
  ).length;
  const submittedCount = assignments.filter((a) => a.studentStatus === 'submitted').length;
  const gradedCount = assignments.filter((a) => a.studentStatus === 'graded').length;

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      {/* Header with stats */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
              My Assignments
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {assignments.length} total • {filteredAssignments.length} shown
            </p>
          </div>
        </div>

        {/* Stats cards - responsive grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Total</p>
                <p className="text-lg sm:text-xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
                  {assignments.length}
                </p>
              </div>
              <HiDocumentText className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Pending</p>
                <p className="text-lg sm:text-xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
                  {pendingCount}
                </p>
              </div>
              <HiClock className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Submitted</p>
                <p className="text-lg sm:text-xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
                  {submittedCount}
                </p>
              </div>
              <HiDocumentText className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Graded</p>
                <p className="text-lg sm:text-xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
                  {gradedCount}
                </p>
              </div>
              <HiCheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Search and filters - responsive */}
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, course, or instructor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium text-xs sm:text-sm transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium text-xs sm:text-sm transition-colors ${
                filter === 'pending'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('submitted')}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium text-xs sm:text-sm transition-colors ${
                filter === 'submitted'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Submitted
            </button>
            <button
              onClick={() => setFilter('graded')}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium text-xs sm:text-sm transition-colors ${
                filter === 'graded'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Graded
            </button>
          </div>
        </div>
      </div>

      {/* Assignments list */}
      {filteredAssignments.length > 0 ? (
        <div className="space-y-4">
          {filteredAssignments.map((assignment) => {
            const statusBadge = getStatusBadge(assignment.studentStatus);
            const timeRemaining = getTimeRemaining(assignment.dueDate);

            return (
              <div
                key={assignment.id}
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
                      {assignment.studentStatus === 'graded' && assignment.studentScore && (
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-bold border ${getGradeColor(
                              assignment.studentScore,
                              assignment.totalPoints
                            )}`}
                          >
                            {assignment.studentScore}/{assignment.totalPoints}
                          </span>
                          <span
                            className={`text-xs font-bold ${getGradeColor(
                              assignment.studentScore,
                              assignment.totalPoints
                            )}`}
                          >
                            {getGradeLetter(assignment.studentScore, assignment.totalPoints)}
                          </span>
                          <button
                            onClick={() => downloadGradeReport(assignment)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                            title="Download Grade Report"
                          >
                            <HiDownload className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <h3
                      className="text-base sm:text-lg font-bold mb-2"
                      style={{ color: BRAND_COLORS.darkNavy }}
                    >
                      {assignment.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {assignment.description}
                    </p>

                    {/* Course metadata - grid on mobile, row on desktop */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <HiBookOpen className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{assignment.courseTitle}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <HiUser className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{assignment.instructorName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <HiCalendar className="w-4 h-4 flex-shrink-0" />
                        <span>Due: {formatDate(assignment.dueDate)}</span>
                      </div>
                    </div>

                    {assignment.submittedAt && (
                      <div className="text-xs text-gray-500">
                        Submitted: {formatDate(assignment.submittedAt)}
                      </div>
                    )}
                  </div>

                  {/* Right actions - stacked on mobile, row on desktop */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:w-48">
                    {assignment.studentStatus === 'not_started' || assignment.studentStatus === 'late' ? (
                      <Link
                        href={`/lms/Student_Portal/assignments/${assignment.id}/submit`}
                        className="w-full py-2.5 px-4 rounded-lg font-medium text-white text-center inline-flex items-center justify-center gap-2 text-sm transition-colors"
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
                      <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
                        <Link
                          href={`/lms/Student_Portal/assignments/${assignment.id}/grade`}
                          className="flex-1 py-2.5 px-4 rounded-lg font-medium text-white text-center inline-flex items-center justify-center gap-2 text-sm transition-colors"
                          style={{ backgroundColor: BRAND_COLORS.darkRoyalBlue }}
                        >
                          View Grade
                          <HiArrowRight className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => downloadGradeReport(assignment)}
                          className="py-2.5 px-4 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 inline-flex items-center justify-center gap-2 text-sm"
                        >
                          <HiDownload className="w-4 h-4" />
                          <span className="sm:hidden lg:inline">Download</span>
                        </button>
                      </div>
                    )}

                    <Link
                      href={`/lms/Student_Portal/assignments/${assignment.id}/view`}
                      className="w-full py-2.5 px-4 rounded-lg font-medium border border-gray-300 text-gray-700 text-center hover:bg-gray-50 transition-colors text-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <HiDocumentText className="w-16 h-16 mx-auto mb-4" style={{ color: BRAND_COLORS.softGrey }} />
          <h3 className="text-lg sm:text-xl font-medium mb-2" style={{ color: BRAND_COLORS.darkGrey }}>
            No assignments found
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            {searchTerm
              ? `No assignments match "${searchTerm}"`
              : 'No assignments available at the moment'}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="px-6 py-2 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm"
            >
              Clear Search
            </button>
          )}
        </div>
      )}
    </div>
  );
}