// app/lms/Student_Portal/assignments/[id]/grade/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  HiArrowLeft,
  HiDocumentText,
  HiCalendar,
  HiClock,
  HiUser,
  HiBookOpen,
  HiPaperClip,
  HiCheckCircle,
  HiExclamationCircle,
  HiDownload,
  HiStar,
  HiAcademicCap,
  HiChat,
  HiChartBar
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
  status: 'draft' | 'published' | 'closed';
}

interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  submittedAt: string;
  files: Array<{
    name: string;
    size: number;
    type: string;
  }>;
  textResponse?: string;
  status: 'graded';
  score: number;
  feedback?: string;
  gradedAt: string;
}

export default function StudentGradeViewPage() {
  const router = useRouter();
  const params = useParams();
  const assignmentId = params.id as string;

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load user data
        const currentUserStr = localStorage.getItem('currentUser');
        if (currentUserStr) {
          const userData = JSON.parse(currentUserStr);
          setUser(userData);
          
          // Load assignment
          const allAssignments = JSON.parse(localStorage.getItem('instructor_assignments') || '[]');
          const foundAssignment = allAssignments.find((a: any) => a.id === assignmentId);
          
          if (foundAssignment) {
            // Load instructor details
            const allInstructors = JSON.parse(localStorage.getItem('lms_instructors') || '[]');
            const instructor = allInstructors.find((inst: any) => 
              inst.id === foundAssignment.instructorId
            ) || { name: foundAssignment.instructorName || 'Unknown Instructor' };
            
            // Load student courses to get course title
            const studentCoursesStr = localStorage.getItem('studentCourses');
            let courseTitle = foundAssignment.courseTitle || 'Unknown Course';
            
            if (studentCoursesStr) {
              const studentCourses = JSON.parse(studentCoursesStr);
              const studentCourse = studentCourses.find((course: any) => 
                course.id === foundAssignment.courseId ||
                course.title?.toLowerCase() === foundAssignment.courseTitle?.toLowerCase()
              );
              if (studentCourse) {
                courseTitle = studentCourse.title;
              }
            }
            
            const assignmentData: Assignment = {
              ...foundAssignment,
              courseTitle,
              instructorName: instructor.name
            };
            
            setAssignment(assignmentData);
            
            // Load student submission
            const studentSubmissions = JSON.parse(localStorage.getItem('student_submissions') || '[]');
            const studentSubmission = studentSubmissions.find((sub: any) => 
              sub.assignmentId === assignmentId && 
              (sub.studentEmail === userData.email || sub.studentId === userData.id) &&
              sub.status === 'graded'
            );
            
            if (studentSubmission) {
              setSubmission(studentSubmission);
            }
          }
        }
      } catch (error) {
        console.error('Error loading grade:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [assignmentId]);

  const getGradeLetter = (score: number) => {
    if (!assignment) return 'N/A';
    const percentage = (score / assignment.totalPoints) * 100;
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  const getGradeColor = (score: number) => {
    if (!assignment) return 'text-gray-600';
    const percentage = (score / assignment.totalPoints) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGradeBackgroundColor = (score: number) => {
    if (!assignment) return 'bg-gray-100';
    const percentage = (score / assignment.totalPoints) * 100;
    if (percentage >= 90) return 'bg-green-50 border-green-200';
    if (percentage >= 80) return 'bg-blue-50 border-blue-200';
    if (percentage >= 70) return 'bg-yellow-50 border-yellow-200';
    if (percentage >= 60) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  const getPerformanceMessage = (score: number) => {
    if (!assignment) return '';
    const percentage = (score / assignment.totalPoints) * 100;
    
    if (percentage >= 90) {
      return "Excellent work! You've demonstrated outstanding understanding of the material.";
    } else if (percentage >= 80) {
      return "Great job! You have a strong grasp of the concepts.";
    } else if (percentage >= 70) {
      return "Good work! You understand the main concepts well.";
    } else if (percentage >= 60) {
      return "Fair effort. Consider reviewing the material for better understanding.";
    } else {
      return "Needs improvement. Please review the material and seek help if needed.";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const downloadGradeReport = () => {
    if (!assignment || !submission) return;
    
    let content = `Grade Report\n`;
    content += `===========\n\n`;
    content += `Student: ${user?.name || user?.email}\n`;
    content += `Assignment: ${assignment.title}\n`;
    content += `Course: ${assignment.courseTitle}\n`;
    content += `Instructor: ${assignment.instructorName}\n`;
    content += `Due Date: ${formatDate(assignment.dueDate)}\n`;
    content += `Submitted: ${formatDate(submission.submittedAt)}\n`;
    content += `Graded: ${formatDate(submission.gradedAt)}\n\n`;
    content += `Score: ${submission.score}/${assignment.totalPoints}\n`;
    content += `Percentage: ${((submission.score / assignment.totalPoints) * 100).toFixed(1)}%\n`;
    content += `Grade: ${getGradeLetter(submission.score)}\n\n`;
    content += `Performance Summary:\n`;
    content += `${getPerformanceMessage(submission.score)}\n\n`;
    
    if (submission.feedback) {
      content += `Instructor Feedback:\n`;
      content += `-------------------\n`;
      content += submission.feedback + '\n\n';
    }
    
    if (submission.textResponse) {
      content += `Your Submission:\n`;
      content += `----------------\n`;
      content += submission.textResponse.substring(0, 500) + (submission.textResponse.length > 500 ? '...' : '') + '\n\n';
    }
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${assignment.title.replace(/\s+/g, '_')}_grade_report_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-200 rounded mb-6"></div>
            <div className="h-64 bg-gray-100 rounded-lg mb-6"></div>
            <div className="h-96 bg-gray-100 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <HiExclamationCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h1 className="text-2xl font-bold mb-2" style={{ color: BRAND_COLORS.darkNavy }}>
              Assignment Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              The assignment you're looking for doesn't exist or you don't have access to it.
            </p>
            <Link
              href="/lms/Student_Portal/assignments"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-white"
              style={{ backgroundColor: BRAND_COLORS.deepRed }}
            >
              <HiArrowLeft className="w-4 h-4" />
              Back to Assignments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <HiClock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h1 className="text-2xl font-bold mb-2" style={{ color: BRAND_COLORS.darkNavy }}>
              Grade Not Available
            </h1>
            <p className="text-gray-600 mb-6">
              This assignment hasn't been graded yet. Please check back later.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={`/lms/Student_Portal/assignments/${assignment.id}/view`}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <HiDocumentText className="w-4 h-4" />
                View Assignment
              </Link>
              <Link
                href="/lms/Student_Portal/assignments"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-white"
                style={{ backgroundColor: BRAND_COLORS.deepRed }}
              >
                <HiArrowLeft className="w-4 h-4" />
                Back to Assignments
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const percentage = (submission.score / assignment.totalPoints) * 100;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Link
                href="/lms/Student_Portal/assignments"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <HiArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back to Assignments</span>
              </Link>
            </div>
            
            <button
              onClick={downloadGradeReport}
              className="flex items-center gap-2 px-4 py-2.5 border border-darkRoyalBlue text-darkRoyalBlue rounded-lg hover:bg-darkRoyalBlue/5 transition-colors"
            >
              <HiDownload className="w-4 h-4" />
              <span>Download Report</span>
            </button>
          </div>

          {/* Grade Summary Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2" style={{ color: BRAND_COLORS.darkNavy }}>
                  {assignment.title}
                </h1>
                <p className="text-gray-600 mb-4">Grade Details</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Your Score</div>
                    <div className="text-2xl font-bold" style={{ color: BRAND_COLORS.deepRed }}>
                      {submission.score}/{assignment.totalPoints}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Percentage</div>
                    <div className={`text-2xl font-bold ${getGradeColor(submission.score)}`}>
                      {percentage.toFixed(1)}%
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Letter Grade</div>
                    <div className={`text-2xl font-bold ${getGradeColor(submission.score)}`}>
                      {getGradeLetter(submission.score)}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Status</div>
                    <div className="flex items-center gap-2">
                      <HiCheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-lg font-medium text-green-600">Graded</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="lg:w-48">
                <div className={`flex items-center justify-center rounded-lg p-6 border ${getGradeBackgroundColor(submission.score)}`}>
                  <div className="text-center">
                    <HiAcademicCap className="w-12 h-12 mx-auto mb-2" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
                    <div className={`text-3xl font-bold ${getGradeColor(submission.score)}`}>
                      {getGradeLetter(submission.score)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Final Grade
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Feedback and Details */}
          <div className="lg:col-span-2">
            {/* Performance Summary */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-bold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
                Performance Summary
              </h2>
              
              <div className={`rounded-lg p-5 mb-4 ${getGradeBackgroundColor(submission.score)}`}>
                <div className="flex items-start gap-3">
                  <HiChartBar className="w-5 h-5 mt-0.5" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
                  <div>
                    <h3 className="font-bold mb-2">How you performed:</h3>
                    <p className="text-gray-700">{getPerformanceMessage(submission.score)}</p>
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Score Progress</span>
                  <span>{percentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="h-3 rounded-full"
                    style={{ 
                      backgroundColor: getGradeColor(submission.score).replace('text-', 'bg-'),
                      width: `${percentage}%`
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span>{assignment.totalPoints}</span>
                </div>
              </div>
            </div>

            {/* Instructor Feedback */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
                  Instructor Feedback
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <HiUser className="w-4 h-4" />
                  <span>{assignment.instructorName}</span>
                </div>
              </div>
              
              {submission.feedback ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                  <div className="whitespace-pre-wrap text-gray-700">
                    {submission.feedback}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 text-center">
                  <HiChat className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-600">No feedback provided by instructor.</p>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 text-sm text-gray-500">
                <div className="flex items-center gap-2 mb-2 sm:mb-0">
                  <HiCalendar className="w-4 h-4" />
                  <span>Graded on: {formatDate(submission.gradedAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <HiCalendar className="w-4 h-4" />
                  <span>Submitted on: {formatDate(submission.submittedAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Assignment Details */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Assignment Info */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-bold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
                  Assignment Details
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <HiBookOpen className="w-5 h-5 mr-3 mt-0.5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-600">Course</div>
                      <div className="font-medium">{assignment.courseTitle}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <HiUser className="w-5 h-5 mr-3 mt-0.5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-600">Instructor</div>
                      <div className="font-medium">{assignment.instructorName}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <HiCalendar className="w-5 h-5 mr-3 mt-0.5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-600">Due Date</div>
                      <div className="font-medium">{formatDate(assignment.dueDate)}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <HiDocumentText className="w-5 h-5 mr-3 mt-0.5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-600">Total Points</div>
                      <div className="font-bold" style={{ color: BRAND_COLORS.deepRed }}>
                        {assignment.totalPoints}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Your Submission */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-bold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
                  Your Submission
                </h3>
                
                {submission.textResponse && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Text Response</div>
                    <div className="text-sm text-gray-600 line-clamp-3 bg-gray-50 p-3 rounded">
                      {submission.textResponse.substring(0, 150)}...
                    </div>
                  </div>
                )}
                
                {submission.files && submission.files.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Files Submitted</div>
                    <div className="space-y-2">
                      {submission.files.slice(0, 3).map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <div className="flex items-center gap-2">
                            <HiPaperClip className="w-4 h-4 text-gray-400" />
                            <span className="text-sm truncate">{file.name}</span>
                          </div>
                          <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-6">
                  <Link
                    href={`/lms/Student_Portal/assignments/${assignment.id}/view`}
                    className="block w-full py-2.5 px-4 rounded-lg font-medium border border-gray-300 text-gray-700 text-center hover:bg-gray-50 transition-colors"
                  >
                    View Full Submission
                  </Link>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-bold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
                  Actions
                </h3>
                
                <div className="space-y-3">
                  <button
                    onClick={downloadGradeReport}
                    className="w-full py-2.5 px-4 rounded-lg font-medium border border-darkRoyalBlue text-darkRoyalBlue hover:bg-darkRoyalBlue/5 transition-colors flex items-center justify-center gap-2"
                  >
                    <HiDownload className="w-4 h-4" />
                    Download Grade Report
                  </button>
                  
                  <Link
                    href={`/lms/Student_Portal/assignments/${assignment.id}/view`}
                    className="block w-full py-2.5 px-4 rounded-lg font-medium border border-gray-300 text-gray-700 text-center hover:bg-gray-50 transition-colors"
                  >
                    View Assignment Details
                  </Link>
                  
                  <Link
                    href="/lms/Student_Portal/assignments"
                    className="block w-full py-2.5 px-4 rounded-lg font-medium text-white text-center transition-colors"
                    style={{ backgroundColor: BRAND_COLORS.deepRed }}
                  >
                    Back to Assignments
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grade Comparison (Mobile Only) */}
        <div className="lg:hidden mt-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
              Grade Breakdown
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Your Score</span>
                  <span>{percentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full"
                    style={{ 
                      backgroundColor: getGradeColor(submission.score).replace('text-', 'bg-'),
                      width: `${percentage}%`
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-xl font-bold text-green-600">{getGradeLetter(submission.score)}</div>
                  <div className="text-xs text-green-700">Letter Grade</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-xl font-bold text-blue-600">{submission.score}/{assignment.totalPoints}</div>
                  <div className="text-xs text-blue-700">Score</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}