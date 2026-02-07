// components/CertificateCard.tsx
'use client';

import { HiDownload, HiEye, HiAcademicCap } from 'react-icons/hi';

type CertificateCardProps = {
  id: string;
  certificateId: string;
  studentName: string;
  courseName: string;
  completionDate: string;
  issueDate: string;
  certificateUrl?: string;
  onView: (certificateId: string) => void;
  onDownload: (certificateId: string) => void;
};

export default function CertificateCard({
  id,
  certificateId,
  studentName,
  courseName,
  completionDate,
  issueDate,
  certificateUrl,
  onView,
  onDownload,
}: CertificateCardProps) {
  const handleView = () => onView(certificateId);
  const handleDownload = () => onDownload(certificateId);

  return (
    <div className="bg-white rounded-2xl p-5">
      {/* Top Section: Course + Verified */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
            <HiAcademicCap className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{courseName}</h3>
            <p className="text-sm text-gray-600 truncate">Certificate ID: {certificateId}</p>
          </div>
        </div>
        <span className="text-xs px-3 py-1 bg-green-100 text-green-800 rounded-full font-medium whitespace-nowrap">
          VERIFIED
        </span>
      </div>

      {/* Info Section */}
      <div className="space-y-3 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Student Name</p>
            <p className="text-sm font-semibold text-gray-900 truncate">{studentName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Completion Date</p>
            <p className="text-sm font-semibold text-gray-900">
              {new Date(completionDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Issued Date</p>
          <p className="text-sm font-semibold text-gray-900">
            {new Date(issueDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
    <div className="flex flex-col sm:flex-row gap-2">
  <button
    onClick={handleView}
    className="w-full sm:flex-1 py-1.5 px-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-md text-sm font-medium hover:from-purple-700 hover:to-purple-900 transition-colors flex items-center justify-center"
  >
    <HiEye className="w-3.5 h-3.5 mr-1.5" />
    View Certificate
  </button>

  <button
    onClick={handleDownload}
    className="w-full sm:w-auto py-1.5 px-3 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
  >
    <HiDownload className="w-3.5 h-3.5 mr-1.5" />
    Download
  </button>
</div>

    </div>
  );
}
