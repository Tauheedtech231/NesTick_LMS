// app/lms/Student_Portal/assignments/[id]/submit/page.tsx
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
  HiUpload
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
/* eslint-disable */
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
  studentStatus?: 'not_started' | 'submitted' | 'graded' | 'late';
}

interface Submission {
  id?: string;
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
}

export default function AssignmentSubmitPage() {
  const router = useRouter();
  const params = useParams();
  const assignmentId = params.id as string;

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existingSubmission, setExistingSubmission] = useState<Submission | null>(null);
  const [user, setUser] = useState<any>(null);

  // Submission form state
  const [textResponse, setTextResponse] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);

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
            
            // Check for existing submission
            const studentSubmissions = JSON.parse(localStorage.getItem('student_submissions') || '[]');
            const submission = studentSubmissions.find((sub: any) => 
              sub.assignmentId === assignmentId && 
              (sub.studentEmail === userData.email || sub.studentId === userData.id)
            );
            
            if (submission) {
              setExistingSubmission(submission);
              setTextResponse(submission.textResponse || '');
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      const newFiles = Array.from(selectedFiles);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles) {
      const newFiles = Array.from(droppedFiles);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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
        borderColor: 'border-red-200'
      };
    } else if (diffHours < 24) {
      return {
        text: `Due in ${diffHours} hours`,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200'
      };
    } else {
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      return {
        text: `Due in ${diffDays} days`,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200'
      };
    }
  };

  const handleSubmit = async () => {
    if (!assignment || !user) return;

    if (files.length === 0 && textResponse.trim() === '') {
      alert('Please add a text response or upload files before submitting.');
      return;
    }

    try {
      setSubmitting(true);

      // Prepare submission data
      const submission: Submission = {
        assignmentId: assignment.id,
        studentId: user.id || user.learnerId,
        studentEmail: user.email,
        studentName: user.name || user.email,
        submittedAt: new Date().toISOString(),
        files: files.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type
        })),
        textResponse: textResponse.trim(),
        status: 'submitted'
      };

      // Save to localStorage
      const existingSubmissions = JSON.parse(localStorage.getItem('student_submissions') || '[]');
      
      // Check if submission already exists
      const existingIndex = existingSubmissions.findIndex((sub: any) => 
        sub.assignmentId === assignment.id && 
        (sub.studentEmail === user.email || sub.studentId === user.id)
      );

      if (existingIndex !== -1) {
        // Update existing submission
        existingSubmissions[existingIndex] = {
          ...existingSubmissions[existingIndex],
          ...submission
        };
      } else {
        // Add new submission
        submission.id = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        existingSubmissions.push(submission);
      }

      localStorage.setItem('student_submissions', JSON.stringify(existingSubmissions));

      // Update assignment status in student view
      const studentCoursesStr = localStorage.getItem('studentCourses');
      if (studentCoursesStr) {
        const studentCourses = JSON.parse(studentCoursesStr);
        // You can update course progress or assignment status here if needed
      }

      // Show success message
      alert('Assignment submitted successfully!');
      
      // Redirect to assignments page
      router.push('/lms/Student_Portal/assignments');
    } catch (error) {
      console.error('Error submitting assignment:', error);
      alert('Failed to submit assignment. Please try again.');
    } finally {
      setSubmitting(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-6"></div>
          <div className="h-64 bg-gray-100 rounded-lg mb-6"></div>
          <div className="h-96 bg-gray-100 rounded-lg"></div>
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
            <h1 className="text-2xl font-bold mb-2">Assignment Not Found</h1>
            <p className="text-gray-600 mb-6">The assignment you're looking for doesn't exist or you don't have access to it.</p>
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
  const isOverdue = timeRemaining.text === 'Overdue';

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Link
                href="/lms/Student_Portal/assignments"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <HiArrowLeft className="w-5 h-5" />
                <span>Back to Assignments</span>
              </Link>
            </div>
            
            <div className={`px-4 py-2 rounded-full ${timeRemaining.bgColor} ${timeRemaining.borderColor} border`}>
              <span className={`font-medium ${timeRemaining.color}`}>
                {timeRemaining.text}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
                  {assignment.title}
                </h1>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <HiBookOpen className="w-4 h-4 mr-2 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Course</div>
                      <div>{assignment.courseTitle}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <HiUser className="w-4 h-4 mr-2 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Instructor</div>
                      <div>{assignment.instructorName}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <HiCalendar className="w-4 h-4 mr-2 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Due Date</div>
                      <div>{formatDate(assignment.dueDate)}</div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="font-medium mb-2" style={{ color: BRAND_COLORS.darkNavy }}>
                    Assignment Description
                  </h3>
                  <div className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200 whitespace-pre-wrap">
                    {assignment.description}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                    {assignment.totalPoints} points
                  </div>
                  {existingSubmission && (
                    <div className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium flex items-center gap-1">
                      <HiCheckCircle className="w-4 h-4" />
                      Previously Submitted
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submission Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Text Response */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-bold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
                Text Response
              </h2>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your response below
                </label>
                <textarea
                  value={textResponse}
                  onChange={(e) => setTextResponse(e.target.value)}
                  placeholder="Type your answer here... You can paste code, write essays, or provide detailed explanations."
                  rows={12}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 resize-none"
                />
              </div>
            </div>

            {/* File Upload */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
                Attach Files
              </h2>
              
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 transition-colors ${
                  dragOver 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <HiUpload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-2">
                  Drag and drop files here, or click to browse
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Supports PDF, DOC, DOCX, PPT, images, and code files (max 50MB each)
                </p>
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-block px-6 py-2.5 rounded-lg font-medium text-white cursor-pointer transition-colors"
                  style={{ backgroundColor: BRAND_COLORS.darkRoyalBlue }}
                >
                  Browse Files
                </label>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium mb-3" style={{ color: BRAND_COLORS.darkNavy }}>
                    Selected Files ({files.length})
                  </h3>
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
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
                        <button
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Submission Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <h3 className="font-bold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
                  Submission Summary
                </h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Text Response</span>
                    <span className="font-medium">
                      {textResponse.trim() ? `${textResponse.length} characters` : 'Not provided'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Files Attached</span>
                    <span className="font-medium">{files.length} files</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Size</span>
                    <span className="font-medium">
                      {formatFileSize(files.reduce((total, file) => total + file.size, 0))}
                    </span>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <HiExclamationCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-1">Important</p>
                      <p>Once submitted, you cannot edit your response. Make sure to review everything before submitting.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {existingSubmission ? (
                    <>
                      <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="w-full py-3 px-4 rounded-lg font-medium text-white flex items-center justify-center gap-2 transition-colors"
                        style={{ backgroundColor: BRAND_COLORS.deepRed }}
                      >
                        {submitting ? 'Updating Submission...' : 'Update Submission'}
                      </button>
                      <p className="text-sm text-gray-500 text-center">
                        Updating will replace your previous submission
                      </p>
                    </>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={submitting || (files.length === 0 && textResponse.trim() === '')}
                      className={`w-full py-3 px-4 rounded-lg font-medium text-white flex items-center justify-center gap-2 transition-colors ${
                        (files.length === 0 && textResponse.trim() === '') || submitting
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:opacity-90'
                      }`}
                      style={{ backgroundColor: BRAND_COLORS.deepRed }}
                    >
                      {submitting ? 'Submitting...' : 'Submit Assignment'}
                    </button>
                  )}
                  
                  <Link
                    href={`/lms/Student_Portal/assignments/${assignment.id}/view`}
                    className="w-full py-3 px-4 rounded-lg font-medium border border-gray-300 text-gray-700 text-center hover:bg-gray-50 transition-colors block"
                  >
                    View Assignment Details
                  </Link>
                </div>
              </div>

              {/* Assignment Details Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-bold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
                  Assignment Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Points</div>
                    <div className="font-bold" style={{ color: BRAND_COLORS.deepRed }}>
                      {assignment.totalPoints} points
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Due Date</div>
                    <div className="font-medium">{formatDate(assignment.dueDate)}</div>
                  </div>
                  {existingSubmission && (
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Previous Submission</div>
                      <div className="font-medium">
                        {formatDate(existingSubmission.submittedAt)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}