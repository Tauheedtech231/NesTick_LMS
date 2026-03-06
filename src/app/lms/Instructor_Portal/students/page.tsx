// lms/Instructor_Portal/students-progress/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  HiUserGroup,
  HiAcademicCap,
  HiCheckCircle,
  HiClock,
  HiRefresh,
  HiSearch,
  HiFilter,
  HiChevronDown,
  HiChevronUp,
  HiDownload,
  HiMail,
  HiPhone,
  HiCalendar,
  HiBookOpen,
  HiStar,
  HiChartBar,
  HiXCircle,
  HiEye
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
  teal: '#1FB6CB'
};

interface StudentProgress {
  student_email: string;
  student_name: string;
  student_phone: string;
  enrollment_date: string;
  course_id: string;
  course_title: string;
  total_slides: number;
  completed_slides: number;
  progress_percentage: number;
  certificate_issued: 'Yes' | 'No';
  certificate_issue_date: string | null;
  certificate_number: string | null;
  last_active: string | null;
}

interface SummaryStats {
  totalStudents: number;
  totalCourses: number;
  studentsWithCertificates: number;
  studentsCompleted: number;
  averageProgress: number;
  latestEnrollment: string | null;
  earliestEnrollment: string | null;
}

export default function InstructorStudentsProgressPage() {
  const router = useRouter();
  const [instructor, setInstructor] = useState<any>(null);
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentProgress[]>([]);
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [certificateFilter, setCertificateFilter] = useState<'all' | 'yes' | 'no'>('all');
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Get unique courses for filter
  const courses = [...new Set(students.map(s => s.course_title))];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      checkAuthAndLoadData();
    }
  }, [isMounted]);

  const checkAuthAndLoadData = async () => {
    try {
      const userStr = localStorage.getItem('currentUser');
      if (!userStr) {
        router.push('/lms/auth/login?type=instructor');
        return;
      }

      const userData = JSON.parse(userStr);
      if (userData.role !== 'instructor') {
        router.push('/lms/auth/login?type=instructor');
        return;
      }

      setInstructor(userData);
      await fetchStudentsProgress(userData.id);
    } catch (error) {
      console.error('Error loading user:', error);
      setError('Failed to load user data');
      setLoading(false);
    }
  };

  const fetchStudentsProgress = async (instructorId: string, showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await fetch(`/api/instructors/students-progress?instructorId=${instructorId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch data');
      }

      if (result.success) {
        setStudents(result.data.students || []);
        setFilteredStudents(result.data.students || []);
        setSummary(result.data.summary);
      }
    } catch (error: any) {
      console.error('Error fetching students progress:', error);
      setError(error.message || 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Filter students based on search, course, and certificate
  useEffect(() => {
    if (students.length > 0) {
      let filtered = [...students];

      // Apply search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(s =>
          (s.student_name || '').toLowerCase().includes(term) ||
          (s.student_email || '').toLowerCase().includes(term) ||
          (s.student_phone || '').toLowerCase().includes(term) ||
          (s.course_title || '').toLowerCase().includes(term)
        );
      }

      // Apply course filter
      if (selectedCourse !== 'all') {
        filtered = filtered.filter(s => s.course_title === selectedCourse);
      }

      // Apply certificate filter
      if (certificateFilter !== 'all') {
        filtered = filtered.filter(s => 
          certificateFilter === 'yes' ? s.certificate_issued === 'Yes' : s.certificate_issued === 'No'
        );
      }

      setFilteredStudents(filtered);
    }
  }, [searchTerm, selectedCourse, certificateFilter, students]);

  const handleRefresh = () => {
    if (instructor?.id) {
      fetchStudentsProgress(instructor.id, true);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressBgColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-600';
    if (progress >= 50) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  // ✅ FIXED: Safe function to get initials
  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  if (!isMounted || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: BRAND_COLORS.deepRed }} />
          <p className="text-gray-600">Loading students progress...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <HiXCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <HiUserGroup className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-2">Students Progress</h1>
                <p className="text-indigo-100">Track your students' learning journey</p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50"
            >
              <HiRefresh className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <HiUserGroup className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-gray-600">Total Students</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{summary.totalStudents}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <HiBookOpen className="w-5 h-5 text-green-600" />
              <p className="text-sm text-gray-600">Total Courses</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{summary.totalCourses}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <HiStar className="w-5 h-5 text-amber-600" />
              <p className="text-sm text-gray-600">Certificates Issued</p>
            </div>
            <p className="text-2xl font-bold text-amber-600">{summary.studentsWithCertificates}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <HiChartBar className="w-5 h-5 text-purple-600" />
              <p className="text-sm text-gray-600">Avg Progress</p>
            </div>
            <p className="text-2xl font-bold text-purple-600">{summary.averageProgress}%</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Course Filter */}
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Courses</option>
            {courses.map((course, index) => (
              <option key={index} value={course}>{course}</option>
            ))}
          </select>

          {/* Certificate Filter */}
          <select
            value={certificateFilter}
            onChange={(e) => setCertificateFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Certificates</option>
            <option value="yes">With Certificate</option>
            <option value="no">Without Certificate</option>
          </select>

          {/* Results Count */}
          <div className="flex items-center px-4 py-2 bg-gray-100 rounded-lg">
            <span className="text-sm text-gray-600">
              Showing {filteredStudents.length} of {students.length} students
            </span>
          </div>
        </div>
      </div>

      {/* Students List */}
      {filteredStudents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <HiUserGroup className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
          <p className="text-gray-500">No students match your current filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredStudents.map((student, index) => (
            <div key={`${student.student_email}-${student.course_id}-${index}`} 
                 className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              
              {/* Student Header */}
              <div className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Student Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-semibold text-indigo-600">
                          {getInitials(student.student_name)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{student.student_name || 'Unknown'}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <HiMail className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{student.student_email}</span>
                          </span>
                          {student.student_phone && (
                            <span className="flex items-center gap-1">
                              <HiPhone className="w-4 h-4 flex-shrink-0" />
                              <span>{student.student_phone}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Course Info & Progress */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <HiBookOpen className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-900 truncate">{student.course_title}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className={`font-semibold ${getProgressColor(student.progress_percentage)}`}>
                          {student.progress_percentage}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${getProgressBgColor(student.progress_percentage)}`}
                          style={{ width: `${student.progress_percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{student.completed_slides}/{student.total_slides} lessons</span>
                        <span>Last active: {formatDate(student.last_active)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Certificate Status & Actions */}
                  <div className="flex flex-col items-end gap-3">
                    {student.certificate_issued === 'Yes' ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                        <HiCheckCircle className="w-4 h-4" />
                        Certificate Issued
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                        No Certificate
                      </span>
                    )}
                    
                    <button
                      onClick={() => setExpandedStudent(
                        expandedStudent === `${student.student_email}-${student.course_id}` 
                          ? null 
                          : `${student.student_email}-${student.course_id}`
                      )}
                      className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      {expandedStudent === `${student.student_email}-${student.course_id}` ? (
                        <>Hide Details <HiChevronUp className="w-4 h-4" /></>
                      ) : (
                        <>View Details <HiChevronDown className="w-4 h-4" /></>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedStudent === `${student.student_email}-${student.course_id}` && (
                <div className="border-t border-gray-200 bg-gray-50 p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Enrollment Details */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Enrollment Details</h4>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-500">Enrollment Date:</dt>
                          <dd className="text-sm font-medium text-gray-900">
                            {formatDate(student.enrollment_date)}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-500">Course:</dt>
                          <dd className="text-sm font-medium text-gray-900">{student.course_title}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-500">Last Active:</dt>
                          <dd className="text-sm font-medium text-gray-900">
                            {formatDate(student.last_active)}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    {/* Certificate Details */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Certificate Details</h4>
                      {student.certificate_issued === 'Yes' ? (
                        <dl className="space-y-2">
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-500">Certificate #:</dt>
                            <dd className="text-sm font-medium text-gray-900">
                              {student.certificate_number}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-500">Issue Date:</dt>
                            <dd className="text-sm font-medium text-gray-900">
                              {formatDate(student.certificate_issue_date)}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-500">Status:</dt>
                            <dd className="text-sm">
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                Active
                              </span>
                            </dd>
                          </div>
                        </dl>
                      ) : (
                        <p className="text-sm text-gray-500">No certificate issued yet.</p>
                      )}
                    </div>
                  </div>

                
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}