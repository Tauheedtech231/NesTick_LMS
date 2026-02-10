// app/lms/Student_Portal/assignments/[id]/view/page.tsx
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
  HiEye,
  HiPencilAlt
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
  createdAt: string;
  updatedAt: string;
}

interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentEmail: string;
  studentName: string;
  submittedAt: string;
  files: Array<{
    name: string;
    size: number;
    type: string;
    url?: string;
  }>;
  textResponse?: string;
  status: 'submitted' | 'graded';
  score?: number;
  feedback?: string;
  gradedAt?: string;
}

export default function AssignmentViewPage() {
  const router = useRouter();
  const params = useParams();
  const assignmentId = params.id as string;

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load user data
        const currentUserStr = localStorage.getItem('currentUser');
        if (currentUserStr) {
          const userData = JSON.parse(currentUserStr);
          setUser(userData);
          
          // Load assignments
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
            
            // Load submission if exists
            const studentSubmissions = JSON.parse(localStorage.getItem('student_submissions') || '[]');
            const studentSubmission = studentSubmissions.find((sub: any) => 
              sub.assignmentId === assignmentId && 
              (sub.studentEmail === userData.email || sub.studentId === userData.id)
            );
            
            if (studentSubmission) {
              setSubmission(studentSubmission);
            }
          }
        }
      } catch (error) {
        console.error('Error loading assignment:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [assignmentId]);

  const getTimeRemaining = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffMs = due.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffMs < 0) {
      return {
        text: 'Overdue',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: <HiExclamationCircle className="w-4 h-4" />
      };
    } else if (diffHours < 24) {
      return {
        text: `Due in ${diffHours} hours`,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        icon: <HiClock className="w-4 h-4" />
      };
    } else {
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      return {
        text: `Due in ${diffDays} days`,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        icon: <HiCalendar className="w-4 h-4" />
      };
    }
  };

  const getSubmissionStatus = () => {
    if (!submission) {
      return {
        text: 'Not Submitted',
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        borderColor: 'border-gray-200',
        icon: <HiClock className="w-4 h-4" />
      };
    }
    
    if (submission.status === 'graded') {
      return {
        text: `Graded - ${submission.score}/${assignment?.totalPoints}`,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: <HiCheckCircle className="w-4 h-4" />
      };
    }
    
    return {
      text: 'Submitted - Awaiting Grade',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      icon: <HiDocumentText className="w-4 h-4" />
    };
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

  const timeRemaining = getTimeRemaining(assignment.dueDate);
  const submissionStatus = getSubmissionStatus();

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
                <span>Back to Assignments</span>
              </Link>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <div className={`px-4 py-2 rounded-full ${timeRemaining.bgColor} ${timeRemaining.borderColor} border flex items-center gap-2`}>
                {timeRemaining.icon}
                <span className={`font-medium ${timeRemaining.color}`}>
                  {timeRemaining.text}
                </span>
              </div>
              
              <div className={`px-4 py-2 rounded-full ${submissionStatus.bgColor} ${submissionStatus.borderColor} border flex items-center gap-2`}>
                {submissionStatus.icon}
                <span className={`font-medium ${submissionStatus.color}`}>
                  {submissionStatus.text}
                </span>
              </div>
            </div>
          </div>

          {/* Assignment Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-2xl font-bold mb-2" style={{ color: BRAND_COLORS.darkNavy }}>
                      {assignment.title}
                    </h1>
                    <div className="text-lg" style={{ color: BRAND_COLORS.deepRed }}>
                      {assignment.totalPoints} points
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {(!submission || submission.status === 'submitted') && (
                      <Link
                        href={`/lms/Student_Portal/assignments/${assignment.id}/submit`}
                        className="px-4 py-2 rounded-lg font-medium text-white flex items-center gap-2"
                        style={{ backgroundColor: BRAND_COLORS.deepRed }}
                      >
                        <HiPencilAlt className="w-4 h-4" />
                        {submission ? 'Edit Submission' : 'Submit Assignment'}
                      </Link>
                    )}
                    
                    {submission?.status === 'graded' && (
                      <Link
                        href={`/lms/Student_Portal/assignments/${assignment.id}/grade`}
                        className="px-4 py-2 rounded-lg font-medium text-white flex items-center gap-2"
                        style={{ backgroundColor: BRAND_COLORS.darkRoyalBlue }}
                      >
                        <HiEye className="w-4 h-4" />
                        View Grade
                      </Link>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-start text-sm">
                    <HiBookOpen className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-600">Course</div>
                      <div>{assignment.courseTitle}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start text-sm">
                    <HiUser className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-600">Instructor</div>
                      <div>{assignment.instructorName}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start text-sm">
                    <HiCalendar className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-600">Due Date</div>
                      <div>{formatDate(assignment.dueDate)}</div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-8">
                  <h3 className="font-bold mb-3" style={{ color: BRAND_COLORS.darkNavy }}>
                    Assignment Description
                  </h3>
                  <div className="text-gray-700 bg-gray-50 p-5 rounded-lg border border-gray-200 whitespace-pre-wrap">
                    {assignment.description}
                  </div>
                </div>
                
                {/* Submission Details */}
                {submission && (
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="font-bold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
                      Your Submission
                    </h3>
                    
                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-5 mb-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Submitted On</div>
                          <div className="font-medium">{formatDate(submission.submittedAt)}</div>
                        </div>
                        
                        {submission.status === 'graded' && (
                          <div className="text-right">
                            <div className="text-sm text-gray-600 mb-1">Score</div>
                            <div className="text-xl font-bold" style={{ color: BRAND_COLORS.deepRed }}>
                              {submission.score}/{assignment.totalPoints}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {submission.textResponse && (
                        <div className="mb-4">
                          <div className="text-sm font-medium text-gray-700 mb-2">Text Response</div>
                          <div className="bg-white p-4 rounded border border-gray-300 whitespace-pre-wrap">
                            {submission.textResponse}
                          </div>
                        </div>
                      )}
                      
                      {submission.files && submission.files.length > 0 && (
                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-2">Attached Files</div>
                          <div className="space-y-2">
                            {submission.files.map((file, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-300"
                              >
                                <div className="flex items-center gap-3">
                                  <HiPaperClip className="w-5 h-5 text-gray-400" />
                                  <div>
                                    <div className="font-medium text-sm">{file.name}</div>
                                    <div className="text-xs text-gray-500">
                                      {formatFileSize(file.size)} • {file.type}
                                    </div>
                                  </div>
                                </div>
                                <button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
                                  <HiDownload className="w-4 h-4" />
                                  Download
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {submission.feedback && (
                        <div className="mt-4">
                          <div className="text-sm font-medium text-gray-700 mb-2">Instructor Feedback</div>
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 whitespace-pre-wrap">
                            {submission.feedback}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/lms/Student_Portal/assignments/${assignment.id}/submit`}
              className={`px-5 py-2.5 rounded-lg font-medium text-white flex items-center gap-2 ${
                submission?.status === 'graded' ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              style={{ backgroundColor: BRAND_COLORS.deepRed }}
              onClick={(e) => {
                if (submission?.status === 'graded') {
                  e.preventDefault();
                  alert('This assignment has been graded and cannot be modified.');
                }
              }}
            >
              <HiPencilAlt className="w-4 h-4" />
              {submission ? 'Edit Submission' : 'Submit Assignment'}
            </Link>
            
            <Link
              href="/lms/Student_Portal/assignments"
              className="px-5 py-2.5 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <HiArrowLeft className="w-4 h-4" />
              Back to All Assignments
            </Link>
            
            {submission?.status === 'graded' && (
              <Link
                href={`/lms/Student_Portal/assignments/${assignment.id}/grade`}
                className="px-5 py-2.5 rounded-lg font-medium text-white flex items-center gap-2"
                style={{ backgroundColor: BRAND_COLORS.darkRoyalBlue }}
              >
                <HiEye className="w-4 h-4" />
                View Detailed Grade
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}