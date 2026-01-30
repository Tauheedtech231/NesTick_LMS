// app/lms/Student_Portal/components/ModuleCard.tsx
'use client';

import { CheckCircle, Circle, FileText, Video, Download, Upload, Clock } from 'lucide-react';
import { useState } from 'react';
import { updateModuleCompletion } from '../utils/demoData';

interface StudyMaterial {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'slides' | 'document';
  url: string;
  duration?: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  submitted: boolean;
  submissionDate?: string;
  score?: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  totalQuestions: number;
  passingScore: number;
  timeLimit: number;
  completed: boolean;
  score?: number;
}

interface ModuleCardProps {
  module: {
    id: string;
    title: string;
    description: string;
    order: number;
    duration: string;
    materials: StudyMaterial[];
    quiz: Quiz | null;
    assignment: Assignment | null;
    completed: boolean;
  };
  onToggleComplete?: () => void;
}

export default function ModuleCard({ module, onToggleComplete }: ModuleCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleMarkComplete = () => {
    updateModuleCompletion(module.id, !module.completed);
    if (onToggleComplete) onToggleComplete();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type.includes('pdf') || selectedFile?.name.endsWith('.docx')) {
      setFile(selectedFile);
      setIsSubmitting(true);
      // Simulate upload
      setTimeout(() => {
        setIsSubmitting(false);
        alert('Assignment submitted successfully!');
        setFile(null);
      }, 1500);
    } else {
      alert('Please upload only PDF or DOCX files');
    }
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-500" />;
      case 'video':
        return <Video className="w-4 h-4 text-purple-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border ${module.completed ? 'border-emerald-200' : 'border-gray-200'} p-6 mb-6`}>
      {/* Module Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              module.completed ? 'bg-emerald-100 text-emerald-600' : 'bg-purple-100 text-purple-600'
            }`}>
              {module.order}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{module.title}</h3>
              <div className="flex items-center gap-4 mt-1">
                <span className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  {module.duration}
                </span>
                {module.completed && (
                  <span className="flex items-center text-sm text-emerald-600 font-medium">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Completed
                  </span>
                )}
              </div>
            </div>
          </div>
          <p className="text-gray-600">{module.description}</p>
        </div>
        <button
          onClick={handleMarkComplete}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            module.completed
              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {module.completed ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Completed
            </>
          ) : (
            <>
              <Circle className="w-4 h-4" />
              Mark Complete
            </>
          )}
        </button>
      </div>

      {/* Study Materials */}
      {module.materials.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Study Materials</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {module.materials.map((material) => (
              <a
                key={material.id}
                href={material.url}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getMaterialIcon(material.type)}
                  <div>
                    <p className="font-medium text-gray-900">{material.title}</p>
                    <p className="text-xs text-gray-500">{material.type.toUpperCase()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {material.duration && (
                    <span className="text-sm text-gray-500">{material.duration}</span>
                  )}
                  <Download className="w-4 h-4 text-gray-400" />
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Quiz Section */}
      {module.quiz && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Assessment</h4>
          <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium text-purple-900">{module.quiz.title}</h5>
                <p className="text-sm text-purple-700 mt-1">{module.quiz.description}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-purple-600">
                  <span>{module.quiz.totalQuestions} questions</span>
                  <span>{module.quiz.timeLimit} minutes</span>
                  <span>Passing: {module.quiz.passingScore}%</span>
                </div>
                {module.quiz.completed && module.quiz.score && (
                  <div className={`inline-flex items-center mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                    module.quiz.score >= module.quiz.passingScore
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    Score: {module.quiz.score}%
                  </div>
                )}
              </div>
              <a
                href={`/lms/Student_Portal/quizzes/${module.quiz.id}`}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  module.quiz.completed
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-amber-500 hover:bg-amber-600 text-white'
                }`}
              >
                {module.quiz.completed ? 'Review Quiz' : 'Start Quiz'}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Section */}
      {module.assignment && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Assignment</h4>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h5 className="font-medium text-gray-900">{module.assignment.title}</h5>
                <p className="text-sm text-gray-600 mt-1">{module.assignment.description}</p>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-500">
                    Due: <span className="font-medium">{module.assignment.dueDate}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Max Score: <span className="font-medium">{module.assignment.maxScore}</span>
                  </p>
                  {module.assignment.submitted && module.assignment.score && (
                    <p className="text-sm font-medium text-emerald-600">
                      Submitted • Score: {module.assignment.score}/{module.assignment.maxScore}
                    </p>
                  )}
                </div>
              </div>
              {!module.assignment.submitted && (
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" />
                    Upload Assignment
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.docx"
                      onChange={handleFileUpload}
                    />
                  </label>
                  <p className="text-xs text-gray-500">PDF or DOCX files only</p>
                </div>
              )}
            </div>
            {isSubmitting && (
              <div className="text-center py-2">
                <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-purple-600 border-t-transparent"></div>
                <p className="text-sm text-gray-600 mt-1">Submitting assignment...</p>
              </div>
            )}
            {file && !isSubmitting && (
              <div className="flex items-center justify-between p-3 bg-white rounded border">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}