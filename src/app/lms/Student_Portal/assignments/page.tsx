/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  HiDocumentText, 
  HiCheckCircle, 
  HiClock, 
  HiAcademicCap,
  HiDownload,
  HiEye,
  HiX,
  HiFilter,
  HiSearch,
  HiStar,
  HiTrendingUp,
  HiChartBar,
  HiBookOpen
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

interface AssignmentFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

interface StudentAssignment {
  submission_id: string;
  assignment_id: string;
  assignment_title: string;
  assignment_description: string;
  course_id: string;
  course_title: string;
  course_title_full: string;
  slide_title: string;
  slide_number: number;
  files: AssignmentFile[];
  submitted_at: string;
  due_date: string;
  status: 'submitted' | 'graded';
  score: number | null;
  total_marks: number;
  passing_marks: number;
  percentage: number | null;
  passed: boolean | null;
  feedback: string | null;
}

interface EnrolledCourse {
  id: string;
  title: string;
}

export default function StudentAssignmentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<StudentAssignment[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    gradedCount: 0,
    pendingCount: 0,
    avgScore: 0,
    passedCount: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [selectedAssignment, setSelectedAssignment] = useState<StudentAssignment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      const parsed = JSON.parse(userData);
      if (parsed.role === 'student') {
        setUser(parsed);
        fetchAssignments(parsed.email);
      } else {
        router.push('/lms/auth/login?type=student');
      }
    } else {
      router.push('/lms/auth/login?type=student');
    }
  }, [router]);

  const fetchAssignments = async (email: string, courseId?: string) => {
    setLoading(true);
    try {
      let url = `/api/student/assignments?email=${encodeURIComponent(email)}`;
      if (courseId && courseId !== 'all') {
        url += `&courseId=${courseId}`;
      }
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        setAssignments(result.data.assignments);
        setStats(result.data.stats);
        setEnrolledCourses(result.data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId);
    if (user?.email) {
      fetchAssignments(user.email, courseId);
    }
  };

  const handleFileDownload = (file: AssignmentFile) => {
    if (file?.url) {
      window.open(file.url, '_blank');
    }
  };

  const getStatusBadge = (assignment: StudentAssignment) => {
    if (assignment.status === 'graded') {
      const passed = assignment.passed;
      return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {passed ? <HiCheckCircle className="w-3 h-3 mr-1" /> : <HiX className="w-3 h-3 mr-1" />}
          {passed ? 'Passed' : 'Failed'}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
        <HiClock className="w-3 h-3 mr-1" />
        Pending Grading
      </span>
    );
  };

  const getScoreDisplay = (assignment: StudentAssignment) => {
    if (assignment.status === 'graded' && assignment.score !== null) {
      return (
        <div className="text-center">
          <span className={`text-lg font-bold ${assignment.passed ? 'text-green-600' : 'text-red-600'}`}>
            {assignment.score}/{assignment.total_marks}
          </span>
          <p className="text-xs text-gray-500">
            ({assignment.percentage}%)
          </p>
        </div>
      );
    }
    return <span className="text-gray-400">—</span>;
  };

  const filteredAssignments = assignments.filter(a => {
    const matchesSearch = a.assignment_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.course_title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || a.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: BRAND_COLORS.deepRed }} />
          <p className="text-gray-600">Loading your assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Assignments & Grades</h1>
        <p className="text-gray-500 mt-1">Track your assignment submissions and grades</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-purple-500">
          <p className="text-xs text-gray-500">Total Submissions</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalSubmissions}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500">
          <p className="text-xs text-gray-500">Graded</p>
          <p className="text-2xl font-bold text-green-600">{stats.gradedCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-yellow-500">
          <p className="text-xs text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pendingCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
          <p className="text-xs text-gray-500">Average Score</p>
          <p className="text-2xl font-bold text-blue-600">{stats.avgScore}%</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-emerald-500">
          <p className="text-xs text-gray-500">Passed</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.passedCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          {/* ✅ Course Filter - Only enrolled courses show */}
          <div className="w-64">
            <div className="relative">
              <HiBookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={selectedCourseId}
                onChange={(e) => handleCourseChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 appearance-none bg-white"
              >
                <option value="all">📚 All Courses ({enrolledCourses.length})</option>
                {enrolledCourses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* ✅ Status Filter */}
          <div className="w-48">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="all">All Status</option>
              <option value="graded">✅ Graded</option>
              <option value="submitted">⏳ Pending</option>
            </select>
          </div>
          
          {/* ✅ Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* No Course Enrollment Message */}
      {enrolledCourses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <HiBookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Courses Enrolled</h3>
          <p className="text-gray-500">You haven't enrolled in any courses yet.</p>
          <button
            onClick={() => router.push('/courses')}
            className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Browse Courses
          </button>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <HiDocumentText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Assignments Found</h3>
          <p className="text-gray-500">
            {selectedCourseId !== 'all' 
              ? "No assignments for this course yet." 
              : "You haven't submitted any assignments yet."}
          </p>
        </div>
      ) : (
        /* Assignments Table */
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assignment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Score</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAssignments.map((assignment) => (
                  <tr key={assignment.submission_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{assignment.assignment_title}</p>
                        <p className="text-xs text-gray-500 mt-1">{assignment.slide_title}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{assignment.course_title}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(assignment.submitted_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(assignment)}</td>
                    <td className="px-6 py-4 text-center">{getScoreDisplay(assignment)}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => {
                          setSelectedAssignment(assignment);
                          setShowDetailsModal(true);
                        }}
                        className="px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors"
                      >
                        <HiEye className="w-4 h-4 inline mr-1" />
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assignment Details Modal */}
      {showDetailsModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-purple-600 to-purple-700">
              <h3 className="text-lg font-semibold text-white">Assignment Details</h3>
              <button onClick={() => setShowDetailsModal(false)} className="p-1 hover:bg-white/20 rounded-lg">
                <HiX className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="p-6 overflow-auto max-h-[calc(90vh-100px)] space-y-4">
              {/* Assignment Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Assignment</p>
                <p className="font-semibold text-lg">{selectedAssignment.assignment_title}</p>
                <p className="text-sm text-gray-600 mt-2">{selectedAssignment.assignment_description}</p>
                <div className="mt-3 flex flex-wrap gap-4 text-sm">
                  <span className="text-gray-500">Due: {new Date(selectedAssignment.due_date).toLocaleDateString()}</span>
                  <span className="text-gray-500">Total Marks: {selectedAssignment.total_marks}</span>
                  <span className="text-gray-500">Passing Marks: {selectedAssignment.passing_marks}</span>
                </div>
              </div>

              {/* Submitted Files */}
              {selectedAssignment.files && selectedAssignment.files.length > 0 && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Submitted Files</h4>
                  <div className="space-y-2">
                    {selectedAssignment.files.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <HiDocumentText className="w-5 h-5 text-blue-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">{file.name}</p>
                            <p className="text-xs text-gray-400">
                              {file.size ? `${(file.size / 1024).toFixed(2)} KB` : 'Size unknown'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleFileDownload(file)}
                          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                        >
                          <HiDownload className="w-4 h-4" />
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Grade & Feedback */}
              {selectedAssignment.status === 'graded' && (
                <div className={`rounded-lg p-4 ${selectedAssignment.passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <h4 className="font-medium mb-3">Grade & Feedback</h4>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-700">Score:</span>
                    <span className={`text-xl font-bold ${selectedAssignment.passed ? 'text-green-700' : 'text-red-700'}`}>
                      {selectedAssignment.score}/{selectedAssignment.total_marks}
                      <span className="text-sm ml-2">({selectedAssignment.percentage}%)</span>
                    </span>
                  </div>
                  {selectedAssignment.feedback && (
                    <div className="mt-3 p-3 bg-white rounded-lg">
                      <p className="text-xs font-medium text-gray-500">Instructor Feedback:</p>
                      <p className="text-sm text-gray-700 mt-1">{selectedAssignment.feedback}</p>
                    </div>
                  )}
                  {selectedAssignment.passed ? (
                    <div className="mt-3 flex items-center gap-2 text-green-600">
                      <HiCheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Congratulations! You passed this assignment.</span>
                    </div>
                  ) : (
                    <div className="mt-3 flex items-center gap-2 text-red-600">
                      <HiX className="w-5 h-5" />
                      <span className="text-sm font-medium">You did not pass this assignment.</span>
                    </div>
                  )}
                </div>
              )}

              {selectedAssignment.status === 'submitted' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                  <HiClock className="w-8 h-8 mx-auto text-yellow-600 mb-2" />
                  <p className="text-yellow-800 font-medium">Pending Grading</p>
                  <p className="text-sm text-yellow-600 mt-1">Your instructor will grade this assignment soon.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}