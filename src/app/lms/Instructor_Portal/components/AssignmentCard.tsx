// app/lms/Instructor_Portal/components/AssignmentCard.tsx
'use client';

import { FileText, Users, Calendar, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { useState } from 'react';

interface AssignmentCardProps {
  assignment: {
    id: string;
    title: string;
    course: string;
    dueDate: string;
    totalStudents: number;
    submitted: number;
    graded: number;
    averageScore: number;
  };
}

export default function AssignmentCard({ assignment }: AssignmentCardProps) {
  const [isGrading, setIsGrading] = useState(false);
  
  const submissionRate = Math.round((assignment.submitted / assignment.totalStudents) * 100);
  const gradingRate = Math.round((assignment.graded / assignment.submitted) * 100);

  const getStatusColor = () => {
    if (submissionRate >= 90) return 'bg-[#10B981]';
    if (submissionRate >= 70) return 'bg-[#F59E0B]';
    return 'bg-[#EF4444]';
  };

  const getStatusIcon = () => {
    if (submissionRate >= 90) return <CheckCircle className="w-4 h-4" />;
    if (submissionRate >= 70) return <AlertCircle className="w-4 h-4" />;
    return <XCircle className="w-4 h-4" />;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-[#6B21A8]" />
            <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">{assignment.course}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{assignment.totalStudents}</div>
              <div className="text-xs text-gray-500">Total Students</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{assignment.submitted}</div>
              <div className="text-xs text-gray-500">Submitted</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{assignment.graded}</div>
              <div className="text-xs text-gray-500">Graded</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{assignment.averageScore}%</div>
              <div className="text-xs text-gray-500">Avg Score</div>
            </div>
          </div>

          {/* Progress Bars */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Submission Rate</span>
                <span className="font-medium">{submissionRate}%</span>
              </div>
              <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`absolute left-0 top-0 h-full rounded-full ${getStatusColor()}`}
                  style={{ width: `${submissionRate}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Grading Progress</span>
                <span className="font-medium">{gradingRate}%</span>
              </div>
              <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="absolute left-0 top-0 h-full rounded-full bg-[#C4B5FD]"
                  style={{ width: `${gradingRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Due: {assignment.dueDate}</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span>{submissionRate >= 70 ? 'On Track' : 'Needs Attention'}</span>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => setIsGrading(true)}
            className="px-4 py-2 bg-[#6B21A8] hover:bg-purple-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            disabled={isGrading}
          >
            {isGrading ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                Grading...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Grade Assignments
              </>
            )}
          </button>
          <button className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}