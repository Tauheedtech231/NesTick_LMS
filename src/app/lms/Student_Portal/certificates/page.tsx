// app/certificates/page.tsx (FIXED VERSION)
'use client';
/* eslint-disable */

import { useState, useEffect } from 'react';
import { 
  HiAcademicCap, 
  HiDownload, 
  HiEye, 
  HiSearch, 
  HiFilter,
  HiCheckCircle,
  HiCalendar,
  HiDocumentText,
  HiArrowRight,
  HiClock,
  HiStar,
  HiUser,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineDocumentDownload,
  HiOutlineShare,
  HiLockClosed,
  HiXCircle
} from 'react-icons/hi';
import Link from 'next/link';

const BRAND_COLORS = {
  darkNavy: '#0B1C3D',
  darkRoyalBlue: '#1E3A8A',
  deepRed: '#B11217',
  white: '#FFFFFF',
  lightGrey: '#F4F6F8',
  softGrey: '#E5E7EB',
  darkGrey: '#1F2933',
  teal: '#1FB6CB'
};

type Certificate = {
  id: string;
  certificateId: string;
  studentName: string;
  studentEmail: string;
  studentId: string;
  courseName: string;
  courseId: string;
  completionDate: string;
  issueDate: string;
  certificateUrl?: string;
  verificationUrl: string;
  instructorName?: string;
  instructorId?: string;
  grade?: string;
  duration?: string;
  totalSlides: number;
  completedSlides: number;
  quizScore?: number;
  assignmentScore?: number;
};

type Course = {
  id: string;
  title: string;
  category: string;
  duration: string;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed';
  instructorName: string;
  instructorId?: string;
  completedDate?: string;
  grade?: string;
  image?: string;
  totalSlides: number;
  completedSlides: number;
  quizCompletion?: {
    total: number;
    attempted: number;
    passed: number;
    averageScore: number;
  };
  assignmentCompletion?: {
    total: number;
    submitted: number;
    graded: number;
    averageScore: number;
  };
};

type Enrollment = {
  id: string;
  courseId: string;
  courseTitle: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  enrollmentDate: string;
  status: 'active' | 'inactive';
  lastActive?: string;
};

export default function CertificatesPage() {
  const [user, setUser] = useState<any>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<Certificate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [verificationModal, setVerificationModal] = useState<Certificate | null>(null);

  // ========== 📋 LOAD ALL COURSES (HARDCODED + LOCALSTORAGE) ==========
  const loadAllCourses = () => {
    try {
      // Hardcoded courses from instructor file
      const hardcodedCourses = [
        {
          id: 'pipe-fitter',
          title: 'Pipe Fitter',
          category: 'Technical Training',
          duration: '8 Weeks',
          instructorName: 'System Instructor',
          image: "https://images.pexels.com/photos/6124242/pexels-photo-6124242.jpeg",
          totalSlides: 0
        },
        {
          id: 'safety-inspector',
          title: 'Safety Inspector',
          category: 'Safety Training',
          duration: '6 Weeks',
          instructorName: 'System Instructor',
          image: "https://images.pexels.com/photos/34082713/pexels-photo-34082713.jpeg",
          totalSlides: 0
        },
        {
          id: 'welding',
          title: 'Professional Welding',
          category: 'Technical Training',
          duration: '10 Weeks',
          instructorName: 'System Instructor',
          image: "https://images.pexels.com/photos/7650512/pexels-photo-7650512.jpeg",
          totalSlides: 0
        }
      ];
      
      // Get courses from localStorage (instructor created courses)
      const localStorageCourses = JSON.parse(localStorage.getItem('courses') || '[]');
      
      // Combine all courses
      const allCourses = [...hardcodedCourses, ...localStorageCourses];
      
      // Remove duplicates by id
      const uniqueCourses = allCourses.filter((course, index, self) => 
        index === self.findIndex((c) => c.id === course.id)
      );
      
      // Get slides data to update totalSlides for each course
      const allSlides = JSON.parse(localStorage.getItem('slides') || '[]');
      
      // Update totalSlides for each course based on actual slides
      uniqueCourses.forEach(course => {
        const courseSlides = allSlides.filter((s: any) => s.courseId === course.id);
        course.totalSlides = courseSlides.length;
      });
      
      return uniqueCourses;
      
    } catch (error) {
      console.error('Error loading courses:', error);
      return [];
    }
  };

  // ========== 🔍 FIND STUDENT ENROLLMENTS ==========
  const findStudentEnrollments = (studentData: any) => {
    try {
      const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
      
      console.log('All enrollments:', enrollments);
      console.log('Current student:', studentData);
      
      // Multiple matching strategies
      const studentEnrollments = enrollments.filter((e: any) => {
        // Strategy 1: Match by email (case insensitive)
        if (e.studentEmail && studentData.email && 
            e.studentEmail.toLowerCase() === studentData.email.toLowerCase()) {
          return true;
        }
        
        // Strategy 2: Match by studentId
        if (e.studentId && studentData.id && e.studentId === studentData.id) {
          return true;
        }
        
        // Strategy 3: Match by userId/learnerId
        if (e.studentId && studentData.userId && e.studentId === studentData.userId) {
          return true;
        }
        
        // Strategy 4: Match by name
        if (e.studentName && studentData.fullName && 
            e.studentName.toLowerCase().includes(studentData.fullName.toLowerCase())) {
          return true;
        }
        
        return false;
      });
      
      console.log('Found enrollments:', studentEnrollments);
      return studentEnrollments;
      
    } catch (error) {
      console.error('Error finding enrollments:', error);
      return [];
    }
  };

  // ========== 📊 CALCULATE COURSE PROGRESS FROM SLIDES ==========
  const calculateCourseProgress = (courseId: string, studentId: string) => {
    try {
      const completedSlidesKey = `completedSlides_${studentId}_${courseId}`;
      const completedSlidesStr = localStorage.getItem(completedSlidesKey);
      const completedSlides = completedSlidesStr ? JSON.parse(completedSlidesStr) : [];
      
      const allSlides = JSON.parse(localStorage.getItem('slides') || '[]');
      const courseSlides = allSlides.filter((s: any) => s.courseId === courseId);
      const totalSlides = courseSlides.length;
      
      const progress = totalSlides > 0 
        ? Math.round((completedSlides.length / totalSlides) * 100) 
        : 0;
      
      return {
        progress,
        completedSlides: completedSlides.length,
        totalSlides,
        isCompleted: totalSlides > 0 && completedSlides.length >= totalSlides
      };
    } catch (error) {
      console.error('Error calculating progress:', error);
      return { progress: 0, completedSlides: 0, totalSlides: 0, isCompleted: false };
    }
  };

  // ========== 📝 LOAD QUIZ DATA ==========
  const loadQuizData = (studentId: string, courseId: string) => {
    try {
      const attemptsKey = `quizAttempts_${studentId}`;
      const savedAttempts = localStorage.getItem(attemptsKey);
      if (!savedAttempts) {
        return { total: 0, attempted: 0, passed: 0, averageScore: 0 };
      }
      
      const attempts = JSON.parse(savedAttempts);
      const courseAttempts = Object.values(attempts).filter((a: any) => a.courseId === courseId);
      
      // Get all quizzes for this course
      const allQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
      const courseQuizzes = allQuizzes.filter((q: any) => q.courseId === courseId);
      
      const totalQuizzes = courseQuizzes.length;
      const attemptedQuizzes = courseAttempts.length;
      const passedQuizzes = courseAttempts.filter((a: any) => a.passed).length;
      const averageScore = attemptedQuizzes > 0 
        ? Math.round(courseAttempts.reduce((sum: number, a: any) => sum + a.score, 0) / attemptedQuizzes)
        : 0;
      
      return {
        total: totalQuizzes,
        attempted: attemptedQuizzes,
        passed: passedQuizzes,
        averageScore
      };
    } catch (error) {
      console.error('Error loading quiz data:', error);
      return { total: 0, attempted: 0, passed: 0, averageScore: 0 };
    }
  };

  // ========== 📝 LOAD ASSIGNMENT DATA ==========
  const loadAssignmentData = (studentId: string, studentEmail: string, courseId: string) => {
    try {
      const submissionsKey = 'assignmentSubmissions';
      const savedSubmissions = localStorage.getItem(submissionsKey);
      if (!savedSubmissions) {
        return { total: 0, submitted: 0, graded: 0, averageScore: 0 };
      }
      
      const submissions = JSON.parse(savedSubmissions);
      const courseSubmissions = submissions.filter((s: any) => 
        s.courseId === courseId && 
        (s.studentId === studentId || s.studentEmail === studentEmail)
      );
      
      const allAssignments = JSON.parse(localStorage.getItem('assignments') || '[]');
      const courseAssignments = allAssignments.filter((a: any) => a.courseId === courseId);
      
      const gradedSubmissions = courseSubmissions.filter((s: any) => s.score !== undefined);
      const avgScore = gradedSubmissions.length > 0
        ? Math.round(gradedSubmissions.reduce((sum: number, s: any) => sum + (s.score || 0), 0) / gradedSubmissions.length)
        : 0;
      
      return {
        total: courseAssignments.length,
        submitted: courseSubmissions.length,
        graded: gradedSubmissions.length,
        averageScore: avgScore
      };
    } catch (error) {
      console.error('Error loading assignment data:', error);
      return { total: 0, submitted: 0, graded: 0, averageScore: 0 };
    }
  };

  // ========== 🎓 CALCULATE GRADE ==========
  const calculateGrade = (quizScore: number = 0, assignmentScore: number = 0): string => {
    const avgScore = (quizScore + assignmentScore) / 2;
    if (avgScore >= 90) return 'A+';
    if (avgScore >= 80) return 'A';
    if (avgScore >= 70) return 'B';
    if (avgScore >= 60) return 'C';
    return 'D';
  };

  // ========== 📥 LOAD ENROLLED COURSES FOR STUDENT ==========
  const loadEnrolledCourses = (studentData: any) => {
    try {
      console.log('Loading enrolled courses for certificates...');
      
      // Step 1: Find enrollments for this student
      const studentEnrollments = findStudentEnrollments(studentData);
      
      // Step 2: Get all available courses
      const allCourses = loadAllCourses();
      
      // Step 3: Get course IDs from enrollments
      let enrolledCourseIds = studentEnrollments.map((e: any) => e.courseId);
      
      console.log('Enrolled course IDs:', enrolledCourseIds);
      
      // Step 4: If no enrollments, create demo enrollments for testing
      if (enrolledCourseIds.length === 0 && studentData) {
        console.log('No enrollments found, creating demo enrollments');
        
        const demoEnrollments = [
          {
            id: `enroll_demo_1_${studentData.id}`,
            courseId: 'pipe-fitter',
            courseTitle: 'Pipe Fitter',
            studentId: studentData.id,
            studentName: studentData.fullName || studentData.name || 'Student',
            studentEmail: studentData.email,
            studentPhone: studentData.phone || '',
            enrollmentDate: new Date().toISOString().split('T')[0],
            status: 'active'
          },
          {
            id: `enroll_demo_2_${studentData.id}`,
            courseId: 'safety-inspector',
            courseTitle: 'Safety Inspector',
            studentId: studentData.id,
            studentName: studentData.fullName || studentData.name || 'Student',
            studentEmail: studentData.email,
            studentPhone: studentData.phone || '',
            enrollmentDate: new Date().toISOString().split('T')[0],
            status: 'active'
          }
        ];
        
        // Save to localStorage so other pages can see them too
        const existingEnrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
        const updatedEnrollments = [...existingEnrollments, ...demoEnrollments];
        localStorage.setItem('enrollments', JSON.stringify(updatedEnrollments));
        
        enrolledCourseIds = ['pipe-fitter', 'safety-inspector'];
      }
      
      // Step 5: Build enrolled courses with progress data
      const enrolledCoursesList = enrolledCourseIds
        .map((courseId: string) => {
          // Find course details
          const course = allCourses.find((c: any) => c.id === courseId);
          if (!course) return null;
          
          // Find enrollment details
          const enrollment = studentEnrollments.find((e: any) => e.courseId === courseId);
          
          // Calculate real progress from slides
          const { progress, completedSlides, totalSlides, isCompleted } = 
            calculateCourseProgress(courseId, studentData.id);
          
          // Load quiz and assignment data
          const quizData = loadQuizData(studentData.id, courseId);
          const assignmentData = loadAssignmentData(studentData.id, studentData.email, courseId);
          
          // Determine status
          let status: 'not_started' | 'in_progress' | 'completed' = 'not_started';
          if (isCompleted) {
            status = 'completed';
          } else if (completedSlides > 0) {
            status = 'in_progress';
          }
          
          return {
            id: course.id,
            title: course.title,
            category: course.category || 'General',
            duration: course.duration || 'Self-paced',
            instructorName: course.instructorName || 'Mansol Hab School',
            instructorId: course.instructorId,
            image: course.image,
            totalSlides: totalSlides,
            completedSlides: completedSlides,
            progress: progress,
            status: status,
            completedDate: isCompleted ? new Date().toISOString().split('T')[0] : undefined,
            grade: calculateGrade(quizData.averageScore, assignmentData.averageScore),
            quizCompletion: quizData,
            assignmentCompletion: assignmentData
          };
        })
        .filter(Boolean);
      
      console.log('Enrolled courses for certificates:', enrolledCoursesList);
      return enrolledCoursesList;
      
    } catch (error) {
      console.error('Error loading enrolled courses:', error);
      return [];
    }
  };

  // ========== 📋 LOAD EXISTING CERTIFICATES ==========
  const loadCertificates = (studentData: any) => {
    try {
      const savedCertificates = localStorage.getItem('studentCertificates');
      if (!savedCertificates) return [];
      
      const allCerts = JSON.parse(savedCertificates);
      
      // Filter certificates for current student
      const studentCerts = allCerts.filter((c: any) => 
        c.studentEmail === studentData.email || 
        c.studentId === studentData.id ||
        c.studentName === studentData.fullName
      );
      
      return studentCerts;
      
    } catch (error) {
      console.error('Error loading certificates:', error);
      return [];
    }
  };

  // ========== 📥 MAIN LOAD FUNCTION ==========
  useEffect(() => {
    const loadData = () => {
      try {
        console.log('Loading certificates page data...');
        
        // Get current user
        const currentUserStr = localStorage.getItem('currentUser');
        if (!currentUserStr) {
          setLoading(false);
          return;
        }
        
        const userData = JSON.parse(currentUserStr);
        setUser(userData);
        console.log('Current user:', userData);
        
        // Load enrolled courses
        const enrolled = loadEnrolledCourses(userData);
        setEnrolledCourses(enrolled);
        
        // Load certificates
        const certs = loadCertificates(userData);
        setCertificates(certs);
        setFilteredCertificates(certs);
        
        console.log('Certificates loaded:', certs);
        console.log('Enrolled courses loaded:', enrolled);
        
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    
    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'enrollments' || 
          e.key === 'studentCertificates' ||
          e.key?.startsWith('completedSlides_') ||
          e.key?.startsWith('quizAttempts_')) {
        loadData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
    
  }, []);

  // ========== 🔍 FILTER CERTIFICATES ==========
  useEffect(() => {
    let filtered = certificates;

    if (searchTerm) {
      filtered = filtered.filter(cert =>
        cert.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.certificateId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCourse !== 'all') {
      filtered = filtered.filter(cert => cert.courseName === selectedCourse);
    }

    setFilteredCertificates(filtered);
  }, [searchTerm, selectedCourse, certificates]);

  // ========== ✅ CHECK IF COURSE IS COMPLETED (SLIDES ONLY) ==========
  const isCourseCompleted = (course: Course): boolean => {
    return course.completedSlides >= course.totalSlides && course.totalSlides > 0;
  };

  // ========== 🎓 GENERATE CERTIFICATE ==========
  const generateCertificate = (course: Course) => {
    // Check if course is fully completed
    if (!isCourseCompleted(course)) {
      alert('⚠️ You must complete all lessons before generating a certificate.');
      return;
    }

    setGeneratingId(course.id);
    
    try {
      // Check if certificate already exists
      const exists = certificates.some(c => 
        c.courseId === course.id && 
        c.studentEmail === user?.email
      );

      if (exists) {
        alert(`Certificate for ${course.title} already exists!`);
        setGeneratingId(null);
        return;
      }

      // Generate unique certificate ID
      const certId = `CERT-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
      
      // Create new certificate
      const newCertificate: Certificate = {
        id: `cert-${Date.now()}-${course.id}`,
        certificateId: certId,
        studentName: user?.fullName || user?.name || 'Student',
        studentEmail: user?.email || '',
        studentId: user?.id || '',
        courseName: course.title,
        courseId: course.id,
        completionDate: new Date().toISOString().split('T')[0],
        issueDate: new Date().toISOString().split('T')[0],
        verificationUrl: `https://verify.mansolhab.com/${certId}`,
        instructorName: course.instructorName || 'Mansol Hab School',
        instructorId: course.instructorId,
        grade: course.grade || 'A',
        duration: course.duration || '8 Weeks',
        totalSlides: course.totalSlides || 0,
        completedSlides: course.completedSlides || 0,
        quizScore: course.quizCompletion?.averageScore || 0,
        assignmentScore: course.assignmentCompletion?.averageScore || 0
      };

      // Save to state
      const updatedCertificates = [...certificates, newCertificate];
      setCertificates(updatedCertificates);
      setFilteredCertificates(updatedCertificates);
      
      // Save to localStorage
      const allSavedCerts = JSON.parse(localStorage.getItem('studentCertificates') || '[]');
      const updatedAllCerts = [...allSavedCerts, newCertificate];
      localStorage.setItem('studentCertificates', JSON.stringify(updatedAllCerts));

      alert(`✅ Certificate generated successfully for ${course.title}!`);
      
    } catch (error) {
      console.error('Error generating certificate:', error);
      alert('Failed to generate certificate. Please try again.');
    } finally {
      setGeneratingId(null);
    }
  };

  // ========== 📥 DOWNLOAD CERTIFICATE ==========
  const handleDownloadCertificate = (certificateId: string) => {
    const cert = certificates.find(c => c.certificateId === certificateId);
    if (cert) {
      const certificateHTML = generateCertificateHTML(cert, true);
      
      const blob = new Blob([certificateHTML], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Certificate-${cert.certificateId}-${cert.courseName.replace(/\s+/g, '-')}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      alert(`✅ Certificate downloaded successfully!\nCertificate ID: ${cert.certificateId}`);
    }
  };

  // ========== 👁️ VIEW CERTIFICATE ==========
  const handleViewCertificate = (certificateId: string) => {
    const cert = certificates.find(c => c.certificateId === certificateId);
    if (cert) {
      setSelectedCertificate(cert);
      
      const certificateHTML = generateCertificateHTML(cert, false);
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(certificateHTML);
        newWindow.document.close();
      }
    }
  };

  // ========== 🔗 VERIFY CERTIFICATE ==========
  const handleVerifyCertificate = (certificateId: string) => {
    const cert = certificates.find(c => c.certificateId === certificateId);
    if (cert) {
      setVerificationModal(cert);
    }
  };

  // ========== 📄 GENERATE CERTIFICATE HTML ==========
  const generateCertificateHTML = (cert: Certificate, forDownload: boolean = false) => {
    const completionDate = new Date(cert.completionDate).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    const issueDate = new Date(cert.issueDate).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Certificate of Completion - ${cert.courseName}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .certificate {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            padding: 60px;
            border-radius: 30px;
            box-shadow: 0 30px 60px rgba(0,0,0,0.2);
            position: relative;
            border: 15px solid #f3f4f6;
          }
          .certificate::before {
            content: '';
            position: absolute;
            top: 20px;
            left: 20px;
            right: 20px;
            bottom: 20px;
            border: 2px solid #667eea;
            border-radius: 15px;
            pointer-events: none;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
          }
          .school-name {
            color: #1a1a1a;
            font-size: 48px;
            font-weight: 800;
            margin-bottom: 10px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .certificate-title {
            color: #4a5568;
            font-size: 32px;
            font-weight: 600;
            letter-spacing: 2px;
            border-bottom: 3px solid #e2e8f0;
            padding-bottom: 20px;
          }
          .content {
            text-align: center;
            margin: 40px 0;
          }
          .presented-to {
            color: #718096;
            font-size: 20px;
            margin-bottom: 10px;
          }
          .student-name {
            color: #2d3748;
            font-size: 42px;
            font-weight: 700;
            margin: 20px 0;
            font-family: 'Georgia', serif;
          }
          .for-text {
            color: #718096;
            font-size: 20px;
            margin: 10px 0;
          }
          .course-name {
            color: #667eea;
            font-size: 36px;
            font-weight: 700;
            margin: 20px 0;
            font-family: 'Georgia', serif;
          }
          .details {
            background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
            padding: 30px;
            border-radius: 15px;
            margin: 30px 0;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
          }
          .detail-item {
            text-align: center;
          }
          .detail-label {
            color: #718096;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 5px;
          }
          .detail-value {
            color: #2d3748;
            font-size: 18px;
            font-weight: 600;
          }
          .grade-badge {
            display: inline-block;
            background: #48bb78;
            color: white;
            padding: 5px 15px;
            border-radius: 25px;
            font-weight: 600;
          }
          .signature {
            margin-top: 50px;
            text-align: center;
          }
          .signature-line {
            width: 250px;
            margin: 0 auto;
            border-top: 2px solid #cbd5e0;
            padding-top: 10px;
          }
          .signature-name {
            color: #2d3748;
            font-size: 24px;
            font-family: 'Brush Script MT', cursive;
            margin: 10px 0;
          }
          .signature-title {
            color: #718096;
            font-size: 16px;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #a0aec0;
            font-size: 14px;
          }
          .verification {
            margin-top: 30px;
            padding: 20px;
            background: #f7fafc;
            border-radius: 10px;
            text-align: center;
          }
          .verification-url {
            color: #667eea;
            text-decoration: none;
            font-weight: 600;
            word-break: break-all;
          }
          ${forDownload ? `
            @media print {
              body { background: white; padding: 0; }
              .certificate { box-shadow: none; border: 2px solid #e2e8f0; }
            }
          ` : ''}
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="header">
            <div class="school-name">MANSOL HAB SCHOOL</div>
            <div class="certificate-title">CERTIFICATE OF COMPLETION</div>
          </div>
          
          <div class="content">
            <div class="presented-to">THIS CERTIFICATE IS PRESENTED TO</div>
            <div class="student-name">${cert.studentName}</div>
            
            <div class="for-text">for successfully completing the course</div>
            <div class="course-name">${cert.courseName}</div>
            
            <div class="details">
              <div class="detail-item">
                <div class="detail-label">Certificate ID</div>
                <div class="detail-value">${cert.certificateId}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Grade Achieved</div>
                <div class="detail-value"><span class="grade-badge">${cert.grade || 'A'}</span></div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Issue Date</div>
                <div class="detail-value">${issueDate}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Duration</div>
                <div class="detail-value">${cert.duration || '8 Weeks'}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Instructor</div>
                <div class="detail-value">${cert.instructorName || 'Mansol Hab School'}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Completion Date</div>
                <div class="detail-value">${completionDate}</div>
              </div>
            </div>
            
            <div class="verification">
              <div class="detail-label">Verify this certificate</div>
              <div class="verification-url">${cert.verificationUrl}</div>
            </div>
          </div>
          
          <div class="signature">
            <div class="signature-line"></div>
            <div class="signature-name">Mansol Hab</div>
            <div class="signature-title">Director, Mansol Hab School</div>
          </div>
          
          <div class="footer">
            <p>This certificate is digitally verifiable and can be validated online</p>
            <p>© ${new Date().getFullYear()} Mansol Hab School. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  // ========== 📊 STATS ==========
  const totalCertificates = certificates.length;
  
  const recentCertificates = certificates.filter(cert => {
    const issueDate = new Date(cert.issueDate);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return issueDate >= thirtyDaysAgo;
  }).length;

  const coursesList = Array.from(new Set(certificates.map(c => c.courseName)));
  
  // Completed courses (based on slides)
  const completedCoursesCount = enrolledCourses.filter(c => 
    c.completedSlides >= c.totalSlides && c.totalSlides > 0
  ).length;
  
  // Pending certificates (completed but no certificate yet)
  const pendingCertificates = enrolledCourses.filter(c => 
    c.completedSlides >= c.totalSlides && 
    c.totalSlides > 0 && 
    !certificates.some(cert => cert.courseId === c.id)
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-transparent"
            style={{ borderColor: BRAND_COLORS.deepRed }}
          ></div>
          <p className="mt-4 text-gray-600">Loading certificates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
      {/* ========== HEADER ========== */}
      <div 
        className="rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 text-white"
        style={{ background: `linear-gradient(135deg, ${BRAND_COLORS.darkNavy} 0%, ${BRAND_COLORS.darkRoyalBlue} 100%)` }}
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 flex items-center gap-2">
              <HiAcademicCap className="w-6 h-6" />
              My Certificates
            </h1>
            <p className="text-white/80 text-xs sm:text-sm">
              {user?.fullName || user?.name || 'Student'} • {totalCertificates} earned
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-white/20 rounded-lg p-2.5 flex items-center gap-2">
              <HiAcademicCap className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-xl sm:text-2xl font-bold">{totalCertificates}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========== STATS CARDS ========== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Total Earned</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold mt-1 text-gray-900">{totalCertificates}</p>
            </div>
            <div className="p-2 sm:p-3 rounded-full bg-purple-100 text-purple-600">
              <HiAcademicCap className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Recent (30 days)</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold mt-1 text-gray-900">{recentCertificates}</p>
            </div>
            <div className="p-2 sm:p-3 rounded-full bg-green-100 text-green-600">
              <HiCalendar className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Completed Courses</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold mt-1 text-gray-900">{completedCoursesCount}</p>
            </div>
            <div className="p-2 sm:p-3 rounded-full bg-blue-100 text-blue-600">
              <HiCheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Pending</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold mt-1 text-gray-900">{pendingCertificates}</p>
            </div>
            <div className="p-2 sm:p-3 rounded-full bg-yellow-100 text-yellow-600">
              <HiClock className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* ========== COMPLETED COURSES SECTION ========== */}
      {enrolledCourses.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                  <HiCheckCircle className="w-5 h-5 text-green-600" />
                  Ready for Certificates ({pendingCertificates})
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Generate certificates for courses where you've completed all lessons
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {/* Completed courses - ready for certificates */}
            {enrolledCourses
              .filter(course => 
                course.completedSlides >= course.totalSlides && 
                course.totalSlides > 0 && 
                !certificates.some(c => c.courseId === course.id)
              )
              .map(course => (
                <div key={course.id} className="p-4 sm:p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex-1">
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900">{course.title}</h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                        <span className="text-xs text-gray-600 flex items-center gap-1">
                          <HiUser className="w-3 h-3" />
                          {course.instructorName}
                        </span>
                        <span className="text-xs text-gray-600 flex items-center gap-1">
                          <HiClock className="w-3 h-3" />
                          {course.duration}
                        </span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          {course.completedSlides}/{course.totalSlides} lessons
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => generateCertificate(course)}
                      disabled={generatingId === course.id}
                      className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg text-sm font-medium hover:from-green-700 hover:to-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {generatingId === course.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <HiOutlineDocumentDownload className="w-4 h-4" />
                          Generate Certificate
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            
            {/* In-progress courses */}
            {enrolledCourses
              .filter(course => 
                (course.completedSlides < course.totalSlides || course.totalSlides === 0) && 
                !certificates.some(c => c.courseId === course.id)
              )
              .map(course => (
                <div key={course.id} className="p-4 sm:p-5 bg-gray-50/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex-1">
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900">{course.title}</h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                        <span className="text-xs text-gray-600 flex items-center gap-1">
                          <HiUser className="w-3 h-3" />
                          {course.instructorName}
                        </span>
                        <span className="text-xs text-gray-600 flex items-center gap-1">
                          <HiClock className="w-3 h-3" />
                          {course.duration}
                        </span>
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                          {course.completedSlides}/{course.totalSlides} lessons
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <HiLockClosed className="w-3 h-3" />
                        Complete all {course.totalSlides - course.completedSlides} remaining lessons to generate certificate
                      </div>
                    </div>
                    <button
                      disabled
                      className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-500 rounded-lg text-sm font-medium cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <HiLockClosed className="w-4 h-4" />
                      Locked
                    </button>
                  </div>
                </div>
              ))}
            
            {pendingCertificates === 0 && enrolledCourses.filter(c => c.completedSlides < c.totalSlides).length === 0 && (
              <div className="p-8 text-center">
                <HiCheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                <h3 className="text-sm font-medium text-gray-900 mb-1">All caught up!</h3>
                <p className="text-xs text-gray-600">
                  You've generated certificates for all your completed courses.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========== SEARCH & FILTER ========== */}
      {certificates.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search certificates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="flex-1 sm:flex-none px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 bg-white"
              >
                <option value="all">All Courses</option>
                {coursesList.map((course) => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
              <button className="px-3 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center">
                <HiFilter className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== CERTIFICATES GRID ========== */}
      {certificates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredCertificates.map(certificate => (
            <div
              key={certificate.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div 
                className="p-4 text-white"
                style={{ background: `linear-gradient(135deg, ${BRAND_COLORS.darkRoyalBlue} 0%, ${BRAND_COLORS.darkNavy} 100%)` }}
              >
                <div className="flex justify-between items-start">
                  <HiAcademicCap className="w-8 h-8 sm:w-10 sm:h-10 opacity-90" />
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                    {certificate.grade || 'A'} Grade
                  </span>
                </div>
                <h3 className="font-bold text-sm sm:text-base mt-3 mb-1 line-clamp-1">
                  {certificate.courseName}
                </h3>
                <p className="text-xs opacity-90 truncate">{certificate.studentName}</p>
              </div>
              
              <div className="p-4">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-600">Certificate ID</span>
                    <span className="font-mono font-medium text-gray-900 truncate ml-2">
                      {certificate.certificateId}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-600">Issue Date</span>
                    <span className="font-medium text-gray-900">
                      {new Date(certificate.issueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-600">Completion</span>
                    <span className="font-medium text-gray-900">
                      {certificate.completedSlides}/{certificate.totalSlides} lessons
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleViewCertificate(certificate.certificateId)}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                  >
                    <HiEye className="w-4 h-4" />
                    View
                  </button>
                  <button
                    onClick={() => handleDownloadCertificate(certificate.certificateId)}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700 transition-colors"
                  >
                    <HiDownload className="w-4 h-4" />
                    Download
                  </button>
                </div>
                
                <button
                  onClick={() => handleVerifyCertificate(certificate.certificateId)}
                  className="mt-2 w-full flex items-center justify-center gap-1 px-3 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
                >
                  <HiOutlineShare className="w-4 h-4" />
                  Verify
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-12 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
            <HiAcademicCap className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">No certificates yet</h3>
          <p className="text-xs sm:text-sm text-gray-600 mb-6 max-w-md mx-auto">
            Complete all lessons in your courses to earn professional certificates.
          </p>
          <Link
            href="/lms/Student_Portal/my-courses"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg text-sm font-medium hover:from-purple-700 hover:to-purple-900 transition-colors"
          >
            Go to My Courses
            <HiArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* ========== VERIFICATION MODAL ========== */}
      {verificationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-gray-900">Verify Certificate</h3>
              <button
                onClick={() => setVerificationModal(null)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <HiXCircle className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700 font-medium flex items-center gap-2">
                  <HiCheckCircle className="w-5 h-5" />
                  Valid Certificate
                </p>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-xs text-gray-500">Certificate ID</dt>
                    <dd className="text-xs font-mono font-medium">{verificationModal.certificateId}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-xs text-gray-500">Student Name</dt>
                    <dd className="text-xs font-medium">{verificationModal.studentName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-xs text-gray-500">Course</dt>
                    <dd className="text-xs font-medium">{verificationModal.courseName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-xs text-gray-500">Issue Date</dt>
                    <dd className="text-xs font-medium">{new Date(verificationModal.issueDate).toLocaleDateString()}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-xs text-gray-500">Grade</dt>
                    <dd className="text-xs font-medium">{verificationModal.grade || 'A'}</dd>
                  </div>
                </dl>
              </div>
              
              <div className="pt-4">
                <p className="text-xs text-gray-500 mb-2">Verification URL</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={verificationModal.verificationUrl}
                    readOnly
                    className="flex-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(verificationModal.verificationUrl);
                      alert('Verification URL copied to clipboard!');
                    }}
                    className="px-3 py-2 bg-purple-600 text-white text-xs rounded hover:bg-purple-700"
                  >
                    Copy
                  </button>
                </div>
              </div>
              
              <button
                onClick={() => setVerificationModal(null)}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}