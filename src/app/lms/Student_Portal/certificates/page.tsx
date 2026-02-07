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
  HiDocumentText
} from 'react-icons/hi';
import CertificateCard from '../components/CertificateCard';

type Certificate = {
  id: string;
  certificateId: string;
  studentName: string;
  courseName: string;
  completionDate: string;
  issueDate: string;
  certificateUrl?: string;
  verificationUrl: string;
};

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([
    {
      id: 'cert-001',
      certificateId: 'CERT2024001',
      studentName: 'Demo Student',
      courseName: 'Safety Inspector Certification',
      completionDate: '2024-01-20',
      issueDate: '2024-01-25',
      certificateUrl: '/certificates/safety-inspector.pdf',
      verificationUrl: 'https://verify.mansolhab.com/cert-001'
    }
  ]);

  const [filteredCertificates, setFilteredCertificates] = useState<Certificate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [generatedCertificates, setGeneratedCertificates] = useState<string[]>([]);

  useEffect(() => {
    setFilteredCertificates(certificates);
    
    // Check localStorage for certificates
    const savedCertificates = localStorage.getItem('studentCertificates');
    if (savedCertificates) {
      const certs = JSON.parse(savedCertificates);
      setCertificates(certs);
      setFilteredCertificates(certs);
    }

    // Check for generated certificates
    const generated = localStorage.getItem('generatedCertificates');
    if (generated) {
      setGeneratedCertificates(JSON.parse(generated));
    }
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = certificates;

    if (searchTerm) {
      filtered = filtered.filter(cert =>
        cert.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.certificateId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.studentName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCourse !== 'all') {
      filtered = filtered.filter(cert => cert.courseName === selectedCourse);
    }

    setFilteredCertificates(filtered);
  }, [searchTerm, selectedCourse, certificates]);

  const courses = Array.from(new Set(certificates.map(c => c.courseName)));
  const totalCertificates = certificates.length;
  const recentCertificates = certificates.filter(cert => {
    const issueDate = new Date(cert.issueDate);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return issueDate >= thirtyDaysAgo;
  }).length;

  const handleViewCertificate = (certificateId: string) => {
    const cert = certificates.find(c => c.certificateId === certificateId);
    if (cert) {
      setSelectedCertificate(cert);
      // In a real app, this would open a modal or redirect to certificate view
      alert(`Viewing certificate: ${cert.certificateId}\n\nCourse: ${cert.courseName}\nStudent: ${cert.studentName}`);
    }
  };

  const handleDownloadCertificate = (certificateId: string) => {
    const cert = certificates.find(c => c.certificateId === certificateId);
    if (cert) {
      // Mock download functionality
      const blob = new Blob([
        `Certificate ID: ${cert.certificateId}\n` +
        `Course: ${cert.courseName}\n` +
        `Student: ${cert.studentName}\n` +
        `Completion Date: ${cert.completionDate}\n` +
        `Issue Date: ${cert.issueDate}\n` +
        `Verification URL: ${cert.verificationUrl}\n\n` +
        `This is to certify that ${cert.studentName} has successfully completed ` +
        `the ${cert.courseName} course on ${cert.completionDate}.`
      ], { type: 'text/plain' });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${cert.certificateId}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      alert(`Certificate ${cert.certificateId} downloaded successfully!`);
    }
  };

  const handleGenerateCertificate = () => {
    // Check completed courses
    const studentCoursesStr = localStorage.getItem('studentCourses');
    if (studentCoursesStr) {
      try {
        const courses = JSON.parse(studentCoursesStr);
        const completedCourses = courses.filter((c: any) => c.status === 'completed');
        
        if (completedCourses.length === 0) {
          alert('You need to complete a course first to generate a certificate!');
          return;
        }

        completedCourses.forEach((course: any) => {
          // Check if certificate already exists
          const exists = certificates.some(c => c.courseName === course.title);
          if (!exists) {
            const userStr = localStorage.getItem('currentUser');
            const user = userStr ? JSON.parse(userStr) : { fullName: 'Demo Student' };
            
            const newCertificate: Certificate = {
              id: `cert-${Date.now()}`,
              certificateId: `CERT${Date.now().toString().slice(-6)}`,
              studentName: user.fullName,
              courseName: course.title,
              completionDate: new Date().toISOString().split('T')[0],
              issueDate: new Date().toISOString().split('T')[0],
              verificationUrl: `https://verify.mansolhab.com/cert-${Date.now()}`
            };

            const updatedCertificates = [...certificates, newCertificate];
            setCertificates(updatedCertificates);
            setFilteredCertificates(updatedCertificates);
            localStorage.setItem('studentCertificates', JSON.stringify(updatedCertificates));
            
            // Track generated certificates
            const updatedGenerated = [...generatedCertificates, course.id];
            setGeneratedCertificates(updatedGenerated);
            localStorage.setItem('generatedCertificates', JSON.stringify(updatedGenerated));
          }
        });

        alert('Certificates generated successfully for completed courses!');
      } catch (error) {
        console.error('Error generating certificates:', error);
      }
    }
  };

  const handleVerifyCertificate = (certificateId: string) => {
    const cert = certificates.find(c => c.certificateId === certificateId);
    if (cert) {
      window.open(cert.verificationUrl, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
     <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl p-4 sm:p-5 md:p-6 text-white">
  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 md:gap-0">
    {/* Title and Description */}
    <div className="flex flex-col">
      <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2">
        Certificates & Achievements
      </h1>
      <p className="text-yellow-100 text-xs sm:text-sm">
        Your earned certifications and accomplishments
      </p>
    </div>

    {/* Stats */}
    <div className="flex items-center space-x-2 mt-2 md:mt-0">
      <div className="p-2.5 bg-yellow-700/30 rounded-lg flex items-center justify-center">
        <HiAcademicCap className="w-5 h-5 sm:w-6 sm:h-7 text-white" />
      </div>
      <div className="flex flex-col text-right">
        <span className="text-xl sm:text-2xl md:text-2xl font-bold">{totalCertificates}</span>
        <span className="text-xs sm:text-sm">Certificates</span>
      </div>
    </div>
  </div>
</div>


      {/* Stats */}
   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {/* Total Certificates */}
  <div className="bg-white rounded-2xl p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-400">Total Certificates</p>
        <p className="text-2xl font-bold text-gray-900">{totalCertificates}</p>
      </div>
      <div className="p-4 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
        <HiAcademicCap className="w-7 h-7" />
      </div>
    </div>
  </div>

  {/* Recent Certificates */}
  <div className="bg-white rounded-2xl p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-400">Recent (30 days)</p>
        <p className="text-2xl font-bold text-gray-900">{recentCertificates}</p>
      </div>
      <div className="p-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
        <HiCalendar className="w-7 h-7" />
      </div>
    </div>
  </div>

  {/* Ready to Generate */}
  <div className="bg-white rounded-2xl p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-400">Ready to Generate</p>
        <p className="text-2xl font-bold text-gray-900">
          {generatedCertificates.length > 0 ? 'Available' : 'None'}
        </p>
      </div>
      <div className="p-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
        <HiCheckCircle className="w-7 h-7" />
      </div>
    </div>
  </div>
</div>


      {/* Generate Certificates Section */}
 {generatedCertificates.length === 0 && (
  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
      
      {/* Text Section */}
      <div className="flex-1">
        <h2 className="text-lg font-bold text-purple-900 mb-2">Generate Certificates</h2>
        <p className="text-purple-700 text-sm sm:text-base">
          Complete courses to unlock certificates. Certificates are automatically generated when you reach 100% completion.
        </p>
      </div>

      {/* Button Section */}
      <button
        onClick={handleGenerateCertificate}
        className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-900 transition-colors"
      >
        Check for New Certificates
      </button>
    </div>
  </div>
)}

      {/* Search and Filter */}
     <div className="bg-white rounded-xl p-6">
  <div className="flex flex-col md:flex-row gap-4 md:gap-6">

    {/* Search Input */}
    <div className="flex-1 w-full">
      <div className="relative">
        <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search certificates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
        />
      </div>
    </div>

    {/* Filter Section */}
    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
      <select
        value={selectedCourse}
        onChange={(e) => setSelectedCourse(e.target.value)}
        className="w-full sm:w-auto px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
      >
        <option value="all">All Courses</option>
        {courses.map((course) => (
          <option key={course} value={course}>{course}</option>
        ))}
      </select>

      <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
        <HiFilter className="w-5 h-5" />
        <span className="font-medium">Filter</span>
      </button>
    </div>

  </div>
</div>


      {/* Certificates Grid */}
      {filteredCertificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCertificates.map(certificate => (
            <CertificateCard
              key={certificate.id}
              {...certificate}
              onView={handleViewCertificate}
              onDownload={handleDownloadCertificate}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <HiAcademicCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No certificates found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || selectedCourse !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Complete courses to earn certificates'}
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCourse('all');
            }}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-900 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Verification Section */}
    <div className="bg-white rounded-2xl p-6">
  <h2 className="text-xl font-bold text-gray-900 mb-4">Certificate Verification</h2>
  <p className="text-gray-600 mb-6 text-sm sm:text-base">
    All certificates issued by Mansol Hab School are digitally verifiable. Use the verification URL to confirm authenticity.
  </p>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    
    {/* Verification Process Card */}
    <div className="p-5 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
      <div className="flex items-center space-x-3 mb-3">
        <div className="p-2 rounded-full bg-green-200 text-green-600 flex items-center justify-center">
          <HiCheckCircle className="w-6 h-6" />
        </div>
        <h3 className="font-semibold text-gray-900">Verification Process</h3>
      </div>
      <ul className="space-y-2 text-gray-700 text-sm">
        <li>• Each certificate has a unique verification URL</li>
        <li>• Verification confirms course completion and authenticity</li>
        <li>• Employers can verify certificates online 24/7</li>
        <li>• Digital records maintained for 10 years</li>
      </ul>
    </div>

    {/* How to Share Card */}
    <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
      <div className="flex items-center space-x-3 mb-3">
        <div className="p-2 rounded-full bg-blue-200 text-blue-600 flex items-center justify-center">
          <HiDocumentText className="w-6 h-6" />
        </div>
        <h3 className="font-semibold text-gray-900">How to Share</h3>
      </div>
      <ul className="space-y-2 text-gray-700 text-sm">
        <li>• Download PDF copy for printing</li>
        <li>• Share verification URL with employers</li>
        <li>• Add to LinkedIn profile</li>
        <li>• Include in job applications</li>
      </ul>
    </div>

  </div>
</div>


      {/* Action Buttons */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-gray-900">Certificate Management</h3>
            <p className="text-sm text-gray-600">Manage and share your certificates</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleGenerateCertificate}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-900 transition-colors"
            >
              Generate New Certificates
            </button>
            <button className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Share All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}