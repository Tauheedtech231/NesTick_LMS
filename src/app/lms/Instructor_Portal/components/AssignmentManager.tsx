/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { Plus, X, Edit3, Trash2, Upload, Calendar, Award, FileText, Loader2, BookOpen } from 'lucide-react'

interface Assignment {
  id: string;
  slideId: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
  totalMarks: number;
  passingMarks: number;
  file?: {
    name: string;
    type: string;
    size: number;
    url: string;
    publicId: string;
    uploadedAt: string;
  };
  status: 'published' | 'draft';
  createdAt: string;
  updatedAt: string;
}

interface AssignmentManagerProps {
  slideId: string;
  courseId: string;
  assignments: Assignment[];
  onAssignmentsChange: (assignments: Assignment[]) => void;
  onShowSuccess?: (message: string) => void;
  onShowError?: (message: string) => void;
}

const CLOUDINARY_CLOUD_NAME = 'dfp9qc0gu'
const CLOUDINARY_UPLOAD_PRESET = 'lms_upload'

const getFileIcon = (fileType: string) => {
  if (fileType.includes('video')) return <FileText className="w-5 h-5 text-blue-500" />;
  if (fileType.includes('image')) return <FileText className="w-5 h-5 text-green-500" />;
  if (fileType.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
  return <FileText className="w-5 h-5 text-gray-500" />;
};

export default function AssignmentManager({ 
  slideId, 
  courseId, 
  assignments, 
  onAssignmentsChange,
  onShowSuccess,
  onShowError
}: AssignmentManagerProps) {
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [currentAssignment, setCurrentAssignment] = useState<Partial<Assignment>>({
    title: '',
    description: '',
    dueDate: '',
    totalMarks: 100,
    passingMarks: 70,
    status: 'draft'
  });
  
  const [assignmentFile, setAssignmentFile] = useState<{
    name: string;
    type: string;
    size: number;
    url: string;
    publicId: string;
    uploadedAt: string;
  } | null>(null);

  // Fetch assignments from database
  const fetchAssignments = async () => {
    if (!slideId || !courseId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/instructors/assignments?slideId=${slideId}&courseId=${courseId}`);
      const result = await response.json();
      
      if (result.success) {
        onAssignmentsChange(result.data);
      } else {
        console.error('Failed to fetch assignments:', result.error);
      }
    } catch (error: any) {
      console.error('Error fetching assignments:', error);
      onShowError?.(error.message || 'Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  };

  // Load assignments when slideId changes
  useEffect(() => {
    if (slideId && courseId) {
      fetchAssignments();
    }
  }, [slideId, courseId]);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setUploadingFile(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('folder', `lms/courses/${courseId}/assignments`);

      const resourceType = file.type.startsWith('video/') ? 'video' : 
                          file.type.startsWith('image/') ? 'image' : 'raw';

      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      setAssignmentFile({
        name: file.name,
        type: file.type,
        size: file.size,
        url: result.secure_url,
        publicId: result.public_id,
        uploadedAt: new Date().toISOString()
      });
      
      onShowSuccess?.('Assignment file uploaded successfully!');
    } catch (error) {
      console.error('Assignment file upload error:', error);
      onShowError?.('Failed to upload assignment file');
    } finally {
      setUploadingFile(false);
    }
  };

  // ============ CREATE Assignment ============
  const handleSave = async () => {
    if (!currentAssignment.title?.trim()) {
      onShowError?.('Please enter assignment title');
      return;
    }

    if (!currentAssignment.description?.trim()) {
      onShowError?.('Please enter assignment description');
      return;
    }

    if (!currentAssignment.dueDate) {
      onShowError?.('Please select due date');
      return;
    }

    setSubmitting(true);

    try {
      const requestBody = {
        slideId: slideId,
        courseId: courseId,
        title: currentAssignment.title.trim(),
        description: currentAssignment.description.trim(),
        dueDate: currentAssignment.dueDate,
        totalMarks: currentAssignment.totalMarks || 100,
        passingMarks: currentAssignment.passingMarks || 70,
        file: assignmentFile || null,
        status: currentAssignment.status || 'draft'
      };

      let response;
      let result;

      if (editingId) {
        // UPDATE
        response = await fetch(`/api/instructors/assignments/update/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });
        result = await response.json();
        
        if (result.success) {
          onShowSuccess?.('Assignment updated successfully!');
          await fetchAssignments();
          resetForm();
        } else {
          throw new Error(result.error);
        }
      } else {
        // CREATE
        response = await fetch('/api/instructors/assignments/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });
        result = await response.json();
        
        if (result.success) {
          onShowSuccess?.('Assignment added successfully!');
          await fetchAssignments();
          resetForm();
        } else {
          throw new Error(result.error);
        }
      }
      
    } catch (error: any) {
      console.error('Error saving assignment:', error);
      onShowError?.(error.message || 'Failed to save assignment');
    } finally {
      setSubmitting(false);
    }
  };

  // ============ EDIT Assignment ============
  const handleEdit = (assignment: Assignment) => {
    setEditingId(assignment.id);
    setCurrentAssignment({
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate.split('T')[0] + 'T' + (assignment.dueDate.split('T')[1] || '23:59'),
      totalMarks: assignment.totalMarks,
      passingMarks: assignment.passingMarks,
      status: assignment.status
    });
    if (assignment.file) {
      setAssignmentFile(assignment.file);
    }
    setShowForm(true);
  };

  // ============ DELETE Assignment ============
  const handleDelete = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) {
      return;
    }

    setDeletingId(assignmentId);

    try {
      const response = await fetch(`/api/instructors/assignments/delete/${assignmentId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        onShowSuccess?.('Assignment deleted successfully!');
        await fetchAssignments();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('Error deleting assignment:', error);
      onShowError?.(error.message || 'Failed to delete assignment');
    } finally {
      setDeletingId(null);
    }
  };

  const resetForm = () => {
    setCurrentAssignment({
      title: '',
      description: '',
      dueDate: '',
      totalMarks: 100,
      passingMarks: 70,
      status: 'draft'
    });
    setAssignmentFile(null);
    setShowForm(false);
    setEditingId(null);
  };

  const slideAssignments = assignments.filter(a => a.slideId === slideId);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-softGrey p-6 text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto" style={{ color: '#1E3A8A' }} />
        <p className="text-sm mt-2">Loading assignments...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-softGrey p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold" style={{ color: '#0B1C3D' }}>
          Assignments for this Slide ({slideAssignments.length})
        </h3>
        <button 
          onClick={() => setShowForm(true)} 
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          style={{ backgroundColor: '#1E3A8A', color: '#FFFFFF' }}
        >
          <Plus className="w-4 h-4" /> Add Assignment
        </button>
      </div>

      {/* Assignment Form */}
      {showForm && (
        <div className="bg-lightGrey rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-darkGrey">{editingId ? 'Edit Assignment' : 'New Assignment'}</h4>
            <button onClick={resetForm} className="p-1 text-darkGrey/60 hover:text-darkGrey rounded cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-darkGrey mb-2">Assignment Title *</label>
              <input 
                type="text" 
                value={currentAssignment.title} 
                onChange={(e) => setCurrentAssignment({ ...currentAssignment, title: e.target.value })} 
                className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue bg-white cursor-text" 
                placeholder="e.g., Final Project" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-darkGrey mb-2">Description *</label>
              <textarea 
                value={currentAssignment.description} 
                onChange={(e) => setCurrentAssignment({ ...currentAssignment, description: e.target.value })} 
                rows={4} 
                className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue bg-white cursor-text" 
                placeholder="Describe the assignment..." 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-darkGrey mb-2">Due Date *</label>
              <input 
                type="datetime-local" 
                value={currentAssignment.dueDate} 
                onChange={(e) => setCurrentAssignment({ ...currentAssignment, dueDate: e.target.value })} 
                className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue bg-white cursor-text" 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-darkGrey mb-2">Total Marks</label>
                <input 
                  type="number" 
                  min="1" 
                  value={currentAssignment.totalMarks} 
                  onChange={(e) => setCurrentAssignment({ ...currentAssignment, totalMarks: parseInt(e.target.value) })} 
                  className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue bg-white cursor-text" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-darkGrey mb-2">Passing Marks</label>
                <input 
                  type="number" 
                  min="1" 
                  value={currentAssignment.passingMarks} 
                  onChange={(e) => setCurrentAssignment({ ...currentAssignment, passingMarks: parseInt(e.target.value) })} 
                  className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue bg-white cursor-text" 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-darkGrey mb-2">Assignment File (Optional)</label>
              <div className="border-2 border-dashed border-softGrey rounded-lg p-4 text-center bg-white">
                {assignmentFile ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getFileIcon(assignmentFile.type)}
                      <div>
                        <p className="text-sm font-medium">{assignmentFile.name}</p>
                        <p className="text-xs text-darkGrey/60">{(assignmentFile.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <button onClick={() => setAssignmentFile(null)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: '#E5E7EB' }} />
                    <p className="text-sm text-darkGrey/70 mb-2">Upload assignment instructions</p>
                    <label className="inline-block relative">
                      <input 
                        type="file" 
                        accept=".pdf,.doc,.docx,.txt" 
                        onChange={(e) => { 
                          if (e.target.files && e.target.files[0]) 
                            handleFileUpload(e.target.files[0]); 
                        }} 
                        className="hidden" 
                      />
                      <span 
                        className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer inline-flex items-center gap-2"
                        style={{ backgroundColor: '#1E3A8A', color: '#FFFFFF' }}
                      >
                        {uploadingFile ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Browse Files'}
                      </span>
                    </label>
                  </>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-darkGrey mb-2">Status</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    checked={currentAssignment.status === 'draft'} 
                    onChange={() => setCurrentAssignment({ ...currentAssignment, status: 'draft' })} 
                    className="w-4 h-4" 
                    style={{ accentColor: '#B11217' }}
                  />
                  <span>Draft</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    checked={currentAssignment.status === 'published'} 
                    onChange={() => setCurrentAssignment({ ...currentAssignment, status: 'published' })} 
                    className="w-4 h-4" 
                    style={{ accentColor: '#B11217' }}
                  />
                  <span>Published</span>
                </label>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button 
                onClick={resetForm} 
                className="px-4 py-2 border border-softGrey text-darkGrey rounded-lg text-sm font-medium hover:bg-lightGrey"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave} 
                disabled={submitting} 
                className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
                style={{ backgroundColor: '#B11217' }}
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingId ? 'Update' : 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assignments List */}
      {slideAssignments.length > 0 ? (
        <div className="space-y-3">
          {slideAssignments.map((assignment) => (
            <div key={assignment.id} className="border border-softGrey rounded-lg p-4 hover:bg-lightGrey/50">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium">{assignment.title}</h4>
                  <p className="text-sm text-darkGrey/70 mt-1">{assignment.description}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(assignment)} 
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Edit assignment"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(assignment.id)} 
                    disabled={deletingId === assignment.id}
                    className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50 transition-colors"
                    title="Delete assignment"
                  >
                    {deletingId === assignment.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-3">
                <div className="flex items-center gap-2 text-xs text-darkGrey/60">
                  <Calendar className="w-3 h-3" />
                  Due: {new Date(assignment.dueDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 text-xs text-darkGrey/60">
                  <Award className="w-3 h-3" />
                  Total: {assignment.totalMarks} marks
                </div>
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    assignment.status === 'published' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {assignment.status}
                  </span>
                </div>
              </div>
              
              {assignment.file && (
                <div className="mt-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <a 
                    href={assignment.file.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:underline text-sm"
                  >
                    {assignment.file.name}
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : !showForm && (
        <div className="text-center py-8 border-2 border-dashed border-softGrey rounded-lg">
          <BookOpen className="w-12 h-12 mx-auto mb-3" style={{ color: '#E5E7EB' }} />
          <p className="text-darkGrey/70">No assignments yet</p>
          <p className="text-xs text-darkGrey/50 mt-1">Click "Add Assignment" to create one</p>
        </div>
      )}
    </div>
  );
}