'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { HiArrowLeft, HiPlus, HiTrash, HiBookOpen, HiFolder } from 'react-icons/hi'
import Link from 'next/link'
import { v4 as uuidv4 } from 'uuid'
/* eslint-disable */

export default function AddAssignment() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [courses, setCourses] = useState<any[]>([])
  const [modules, setModules] = useState<any[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [selectedModule, setSelectedModule] = useState<string>('')
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    dueDate: '',
    totalPoints: 100,
    submissionType: 'file' as 'file' | 'text' | 'both',
    allowedFileTypes: ['.pdf', '.doc', '.docx', '.zip'],
    maxFileSize: 10, // in MB
    status: 'draft' as 'draft' | 'published',
    attachments: [] as Array<{ id: string; name: string; url: string }>
  })

  const [attachmentForm, setAttachmentForm] = useState({
    name: '',
    url: ''
  })

  useEffect(() => {
    // Load available courses
    const storedCourses = JSON.parse(localStorage.getItem('courses') || '[]')
    setCourses(storedCourses)
  }, [])

  useEffect(() => {
    // Load modules for selected course
    if (selectedCourse) {
      const storedModules = JSON.parse(localStorage.getItem('modules') || '[]')
      const courseModules = storedModules.filter((m: any) => m.courseId === selectedCourse)
      setModules(courseModules)
    } else {
      setModules([])
      setSelectedModule('')
    }
  }, [selectedCourse])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'totalPoints' || name === 'maxFileSize' ? parseInt(value) || 0 : value
    }))
  }

  const handleAttachmentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setAttachmentForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const addAttachment = () => {
    if (attachmentForm.name && attachmentForm.url) {
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, {
          id: uuidv4(),
          name: attachmentForm.name,
          url: attachmentForm.url
        }]
      }))
      setAttachmentForm({ name: '', url: '' })
    }
  }

  const removeAttachment = (id: string) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(attachment => attachment.id !== id)
    }))
  }

  const toggleFileType = (fileType: string) => {
    setFormData(prev => ({
      ...prev,
      allowedFileTypes: prev.allowedFileTypes.includes(fileType)
        ? prev.allowedFileTypes.filter(type => type !== fileType)
        : [...prev.allowedFileTypes, fileType]
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!selectedCourse || !selectedModule) {
      alert('Please select both course and module')
      setLoading(false)
      return
    }

    // Generate unique ID
    const assignmentId = uuidv4()
    
    // Get course and module names
    const course = courses.find(c => c.id === selectedCourse)
    const module = modules.find(m => m.id === selectedModule)
    
    // Create assignment object
    const newAssignment = {
      id: assignmentId,
      courseId: selectedCourse,
      courseName: course?.title || 'Unknown Course',
      moduleId: selectedModule,
      moduleName: module?.title || 'Unknown Module',
      ...formData,
      totalStudents: 45, // Default value
      submitted: 0,
      averageScore: null,
      createdAt: new Date().toISOString(),
      submissions: []
    }

    // Save to localStorage (in real app, this would be API call)
    const existingAssignments = JSON.parse(localStorage.getItem('assignments') || '[]')
    localStorage.setItem('assignments', JSON.stringify([...existingAssignments, newAssignment]))

    // Show success message
    setTimeout(() => {
      setLoading(false)
      alert('Assignment created successfully!')
      router.push('/lms/Admin_Portal/assignments')
    }, 1000)
  }

  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId)
    return course ? course.title : 'Unknown Course'
  }

  const getModuleName = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId)
    return module ? module.title : 'Unknown Module'
  }

  const fileTypes = [
    { extension: '.pdf', name: 'PDF Documents' },
    { extension: '.doc', name: 'Word Documents' },
    { extension: '.docx', name: 'Word Documents (docx)' },
    { extension: '.txt', name: 'Text Files' },
    { extension: '.zip', name: 'Zip Archives' },
    { extension: '.jpg', name: 'JPEG Images' },
    { extension: '.png', name: 'PNG Images' },
    { extension: '.mp4', name: 'MP4 Videos' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/lms/Admin_Portal/assignments"
            className="inline-flex items-center text-gray-600 hover:text-purple-600 mb-2"
          >
            <HiArrowLeft className="w-5 h-5 mr-2" />
            Back to Assignments
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Create New Assignment</h1>
          <p className="text-gray-600 mt-2">Create a new assignment for students to complete</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Course and Module Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">
                Select Course *
              </label>
              <select
                id="course"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
              {selectedCourse && (
                <div className="mt-2 flex items-center text-sm text-gray-600">
                  <HiBookOpen className="w-4 h-4 mr-2" />
                  {getCourseName(selectedCourse)}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="module" className="block text-sm font-medium text-gray-700 mb-1">
                Select Module *
              </label>
              <select
                id="module"
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
                disabled={!selectedCourse}
              >
                <option value="">{selectedCourse ? 'Select a module' : 'Select course first'}</option>
                {modules.map((module) => (
                  <option key={module.id} value={module.id}>
                    {module.title}
                  </option>
                ))}
              </select>
              {selectedModule && (
                <div className="mt-2 flex items-center text-sm text-gray-600">
                  <HiFolder className="w-4 h-4 mr-2" />
                  {getModuleName(selectedModule)}
                </div>
              )}
            </div>
          </div>

          {/* Assignment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Assignment Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., HTML Portfolio Project"
              />
            </div>

            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                Due Date *
              </label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                required
                value={formData.dueDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Points and Submission Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="totalPoints" className="block text-sm font-medium text-gray-700 mb-1">
                Total Points *
              </label>
              <input
                type="number"
                id="totalPoints"
                name="totalPoints"
                required
                min="1"
                max="1000"
                value={formData.totalPoints}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., 100"
              />
            </div>

            <div>
              <label htmlFor="submissionType" className="block text-sm font-medium text-gray-700 mb-1">
                Submission Type *
              </label>
              <select
                id="submissionType"
                name="submissionType"
                required
                value={formData.submissionType}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="file">File Upload Only</option>
                <option value="text">Text Submission Only</option>
                <option value="both">File Upload and Text</option>
              </select>
            </div>
          </div>

          {/* File Upload Settings */}
          {(formData.submissionType === 'file' || formData.submissionType === 'both') && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">File Upload Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="maxFileSize" className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum File Size (MB) *
                  </label>
                  <input
                    type="number"
                    id="maxFileSize"
                    name="maxFileSize"
                    required
                    min="1"
                    max="100"
                    value={formData.maxFileSize}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., 10"
                  />
                </div>
              </div>

              {/* Allowed File Types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allowed File Types *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {fileTypes.map((fileType) => (
                    <div
                      key={fileType.extension}
                      onClick={() => toggleFileType(fileType.extension)}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        formData.allowedFileTypes.includes(fileType.extension)
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-300 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{fileType.name}</div>
                          <div className="text-sm text-gray-500">{fileType.extension}</div>
                        </div>
                        {formData.allowedFileTypes.includes(fileType.extension) && (
                          <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {formData.allowedFileTypes.length === 0 && (
                  <p className="text-red-500 text-sm mt-2">Please select at least one file type</p>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Assignment Description *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Provide a brief overview of the assignment..."
            />
          </div>

          {/* Instructions */}
          <div>
            <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-1">
              Detailed Instructions
            </label>
            <textarea
              id="instructions"
              name="instructions"
              rows={4}
              value={formData.instructions}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Provide step-by-step instructions for students..."
            />
          </div>

          {/* Attachments */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Attachments</h3>
            
            {/* Add Attachment Form */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Attachment Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={attachmentForm.name}
                    onChange={handleAttachmentInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Project Guidelines.pdf"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL/Link
                  </label>
                  <input
                    type="url"
                    name="url"
                    value={attachmentForm.url}
                    onChange={handleAttachmentInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://example.com/guidelines.pdf"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={addAttachment}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all shadow-md"
              >
                <HiPlus className="w-5 h-5 mr-2" />
                Add Attachment
              </button>
            </div>

            {/* Attachments List */}
            {formData.attachments.length > 0 ? (
              <div className="space-y-2">
                {formData.attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between p-3 bg-white border border-gray-300 rounded-lg">
                    <div>
                      <span className="font-medium text-gray-900">{attachment.name}</span>
                      <div className="text-sm text-gray-600 truncate">{attachment.url}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(attachment.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <HiTrash className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No attachments added yet</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select
              id="status"
              name="status"
              required
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="draft">Save as Draft</option>
              <option value="published">Publish Now</option>
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Draft assignments are only visible to instructors. Published assignments are visible to students.
            </p>
          </div>

          {/* Preview */}
          {selectedCourse && selectedModule && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Assignment Preview</h4>
              <div className="space-y-3">
                <div className="font-bold text-gray-900">{formData.title || 'Untitled Assignment'}</div>
                <div className="text-sm text-gray-600">
                  {getCourseName(selectedCourse)} • {getModuleName(selectedModule)}
                </div>
                <div className="text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Due Date:</span>
                    <span className="font-medium text-gray-900">
                      {formData.dueDate ? new Date(formData.dueDate).toLocaleDateString() : 'Not set'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Points:</span>
                    <span className="font-medium text-gray-900">{formData.totalPoints}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Status:</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      formData.status === 'published' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {formData.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-end space-x-4">
              <Link
                href="/lms/Admin_Portal/assignments"
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating Assignment...
                  </span>
                ) : formData.status === 'draft' ? (
                  'Save as Draft'
                ) : (
                  'Publish Assignment'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}