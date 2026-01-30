// app/lms/Instructor_Portal/students/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Search, Filter, Mail, Phone, CheckCircle, XCircle, Clock, Download, Send, Users, TrendingUp } from 'lucide-react';
import { getStudents, getAssignments } from '../utils/demoData';
/* eslint-disable */

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showGradeModal, setShowGradeModal] = useState(false);

  useEffect(() => {
    const loadedStudents = getStudents();
    const loadedAssignments = getAssignments();
    
    setStudents(loadedStudents);
    setAssignments(loadedAssignments);
  }, []);

  const filteredStudents = students.filter(student => {
    if (searchTerm && !student.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (courseFilter !== 'all' && !student.enrolledCourses.includes(courseFilter)) return false;
    return true;
  });

  const getStatusBadge = (progress: number) => {
    if (progress >= 80) {
      return <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded text-xs font-medium">Excellent</span>;
    } else if (progress >= 60) {
      return <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs font-medium">Good</span>;
    } else {
      return <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">Needs Help</span>;
    }
  };

  const handleGradeAssignment = (student: any) => {
    setSelectedStudent(student);
    setShowGradeModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
          <p className="text-gray-600 mt-2">Monitor student progress and evaluate assignments</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            Export Report
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#F59E0B] hover:bg-amber-600 text-white font-medium rounded-lg transition-colors">
            <Send className="w-4 h-4" />
            Send Announcement
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search students by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Course:</span>
            </div>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-transparent"
            >
              <option value="all">All Courses</option>
              <option value="math-10">Mathematics</option>
              <option value="physics-10">Physics</option>
              <option value="chemistry-11">Chemistry</option>
              <option value="biology-12">Biology</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-[#6B21A8] mt-1">{students.length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-[#6B21A8]" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Progress</p>
              <p className="text-2xl font-bold text-[#10B981] mt-1">
                {Math.round(students.reduce((sum, s) => sum + s.overallProgress, 0) / students.length)}%
              </p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-[#10B981]" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Assignments Due</p>
              <p className="text-2xl font-bold text-[#EF4444] mt-1">
                {students.reduce((sum, s) => sum + s.assignmentsPending, 0)}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <Clock className="w-6 h-6 text-[#EF4444]" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Today</p>
              <p className="text-2xl font-bold text-[#F59E0B] mt-1">
                {students.filter(s => s.lastActive === new Date().toISOString().split('T')[0]).length}
              </p>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-[#F59E0B]" />
            </div>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#6B21A8] text-white">
                <th className="py-4 px-6 text-left font-semibold">Student</th>
                <th className="py-4 px-6 text-left font-semibold">Progress</th>
                <th className="py-4 px-6 text-left font-semibold">Assignments</th>
                <th className="py-4 px-6 text-left font-semibold">Status</th>
                <th className="py-4 px-6 text-left font-semibold">Last Active</th>
                <th className="py-4 px-6 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-300 flex items-center justify-center text-white font-bold">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.studentId}</div>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                          <Mail className="w-3 h-3" />
                          <span>{student.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      <div className="text-lg font-bold text-gray-900">{student.overallProgress}%</div>
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            student.overallProgress >= 80 ? 'bg-[#10B981]' :
                            student.overallProgress >= 60 ? 'bg-[#F59E0B]' :
                            'bg-[#6B21A8]'
                          }`}
                          style={{ width: `${student.overallProgress}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-[#10B981]" />
                        <span className="text-sm">{student.assignmentsSubmitted} submitted</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#EF4444]" />
                        <span className="text-sm">{student.assignmentsPending} pending</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {getStatusBadge(student.overallProgress)}
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-600">{student.lastActive}</div>
                    <div className="text-xs text-gray-400">Last seen</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleGradeAssignment(student)}
                        className="px-3 py-1.5 bg-[#6B21A8] hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Grade
                      </button>
                      <button className="px-3 py-1.5 bg-[#F59E0B] hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors">
                        Message
                      </button>
                      <button className="p-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg">
                        ⋮
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No students found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Assignment Evaluation Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Assignment Evaluation Queue</h2>
        
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{assignment.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{assignment.course}</p>
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <span>Due: {assignment.dueDate}</span>
                  <span>Pending: {assignment.submitted - assignment.graded} submissions</span>
                  <span>Avg Score: {assignment.averageScore}%</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 bg-[#6B21A8] hover:bg-purple-700 text-white font-medium rounded-lg transition-colors">
                  Evaluate All
                </button>
                <button className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grade Assignment Modal */}
      {showGradeModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Grade Assignment</h3>
                  <p className="text-gray-600 mt-1">for {selectedStudent.name}</p>
                </div>
                <button 
                  onClick={() => setShowGradeModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assignment
                  </label>
                  <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-transparent">
                    <option>Select assignment</option>
                    {assignments.map(assignment => (
                      <option key={assignment.id}>{assignment.title}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Score
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="Enter score"
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-transparent"
                    />
                    <span className="text-gray-500">/ 100</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Feedback
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Provide constructive feedback..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-transparent"
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Status</p>
                    <p className="text-sm text-gray-600">Mark assignment as</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-[#10B981] hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors">
                      Accepted
                    </button>
                    <button className="px-4 py-2 bg-[#EF4444] hover:bg-red-600 text-white font-medium rounded-lg transition-colors">
                      Needs Revision
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-8">
                <button 
                  onClick={() => setShowGradeModal(false)}
                  className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button className="px-6 py-2.5 bg-[#6B21A8] hover:bg-purple-700 text-white font-medium rounded-lg transition-colors">
                  Submit Grade
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}