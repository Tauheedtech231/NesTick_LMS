/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit3, Save, X, Loader2, CheckCircle, AlertCircle, Calendar, Award, FileText, Upload } from 'lucide-react'

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
}

interface AssignmentManagerProps {
  slideId: string;
  courseId: string;
  onAssignmentsChange?: (assignments: Assignment[]) => void;
}

const CLOUDINARY_CLOUD_NAME = 'dfp9qc0gu'
const CLOUDINARY_UPLOAD_PRESET = 'lms_upload'

export default function AssignmentManager({ slideId, courseId, onAssignmentsChange }: AssignmentManagerProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [formData, setFormData] = useState<Partial<Assignment>>({
    title: '',
    description: '',
    dueDate: '',
    totalMarks: 100,
    passingMarks: 70,
    status: 'draft'
  })
  const [assignmentFile, setAssignmentFile] = useState<Assignment['file'] | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Fetch assignments
  const fetchAssignments = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/instructors/slide/assignments?slideId=${slideId}&courseId=${courseId}`)
      const data = await response.json()
      if (data.success) {
        setAssignments(data.data || [])
        onAssignmentsChange?.(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching assignments:', error)
      showMessage('error', 'Failed to load assignments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (slideId) {
      fetchAssignments()
    }
  }, [slideId])

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  // Upload file to Cloudinary
  const uploadFile = async (file: File): Promise<Assignment['file'] | null> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
    formData.append('folder', `lms/courses/${courseId}/assignments`)

    const resourceType = file.type.startsWith('video/') ? 'video' : 
                        file.type.startsWith('image/') ? 'image' : 'raw'

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) throw new Error('Upload failed')

    const result = await response.json()
    return {
      name: file.name,
      type: file.type,
      size: file.size,
      url: result.secure_url,
      publicId: result.public_id,
      uploadedAt: new Date().toISOString()
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingFile(true)
    try {
      const uploaded = await uploadFile(file)
      setAssignmentFile(uploaded)
      showMessage('success', 'File uploaded successfully!')
    } catch (error) {
      showMessage('error', 'Failed to upload file')
    } finally {
      setUploadingFile(false)
    }
  }

  // Save assignment
  const handleSave = async () => {
    if (!formData.title?.trim()) {
      showMessage('error', 'Please enter assignment title')
      return
    }
    if (!formData.description?.trim()) {
      showMessage('error', 'Please enter assignment description')
      return
    }
    if (!formData.dueDate) {
      showMessage('error', 'Please select due date')
      return
    }

    setSaving(true)
    try {
      const payload = {
        slideId,
        courseId,
        title: formData.title,
        description: formData.description,
        dueDate: formData.dueDate,
        totalMarks: formData.totalMarks,
        passingMarks: formData.passingMarks,
        status: formData.status,
        file: assignmentFile
      }

      let response
      if (editingId) {
        response = await fetch(`/api/instructors/assignment/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      } else {
        response = await fetch('/api/instructors/assignment/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      }

      const data = await response.json()
      if (data.success) {
        showMessage('success', editingId ? 'Assignment updated!' : 'Assignment added!')
        resetForm()
        fetchAssignments()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to save assignment')
    } finally {
      setSaving(false)
    }
  }

  // Delete assignment
  const handleDelete = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return

    try {
      const response = await fetch(`/api/instructors/assignment/${assignmentId}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      if (data.success) {
        showMessage('success', 'Assignment deleted!')
        fetchAssignments()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to delete assignment')
    }
  }

  // Edit assignment
  const handleEdit = (assignment: Assignment) => {
    setEditingId(assignment.id)
    setFormData({
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate,
      totalMarks: assignment.totalMarks,
      passingMarks: assignment.passingMarks,
      status: assignment.status
    })
    setAssignmentFile(assignment.file || null)
    setShowForm(true)
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      totalMarks: 100,
      passingMarks: 70,
      status: 'draft'
    })
    setAssignmentFile(null)
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="w-4 h-4 text-red-500" />
    if (fileType.includes('word')) return <FileText className="w-4 h-4 text-blue-500" />
    return <FileText className="w-4 h-4 text-gray-500" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading assignments...</span>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Assignments</h3>
          <p className="text-xs text-gray-500 mt-1">{assignments.length} assignment(s)</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Assignment
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">{editingId ? 'Edit Assignment' : 'New Assignment'}</h4>
            <button onClick={resetForm} className="p-1 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Final Project"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the assignment..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
              <input
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks</label>
                <input
                  type="number"
                  min="1"
                  value={formData.totalMarks}
                  onChange={(e) => setFormData({ ...formData, totalMarks: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Passing Marks</label>
                <input
                  type="number"
                  min="1"
                  value={formData.passingMarks}
                  onChange={(e) => setFormData({ ...formData, passingMarks: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assignment File (Optional)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-white">
                {assignmentFile ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getFileIcon(assignmentFile.type)}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{assignmentFile.name}</p>
                        <p className="text-xs text-gray-500">{(assignmentFile.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setAssignmentFile(null)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600 mb-2">Upload assignment instructions or template</p>
                    <label className="inline-block cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={uploadingFile}
                      />
                      <span className={`px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium inline-flex items-center gap-2 ${uploadingFile ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}>
                        {uploadingFile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        {uploadingFile ? 'Uploading...' : 'Browse Files'}
                      </span>
                    </label>
                  </>
                )}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.status === 'draft'}
                    onChange={() => setFormData({ ...formData, status: 'draft' })}
                    className="w-4 h-4 text-red-600"
                  />
                  <span className="text-sm">Draft</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.status === 'published'}
                    onChange={() => setFormData({ ...formData, status: 'published' })}
                    className="w-4 h-4 text-red-600"
                  />
                  <span className="text-sm">Published</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={resetForm} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : (editingId ? 'Update' : 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assignments List */}
      {assignments.length === 0 && !showForm ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">No assignments yet. Click &quot;Add Assignment&quot; to create one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">{assignment.title}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${assignment.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {assignment.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Award className="w-3 h-3" /> Total: {assignment.totalMarks} marks</span>
                    <span className="flex items-center gap-1"><Award className="w-3 h-3" /> Passing: {assignment.passingMarks} marks</span>
                  </div>
                  {assignment.file && (
                    <a href={assignment.file.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 hover:underline">
                      <FileText className="w-3 h-3" />
                      {assignment.file.name}
                    </a>
                  )}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(assignment)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(assignment.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}