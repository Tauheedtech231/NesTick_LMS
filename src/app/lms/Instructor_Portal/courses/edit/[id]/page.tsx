// app/lms/Instructor_Portal/courses/edit/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import {
  Save,
  X,
  Plus,
  Trash2,
  Upload,
  BookOpen,
  ArrowLeft,
  FileText,
  FileVideo,
  FileImage,
  File,
  Edit3,
  AlertCircle,
  HelpCircle,
  Loader2,
  Lock,
  Calendar,
  Award,
  CheckCircle,
  RefreshCw,
  Video,
  Film
} from 'lucide-react'
/* eslint-disable */

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

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = 'dfp9qc0gu'
const CLOUDINARY_UPLOAD_PRESET = 'lms_upload'

// ============ QUIZ TYPES ============
enum QuestionType {
  MCQ = 'mcq',
  TEXT = 'text'
}

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'draft' | 'published';
  instructorId: string;
  instructorName: string;
  createdAt: string;
  updatedAt: string;
  isPublished?: boolean;
  image?: string;
  duration?: string;
  level?: string;
  price?: number;
}

interface Slide {
  id: string;
  courseId: string;
  slideNumber: number;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface SlideFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  publicId: string;
  uploadedAt: string;
}

interface QuizQuestion {
  id: string;
  slideId: string;
  courseId: string;
  question: string;
  options: string[];
  correctAnswer: number;
  questionType: QuestionType;
  createdAt?: string;
  updatedAt?: string;
}

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

interface UploadProgress {
  [key: string]: number;
}

// Helper function for generating IDs client-side only
const generateId = (prefix: string): string => {
  if (typeof window === 'undefined') return `${prefix}_placeholder`;
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Slide states
  const [addingSlide, setAddingSlide] = useState(false);
  const [deletingSlide, setDeletingSlide] = useState<string | null>(null);
  const [updatingSlide, setUpdatingSlide] = useState<string | null>(null);
  
  // Edit slide states
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [editingSlideTitle, setEditingSlideTitle] = useState('');
  
  const [activeTab, setActiveTab] = useState<'details' | 'slides' | 'content' | 'assignments'>('details');
  const [instructor, setInstructor] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  // Upload progress states
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  
  // Course Details
  const [courseDetails, setCourseDetails] = useState<Course | null>(null);
  const [editedDetails, setEditedDetails] = useState<Partial<Course>>({});
  
  // Slides
  const [slides, setSlides] = useState<Slide[]>([]);
  const [selectedSlideId, setSelectedSlideId] = useState<string>('');
  
  // Content - Files
  const [slideContents, setSlideContents] = useState<Record<string, SlideFile[]>>({});
  
  // Quiz Questions - Per Slide
  const [quizQuestions, setQuizQuestions] = useState<Record<string, QuizQuestion[]>>({});
  
  // Assignments
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [selectedAssignmentSlide, setSelectedAssignmentSlide] = useState<string>('');
  const [editingAssignment, setEditingAssignment] = useState<string | null>(null);
  const [submittingAssignment, setSubmittingAssignment] = useState(false);
  const [deletingAssignment, setDeletingAssignment] = useState<string | null>(null);
  
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
  const [uploadingAssignment, setUploadingAssignment] = useState(false);
  
  // Quiz creation
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    questionType: QuestionType.MCQ
  });

  // Mount effect for hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load course data after mount
  useEffect(() => {
    if (isMounted) {
      checkAuthAndLoadCourse();
    }
  }, [courseId, isMounted]);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 3000);
  };

  const checkAuthAndLoadCourse = async () => {
    try {
      const currentUserStr = localStorage.getItem('currentUser');
      if (!currentUserStr) {
        router.push('/lms/auth/login?type=instructor');
        return;
      }

      const currentUser = JSON.parse(currentUserStr);
      if (currentUser.role !== 'instructor') {
        router.push('/lms/auth/login?type=instructor');
        return;
      }

      setInstructor(currentUser);
      await fetchCourseFromAPI();
      
    } catch (error) {
      console.error('Auth error:', error);
      setError('Authentication failed');
      setLoading(false);
    }
  };

  // ============ API FUNCTIONS ============
const fetchCourseFromAPI = async () => {
  try {
    setLoading(true);
    setError(null);

    console.log('🔍 Fetching course from API:', courseId);

    const response = await fetch(`/api/instructors/course/${courseId}`);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch course');
    }

    if (result.success) {
      const courseData = result.data.course;
      const slidesData = result.data.slides || [];
      
      // ✅ SORT SLIDES BY TITLE NUMBER (Module 1, Module 2, Module 3)
      const sortedSlides = [...slidesData].sort((a, b) => {
        const getNumber = (title: string) => {
          const match = title?.match(/\d+/);
          return match ? parseInt(match[0]) : 999;
        };
        return getNumber(a.title) - getNumber(b.title);
      });
      
      setCourseDetails(courseData);
      setEditedDetails({
        title: courseData.title,
        description: courseData.description,
        category: courseData.category,
        status: courseData.status,
        duration: courseData.duration,
        level: courseData.level,
        price: courseData.price
      });
      
      setSlides(sortedSlides);
      
      // Load slide contents (files) and quiz questions
      const contentsMap: Record<string, SlideFile[]> = {};
      const quizMap: Record<string, QuizQuestion[]> = {};
      const allAssignments: Assignment[] = [];
      
      sortedSlides.forEach((slide: any) => {
        // Load files
        if (slide.files && Array.isArray(slide.files)) {
          contentsMap[slide.id] = slide.files.map((f: any) => ({
            id: f.id,
            name: f.file_name || f.name,
            type: f.file_type || f.type,
            size: f.file_size || f.size,
            url: f.file_url || f.url,
            publicId: f.public_id || f.publicId,
            uploadedAt: f.uploaded_at || f.uploadedAt
          }));
        }
        
        // Load quiz questions
        if (slide.quizQuestions && Array.isArray(slide.quizQuestions)) {
          quizMap[slide.id] = slide.quizQuestions.map((q: any) => ({
            id: q.id,
            slideId: slide.id,
            courseId: courseId,
            question: q.question,
            options: q.options || [],
            correctAnswer: q.correctAnswer ?? (q.options?.length > 0 ? 0 : -1),
            questionType: q.questionType || (q.options?.length > 0 ? QuestionType.MCQ : QuestionType.TEXT),
            createdAt: q.created_at || q.createdAt,
            updatedAt: q.updated_at || q.updatedAt
          }));
        }
        
        // Load assignments
        if (slide.assignments && Array.isArray(slide.assignments)) {
          allAssignments.push(...slide.assignments.map((a: any) => ({
            ...a,
            slideId: a.slideId || slide.id
          })));
        }
      });
      
      setSlideContents(contentsMap);
      setQuizQuestions(quizMap);
      setAssignments(allAssignments);
      
      if (sortedSlides.length > 0) {
        setSelectedSlideId(sortedSlides[0].id);
      }
    }
    
  } catch (error: any) {
    console.error('Error fetching course:', error);
    setError(error.message || 'Failed to load course');
  } finally {
    setLoading(false);
  }
};

  // ============ FULL COURSE SAVE ============
  const handleSaveAll = async () => {
    setSaving(true);
    setError(null);

    try {
      // Validate all assignments have slideId
      const invalidAssignments = assignments.filter(a => !a.slideId);
      if (invalidAssignments.length > 0) {
        console.error('❌ Assignments missing slideId:', invalidAssignments);
        showError(`${invalidAssignments.length} assignment(s) are not attached to any slide. Please delete and recreate them.`);
        setSaving(false);
        return;
      }

      // Prepare slides data with quiz questions
      const slidesData = slides.map(slide => ({
        id: slide.id,
        slideNumber: slide.slideNumber,
        title: slide.title,
        files: slideContents[slide.id] || [],
        quizQuestions: (quizQuestions[slide.id] || []).map(q => ({
          id: q.id,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          questionType: q.questionType
        }))
      }));

      // Prepare assignments data
      const assignmentsData = assignments.map(a => ({
        id: a.id,
        slideId: a.slideId,
        courseId: a.courseId,
        title: a.title,
        description: a.description,
        dueDate: a.dueDate,
        totalMarks: a.totalMarks,
        passingMarks: a.passingMarks,
        file: a.file,
        status: a.status
      }));

      const updateData = {
        course: {
          title: editedDetails.title,
          description: editedDetails.description,
          category: editedDetails.category,
          status: editedDetails.status,
          duration: editedDetails.duration,
          level: editedDetails.level,
          price: editedDetails.price
        },
        slides: slidesData,
        assignments: assignmentsData
      };

      console.log('📤 Sending update data:', JSON.stringify(updateData, null, 2));

      const response = await fetch(`/api/instructors/course/${courseId}/full-update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save course');
      }

      if (result.success) {
        showSuccess('✅ Course updated successfully!');
        await fetchCourseFromAPI(); // Refresh data
      }
    } catch (error: any) {
      console.error('Error saving course:', error);
      showError(error.message || 'Failed to save course');
    } finally {
      setSaving(false);
    }
  };

  // ============ SLIDE FUNCTIONS ============
  
  const handleAddSlide = async () => {
    setAddingSlide(true);
    setError(null);

    try {
      const newSlideNumber = slides.length + 1;
      const newSlideTitle = `Slide ${newSlideNumber}`;

      console.log('📤 Adding new slide:', { courseId, slideNumber: newSlideNumber, title: newSlideTitle });

      const response = await fetch('/api/instructors/slides/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: courseId,
          slideNumber: newSlideNumber,
          title: newSlideTitle
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add slide');
      }

      if (result.success) {
        setSlides(prev => [...prev, result.data]);
        setSelectedSlideId(result.data.id);
        showSuccess('✅ Slide added successfully!');
      }
    } catch (error: any) {
      console.error('❌ Error adding slide:', error);
      showError(error.message || 'Failed to add slide');
    } finally {
      setAddingSlide(false);
    }
  };

  const handleEditSlideTitle = async (slideId: string, newTitle: string) => {
    if (!newTitle.trim()) {
      showError('Slide title cannot be empty');
      return;
    }

    const previousSlides = [...slides];
    const updatedSlides = slides.map(slide => 
      slide.id === slideId ? { ...slide, title: newTitle, updatedAt: new Date().toISOString() } : slide
    );
    setSlides(updatedSlides);
    setUpdatingSlide(slideId);

    try {
      const response = await fetch(`/api/instructors/slides/update/${slideId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update slide');
      }

      if (result.success) {
        showSuccess('✅ Slide title updated!');
      }
    } catch (error: any) {
      setSlides(previousSlides);
      showError(error.message || 'Failed to update slide');
    } finally {
      setUpdatingSlide(null);
      setEditingSlideId(null);
      setEditingSlideTitle('');
    }
  };

  const handleRemoveSlide = async (slideId: string) => {
    if (!confirm('Are you sure you want to delete this slide? All content, quizzes, and assignments will be permanently removed.')) {
      return;
    }
    
    setDeletingSlide(slideId);
    setError(null);

    try {
      const response = await fetch(`/api/instructors/course/${courseId}/slides/${slideId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete slide');
      }

      if (result.success) {
        const updatedSlides = slides.filter(s => s.id !== slideId);
        
        const reorderedSlides = updatedSlides.map((slide, index) => ({
          ...slide,
          slideNumber: index + 1,
          title: `Slide ${index + 1}`,
          updatedAt: new Date().toISOString()
        }));
        
        setSlides(reorderedSlides);
        
        if (selectedSlideId === slideId) {
          setSelectedSlideId(reorderedSlides[0]?.id || '');
        }
        
        // Remove associated content
        const newContents = { ...slideContents };
        delete newContents[slideId];
        setSlideContents(newContents);
        
        const newQuizQuestions = { ...quizQuestions };
        delete newQuizQuestions[slideId];
        setQuizQuestions(newQuizQuestions);
        
        setAssignments(assignments.filter(a => a.slideId !== slideId));
        
        showSuccess('✅ Slide deleted successfully!');
      }
    } catch (error: any) {
      console.error('Error deleting slide:', error);
      showError(error.message || 'Failed to delete slide');
    } finally {
      setDeletingSlide(null);
    }
  };

  const handleStartEditSlide = (slideId: string, currentTitle: string) => {
    setEditingSlideId(slideId);
    setEditingSlideTitle(currentTitle);
  };

  const handleCancelEditSlide = () => {
    setEditingSlideId(null);
    setEditingSlideTitle('');
  };

  // ============ DIRECT CLOUDINARY UPLOAD (NO BACKEND) ============
  const uploadToCloudinaryDirect = async (file: File, slideId: string): Promise<{ secure_url: string; public_id: string }> => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      
      // Add folder structure for better organization
      const folder = `lms/courses/${courseId}/slides/${slideId}`;
      formData.append('folder', folder);

      // Determine resource type based on file MIME type
      const resourceType = file.type.startsWith('video/') ? 'video' : 
                          file.type.startsWith('image/') ? 'image' : 'raw';
      
      // Cloudinary upload URL - DIRECT browser to Cloudinary
      const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(prev => ({
            ...prev,
            [`${slideId}_${file.name}`]: progress
          }));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            // Clear progress for this file
            setUploadProgress(prev => {
              const newProgress = { ...prev };
              delete newProgress[`${slideId}_${file.name}`];
              return newProgress;
            });
            resolve({
              secure_url: response.secure_url,
              public_id: response.public_id
            });
          } catch (error) {
            reject(new Error('Failed to parse Cloudinary response'));
          }
        } else {
          let errorMessage = `Upload failed`;
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            errorMessage = errorResponse.error?.message || errorMessage;
          } catch (e) {}
          reject(new Error(errorMessage));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error. Please check your connection.'));
      });

      xhr.addEventListener('timeout', () => {
        reject(new Error('Upload timeout. File may be too large.'));
      });

      // Set timeout based on file size (30 seconds per MB, minimum 5 minutes)
      const timeout = Math.max(300000, Math.ceil(file.size / (1024 * 1024)) * 30000);
      xhr.timeout = timeout;

      xhr.open('POST', url);
      xhr.send(formData);
    });
  };

  // ============ FILE UPLOAD FUNCTIONS - UPDATED ============
  const handleFileUpload = async (slideId: string, files: FileList | null) => {
    if (!files || !courseId) return;
    
    setUploading(prev => ({ ...prev, [slideId]: true }));
    
    try {
      const uploadedFiles = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        try {
          // Direct upload to Cloudinary (NO BACKEND)
          const result = await uploadToCloudinaryDirect(file, slideId);
          
          uploadedFiles.push({
            id: generateId('file'),
            name: file.name,
            type: file.type,
            size: file.size,
            url: result.secure_url,
            publicId: result.public_id,
            uploadedAt: new Date().toISOString()
          });
        } catch (error: any) {
          console.error(`Failed to upload ${file.name}:`, error);
          showError(`Failed to upload ${file.name}: ${error.message}`);
        }
      }
      
      if (uploadedFiles.length > 0) {
        const currentFiles = slideContents[slideId] || [];
        const updatedFiles = [...currentFiles, ...uploadedFiles];
        
        setSlideContents({
          ...slideContents,
          [slideId]: updatedFiles
        });
        
        showSuccess(`${uploadedFiles.length} file(s) uploaded successfully!`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      showError('Failed to upload files. Please try again.');
    } finally {
      setUploading(prev => ({ ...prev, [slideId]: false }));
    }
  };

  const handleRemoveFile = (slideId: string, filePublicId: string) => {
    const currentFiles = slideContents[slideId] || [];
    const updatedFiles = currentFiles.filter(f => f.publicId !== filePublicId);
    
    if (updatedFiles.length > 0) {
      setSlideContents({
        ...slideContents,
        [slideId]: updatedFiles
      });
    } else {
      const newContents = { ...slideContents };
      delete newContents[slideId];
      setSlideContents(newContents);
    }
    
    showSuccess('File removed successfully!');
  };

  // ============ UPDATED QUIZ FUNCTIONS ============
  
  const handleQuestionTypeChange = (type: QuestionType) => {
    setCurrentQuizQuestion({
      question: currentQuizQuestion.question,
      options: type === QuestionType.MCQ ? ['', '', '', ''] : [],
      correctAnswer: type === QuestionType.MCQ ? 0 : -1,
      questionType: type
    });
  };

  const handleAddQuestion = (slideId: string) => {
    if (!currentQuizQuestion.question.trim()) {
      showError('Please enter a question');
      return;
    }

    if (currentQuizQuestion.questionType === QuestionType.MCQ) {
      if (currentQuizQuestion.options.some(opt => !opt.trim())) {
        showError('Please fill all options for MCQ');
        return;
      }
    }
    
    const newQuestion: QuizQuestion = {
      id: generateId('q'),
      slideId: slideId,
      courseId: courseId,
      question: currentQuizQuestion.question,
      options: currentQuizQuestion.questionType === QuestionType.MCQ 
        ? [...currentQuizQuestion.options] 
        : [],
      correctAnswer: currentQuizQuestion.questionType === QuestionType.MCQ 
        ? currentQuizQuestion.correctAnswer 
        : -1,
      questionType: currentQuizQuestion.questionType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const currentQuestions = quizQuestions[slideId] || [];
    const updatedQuestions = [...currentQuestions, newQuestion];
    
    setQuizQuestions({
      ...quizQuestions,
      [slideId]: updatedQuestions
    });
    
    setCurrentQuizQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      questionType: QuestionType.MCQ
    });
    
    showSuccess('Question added successfully!');
  };

  const handleRemoveQuestion = (slideId: string, questionId: string) => {
    const currentQuestions = quizQuestions[slideId] || [];
    const updatedQuestions = currentQuestions.filter(q => q.id !== questionId);
    
    if (updatedQuestions.length > 0) {
      setQuizQuestions({
        ...quizQuestions,
        [slideId]: updatedQuestions
      });
    } else {
      const newQuestions = { ...quizQuestions };
      delete newQuestions[slideId];
      setQuizQuestions(newQuestions);
    }
    
    showSuccess('Question removed successfully!');
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...currentQuizQuestion.options];
    newOptions[index] = value;
    setCurrentQuizQuestion({
      ...currentQuizQuestion,
      options: newOptions
    });
  };

  // ============ ASSIGNMENT FUNCTIONS - UPDATED WITH DIRECT UPLOAD ============
  
  const handleAssignmentFileUpload = async (file: File) => {
    if (!file) return;

    setUploadingAssignment(true);

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
      
      showSuccess('Assignment file uploaded successfully!');
    } catch (error) {
      console.error('Assignment file upload error:', error);
      showError('Failed to upload assignment file. Please try again.');
    } finally {
      setUploadingAssignment(false);
    }
  };

  const handleSaveAssignment = async () => {
    if (!selectedAssignmentSlide && !editingAssignment) {
      showError('Please select a slide first');
      return;
    }

    if (!currentAssignment.title?.trim()) {
      showError('Please enter assignment title');
      return;
    }

    if (!currentAssignment.description?.trim()) {
      showError('Please enter assignment description');
      return;
    }

    if (!currentAssignment.dueDate) {
      showError('Please select due date');
      return;
    }

    if (!currentAssignment.totalMarks || currentAssignment.totalMarks <= 0) {
      showError('Please enter valid total marks');
      return;
    }

    if (!currentAssignment.passingMarks || currentAssignment.passingMarks <= 0) {
      showError('Please enter valid passing marks');
      return;
    }

    setSubmittingAssignment(true);
    setError(null);

    try {
      const assignmentData = {
        slideId: selectedAssignmentSlide,
        courseId: courseId,
        title: currentAssignment.title.trim(),
        description: currentAssignment.description.trim(),
        dueDate: currentAssignment.dueDate,
        totalMarks: currentAssignment.totalMarks,
        passingMarks: currentAssignment.passingMarks,
        file: assignmentFile || null,
        status: currentAssignment.status
      };

      let response;
      let result: { error: any; success: any; data: Assignment };

      if (editingAssignment) {
        response = await fetch(`/api/instructors/assignment/update/${editingAssignment}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(assignmentData)
        });
        result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to update assignment');
        }

        if (result.success) {
          const updatedAssignments = assignments.map(a => 
            a.id === editingAssignment ? result.data : a
          );
          setAssignments(updatedAssignments);
          showSuccess('✅ Assignment updated successfully!');
        }
      } else {
        response = await fetch('/api/instructors/assignment/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(assignmentData)
        });
        result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to add assignment');
        }

        if (result.success) {
          setAssignments([...assignments, result.data]);
          showSuccess('✅ Assignment added successfully!');
        }
      }

      resetAssignmentForm();
      
    } catch (error: any) {
      console.error('Error saving assignment:', error);
      showError(error.message || 'Failed to save assignment');
    } finally {
      setSubmittingAssignment(false);
    }
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setEditingAssignment(assignment.id);
    setSelectedAssignmentSlide(assignment.slideId);
    setCurrentAssignment({
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate,
      totalMarks: assignment.totalMarks,
      passingMarks: assignment.passingMarks,
      status: assignment.status
    });
    if (assignment.file) {
      setAssignmentFile(assignment.file);
    }
    setShowAssignmentForm(true);
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) {
      return;
    }

    setDeletingAssignment(assignmentId);
    setError(null);

    try {
      const response = await fetch(`/api/instructors/assignment/delete/${assignmentId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete assignment');
      }

      if (result.success) {
        setAssignments(assignments.filter(a => a.id !== assignmentId));
        showSuccess('✅ Assignment deleted successfully!');
      }
    } catch (error: any) {
      console.error('Error deleting assignment:', error);
      showError(error.message || 'Failed to delete assignment');
    } finally {
      setDeletingAssignment(null);
    }
  };

  const openAssignmentFormForSlide = (slideId: string) => {
    setSelectedAssignmentSlide(slideId);
    setEditingAssignment(null);
    setCurrentAssignment({
      title: '',
      description: '',
      dueDate: '',
      totalMarks: 100,
      passingMarks: 70,
      status: 'draft'
    });
    setAssignmentFile(null);
    setShowAssignmentForm(true);
  };

  const resetAssignmentForm = () => {
    setCurrentAssignment({
      title: '',
      description: '',
      dueDate: '',
      totalMarks: 100,
      passingMarks: 70,
      status: 'draft'
    });
    setAssignmentFile(null);
    setShowAssignmentForm(false);
    setSelectedAssignmentSlide('');
    setEditingAssignment(null);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('video')) return <FileVideo className="w-5 h-5 text-blue-500" />;
    if (fileType.includes('image')) return <FileImage className="w-5 h-5 text-green-500" />;
    if (fileType.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    if (fileType.includes('word') || fileType.includes('document')) return <FileText className="w-5 h-5 text-blue-700" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

  // Check if Cloudinary is configured
  if (!CLOUDINARY_CLOUD_NAME) {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-6 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-700 text-center mb-2">Configuration Error</h2>
          <p className="text-red-600 text-center">
            NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME environment variable is not set.
          </p>
        </div>
      </div>
    );
  }

  if (!isMounted || loading) {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
              <p className="text-sm text-darkGrey">Loading course data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!courseDetails) {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-3" style={{ color: BRAND_COLORS.softGrey }} />
          <h3 className="text-lg font-medium mb-2">Course Not Found</h3>
          <Link href="/lms/Instructor_Portal/courses" className="text-darkRoyalBlue hover:underline">
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const isSystemCourse = courseDetails.instructorId === 'system';

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6">
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 animate-slideIn">
          <div className="bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm font-medium text-green-800">{successMessage}</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="fixed top-4 right-4 z-50 animate-slideIn">
          <div className="bg-red-50 border border-red-200 rounded-lg shadow-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="bg-lightGrey rounded-xl p-4 sm:p-6 border border-softGrey">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/lms/Instructor_Portal/courses" className="p-2 text-darkGrey hover:text-darkRoyalBlue hover:bg-white rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                {isSystemCourse ? 'View Course' : 'Edit Course'}
              </h1>
              <p className="text-darkGrey text-sm mt-1">{courseDetails.title}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={fetchCourseFromAPI} className="p-2 text-darkGrey hover:text-darkRoyalBlue hover:bg-white rounded-lg transition-colors" title="Refresh">
                <RefreshCw className="w-5 h-5" />
              </button>
              {isSystemCourse && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  System Course
                </span>
              )}
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                courseDetails.status === 'published' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {courseDetails.status === 'published' ? 'Published' : 'Draft'}
              </span>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b border-softGrey overflow-x-auto pb-1">
            <button onClick={() => setActiveTab('details')} className={`px-4 py-2 text-sm font-medium transition-colors relative whitespace-nowrap ${
              activeTab === 'details' ? 'text-deepRed' : 'text-darkGrey/60 hover:text-darkGrey'
            }`}>
              Course Details
              {activeTab === 'details' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-deepRed" />}
            </button>
            <button onClick={() => setActiveTab('slides')} className={`px-4 py-2 text-sm font-medium transition-colors relative whitespace-nowrap ${
              activeTab === 'slides' ? 'text-deepRed' : 'text-darkGrey/60 hover:text-darkGrey'
            }`}>
              Slides ({slides.length})
              {activeTab === 'slides' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-deepRed" />}
            </button>
            <button 
              onClick={() => setActiveTab('content')} 
              className={`px-4 py-2 text-sm font-medium transition-colors relative whitespace-nowrap ${
                activeTab === 'content' ? 'text-deepRed' : 'text-darkGrey/60 hover:text-darkGrey'
              } ${slides.length === 0 ? 'opacity-50 pointer-events-none' : ''}`} 
              disabled={slides.length === 0}
            >
              Content & Quizzes
              {activeTab === 'content' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-deepRed" />}
            </button>
            <button onClick={() => setActiveTab('assignments')} className={`px-4 py-2 text-sm font-medium transition-colors relative whitespace-nowrap ${
              activeTab === 'assignments' ? 'text-deepRed' : 'text-darkGrey/60 hover:text-darkGrey'
            }`}>
              Assignments ({assignments.length})
              {activeTab === 'assignments' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-deepRed" />}
            </button>
          </div>

          {/* Global Save Button */}
          {!isSystemCourse && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleSaveAll}
                disabled={saving}
                className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving All Changes...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save All Changes
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto">
        {/* Tab 1: Course Details */}
        {activeTab === 'details' && (
          <div className="bg-white rounded-lg border border-softGrey p-6">
            <h2 className="text-lg font-semibold mb-6" style={{ color: BRAND_COLORS.darkNavy }}>
              Course Details
            </h2>

            {isSystemCourse ? (
              <div className="space-y-5 max-w-3xl">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800">System Course - Read Only</h4>
                      <p className="text-sm text-blue-600 mt-1">
                        This is a system course. You can add slides, upload materials, create quizzes, and manage assignments.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-darkGrey mb-2">Course Name</label>
                    <p className="px-4 py-2.5 bg-lightGrey rounded-lg text-darkGrey">{courseDetails.title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-darkGrey mb-2">Category</label>
                    <p className="px-4 py-2.5 bg-lightGrey rounded-lg text-darkGrey">{courseDetails.category}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-darkGrey mb-2">Description</label>
                  <p className="px-4 py-2.5 bg-lightGrey rounded-lg text-darkGrey">{courseDetails.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-darkGrey mb-2">Duration</label>
                    <p className="px-4 py-2.5 bg-lightGrey rounded-lg text-darkGrey">
                      {courseDetails.duration || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-darkGrey mb-2">Level</label>
                    <p className="px-4 py-2.5 bg-lightGrey rounded-lg text-darkGrey">
                      {courseDetails.level || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-darkGrey mb-2">Price</label>
                    <p className="px-4 py-2.5 bg-lightGrey rounded-lg text-darkGrey">
                      {courseDetails.price ? `PKR ${courseDetails.price.toLocaleString()}` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-5 max-w-3xl">
                <div>
                  <label className="block text-sm font-medium text-darkGrey mb-2">Course Name</label>
                  <input
                    type="text"
                    value={editedDetails.title || ''}
                    onChange={(e) => setEditedDetails({ ...editedDetails, title: e.target.value })}
                    className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue"
                    placeholder="Enter course name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-darkGrey mb-2">Description</label>
                  <textarea
                    value={editedDetails.description || ''}
                    onChange={(e) =>
                      setEditedDetails({ ...editedDetails, description: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue"
                    placeholder="Enter course description"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-darkGrey mb-2">Duration</label>
                    <input
                      type="text"
                      value={editedDetails.duration || ''}
                      onChange={(e) =>
                        setEditedDetails({ ...editedDetails, duration: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue"
                      placeholder="e.g., 8 Weeks"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-darkGrey mb-2">Level</label>
                    <select
                      value={editedDetails.level || ''}
                      onChange={(e) => setEditedDetails({ ...editedDetails, level: e.target.value })}
                      className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue bg-white"
                    >
                      <option value="">Select Level</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="All Levels">All Levels</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-darkGrey mb-2">Price (PKR)</label>
                    <input
                      type="number"
                      value={editedDetails.price || ''}
                      onChange={(e) =>
                        setEditedDetails({ ...editedDetails, price: parseFloat(e.target.value) })
                      }
                      className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue"
                      placeholder="e.g., 25000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-darkGrey mb-2">Category</label>
                  <select
                    value={editedDetails.category || ''}
                    onChange={(e) => setEditedDetails({ ...editedDetails, category: e.target.value })}
                    className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue bg-white"
                  >
                    <option value="">Select Category</option>
                    <option value="Technical Training">Technical Training</option>
                    <option value="Safety Training">Safety Training</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Mobile Development">Mobile Development</option>
                    <option value="Data Science">Data Science</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-darkGrey mb-2">Status</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        checked={editedDetails.status === 'draft'}
                        onChange={() => setEditedDetails({ ...editedDetails, status: 'draft' })}
                        className="w-4 h-4 text-deepRed"
                      />
                      <span className="text-sm">Draft</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        checked={editedDetails.status === 'published'}
                        onChange={() => setEditedDetails({ ...editedDetails, status: 'published' })}
                        className="w-4 h-4 text-deepRed"
                      />
                      <span className="text-sm">Published</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Slides Management */}
        {activeTab === 'slides' && !isSystemCourse && (
          <div className="bg-white rounded-lg border border-softGrey p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold" style={{ color: BRAND_COLORS.darkNavy }}>Manage Slides</h2>
              <button 
                onClick={handleAddSlide} 
                disabled={addingSlide}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                style={{ backgroundColor: BRAND_COLORS.darkRoyalBlue, color: BRAND_COLORS.white }}
              >
                {addingSlide ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add New Slide
                  </>
                )}
              </button>
            </div>

            {slides.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-softGrey rounded-lg">
                <BookOpen className="w-12 h-12 mx-auto mb-3" style={{ color: BRAND_COLORS.softGrey }} />
                <h3 className="text-base font-medium mb-2">No Slides Yet</h3>
                <p className="text-darkGrey/70 mb-4 text-sm">Start by adding your first slide</p>
                <button 
                  onClick={handleAddSlide} 
                  disabled={addingSlide}
                  className="px-4 py-2 bg-darkRoyalBlue text-white rounded-lg text-sm font-medium inline-flex items-center gap-2 disabled:opacity-50"
                >
                  {addingSlide ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Create First Slide
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {slides.map((slide) => {
                  const slideAssignmentCount = assignments.filter(a => a.slideId === slide.id).length;
                  const slideQuizCount = quizQuestions[slide.id]?.length || 0;
                  const isUpdating = updatingSlide === slide.id;
                  const isEditing = editingSlideId === slide.id;
                  
                  return (
                    <div key={slide.id} className="flex items-center gap-3 p-3 border border-softGrey rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-lightGrey flex items-center justify-center text-sm font-medium">
                        {slide.slideNumber}
                      </div>
                      <div className="flex-1">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input 
                              type="text" 
                              value={editingSlideTitle} 
                              onChange={(e) => setEditingSlideTitle(e.target.value)}
                              className="font-medium text-darkGrey border border-darkRoyalBlue rounded-lg px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-darkRoyalBlue/20" 
                              autoFocus
                            />
                            <button
                              onClick={() => handleEditSlideTitle(slide.id, editingSlideTitle)}
                              className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors"
                              disabled={isUpdating}
                            >
                              {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
                            </button>
                            <button
                              onClick={handleCancelEditSlide}
                              className="px-3 py-1 bg-gray-500 text-white rounded-lg text-xs font-medium hover:bg-gray-600 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-darkGrey">{slide.title}</span>
                            <button
                              onClick={() => handleStartEditSlide(slide.id, slide.title)}
                              className="p-1 text-darkRoyalBlue hover:bg-darkRoyalBlue/5 rounded-lg transition-colors"
                              title="Edit slide title"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        
                        {isUpdating && !isEditing && (
                          <span className="text-xs text-blue-600 ml-2">Updating...</span>
                        )}
                        
                        <p className="text-xs text-darkGrey/60 mt-1">
                          {slideContents[slide.id]?.length || 0} files • 
                          {slideQuizCount} questions • 
                          {slideAssignmentCount} assignments
                        </p>
                      </div>
                      <button 
                        onClick={() => handleRemoveSlide(slide.id)}
                        disabled={deletingSlide === slide.id || isUpdating}
                        className="p-2 text-brightRed hover:bg-brightRed/5 rounded-lg disabled:opacity-50"
                      >
                        {deletingSlide === slide.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Content & Quizzes - UPDATED WITH DIRECT UPLOAD */}
        {activeTab === 'content' && !isSystemCourse && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Slide List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-softGrey p-4">
                <h3 className="font-medium text-darkGrey mb-3">Slides</h3>
                <div className="space-y-2">
                  {slides.map((slide) => {
                    const slideAssignmentCount = assignments.filter(a => a.slideId === slide.id).length;
                    const slideQuizCount = quizQuestions[slide.id]?.length || 0;
                    
                    return (
                      <button 
                        key={slide.id} 
                        onClick={() => setSelectedSlideId(slide.id)} 
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedSlideId === slide.id ? 'bg-lightGrey border-l-4' : 'hover:bg-lightGrey/50'
                        }`} 
                        style={{ borderLeftColor: selectedSlideId === slide.id ? BRAND_COLORS.deepRed : 'transparent' }}
                      >
                        <p className="font-medium text-sm text-darkGrey">{slide.title}</p>
                        <p className="text-xs text-darkGrey/60 mt-1">
                          {slideContents[slide.id]?.length || 0} files • 
                          {slideQuizCount} questions • 
                          {slideAssignmentCount} assignments
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3">
              {selectedSlideId ? (
                <div className="space-y-6">
                  {/* Educational Content - UPDATED WITH PROGRESS */}
                  <div className="bg-white rounded-lg border border-softGrey p-6">
                    <h3 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>Educational Content</h3>
                    
                    <div className="mb-6">
                      <div className="border-2 border-dashed border-softGrey rounded-lg p-6 text-center">
                        <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: BRAND_COLORS.softGrey }} />
                        <p className="text-sm text-darkGrey/70 mb-2">
                          Drag & drop files or click to upload
                        </p>
                        <p className="text-xs text-darkGrey/50 mb-4">
                          Supports: MP4, PDF, DOC/DOCX, JPG, PNG (Videos up to 100MB+)
                        </p>
                        <label className="inline-block cursor-pointer">
                          <input 
                            type="file" 
                            multiple 
                            accept=".pdf,.doc,.docx,.mp4,.mov,.avi,.wmv,.flv,.mkv,.webm,.jpg,.jpeg,.png" 
                            onChange={(e) => handleFileUpload(selectedSlideId, e.target.files)} 
                            className="hidden" 
                            disabled={uploading[selectedSlideId]} 
                          />
                          <span
                            className={`px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2 ${
                              uploading[selectedSlideId] ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                            style={{ backgroundColor: BRAND_COLORS.darkRoyalBlue, color: BRAND_COLORS.white }}
                          >
                            {uploading[selectedSlideId] ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              'Browse Files'
                            )}
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Upload Progress */}
                    {Object.keys(uploadProgress).length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-darkGrey mb-2">Upload Progress</h4>
                        <div className="space-y-2">
                          {Object.entries(uploadProgress).map(([key, progress]) => {
                            const fileName = key.split('_').slice(1).join('_');
                            return (
                              <div key={key} className="bg-lightGrey rounded-lg p-3">
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-darkGrey truncate max-w-[200px]">{fileName}</span>
                                  <span className="text-darkRoyalBlue font-medium">{progress}%</span>
                                </div>
                                <div className="w-full bg-softGrey rounded-full h-2">
                                  <div 
                                    className="h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%`, backgroundColor: BRAND_COLORS.darkRoyalBlue }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Uploaded Files */}
                    {slideContents[selectedSlideId]?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-darkGrey mb-3">Uploaded Files</h4>
                        <div className="space-y-2">
                          {slideContents[selectedSlideId].map((file) => (
                            <div key={file.id} className="flex items-center justify-between p-3 bg-lightGrey rounded-lg">
                              <div className="flex items-center gap-3 flex-1">
                                {getFileIcon(file.type)}
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium text-darkGrey">{file.name}</p>
                                    {file.type.includes('video') && (
                                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full flex items-center gap-1">
                                        <Film className="w-3 h-3" />
                                        Video
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-darkGrey/60">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB • {new Date(file.uploadedAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {file.type.includes('video') && (
                                  <a 
                                    href={file.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="p-1 text-darkRoyalBlue hover:bg-darkRoyalBlue/5 rounded"
                                  >
                                    <Video className="w-4 h-4" />
                                  </a>
                                )}
                                <button 
                                  onClick={() => handleRemoveFile(selectedSlideId, file.publicId)} 
                                  className="p-1 text-brightRed hover:bg-brightRed/5 rounded"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quiz Content */}
                  <div className="bg-white rounded-lg border border-softGrey p-6">
                    <h3 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>Quiz Questions</h3>

                    {/* Add Question Form */}
                    <div className="bg-lightGrey rounded-lg p-4 mb-6">
                      <h4 className="font-medium text-darkGrey mb-3">Add New Question</h4>
                      
                      <div className="space-y-4">
                        {/* Question Type Selector */}
                        <div>
                          <label className="block text-xs font-medium text-darkGrey/70 mb-1">Question Type</label>
                          <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="radio" 
                                name="questionType" 
                                checked={currentQuizQuestion.questionType === QuestionType.MCQ} 
                                onChange={() => handleQuestionTypeChange(QuestionType.MCQ)}
                                className="w-4 h-4 text-darkRoyalBlue" 
                              />
                              <span className="text-sm text-darkGrey">Multiple Choice</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="radio" 
                                name="questionType" 
                                checked={currentQuizQuestion.questionType === QuestionType.TEXT} 
                                onChange={() => handleQuestionTypeChange(QuestionType.TEXT)}
                                className="w-4 h-4 text-darkRoyalBlue" 
                              />
                              <span className="text-sm text-darkGrey">Text Answer</span>
                            </label>
                          </div>
                        </div>

                        {/* Question Input */}
                        <div>
                          <label className="block text-xs font-medium text-darkGrey/70 mb-1">Question</label>
                          <textarea
                            value={currentQuizQuestion.question}
                            onChange={(e) => setCurrentQuizQuestion({ ...currentQuizQuestion, question: e.target.value })}
                            rows={2}
                            className="w-full px-3 py-2 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue text-sm"
                            placeholder="Enter your question here..."
                          />
                        </div>

                        {/* MCQ Options */}
                        {currentQuizQuestion.questionType === QuestionType.MCQ && (
                          <>
                            <div>
                              <label className="block text-xs font-medium text-darkGrey/70 mb-1">Options</label>
                              <div className="space-y-2">
                                {currentQuizQuestion.options.map((option, index) => (
                                  <div key={index} className="flex items-center gap-2">
                                    <span className="w-6 text-sm font-medium text-darkGrey/70">
                                      {String.fromCharCode(65 + index)}.
                                    </span>
                                    <input 
                                      type="text" 
                                      value={option} 
                                      onChange={(e) => handleOptionChange(index, e.target.value)}
                                      className="flex-1 px-3 py-2 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue text-sm" 
                                      placeholder={`Option ${index + 1}`} 
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-darkGrey/70 mb-1">Correct Answer</label>
                              <select
                                value={currentQuizQuestion.correctAnswer}
                                onChange={(e) => setCurrentQuizQuestion({ ...currentQuizQuestion, correctAnswer: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue text-sm bg-white"
                              >
                                {currentQuizQuestion.options.map((_, index) => (
                                  <option key={index} value={index}>
                                    Option {String.fromCharCode(65 + index)}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </>
                        )}

                        {/* Text Answer Info */}
                        {currentQuizQuestion.questionType === QuestionType.TEXT && (
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-xs text-blue-700">
                              <span className="font-medium">Text Answer Question:</span> Students will write their answer in a text box. No options needed.
                            </p>
                          </div>
                        )}

                        <button 
                          onClick={() => handleAddQuestion(selectedSlideId)} 
                          className="px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-colors"
                          style={{ backgroundColor: BRAND_COLORS.darkRoyalBlue }}
                        >
                          Add Question
                        </button>
                      </div>
                    </div>

                    {/* Questions List */}
                    {quizQuestions[selectedSlideId] && quizQuestions[selectedSlideId].length > 0 && (
                      <div>
                        <h4 className="font-medium text-darkGrey mb-3">
                          Questions ({quizQuestions[selectedSlideId].length})
                        </h4>
                        <div className="space-y-3">
                          {quizQuestions[selectedSlideId].map((q, qIndex) => (
                            <div key={q.id} className="border border-softGrey rounded-lg p-3">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                      q.questionType === QuestionType.MCQ 
                                        ? 'bg-blue-100 text-blue-700' 
                                        : 'bg-green-100 text-green-700'
                                    }`}>
                                      {q.questionType === QuestionType.MCQ ? 'MCQ' : 'Text Answer'}
                                    </span>
                                    <p className="font-medium text-sm text-darkGrey">Q{qIndex + 1}: {q.question}</p>
                                  </div>
                                </div>
                                <button 
                                  onClick={() => handleRemoveQuestion(selectedSlideId, q.id)} 
                                  className="p-1 text-brightRed hover:bg-brightRed/5 rounded ml-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              
                              {q.questionType === QuestionType.MCQ ? (
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                  {q.options.map((opt, optIndex) => (
                                    <div key={optIndex} className="flex items-center gap-2">
                                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                        optIndex === q.correctAnswer ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                      }`}>
                                        {String.fromCharCode(65 + optIndex)}
                                      </span>
                                      <span className="text-xs text-darkGrey/70">{opt}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="mt-2 p-2 bg-lightGrey rounded-lg">
                                  <p className="text-xs text-darkGrey/70">Text answer question - students will write response</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Assignments for this Slide */}
                  <div className="bg-white rounded-lg border border-softGrey p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold" style={{ color: BRAND_COLORS.darkNavy }}>Assignments for this Slide</h3>
                      <button 
                        onClick={() => openAssignmentFormForSlide(selectedSlideId)} 
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        style={{ backgroundColor: BRAND_COLORS.darkRoyalBlue, color: BRAND_COLORS.white }}
                      >
                        <Plus className="w-4 h-4" />
                        Add Assignment
                      </button>
                    </div>

                    {/* Assignment Form */}
                    {showAssignmentForm && selectedAssignmentSlide === selectedSlideId && (
                      <div className="bg-lightGrey rounded-lg p-4 mb-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-darkGrey">{editingAssignment ? 'Edit Assignment' : 'New Assignment'}</h4>
                          <button onClick={resetAssignmentForm} className="p-1 text-darkGrey/60 hover:text-darkGrey">
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-darkGrey mb-2">
                              Assignment Title <span className="text-deepRed">*</span>
                            </label>
                            <input 
                              type="text" 
                              value={currentAssignment.title} 
                              onChange={(e) => setCurrentAssignment({ ...currentAssignment, title: e.target.value })} 
                              className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue bg-white" 
                              placeholder="e.g., Final Project Submission" 
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-darkGrey mb-2">
                              Description <span className="text-deepRed">*</span>
                            </label>
                            <textarea 
                              value={currentAssignment.description} 
                              onChange={(e) => setCurrentAssignment({ ...currentAssignment, description: e.target.value })} 
                              rows={4} 
                              className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue bg-white" 
                              placeholder="Describe the assignment requirements..." 
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-darkGrey mb-2">
                              Due Date <span className="text-deepRed">*</span>
                            </label>
                            <input 
                              type="datetime-local" 
                              value={currentAssignment.dueDate} 
                              onChange={(e) => setCurrentAssignment({ ...currentAssignment, dueDate: e.target.value })} 
                              className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue bg-white" 
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-darkGrey mb-2">
                                Total Marks <span className="text-deepRed">*</span>
                              </label>
                              <input 
                                type="number" 
                                min="1" 
                                value={currentAssignment.totalMarks} 
                                onChange={(e) => setCurrentAssignment({ ...currentAssignment, totalMarks: parseInt(e.target.value) })} 
                                className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue bg-white" 
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-darkGrey mb-2">
                                Passing Marks <span className="text-deepRed">*</span>
                              </label>
                              <input 
                                type="number" 
                                min="1" 
                                value={currentAssignment.passingMarks} 
                                onChange={(e) => setCurrentAssignment({ ...currentAssignment, passingMarks: parseInt(e.target.value) })} 
                                className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue bg-white" 
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-darkGrey mb-2">
                              Assignment File (Optional)
                            </label>
                            <div className="border-2 border-dashed border-softGrey rounded-lg p-4 text-center bg-white">
                              {assignmentFile ? (
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    {getFileIcon(assignmentFile.type)}
                                    <div className="text-left">
                                      <p className="text-sm font-medium text-darkGrey">{assignmentFile.name}</p>
                                      <p className="text-xs text-darkGrey/60">{(assignmentFile.size / 1024).toFixed(2)} KB</p>
                                    </div>
                                  </div>
                                  <button onClick={() => setAssignmentFile(null)} className="p-1 text-brightRed hover:bg-brightRed/5 rounded">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: BRAND_COLORS.softGrey }} />
                                  <p className="text-sm text-darkGrey/70 mb-2">Upload assignment instructions or template</p>
                                  <label className="inline-block relative">
                                    <input 
                                      type="file" 
                                      accept=".pdf,.doc,.docx,.txt" 
                                      onChange={(e) => { if (e.target.files && e.target.files[0]) { handleAssignmentFileUpload(e.target.files[0]); } }} 
                                      className="hidden" 
                                      disabled={uploadingAssignment} 
                                    />
                                    <span 
                                      className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors inline-flex items-center gap-2 ${
                                        uploadingAssignment ? 'opacity-50 cursor-not-allowed' : ''
                                      }`}
                                      style={{ backgroundColor: BRAND_COLORS.darkRoyalBlue, color: BRAND_COLORS.white }}
                                    >
                                      {uploadingAssignment ? (
                                        <>
                                          <Loader2 className="w-4 h-4 animate-spin" />
                                          Uploading...
                                        </>
                                      ) : (
                                        'Browse Files'
                                      )}
                                    </span>
                                  </label>
                                </>
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-darkGrey mb-2">Status</label>
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2">
                                <input 
                                  type="radio" 
                                  name="assignmentStatus" 
                                  checked={currentAssignment.status === 'draft'} 
                                  onChange={() => setCurrentAssignment({ ...currentAssignment, status: 'draft' })} 
                                  className="w-4 h-4 text-deepRed" 
                                />
                                <span className="text-sm text-darkGrey">Draft</span>
                              </label>
                              <label className="flex items-center gap-2">
                                <input 
                                  type="radio" 
                                  name="assignmentStatus" 
                                  checked={currentAssignment.status === 'published'} 
                                  onChange={() => setCurrentAssignment({ ...currentAssignment, status: 'published' })} 
                                  className="w-4 h-4 text-deepRed" 
                                />
                                <span className="text-sm text-darkGrey">Published</span>
                              </label>
                            </div>
                          </div>

                          <div className="flex justify-end gap-3 pt-4">
                            <button onClick={resetAssignmentForm} className="px-4 py-2 border border-softGrey text-darkGrey rounded-lg text-sm font-medium hover:bg-lightGrey transition-colors">
                              Cancel
                            </button>
                            <button 
                              onClick={handleSaveAssignment} 
                              disabled={submittingAssignment}
                              className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
                              style={{ backgroundColor: BRAND_COLORS.deepRed }}
                            >
                              {submittingAssignment ? (
                                <span className="flex items-center gap-2">
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  {editingAssignment ? 'Updating...' : 'Saving...'}
                                </span>
                              ) : (
                                editingAssignment ? 'Update Assignment' : 'Save Assignment'
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Assignments List */}
                    {assignments.filter(a => a.slideId === selectedSlideId).length > 0 ? (
                      <div className="space-y-3">
                        {assignments.filter(a => a.slideId === selectedSlideId).map((assignment) => (
                          <div key={assignment.id} className="border border-softGrey rounded-lg p-4 hover:bg-lightGrey/50">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-medium text-darkGrey">{assignment.title}</h4>
                                <p className="text-sm text-darkGrey/70 mt-1">{assignment.description}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => handleEditAssignment(assignment)} 
                                  className="p-1 text-darkRoyalBlue hover:bg-darkRoyalBlue/5 rounded"
                                  title="Edit Assignment"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleRemoveAssignment(assignment.id)} 
                                  disabled={deletingAssignment === assignment.id}
                                  className="p-1 text-brightRed hover:bg-brightRed/5 rounded disabled:opacity-50"
                                  title="Delete Assignment"
                                >
                                  {deletingAssignment === assignment.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4 mt-3">
                              <div className="flex items-center gap-2 text-xs text-darkGrey/60">
                                <Calendar className="w-3 h-3" />
                                <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-darkGrey/60">
                                <Award className="w-3 h-3" />
                                <span>Total: {assignment.totalMarks} marks</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                <span className={`px-2 py-1 rounded-full ${
                                  assignment.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {assignment.status}
                                </span>
                              </div>
                            </div>

                            {assignment.file && (
                              <div className="mt-3 flex items-center gap-2 text-sm">
                                <FileText className="w-4 h-4 text-darkRoyalBlue" />
                                <a href={assignment.file.url} target="_blank" rel="noopener noreferrer" className="text-darkRoyalBlue hover:underline">
                                  {assignment.file.name}
                                </a>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      !showAssignmentForm && (
                        <div className="text-center py-8 border-2 border-dashed border-softGrey rounded-lg">
                          <BookOpen className="w-12 h-12 mx-auto mb-3" style={{ color: BRAND_COLORS.softGrey }} />
                          <p className="text-darkGrey/70 text-sm">No assignments for this slide yet</p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-softGrey p-12 text-center">
                  <HelpCircle className="w-12 h-12 mx-auto mb-3" style={{ color: BRAND_COLORS.softGrey }} />
                  <h3 className="text-base font-medium mb-2">Select a Slide</h3>
                  <p className="text-darkGrey/70 text-sm">Choose a slide from the left to add content, quizzes, and assignments</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Assignments Overview */}
        {activeTab === 'assignments' && !isSystemCourse && (
          <div className="bg-white rounded-lg border border-softGrey p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold" style={{ color: BRAND_COLORS.darkNavy }}>All Assignments</h2>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-lightGrey rounded-lg p-4 text-center">
                <p className="text-xs text-darkGrey/60">Total Assignments</p>
                <p className="text-2xl font-bold text-darkGrey">{assignments.length}</p>
              </div>
              <div className="bg-lightGrey rounded-lg p-4 text-center">
                <p className="text-xs text-darkGrey/60">Published</p>
                <p className="text-2xl font-bold text-green-600">{assignments.filter(a => a.status === 'published').length}</p>
              </div>
              <div className="bg-lightGrey rounded-lg p-4 text-center">
                <p className="text-xs text-darkGrey/60">Drafts</p>
                <p className="text-2xl font-bold text-yellow-600">{assignments.filter(a => a.status === 'draft').length}</p>
              </div>
            </div>

            {/* Assignments List */}
            {slides.length > 0 ? (
              <div className="space-y-6">
                {slides.map(slide => {
                  const slideAssignments = assignments.filter(a => a.slideId === slide.id);
                  if (slideAssignments.length === 0) return null;
                  
                  return (
                    <div key={slide.id} className="border border-softGrey rounded-lg overflow-hidden">
                      <div className="bg-lightGrey px-4 py-3 border-b border-softGrey">
                        <h3 className="font-medium text-darkGrey">Slide {slide.slideNumber}: {slide.title}</h3>
                      </div>
                      <div className="p-4 space-y-3">
                        {slideAssignments.map((assignment) => (
                          <div key={assignment.id} className="border border-softGrey rounded-lg p-4 hover:bg-lightGrey/50">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-medium text-darkGrey">{assignment.title}</h4>
                                <p className="text-sm text-darkGrey/70 mt-1">{assignment.description}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => { 
                                    setActiveTab('content'); 
                                    setSelectedSlideId(slide.id); 
                                    setTimeout(() => { 
                                      openAssignmentFormForSlide(slide.id); 
                                      handleEditAssignment(assignment); 
                                    }, 100); 
                                  }} 
                                  className="p-1 text-darkRoyalBlue hover:bg-darkRoyalBlue/5 rounded" 
                                  title="Edit Assignment"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4 mt-3">
                              <div className="flex items-center gap-2 text-xs text-darkGrey/60">
                                <Calendar className="w-3 h-3" />
                                <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-darkGrey/60">
                                <Award className="w-3 h-3" />
                                <span>Total: {assignment.totalMarks} marks</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                <span className={`px-2 py-1 rounded-full ${
                                  assignment.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {assignment.status}
                                </span>
                              </div>
                            </div>

                            {assignment.file && (
                              <div className="mt-3 flex items-center gap-2 text-sm">
                                <FileText className="w-4 h-4 text-darkRoyalBlue" />
                                <a href={assignment.file.url} target="_blank" rel="noopener noreferrer" className="text-darkRoyalBlue hover:underline">
                                  {assignment.file.name}
                                </a>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {assignments.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-softGrey rounded-lg">
                    <BookOpen className="w-12 h-12 mx-auto mb-3" style={{ color: BRAND_COLORS.softGrey }} />
                    <h3 className="text-base font-medium mb-2">No Assignments Created</h3>
                    <p className="text-darkGrey/70 text-sm">Go to the Content tab to add assignments to your slides</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-softGrey rounded-lg">
                <BookOpen className="w-12 h-12 mx-auto mb-3" style={{ color: BRAND_COLORS.softGrey }} />
                <h3 className="text-base font-medium mb-2">No Slides Created</h3>
                <p className="text-darkGrey/70 text-sm">Please create slides first before adding assignments</p>
              </div>
            )}
          </div>
        )}

        {/* System Course View (Read-only) */}
        {isSystemCourse && activeTab !== 'details' && (
          <div className="bg-white rounded-lg border border-softGrey p-12 text-center">
            <Lock className="w-12 h-12 mx-auto mb-3 text-blue-600" />
            <h3 className="text-base font-medium mb-2">System Course - Read Only</h3>
            <p className="text-darkGrey/70 text-sm">This is a system course. You can view the content but cannot modify it.</p>
          </div>
        )}
      </div>
    </div>
  );
}