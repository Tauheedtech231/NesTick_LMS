// lms/Student_Portal/certificates/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  HiAcademicCap,
  HiDownload,
  HiEye,
  HiRefresh,
  HiCheckCircle,
  HiClock,
  HiXCircle,
  HiCalendar,
  HiUser,
  HiBookOpen,
  HiStar
} from 'react-icons/hi';
import { Loader2 } from 'lucide-react';

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

interface Certificate {
  id: string;
  certificate_number: string;
  student_name: string;
  course_title: string;
  instructor_name: string;
  issue_date: string;
  download_count: number;
  last_downloaded: string | null;
  course_duration?: string;
  course_level?: string;
  course_image?: string;
}

interface EnrolledCourse {
  id: string;
  title: string;
  progress: number;
  completedSlides: number;
  totalSlides: number;
  isEligible: boolean;
  hasCertificate: boolean;
}

export default function CertificatesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [eligibleCourses, setEligibleCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [issuingId, setIssuingId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      loadUserData();
    }
  }, [isMounted]);

  const loadUserData = async () => {
    try {
      const userStr = localStorage.getItem('currentUser');
      if (!userStr) {
        router.push('/lms/auth/login?type=student');
        return;
      }

      const userData = JSON.parse(userStr);
      if (userData.role !== 'student') {
        router.push('/lms/auth/login?type=student');
        return;
      }

      setUser(userData);
      await Promise.all([
        fetchCertificates(userData.email),
        fetchEligibleCourses(userData.email)
      ]);
    } catch (error) {
      console.error('Error loading user:', error);
      setError('Failed to load user data');
      setLoading(false);
    }
  };

  const fetchCertificates = async (email: string) => {
    try {
      const response = await fetch(`/api/students/certificates?email=${encodeURIComponent(email)}`);
      const result = await response.json();

      if (response.ok && result.success) {
        setCertificates(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
    }
  };

  const fetchEligibleCourses = async (email: string) => {
    try {
      const enrollResponse = await fetch(`/api/students/enrollments?email=${encodeURIComponent(email)}`);
      const enrollResult = await enrollResponse.json();

      if (!enrollResponse.ok || !enrollResult.success) {
        return;
      }

      const courses = await Promise.all(
        enrollResult.data.map(async (enrollment: any) => {
          const eligibilityResponse = await fetch(
            `/api/students/certificate/check-eligibility?studentEmail=${encodeURIComponent(email)}&courseId=${enrollment.course_id}`
          );
          const eligibilityResult = await eligibilityResponse.json();

          return {
            id: enrollment.course_id,
            title: enrollment.course_title || 'Course',
            progress: eligibilityResult.data?.progress || 0,
            completedSlides: eligibilityResult.data?.completed || 0,
            totalSlides: eligibilityResult.data?.total || 0,
            isEligible: eligibilityResult.data?.eligible || false,
            hasCertificate: eligibilityResult.data?.hasCertificate || false
          };
        })
      );

      setEligibleCourses(courses.filter((c: any) => c.isEligible && !c.hasCertificate));
    } catch (error) {
      console.error('Error fetching eligible courses:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    if (!user?.email) return;
    setRefreshing(true);
    await Promise.all([
      fetchCertificates(user.email),
      fetchEligibleCourses(user.email)
    ]);
    setRefreshing(false);
  };

  const handleIssueCertificate = async (courseId: string) => {
    if (!user?.email) return;
    
    setIssuingId(courseId);
    setError(null);

    try {
      const response = await fetch('/api/students/certificate/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentEmail: user.email,
          courseId
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to issue certificate');
      }

      if (result.success) {
        await fetchCertificates(user.email);
        await fetchEligibleCourses(user.email);
      }
    } catch (error: any) {
      console.error('Error issuing certificate:', error);
      setError(error.message || 'Failed to issue certificate');
    } finally {
      setIssuingId(null);
    }
  };

  // ✅ FIXED: Download function with proper endpoint
  const handleDownload = async (certId: string) => {
    try {
      // First, fetch certificate data
      const response = await fetch(`/api/students/certificate/${certId}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error('Failed to fetch certificate');
      }

      // Create certificate HTML content
      const cert = result.data;
      const htmlContent = generateCertificateHTML(cert);
      
      // Create blob and download
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${cert.certificate_number}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      // Refresh certificates to update download count
      setTimeout(() => {
        if (user?.email) fetchCertificates(user.email);
      }, 1000);

    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert('Failed to download certificate. Please try again.');
    }
  };

  // ✅ Generate certificate HTML
  const generateCertificateHTML = (cert: any) => {
    const issueDate = new Date(cert.issue_date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Certificate of Completion</title>
        <style>
          body {
            margin: 0;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: #f3f4f6;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          .certificate {
            max-width: 900px;
            width: 100%;
            background: white;
            border: 16px double #4f46e5;
            border-radius: 24px;
            padding: 40px;
            background: linear-gradient(135deg, #fffbeb 0%, #fff7ed 100%);
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          }
          .icon {
            width: 80px;
            height: 80px;
            margin: 0 auto 20px;
            background: #4f46e5;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 40px;
          }
          h1 {
            text-align: center;
            color: #1f2937;
            font-size: 32px;
            margin-bottom: 10px;
            font-weight: 700;
          }
          .subtitle {
            text-align: center;
            color: #6b7280;
            font-size: 16px;
            margin-bottom: 30px;
          }
          .name {
            text-align: center;
            color: #4f46e5;
            font-size: 28px;
            font-weight: 700;
            margin: 20px 0;
            padding: 10px 0;
            border-top: 2px dashed #4f46e5;
            border-bottom: 2px dashed #4f46e5;
          }
          .course {
            text-align: center;
            font-size: 20px;
            color: #1f2937;
            margin: 20px 0;
          }
          .details {
            display: flex;
            justify-content: space-between;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
          }
          .detail-item {
            text-align: center;
          }
          .detail-label {
            color: #6b7280;
            font-size: 12px;
            margin-bottom: 5px;
          }
          .detail-value {
            color: #1f2937;
            font-size: 14px;
            font-weight: 600;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            color: #9ca3af;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="icon">🎓</div>
          <h1>Certificate of Completion</h1>
          <div class="subtitle">This is to certify that</div>
          <div class="name">${cert.student_name}</div>
          <div class="course">has successfully completed the course</div>
          <div class="name" style="font-size: 24px; color: #b45309;">${cert.course_title}</div>
          
          <div class="details">
            <div class="detail-item">
              <div class="detail-label">Issue Date</div>
              <div class="detail-value">${issueDate}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Certificate ID</div>
              <div class="detail-value">${cert.certificate_number}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Instructor</div>
              <div class="detail-value">${cert.instructor_name}</div>
            </div>
          </div>
          
          <div class="footer">
            This certificate is issued by the LMS platform and is valid for verification at any time.
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const formatLastDownloaded = (dateString: string | null) => {
    if (!dateString) return 'Never';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      return date.toLocaleDateString();
    } catch {
      return 'Never';
    }
  };

  if (!isMounted || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: BRAND_COLORS.deepRed }} />
          <p className="text-gray-600">Loading certificates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <HiAcademicCap className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-2">My Certificates</h1>
                <p className="text-amber-100">View and download your course certificates</p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50"
            >
              <HiRefresh className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Certificates</p>
          <p className="text-2xl font-bold text-gray-900">{certificates.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Eligible Courses</p>
          <p className="text-2xl font-bold text-green-600">{eligibleCourses.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Last Downloaded</p>
          <p className="text-sm font-medium text-gray-900">
            {certificates.length > 0 
              ? formatLastDownloaded(certificates[0].last_downloaded)
              : 'Never'}
          </p>
        </div>
      </div>

      {/* Eligible Courses Section */}
      {eligibleCourses.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Ready for Certificate</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {eligibleCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-xl border-2 border-amber-200 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{course.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {course.completedSlides}/{course.totalSlides} lessons completed
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    100% Complete
                  </span>
                </div>
                <button
                  onClick={() => handleIssueCertificate(course.id)}
                  disabled={issuingId === course.id}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
                >
                  {issuingId === course.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Issuing...
                    </>
                  ) : (
                    <>
                      <HiAcademicCap className="w-4 h-4" />
                      Get Certificate
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certificates Grid */}
      {certificates.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {certificates.map((cert) => (
            <div key={cert.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <HiCheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{cert.course_title}</h3>
                    <p className="text-xs text-gray-500">Certificate of Completion</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  Issued
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <HiUser className="w-4 h-4 text-gray-400" />
                  <span>{cert.student_name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <HiCalendar className="w-4 h-4 text-gray-400" />
                  <span>Issued: {formatDate(cert.issue_date)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <HiBookOpen className="w-4 h-4 text-gray-400" />
                  <span>ID: {cert.certificate_number}</span>
                </div>
                {cert.last_downloaded && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <HiDownload className="w-4 h-4 text-gray-400" />
                    <span>Downloaded {formatLastDownloaded(cert.last_downloaded)}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleDownload(cert.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <HiDownload className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={() => {
                    setSelectedCert(cert);
                    setShowPreview(true);
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <HiEye className="w-4 h-4" />
                  Preview
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4">
            <HiAcademicCap className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Certificates Yet</h3>
          <p className="text-gray-500">Complete your courses to earn certificates</p>
        </div>
      )}

      {/* Certificate Preview Modal */}
      {showPreview && selectedCert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold">Certificate Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <HiXCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="border-8 border-double border-indigo-600 p-8 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50">
                <div className="text-center">
                  <HiAcademicCap className="w-16 h-16 mx-auto text-indigo-600 mb-4" />
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Certificate of Completion</h1>
                  <p className="text-gray-600 mb-4">This is to certify that</p>
                  <p className="text-2xl font-bold text-indigo-600 mb-4">{selectedCert.student_name}</p>
                  <p className="text-gray-600 mb-2">has successfully completed the course</p>
                  <p className="text-xl font-bold text-gray-900 mb-4">{selectedCert.course_title}</p>
                  
                  <div className="flex justify-between items-center mt-8 text-sm">
                    <div>
                      <p className="text-gray-500">Issue Date</p>
                      <p className="font-bold">{formatDate(selectedCert.issue_date)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Certificate ID</p>
                      <p className="font-bold">{selectedCert.certificate_number}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Instructor</p>
                      <p className="font-bold">{selectedCert.instructor_name}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => handleDownload(selectedCert.id)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                >
                  <HiDownload className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}