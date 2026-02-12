// app/certificates/page.tsx
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
  HiOutlineShare
} from 'react-icons/hi';
import Link from 'next/link';
import CertificateCard from '../components/CertificateCard';

type Certificate = {
  id: string;
  certificateId: string;
  studentName: string;
  studentEmail: string;
  courseName: string;
  courseId: string;
  completionDate: string;
  issueDate: string;
  certificateUrl?: string;
  verificationUrl: string;
  instructorName?: string;
  grade?: string;
  duration?: string;
};

type Course = {
  id: string;
  title: string;
  category: string;
  duration: string;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed';
  instructorName: string;
  completedDate?: string;
  grade?: string;
  image?: string;
};

export default function CertificatesPage() {
  const [user, setUser] = useState<any>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [completedCourses, setCompletedCourses] = useState<Course[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<Certificate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  // ========== 📋 LOAD USER DATA ==========
  useEffect(() => {
    const loadData = () => {
      try {
        // Get current user
        const currentUserStr = localStorage.getItem('currentUser');
        if (currentUserStr) {
          const userData = JSON.parse(currentUserStr);
          setUser(userData);
        }

        // Get student courses
        const studentCoursesStr = localStorage.getItem('studentCourses');
        if (studentCoursesStr) {
          const courses = JSON.parse(studentCoursesStr);
          
          // ✅ Filter COMPLETED courses (progress >= 100)
          const completed = courses.filter((c: any) => 
            c.progress >= 100 || c.status === 'completed'
          ).map((c: any) => ({
            ...c,
            completedDate: c.completedDate || new Date().toISOString().split('T')[0],
            grade: c.grade || 'A'
          }));
          
          setCompletedCourses(completed);
        }

        // Get existing certificates
        const savedCertificates = localStorage.getItem('studentCertificates');
        if (savedCertificates) {
          const certs = JSON.parse(savedCertificates);
          // ✅ Filter certificates for current user
          if (currentUserStr) {
            const userData = JSON.parse(currentUserStr);
            const userCerts = certs.filter((c: any) => 
              c.studentEmail === userData.email || 
              c.studentName === userData.fullName
            );
            setCertificates(userCerts);
            setFilteredCertificates(userCerts);
          } else {
            setCertificates(certs);
            setFilteredCertificates(certs);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
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

  // ========== 🎓 GENERATE CERTIFICATE ==========
  const generateCertificate = (course: Course) => {
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

      // ✅ Generate unique certificate ID
      const certId = `CERT-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
      
      // Create new certificate
      const newCertificate: Certificate = {
        id: `cert-${Date.now()}-${course.id}`,
        certificateId: certId,
        studentName: user?.fullName || 'Student',
        studentEmail: user?.email || '',
        courseName: course.title,
        courseId: course.id,
        completionDate: course.completedDate || new Date().toISOString().split('T')[0],
        issueDate: new Date().toISOString().split('T')[0],
        verificationUrl: `https://verify.mansolhab.com/${certId}`,
        instructorName: course.instructorName || 'Mansol Hab School',
        grade: course.grade || 'A',
        duration: course.duration || '8 Weeks'
      };

      // Save to state and localStorage
      const updatedCertificates = [...certificates, newCertificate];
      setCertificates(updatedCertificates);
      setFilteredCertificates(updatedCertificates);
      
      // Get existing certificates from localStorage
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
      // Create professional certificate HTML
      const certificateHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Certificate of Completion - ${cert.courseName}</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 40px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            .certificate {
              max-width: 900px;
              margin: 0 auto;
              background: white;
              padding: 60px;
              border-radius: 20px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              position: relative;
            }
            .certificate::before {
              content: '★';
              position: absolute;
              top: 20px;
              left: 20px;
              font-size: 40px;
              color: #ffd700;
            }
            .certificate::after {
              content: '★';
              position: absolute;
              bottom: 20px;
              right: 20px;
              font-size: 40px;
              color: #ffd700;
            }
            h1 {
              color: #1a1a1a;
              font-size: 42px;
              margin-bottom: 20px;
              text-align: center;
              border-bottom: 3px solid #667eea;
              padding-bottom: 20px;
            }
            h2 {
              color: #4a5568;
              font-size: 32px;
              margin: 20px 0;
              text-align: center;
            }
            h3 {
              color: #667eea;
              font-size: 28px;
              margin: 20px 0;
              text-align: center;
              font-weight: bold;
            }
            .info {
              margin: 40px 0;
              padding: 20px;
              background: #f7fafc;
              border-radius: 10px;
            }
            .info p {
              font-size: 18px;
              color: #2d3748;
              margin: 10px 0;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              color: #718096;
              font-size: 14px;
            }
            .signature {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e2e8f0;
              text-align: center;
              font-size: 16px;
            }
            .verification {
              color: #667eea;
              text-decoration: none;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="certificate">
            <h1>MANSOL HAB SCHOOL</h1>
            <h2>CERTIFICATE OF COMPLETION</h2>
            
            <h3>This is to certify that</h3>
            <h2 style="color: #764ba2;">${cert.studentName}</h2>
            
            <h3>has successfully completed</h3>
            <h2 style="color: #667eea;">${cert.courseName}</h2>
            
            <div class="info">
              <p><strong>Certificate ID:</strong> ${cert.certificateId}</p>
              <p><strong>Completion Date:</strong> ${new Date(cert.completionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p><strong>Issue Date:</strong> ${new Date(cert.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p><strong>Instructor:</strong> ${cert.instructorName || 'Mansol Hab School'}</p>
              <p><strong>Grade:</strong> ${cert.grade || 'A'}</p>
              <p><strong>Duration:</strong> ${cert.duration || '8 Weeks'}</p>
            </div>
            
            <div class="signature">
              <p>Authorized Signature</p>
              <p style="font-family: 'Brush Script MT', cursive; font-size: 24px;">Mansol Hab</p>
              <p>Director, Mansol Hab School</p>
            </div>
            
            <div class="footer">
              <p>This certificate is digitally verifiable</p>
              <p>Verification URL: <a href="${cert.verificationUrl}" class="verification">${cert.verificationUrl}</a></p>
              <p>© ${new Date().getFullYear()} Mansol Hab School. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Download as HTML file
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
      
      // Open in new window
      const certificateHTML = generateCertificateHTML(cert);
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(certificateHTML);
        newWindow.document.close();
      }
    }
  };

  // ========== 📄 GENERATE CERTIFICATE HTML ==========
  const generateCertificateHTML = (cert: Certificate) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Certificate - ${cert.courseName}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .certificate {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            padding: 60px;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          }
          h1 { color: #1a1a1a; font-size: 42px; text-align: center; border-bottom: 3px solid #667eea; padding-bottom: 20px; }
          h2 { color: #4a5568; font-size: 32px; text-align: center; }
          h3 { color: #667eea; font-size: 28px; text-align: center; }
          .info { margin: 40px 0; padding: 20px; background: #f7fafc; border-radius: 10px; }
          .info p { font-size: 18px; color: #2d3748; margin: 10px 0; }
          .verification { color: #667eea; text-align: center; margin-top: 40px; }
        </style>
      </head>
      <body>
        <div class="certificate">
          <h1>MANSOL HAB SCHOOL</h1>
          <h2>CERTIFICATE OF COMPLETION</h2>
          <h3>${cert.studentName}</h3>
          <p style="text-align: center; font-size: 20px;">has successfully completed</p>
          <h2 style="color: #667eea;">${cert.courseName}</h2>
          <div class="info">
            <p><strong>Certificate ID:</strong> ${cert.certificateId}</p>
            <p><strong>Completion Date:</strong> ${new Date(cert.completionDate).toLocaleDateString()}</p>
            <p><strong>Issue Date:</strong> ${new Date(cert.issueDate).toLocaleDateString()}</p>
            <p><strong>Instructor:</strong> ${cert.instructorName || 'Mansol Hab School'}</p>
            <p><strong>Grade:</strong> ${cert.grade || 'A'}</p>
            <p><strong>Duration:</strong> ${cert.duration || '8 Weeks'}</p>
          </div>
          <div class="verification">
            <p>Verify at: <a href="${cert.verificationUrl}" target="_blank">${cert.verificationUrl}</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  // ========== 🔗 VERIFY CERTIFICATE ==========
  const handleVerifyCertificate = (certificateId: string) => {
    const cert = certificates.find(c => c.certificateId === certificateId);
    if (cert) {
      window.open(cert.verificationUrl, '_blank');
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-transparent"
            style={{ borderColor: '#B11217' }}
          ></div>
          <p className="mt-4 text-gray-600">Loading certificates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
      {/* ========== HEADER ========== */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-1">
              🎓 My Certificates
            </h1>
            <p className="text-purple-100 text-xs sm:text-sm">
              {user?.fullName || 'Student'} • {totalCertificates} earned
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
              <p className="text-xs text-gray-600">Total</p>
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
              <p className="text-xs text-gray-600">Recent</p>
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
              <p className="text-xs text-gray-600">Completed</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold mt-1 text-gray-900">{completedCourses.length}</p>
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
              <p className="text-lg sm:text-xl md:text-2xl font-bold mt-1 text-gray-900">
                {completedCourses.length - totalCertificates}
              </p>
            </div>
            <div className="p-2 sm:p-3 rounded-full bg-yellow-100 text-yellow-600">
              <HiClock className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* ========== COMPLETED COURSES SECTION - GENERATE CERTIFICATES ========== */}
      {completedCourses.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                  <HiCheckCircle className="w-5 h-5 text-green-600" />
                  Completed Courses ({completedCourses.length - totalCertificates} ready for certificate)
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Generate certificates for your completed courses
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {completedCourses
              .filter(course => !certificates.some(c => c.courseId === course.id))
              .map(course => (
                <div key={course.id} className="p-4 sm:p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex-1">
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900">{course.title}</h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                        <span className="text-xs text-gray-600 flex items-center gap-1">
                          <HiUser className="w-3 h-3" />
                          {course.instructorName || 'Mansol Hab School'}
                        </span>
                        <span className="text-xs text-gray-600 flex items-center gap-1">
                          <HiClock className="w-3 h-3" />
                          {course.duration}
                        </span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          Completed
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
            
            {completedCourses.length - totalCertificates === 0 && (
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
              <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-4 text-white">
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
                    <span className="text-gray-600">Instructor</span>
                    <span className="font-medium text-gray-900 truncate ml-2">
                      {certificate.instructorName || 'Mansol Hab School'}
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
            Complete your courses to earn certificates. Each completed course qualifies for a professional certificate.
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

      {/* ========== VERIFICATION INFO SECTION ========== */}
      {certificates.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <HiCheckCircle className="w-5 h-5 text-green-600" />
            Certificate Verification
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mb-4">
            All certificates are digitally verifiable. Share the verification URL with employers to confirm authenticity.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <h3 className="text-xs font-semibold text-gray-900 mb-2">Verification Process</h3>
              <ul className="space-y-1 text-xs text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">•</span>
                  Each certificate has a unique verification URL
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">•</span>
                  Instant online verification 24/7
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">•</span>
                  Digital records maintained for 10 years
                </li>
              </ul>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <h3 className="text-xs font-semibold text-gray-900 mb-2">How to Share</h3>
              <ul className="space-y-1 text-xs text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  Download PDF/HTML certificate
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  Share verification link via email
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  Add to LinkedIn profile
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}