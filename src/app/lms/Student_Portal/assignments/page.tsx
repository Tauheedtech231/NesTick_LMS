// app/lms/Student_Portal/assignments/page.tsx
'use client';

import { useState } from 'react';
import { Search, Filter, Calendar, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState([
    {
      id: 1,
      course: 'Mathematics - 10th Grade',
      title: 'Algebraic Expressions Assignment',
      description: 'Solve the given algebraic expressions and show your work',
      dueDate: '2024-04-01',
      status: 'submitted',
      score: 92,
      maxScore: 100,
      submittedDate: '2024-03-28',
      type: 'assignment',
    },
    {
      id: 2,
      course: 'Physics - 10th Grade',
      title: 'Newton\'s Laws Lab Report',
      description: 'Write a comprehensive lab report on Newton\'s Laws of Motion',
      dueDate: '2024-04-05',
      status: 'pending',
      score: null,
      maxScore: 100,
      type: 'lab',
    },
    {
      id: 3,
      course: 'Chemistry - 11th Grade',
      title: 'Periodic Table Quiz',
      description: 'Quiz on elements and their properties',
      dueDate: '2024-04-03',
      status: 'overdue',
      score: null,
      maxScore: 50,
      type: 'quiz',
    },
    {
      id: 4,
      course: 'Biology - 12th Grade',
      title: 'Genetics Research Paper',
      description: 'Research paper on genetic inheritance patterns',
      dueDate: '2024-04-10',
      status: 'pending',
      score: null,
      maxScore: 100,
      type: 'paper',
    },
  ]);

  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAssignments = assignments.filter(assignment => {
    if (filter !== 'all' && assignment.status !== filter) return false;
    if (searchTerm && !assignment.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-emerald-100 text-emerald-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'assignment':
        return <FileText className="w-4 h-4 text-purple-600" />;
      case 'lab':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'quiz':
        return <FileText className="w-4 h-4 text-amber-600" />;
      case 'paper':
        return <FileText className="w-4 h-4 text-emerald-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
          <p className="text-gray-600 mt-2">Track and submit your assignments</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full md:w-64"
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all' 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Assignments
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'pending' 
              ? 'bg-amber-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter('submitted')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'submitted' 
              ? 'bg-emerald-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Submitted
        </button>
        <button
          onClick={() => setFilter('overdue')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'overdue' 
              ? 'bg-red-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Overdue
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">2</p>
            </div>
            <Clock className="w-8 h-8 text-amber-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Submitted</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">1</p>
            </div>
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">92%</p>
            </div>
            <FileText className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Assignments List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredAssignments.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredAssignments.map((assignment) => (
              <div key={assignment.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getTypeIcon(assignment.type)}
                      <span className="text-sm font-medium text-gray-500">{assignment.course}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
                    <p className="text-gray-600 mt-1">{assignment.description}</p>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>Due: {assignment.dueDate}</span>
                      </div>
                      {assignment.submittedDate && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <CheckCircle className="w-4 h-4" />
                          <span>Submitted: {assignment.submittedDate}</span>
                        </div>
                      )}
                      {assignment.score !== null && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">Score:</span>
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded text-sm font-medium">
                            {assignment.score}/{assignment.maxScore}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(assignment.status)}`}>
                      {getStatusIcon(assignment.status)}
                      {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                    </span>
                    <div className="flex items-center gap-2">
                      {assignment.status === 'pending' && (
                        <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors">
                          Submit Now
                        </button>
                      )}
                      {assignment.status === 'submitted' && (
                        <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors">
                          View Submission
                        </button>
                      )}
                      <button className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <FileText className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No assignments found</h3>
            <p className="text-gray-600">You are all caught up!</p>
          </div>
        )}
      </div>

      {/* Upload Modal (simplified) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit New Assignment</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Assignment
            </label>
            <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option>Select an assignment</option>
              {assignments
                .filter(a => a.status === 'pending')
                .map(assignment => (
                  <option key={assignment.id} value={assignment.id}>
                    {assignment.title}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload File
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Drag & drop your file here or</p>
              <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors">
                Browse Files
              </button>
              <p className="text-xs text-gray-500 mt-4">Supports: PDF, DOCX (Max: 10MB)</p>
            </div>
          </div>
          <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 rounded-lg transition-colors">
            Submit Assignment
          </button>
        </div>
      </div>
    </div>
  );
}