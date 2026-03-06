// app/verify-certificate/page.tsx
'use client';

import { useState } from 'react';
import {
  HiAcademicCap,
  HiCheckCircle,
  HiXCircle,
  HiSearch,
  HiUser,
  HiCalendar,
  HiBookOpen,
  HiStar,
  HiRefresh
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

interface CertificateData {
  certificateNumber: string;
  studentName: string;
  courseName: string;
  instructorName: string;
  issueDate: string;
  courseDuration?: string;
  courseLevel?: string;
  courseImage?: string;
  status: string;
  isValid: boolean;
}

export default function VerifyCertificatePage() {
  const [certNumber, setCertNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!certNumber.trim()) {
      setError('Please enter a certificate number');
      return;
    }

    setVerifying(true);
    setError(null);
    setCertificate(null);

    try {
      const response = await fetch(`/api/public/verify-certificate/${encodeURIComponent(certNumber.trim())}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to verify certificate');
      }

      if (result.success) {
        setCertificate(result.data);
        
        // Add to recent searches
        setRecentSearches(prev => {
          const newSearches = [certNumber, ...prev.filter(s => s !== certNumber)].slice(0, 5);
          return newSearches;
        });
      }
    } catch (error: any) {
      console.error('Error verifying certificate:', error);
      setError(error.message || 'Certificate not found or invalid');
    } finally {
      setVerifying(false);
    }
  };

  const handleQuickVerify = (number: string) => {
    setCertNumber(number);
    setTimeout(() => {
      const form = document.getElementById('verify-form') as HTMLFormElement;
      if (form) form.requestSubmit();
    }, 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-3 bg-white/20 rounded-full mb-4">
              <HiAcademicCap className="w-8 h-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Certificate Verification</h1>
            <p className="text-lg text-indigo-100 max-w-2xl mx-auto">
              Verify the authenticity of certificates issued by our institution. 
              Enter the certificate number below to check its validity.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-8">
          <form id="verify-form" onSubmit={handleVerify} className="space-y-4">
            <div>
              <label htmlFor="cert-number" className="block text-sm font-medium text-gray-700 mb-2">
                Certificate Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="cert-number"
                  value={certNumber}
                  onChange={(e) => setCertNumber(e.target.value.toUpperCase())}
                  placeholder="e.g., CERT-2024-PIPE-ABC123"
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={verifying}
                />
                <HiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Enter the complete certificate number as shown on the certificate
              </p>
            </div>

            <button
              type="submit"
              disabled={verifying || !certNumber.trim()}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verifying ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <HiSearch className="w-5 h-5" />
                  Verify Certificate
                </>
              )}
            </button>
          </form>

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Recent Searches:</p>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search) => (
                  <button
                    key={search}
                    onClick={() => handleQuickVerify(search)}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 flex items-start gap-3">
            <HiXCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Verification Failed</h3>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Certificate Result */}
        {certificate && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Status Banner */}
            <div className={`px-6 py-4 ${
              certificate.isValid 
                ? 'bg-green-600' 
                : 'bg-red-600'
            }`}>
              <div className="flex items-center gap-3">
                {certificate.isValid ? (
                  <HiCheckCircle className="w-6 h-6 text-white" />
                ) : (
                  <HiXCircle className="w-6 h-6 text-white" />
                )}
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {certificate.isValid ? 'Valid Certificate' : 'Invalid Certificate'}
                  </h2>
                  <p className="text-sm text-white/90">
                    {certificate.isValid 
                      ? 'This certificate has been verified and is authentic'
                      : 'This certificate is not valid or has been revoked'}
                  </p>
                </div>
              </div>
            </div>

            {/* Certificate Details */}
            <div className="p-6">
              {/* Certificate Display */}
              <div className="border-8 border-double border-indigo-600 p-8 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 mb-6">
                <div className="text-center">
                  {certificate.courseImage && (
                    <img 
                      src={certificate.courseImage} 
                      alt={certificate.courseName}
                      className="w-24 h-24 object-cover rounded-full mx-auto mb-4 border-4 border-indigo-600"
                    />
                  )}
                  <HiAcademicCap className="w-16 h-16 mx-auto text-indigo-600 mb-4" />
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Certificate of Completion</h1>
                  <p className="text-gray-600 mb-4">This is to certify that</p>
                  <p className="text-2xl font-bold text-indigo-600 mb-4">{certificate.studentName}</p>
                  <p className="text-gray-600 mb-2">has successfully completed the course</p>
                  <p className="text-xl font-bold text-gray-900 mb-4">{certificate.courseName}</p>
                  
                  {certificate.courseDuration && (
                    <p className="text-sm text-gray-600 mb-2">
                      Duration: {certificate.courseDuration}
                    </p>
                  )}
                  
                  <div className="flex justify-between items-center mt-8 text-sm border-t pt-6">
                    <div>
                      <p className="text-gray-500">Issue Date</p>
                      <p className="font-bold text-gray-900">{formatDate(certificate.issueDate)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Certificate ID</p>
                      <p className="font-bold text-gray-900">{certificate.certificateNumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Instructor</p>
                      <p className="font-bold text-gray-900">{certificate.instructorName}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Verification Details</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-xs text-gray-500">Certificate Number</dt>
                    <dd className="text-sm font-medium text-gray-900">{certificate.certificateNumber}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500">Issue Date</dt>
                    <dd className="text-sm font-medium text-gray-900">{formatDate(certificate.issueDate)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500">Student Name</dt>
                    <dd className="text-sm font-medium text-gray-900">{certificate.studentName}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500">Course Name</dt>
                    <dd className="text-sm font-medium text-gray-900">{certificate.courseName}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500">Instructor</dt>
                    <dd className="text-sm font-medium text-gray-900">{certificate.instructorName}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500">Status</dt>
                    <dd className="text-sm">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        certificate.isValid 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {certificate.isValid ? (
                          <>
                            <HiCheckCircle className="w-3 h-3" />
                            Valid
                          </>
                        ) : (
                          <>
                            <HiXCircle className="w-3 h-3" />
                            {certificate.status || 'Invalid'}
                          </>
                        )}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Verification Seal */}
              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-2 text-xs text-gray-500">
                  <HiCheckCircle className="w-4 h-4 text-green-600" />
                  <span>Verified by LMS Certificate Authority</span>
                  <span className="text-gray-300">•</span>
                  <HiRefresh className="w-4 h-4 text-indigo-600" />
                  <span>Real-time verification</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <HiCheckCircle className="w-4 h-4 text-indigo-600" />
              </div>
              <h3 className="font-medium text-gray-900">Instant Verification</h3>
            </div>
            <p className="text-xs text-gray-600">
              Certificates are verified in real-time against our database
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <HiUser className="w-4 h-4 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900">Secure & Authentic</h3>
            </div>
            <p className="text-xs text-gray-600">
              Each certificate has a unique number that cannot be forged
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <HiStar className="w-4 h-4 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900">Free Service</h3>
            </div>
            <p className="text-xs text-gray-600">
              Anyone can verify certificates without any cost
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}