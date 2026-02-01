// app/lms/Instructor_Portal/students/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  User, 
  Calendar,

  Send,
 
  Download,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react';
/* eslint-disable */

// Define TypeScript interfaces
interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  cnic: string;
  courseId: string;
  courseName: string;
  dateOfBirth: string;
  gender: string;
  country: string;
  registrationDate: string;
}

interface Course {
  id: string;
  name: string;
}

interface FeedbackForm {
  subject: string;
  message: string;
  type: string;
}

interface SortConfig {
  key: keyof Student;
  direction: 'asc' | 'desc';
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingFeedback, setSendingFeedback] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'name',
    direction: 'asc'
  });
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [feedbackForm, setFeedbackForm] = useState<FeedbackForm>({
    subject: 'Feedback from Instructor',
    message: '',
    type: 'general'
  });

  useEffect(() => {
    const fetchStudentData = () => {
      try {
        // Get current logged in instructor
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        const allStudents = JSON.parse(localStorage.getItem('students') || '[]');
        const allCourses = JSON.parse(localStorage.getItem('courses') || '[]');
        const allInstructors = JSON.parse(localStorage.getItem('instructors') || '[]');
        
        let assignedStudents: Student[] = [];
        
        if (currentUser?.email === 'instructor@gmail.com') {
          // Demo instructor - show all students
          assignedStudents = allStudents.map((student: any) => ({
            id: student.id || student.cnic,
            name: `${student.firstName} ${student.lastName || ''}`.trim(),
            email: student.email,
            phone: student.phone || 'N/A',
            cnic: student.cnic,
            courseId: student.courseId,
            courseName: student.courseName || 'Unknown Course',
            dateOfBirth: student.dateOfBirth,
            gender: student.gender,
            country: student.country,
            registrationDate: student.createdAt || 'Unknown'
          }));
        } else if (currentUser?.role === 'instructor') {
          // Real instructor - get assigned students
          const instructorDetails = allInstructors.find((instr: any) => 
            instr.email === currentUser.email || instr.id === currentUser.instructorId
          );
          
          if (instructorDetails?.studentsList) {
            assignedStudents = instructorDetails.studentsList;
          } else if (instructorDetails?.assignedCourseIds) {
            // Get students enrolled in assigned courses
            assignedStudents = allStudents
              .filter((student: any) => 
                instructorDetails.assignedCourseIds.includes(student.courseId) ||
                student.enrolledCourses?.some((courseId: string) => 
                  instructorDetails.assignedCourseIds.includes(courseId)
                )
              )
              .map((student: any) => ({
                id: student.id || student.cnic,
                name: `${student.firstName} ${student.lastName || ''}`.trim(),
                email: student.email,
                phone: student.phone || 'N/A',
                cnic: student.cnic,
                courseId: student.courseId,
                courseName: student.courseName || 'Unknown Course',
                dateOfBirth: student.dateOfBirth,
                gender: student.gender,
                country: student.country,
                registrationDate: student.createdAt || 'Unknown'
              }));
          }
        }
        
        // Get unique courses for filter
        const uniqueCourses: Course[] = Array.from(new Set(
          assignedStudents.map(student => student.courseId).filter(Boolean)
        )).map(courseId => {
          const course = allCourses.find((c: any) => c.id === courseId);
          return {
            id: courseId,
            name: course?.title || courseId
          };
        });
        
        setStudents(assignedStudents);
        setFilteredStudents(assignedStudents);
        setCourses(uniqueCourses);
        
      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  // Filter students based on search and course filter
  useEffect(() => {
    let result = [...students];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(student =>
        student.name.toLowerCase().includes(term) ||
        student.email.toLowerCase().includes(term) ||
        student.cnic.toLowerCase().includes(term)
      );
    }
    
    if (courseFilter !== 'all') {
      result = result.filter(student => student.courseId === courseFilter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredStudents(result);
  }, [searchTerm, courseFilter, students, sortConfig]);

  const handleSort = (key: keyof Student) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSendFeedback = (student: Student) => {
    setSelectedStudent(student);
    setFeedbackForm({
      subject: 'Feedback from Instructor',
      message: `Dear ${student.name},\n\nThank you for your participation in the ${getCourseName(student.courseId)} course.\n\n`,
      type: 'general'
    });
    setShowFeedbackModal(true);
  };

  const handleSubmitFeedback = async () => {
    if (!selectedStudent) return;
    
    setSendingFeedback(true);
    
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      const response = await fetch('/api/send-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: selectedStudent.email,
          name: selectedStudent.name,
          subject: feedbackForm.subject,
          message: feedbackForm.message,
          instructorName: currentUser.name || 'Your Instructor',
          courseName: getCourseName(selectedStudent.courseId)
        })
      });

      const data = await response.json();

      if (data.success) {
        // Save feedback record in localStorage
        const feedbackData = {
          id: `feedback_${Date.now()}`,
          studentId: selectedStudent.id,
          studentEmail: selectedStudent.email,
          studentName: selectedStudent.name,
          subject: feedbackForm.subject,
          message: feedbackForm.message,
          type: feedbackForm.type,
          sentAt: new Date().toISOString(),
          instructor: currentUser.name || 'Instructor'
        };
        
        const existingFeedback = JSON.parse(localStorage.getItem('student_feedback') || '[]');
        localStorage.setItem('student_feedback', JSON.stringify([...existingFeedback, feedbackData]));
        
        alert(`✅ Feedback sent successfully to ${selectedStudent.email}`);
        setShowFeedbackModal(false);
        setSelectedStudent(null);
      } else {
        throw new Error(data.error || 'Failed to send feedback');
      }
    } catch (error: any) {
      console.error('Error sending feedback:', error);
      alert(`❌ Failed to send feedback: ${error.message}`);
    } finally {
      setSendingFeedback(false);
    }
  };

  const handleToggleRow = (studentId: string) => {
    setExpandedRow(expandedRow === studentId ? null : studentId);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getCourseName = (courseId: string) => {
    const allCourses = JSON.parse(localStorage.getItem('courses') || '[]');
    const course = allCourses.find((c: any) => c.id === courseId);
    return course?.title || courseId || 'Unknown Course';
  };

  const handleExportData = () => {
    const exportData = filteredStudents.map(student => ({
      Name: student.name,
      Email: student.email,
      CNIC: student.cnic,
      Phone: student.phone || 'N/A',
      Course: getCourseName(student.courseId),
      'Date of Birth': formatDate(student.dateOfBirth),
      Gender: student.gender,
      Country: student.country
    }));

    const csv = [
      Object.keys(exportData[0] || {}).join(','),
      ...exportData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#6B21A8] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
       <div className="bg-white rounded-2xl border border-gray-200 p-6">
  {/* Header */}
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Student Management</h1>
      <p className="text-gray-600 mt-2">
        Manage and communicate with your students • {students.length} students
      </p>
    </div>
    <div className="flex items-center gap-3">
      <button
        onClick={handleExportData}
        className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium rounded-lg transition-colors"
      >
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">Export CSV</span>
      </button>
    </div>
  </div>

  {/* Stats - Minimal, flat design */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
    {/* Total Students */}
    <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
      <p className="text-sm font-medium text-gray-700">Total Students</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{students.length}</p>
    </div>

    {/* Active Courses */}
    <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
      <p className="text-sm font-medium text-gray-700">Active Courses</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{courses.length}</p>
    </div>

    {/* Ready for Feedback */}
    <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
      <p className="text-sm font-medium text-gray-700">Ready for Feedback</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">
        {students.length > 0 ? Math.floor(students.length * 0.3) : 0}
      </p>
    </div>

    {/* International */}
    <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
      <p className="text-sm font-medium text-gray-700">International</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">
        {students.filter(s => s.country !== 'Pakistan').length}
      </p>
    </div>
  </div>
</div>


        {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
  <div className="flex flex-col md:flex-row gap-4">
    {/* Search Input */}
    <div className="flex-1 relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        placeholder="Search by name, email, or CNIC..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-600 focus:border-purple-600 transition"
      />
    </div>

    {/* Filter Section */}
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-xl text-gray-700 text-sm">
        <Filter className="w-4 h-4" />
        Filter
      </div>
      <select
        value={courseFilter}
        onChange={(e) => setCourseFilter(e.target.value)}
        className="px-4 py-3 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-600 focus:border-purple-600 transition"
      >
        <option value="all">All Courses</option>
        {courses.map(course => (
          <option key={course.id} value={course.id}>
            {course.name}
          </option>
        ))}
      </select>
    </div>
  </div>
</div>


        {/* Students Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <th className="py-4 px-6 text-left">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-gray-900"
                    >
                      Student
                      {sortConfig.key === 'name' && (
                        sortConfig.direction === 'asc' ? 
                          <ChevronUp className="w-4 h-4" /> : 
                          <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Contact</th>
                  <th className="py-4 px-6 text-left">
                    <button
                      onClick={() => handleSort('courseId')}
                      className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-gray-900"
                    >
                      Course
                      {sortConfig.key === 'courseId' && (
                        sortConfig.direction === 'asc' ? 
                          <ChevronUp className="w-4 h-4" /> : 
                          <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Details</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <>
                      <tr 
                        key={student.id} 
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleToggleRow(student.id)}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-300 flex items-center justify-center text-white font-bold">
                              {student.name?.charAt(0) || 'S'}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{student.name}</div>
                              <div className="text-sm text-gray-500">{student.cnic}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-700 truncate max-w-[200px]">
                                {student.email}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-700">{student.phone || 'N/A'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            <div className="font-medium text-gray-900">
                              {getCourseName(student.courseId)}
                            </div>
                            <div className="text-xs text-gray-500">ID: {student.courseId?.substring(0, 8)}...</div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-600">DOB: {formatDate(student.dateOfBirth)}</span>
                            </div>
                            <div className="text-xs text-gray-600">
                              {student.gender} • {student.country}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSendFeedback(student);
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 bg-[#6B21A8] hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                              <Send className="w-3 h-3" />
                              <span className="hidden sm:inline">Feedback</span>
                            </button>
                            <a
                              href={`mailto:${student.email}`}
                              className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Mail className="w-3 h-3" />
                              <span className="hidden sm:inline">Email</span>
                            </a>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleRow(student.id);
                              }}
                              className="p-1.5 text-gray-400 hover:text-gray-600"
                            >
                              {expandedRow === student.id ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedRow === student.id && (
                        <tr className="bg-gray-50">
                          <td colSpan={5} className="py-4 px-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-lg border border-gray-200">
                              <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Personal Details</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Full Name:</span>
                                    <span className="font-medium">{student.name}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">CNIC:</span>
                                    <span className="font-medium">{student.cnic}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Gender:</span>
                                    <span className="font-medium">{student.gender}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Country:</span>
                                    <span className="font-medium">{student.country}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Contact Information</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Email:</span>
                                    <span className="font-medium">{student.email}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Phone:</span>
                                    <span className="font-medium">{student.phone || 'N/A'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Date of Birth:</span>
                                    <span className="font-medium">{formatDate(student.dateOfBirth)}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Course Information</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Course:</span>
                                    <span className="font-medium">{getCourseName(student.courseId)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Course ID:</span>
                                    <span className="font-medium">{student.courseId}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Registration:</span>
                                    <span className="font-medium">
                                      {student.registrationDate ? formatDate(student.registrationDate) : 'Unknown'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <User className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {students.length === 0 ? 'No Students Found' : 'No Matching Students'}
                      </h3>
                      <p className="text-gray-600 max-w-md mx-auto">
                        {students.length === 0 
                          ? "No students are currently assigned to your courses." 
                          : "Try adjusting your search terms or filters to find students."}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Send Feedback Modal */}
      {showFeedbackModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Send Feedback</h3>
                  <p className="text-gray-600 mt-1">to {selectedStudent.name}</p>
                </div>
                <button 
                  onClick={() => setShowFeedbackModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Send className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-blue-800">Sending to:</p>
                    <p className="text-blue-700">{selectedStudent.email}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={feedbackForm.subject}
                    onChange={(e) => setFeedbackForm({...feedbackForm, subject: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-transparent"
                    placeholder="Enter email subject"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Message
                  </label>
                  <textarea
                    rows={6}
                    value={feedbackForm.message}
                    onChange={(e) => setFeedbackForm({...feedbackForm, message: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-transparent"
                    placeholder="Write your feedback message here..."
                  />
                </div>
                
                <div className="p-4 bg-gray-50 rounded-xl">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-[#6B21A8] rounded focus:ring-[#6B21A8]" />
                    <span className="text-sm text-gray-700">Save this as a template for future use</span>
                  </label>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <button 
                  onClick={() => setShowFeedbackModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubmitFeedback}
                  disabled={sendingFeedback}
                  className="flex items-center justify-center gap-2 flex-1 px-6 py-3 bg-gradient-to-r from-[#6B21A8] to-purple-600 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {sendingFeedback ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Feedback
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}