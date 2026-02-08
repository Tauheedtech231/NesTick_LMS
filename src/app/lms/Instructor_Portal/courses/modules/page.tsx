'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Plus,
  Edit,
  Trash2,
  Video,
  FileText,
  AlertCircle,
  Wrench,
  FolderOpen,
  BookOpen,
  Clock,

  Search,
 
  ArrowLeft,
  Save,
  X
} from 'lucide-react'

const BRAND_COLORS = {
  darkNavy: '#0B1C3D',
  darkRoyalBlue: '#1E3A8A',
  deepRed: '#B11217',
  white: '#FFFFFF',
  lightGrey: '#F4F6F8',
  softGrey: '#E5E7EB',
  darkGrey: '#1F2933',
  teal: '#1FB6C9',
  brightRed: '#D32F2F'
}

type Module = {
  id: string;
  title: string;
  description: string;
  duration: string;
  type: 'video' | 'reading' | 'quiz' | 'assignment' | 'workshop' | 'project';
  order: number;
  resources?: string[];
  courseId: string;
}
/* eslint-disable */

export default function ModulesPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<string>('')
  const [modules, setModules] = useState<Module[]>([])
  const [showAddModule, setShowAddModule] = useState(false)
  const [editingModule, setEditingModule] = useState<Module | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  const [newModule, setNewModule] = useState({
    title: '',
    description: '',
    duration: '',
    type: 'video' as Module['type'],
    order: 1,
    resources: ['']
  })

  // Load courses
  useEffect(() => {
    const loadCourses = () => {
      try {
        const savedCourses = localStorage.getItem('lms_courses')
        if (savedCourses) {
          const coursesData = JSON.parse(savedCourses)
          setCourses(coursesData)
          if (coursesData.length > 0 && !selectedCourseId) {
            setSelectedCourseId(coursesData[0].id)
          }
        }
      } catch (error) {
        console.error('Error loading courses:', error)
      }
    }

    loadCourses()
  }, [])

  // Load modules when course is selected
  useEffect(() => {
    if (selectedCourseId) {
      const selectedCourse = courses.find(c => c.id === selectedCourseId)
      if (selectedCourse) {
        setModules(selectedCourse.modules || [])
      }
    }
  }, [selectedCourseId, courses])

  // Filter modules
  const filteredModules = modules.filter(module => 
    module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    module.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    module.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedCourse = courses.find(c => c.id === selectedCourseId)

  const handleAddResource = () => {
    setNewModule({ ...newModule, resources: [...newModule.resources, ''] })
  }

  const handleRemoveResource = (index: number) => {
    const newResources = newModule.resources.filter((_, i) => i !== index)
    setNewModule({ ...newModule, resources: newResources })
  }

  const handleResourceChange = (index: number, value: string) => {
    const newResources = [...newModule.resources]
    newResources[index] = value
    setNewModule({ ...newModule, resources: newResources })
  }

  const handleAddModule = () => {
    if (!selectedCourseId) {
      alert('Please select a course first')
      return
    }

    const moduleId = `module-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const moduleToAdd: Module = {
      id: moduleId,
      ...newModule,
      courseId: selectedCourseId,
      order: modules.length + 1
    }

    // Update course modules
    const updatedCourses = courses.map(course => {
      if (course.id === selectedCourseId) {
        return {
          ...course,
          modules: [...(course.modules || []), moduleToAdd]
        }
      }
      return course
    })

    // Save to localStorage
    localStorage.setItem('lms_courses', JSON.stringify(updatedCourses))
    setCourses(updatedCourses)
    
    // Reset form
    setNewModule({
      title: '',
      description: '',
      duration: '',
      type: 'video',
      order: modules.length + 2,
      resources: ['']
    })
    setShowAddModule(false)
    
    alert('Module added successfully!')
  }

  const handleEditModule = (module: Module) => {
    setEditingModule(module)
    setNewModule({
      title: module.title,
      description: module.description,
      duration: module.duration,
      type: module.type,
      order: module.order,
      resources: module.resources || ['']
    })
    setShowAddModule(true)
  }

  const handleUpdateModule = () => {
    if (!editingModule) return

    const updatedCourses = courses.map(course => {
      if (course.id === selectedCourseId) {
        const updatedModules = course.modules.map((mod: Module) =>
          mod.id === editingModule.id ? { ...mod, ...newModule } : mod
        )
        return { ...course, modules: updatedModules }
      }
      return course
    })

    localStorage.setItem('lms_courses', JSON.stringify(updatedCourses))
    setCourses(updatedCourses)
    
    setEditingModule(null)
    setShowAddModule(false)
    setNewModule({
      title: '',
      description: '',
      duration: '',
      type: 'video',
      order: 1,
      resources: ['']
    })
    
    alert('Module updated successfully!')
  }

  const handleDeleteModule = (moduleId: string) => {
    if (confirm('Are you sure you want to delete this module?')) {
      const updatedCourses = courses.map(course => {
        if (course.id === selectedCourseId) {
          const updatedModules = course.modules.filter((mod: Module) => mod.id !== moduleId)
          return { ...course, modules: updatedModules }
        }
        return course
      })

      localStorage.setItem('lms_courses', JSON.stringify(updatedCourses))
      setCourses(updatedCourses)
      
      alert('Module deleted successfully!')
    }
  }

  const moduleTypeIcons = {
    'video': <Video className="w-4 h-4" />,
    'reading': <FileText className="w-4 h-4" />,
    'quiz': <AlertCircle className="w-4 h-4" />,
    'assignment': <FileText className="w-4 h-4" />,
    'workshop': <Wrench className="w-4 h-4" />,
    'project': <FolderOpen className="w-4 h-4" />
  }

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-lightGrey rounded-xl p-6 border border-softGrey">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link
                href="/lms/Instructor_Portal/courses"
                className="p-2 text-darkGrey hover:text-darkRoyalBlue hover:bg-white rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                  Modules Management
                </h1>
                <p className="text-darkGrey mt-1">
                  Add, edit, and organize modules for each course
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAddModule(true)}
              className="flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors"
              style={{ 
                backgroundColor: BRAND_COLORS.deepRed,
                color: BRAND_COLORS.white 
              }}
            >
              <Plus className="w-5 h-5" />
              Add Module
            </button>
          </div>
          <div className="h-1 w-12 rounded-full" style={{ backgroundColor: BRAND_COLORS.deepRed }}></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column - Course Selection & Stats */}
        <div className="space-y-6">
          {/* Course Selection */}
          <div className="bg-white rounded-lg border border-softGrey p-6">
            <h2 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
              Select Course
            </h2>
            
            <div className="space-y-2">
              {courses.map(course => (
                <button
                  key={course.id}
                  onClick={() => setSelectedCourseId(course.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedCourseId === course.id 
                      ? 'border-l-4 bg-lightGrey' 
                      : 'hover:bg-lightGrey'
                  }`}
                  style={{ 
                    borderLeftColor: selectedCourseId === course.id ? BRAND_COLORS.deepRed : 'transparent'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" 
                      style={{ backgroundColor: `${BRAND_COLORS.darkRoyalBlue}10` }}>
                      <BookOpen className="w-4 h-4" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
                    </div>
                    <div>
                      <p className="font-medium text-darkGrey">{course.title}</p>
                      <p className="text-xs text-darkGrey/70">{course.modules?.length || 0} modules</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-lg border border-softGrey p-6">
            <h2 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
              Modules Stats
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-darkGrey">Total Modules</span>
                <span className="font-medium text-darkNavy">{modules.length}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-darkGrey">Videos</span>
                <span className="font-medium text-darkNavy">
                  {modules.filter(m => m.type === 'video').length}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-darkGrey">Assignments</span>
                <span className="font-medium text-darkNavy">
                  {modules.filter(m => m.type === 'assignment').length}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-darkGrey">Quizzes</span>
                <span className="font-medium text-darkNavy">
                  {modules.filter(m => m.type === 'quiz').length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Modules List */}
        <div className="lg:col-span-3">
          {selectedCourse ? (
            <>
              {/* Course Info */}
              <div className="bg-white rounded-lg border border-softGrey p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                      {selectedCourse.title}
                    </h2>
                    <p className="text-darkGrey/70 mt-1">{selectedCourse.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-darkGrey flex items-center gap-1">
                        <Clock className="w-4 h-4" /> {selectedCourse.duration}
                      </span>
                      <span className="text-sm text-darkGrey flex items-center gap-1">
                        <BookOpen className="w-4 h-4" /> {modules.length} modules
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/lms/Instructor_Portal/courses/edit/${selectedCourse.id}`}
                    className="px-4 py-2 border border-darkRoyalBlue text-darkRoyalBlue rounded-lg hover:bg-darkRoyalBlue/5 transition-colors font-medium"
                  >
                    Edit Course
                  </Link>
                </div>
              </div>

              {/* Search */}
              <div className="bg-white rounded-lg border border-softGrey p-5 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: BRAND_COLORS.darkGrey }} />
                  <input
                    type="text"
                    placeholder="Search modules..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                  />
                </div>
              </div>

              {/* Modules List */}
              <div className="bg-white rounded-lg border border-softGrey overflow-hidden">
                <div className="p-4 border-b border-softGrey flex justify-between items-center bg-lightGrey">
                  <h2 className="text-lg font-semibold" style={{ color: BRAND_COLORS.darkNavy }}>
                    Modules ({filteredModules.length})
                  </h2>
                  <span className="text-sm text-darkGrey">
                    Order: 1 → {modules.length}
                  </span>
                </div>

                {filteredModules.length > 0 ? (
                  <div className="divide-y divide-softGrey">
                    {filteredModules.map((module, index) => (
                      <div key={module.id} className="p-4 hover:bg-lightGrey transition-colors duration-150">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="flex flex-col items-center mt-1">
                              <span className="text-xs font-medium text-darkGrey/70 mb-1">
                                {module.order}
                              </span>
                              <div className="p-2 rounded-lg" style={{ backgroundColor: `${BRAND_COLORS.darkRoyalBlue}10` }}>
                                {moduleTypeIcons[module.type]}
                              </div>
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-darkGrey">{module.title}</h3>
                                <span className="text-xs px-2 py-0.5 rounded-full capitalize bg-lightGrey text-darkGrey">
                                  {module.type}
                                </span>
                              </div>
                              <p className="text-sm text-darkGrey/70 mb-2">{module.description}</p>
                              
                              <div className="flex items-center gap-4 text-sm text-darkGrey/70">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {module.duration}
                                </span>
                                {module.resources && module.resources.length > 0 && (
                                  <span>
                                    {module.resources.length} resource{module.resources.length !== 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleEditModule(module)}
                              className="p-2 text-darkGrey hover:text-darkRoyalBlue hover:bg-lightGrey rounded-lg transition-colors"
                              title="Edit Module"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            
                            <button
                              onClick={() => handleDeleteModule(module.id)}
                              className="p-2 text-brightRed hover:bg-brightRed/5 rounded-lg transition-colors"
                              title="Delete Module"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FolderOpen className="w-16 h-16 mx-auto mb-4" style={{ color: BRAND_COLORS.softGrey }} />
                    <h3 className="text-lg font-medium mb-2" style={{ color: BRAND_COLORS.darkGrey }}>
                      {searchTerm ? 'No matching modules found' : 'No modules yet'}
                    </h3>
                    <p className="text-darkGrey/70 mb-6 max-w-md mx-auto">
                      {searchTerm 
                        ? 'Try a different search term' 
                        : 'Add your first module to this course'}
                    </p>
                    <button
                      onClick={() => setShowAddModule(true)}
                      className="inline-flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors"
                      style={{ 
                        backgroundColor: BRAND_COLORS.deepRed,
                        color: BRAND_COLORS.white 
                      }}
                    >
                      <Plus className="w-5 h-5" />
                      Add First Module
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-softGrey">
              <BookOpen className="w-16 h-16 mx-auto mb-4" style={{ color: BRAND_COLORS.softGrey }} />
              <h3 className="text-lg font-medium mb-2" style={{ color: BRAND_COLORS.darkGrey }}>
                Select a Course
              </h3>
              <p className="text-darkGrey/70 mb-6 max-w-md mx-auto">
                Choose a course from the left panel to view and manage its modules
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Module Modal */}
      {showAddModule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-softGrey">
            <div className="p-4 border-b border-softGrey flex justify-between items-center bg-lightGrey">
              <div>
                <h3 className="text-lg font-semibold" style={{ color: BRAND_COLORS.darkNavy }}>
                  {editingModule ? 'Edit Module' : 'Add New Module'}
                </h3>
                <p className="text-sm text-darkGrey/70">
                  {selectedCourse?.title}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddModule(false)
                  setEditingModule(null)
                  setNewModule({
                    title: '',
                    description: '',
                    duration: '',
                    type: 'video',
                    order: 1,
                    resources: ['']
                  })
                }}
                className="p-2 text-darkGrey hover:text-darkGrey hover:bg-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-darkGrey mb-2">
                    Module Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newModule.title}
                    onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                    className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                    placeholder="e.g., Introduction to Pipe Fitting"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-darkGrey mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    value={newModule.description}
                    onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                    placeholder="Describe what students will learn in this module..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-darkGrey mb-2">
                      Duration *
                    </label>
                    <input
                      type="text"
                      required
                      value={newModule.duration}
                      onChange={(e) => setNewModule({ ...newModule, duration: e.target.value })}
                      className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                      placeholder="e.g., 2 hours"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-darkGrey mb-2">
                      Module Type *
                    </label>
                    <select
                      value={newModule.type}
                      onChange={(e) => setNewModule({ ...newModule, type: e.target.value as Module['type'] })}
                      className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20 bg-white"
                    >
                      <option value="video">Video Lesson</option>
                      <option value="reading">Reading Material</option>
                      <option value="quiz">Quiz</option>
                      <option value="assignment">Assignment</option>
                      <option value="workshop">Workshop</option>
                      <option value="project">Project</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-darkGrey mb-2">
                    Order Number *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newModule.order}
                    onChange={(e) => setNewModule({ ...newModule, order: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                  />
                </div>

                {/* Resources */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-darkGrey">
                      Resources (URLs)
                    </label>
                    <button
                      type="button"
                      onClick={handleAddResource}
                      className="flex items-center gap-1 text-sm text-darkRoyalBlue hover:text-darkRoyalBlue/80"
                    >
                      <Plus className="w-4 h-4" />
                      Add Resource
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {newModule.resources.map((resource, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={resource}
                          onChange={(e) => handleResourceChange(index, e.target.value)}
                          className="flex-1 px-4 py-2 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                          placeholder={`Resource ${index + 1} URL`}
                        />
                        {newModule.resources.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveResource(index)}
                            className="p-2 text-brightRed hover:bg-brightRed/5 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="mt-8 pt-6 border-t border-softGrey flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModule(false)
                    setEditingModule(null)
                    setNewModule({
                      title: '',
                      description: '',
                      duration: '',
                      type: 'video',
                      order: 1,
                      resources: ['']
                    })
                  }}
                  className="px-6 py-3 border border-darkRoyalBlue text-darkRoyalBlue rounded-lg hover:bg-darkRoyalBlue/5 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={editingModule ? handleUpdateModule : handleAddModule}
                  className="px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                  style={{ 
                    backgroundColor: BRAND_COLORS.deepRed,
                    color: BRAND_COLORS.white 
                  }}
                >
                  <Save className="w-5 h-5" />
                  {editingModule ? 'Update Module' : 'Add Module'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}