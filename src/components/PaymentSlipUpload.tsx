// app/courses/components/PaymentSlipUpload.tsx
'use client';

import { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UploadData {
  enrollmentId: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  remarks?: string;
}

export default function PaymentSlipUpload() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [remarks, setRemarks] = useState('');
  const [uploadData, setUploadData] = useState<UploadData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploaded, setIsUploaded] = useState(false);

  useEffect(() => {
    // Check if enrollment exists
    const enrollmentData = localStorage.getItem('enrollmentData');
    if (!enrollmentData) {
      router.push('/courses');
      return;
    }

    // Check if voucher was generated
    const data = JSON.parse(enrollmentData);
    if (!data.voucherGenerated) {
      router.push('/courses');
      return;
    }

    // Check if already uploaded
    const uploaded = localStorage.getItem('paymentSlip');
    if (uploaded) {
      setUploadData(JSON.parse(uploaded));
      setIsUploaded(true);
    }
  }, [router]);

  const validateFile = (file: File) => {
    const errors: Record<string, string> = {};
    
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      errors.file = 'Only JPG, PNG, and PDF files are allowed';
    }
    
    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      errors.file = 'File size must be less than 5MB';
    }
    
    return errors;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    const fileErrors = validateFile(selectedFile);
    if (Object.keys(fileErrors).length > 0) {
      setErrors(fileErrors);
      setFile(null);
      return;
    }
    
    setFile(selectedFile);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setErrors({ file: 'Please select a payment slip to upload' });
      return;
    }
    
    setIsUploading(true);
    
    // Simulate upload process
    setTimeout(() => {
      const enrollmentData = JSON.parse(localStorage.getItem('enrollmentData') || '{}');
      
      // Create upload data
      const uploadData: UploadData = {
        enrollmentId: enrollmentData.enrollmentId,
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        remarks: remarks.trim() || undefined,
      };
      
      // Store in localStorage (in real app, this would be API call)
      localStorage.setItem('paymentSlip', JSON.stringify(uploadData));
      
      // Update enrollment status
      enrollmentData.paymentSlipUploaded = true;
      localStorage.setItem('enrollmentData', JSON.stringify(enrollmentData));
      
      setUploadData(uploadData);
      setIsUploaded(true);
      setIsUploading(false);
      setErrors({});
    }, 1500);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (isUploaded && uploadData) {
    return (
      <div className="max-w-2xl mx-auto">
        {/* Success State */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Slip Uploaded!</h1>
          <p className="text-gray-600">Your payment slip has been successfully submitted for verification</p>
        </div>

        {/* Upload Details Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{uploadData.fileName}</h3>
                <p className="text-sm text-gray-600">
                  {formatFileSize(uploadData.fileSize)} • Uploaded on{' '}
                  {new Date(uploadData.uploadedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {uploadData.remarks && (
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-medium text-gray-900 mb-2">Remarks:</h4>
                <p className="text-gray-700">{uploadData.remarks}</p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">What&apos;s Next?</h3>
              <ol className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <span className="text-sm font-semibold text-[#1E3A8A]">1</span>
                  </div>
                  <span>Our team will verify your payment within 24-48 hours</span>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <span className="text-sm font-semibold text-[#1E3A8A]">2</span>
                  </div>
                  <span>You will receive a confirmation email once verified</span>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <span className="text-sm font-semibold text-[#1E3A8A]">3</span>
                  </div>
                  <span>Access to course materials will be granted after verification</span>
                </li>
              </ol>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => router.push('/courses')}
                  className="flex-1 bg-white border border-[#1E3A8A] text-[#1E3A8A] 
                           font-semibold py-3 px-4 rounded-lg hover:bg-blue-50 
                           transition-all duration-300"
                >
                  Browse More Courses
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="flex-1 bg-[#F97316] hover:bg-[#EA580C] text-white 
                           font-semibold py-3 px-4 rounded-lg hover:scale-[1.02] 
                           transition-all duration-300"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Payment Slip</h1>
        <p className="text-gray-600">
          Upload your payment slip/bank receipt for verification
        </p>
      </div>

      {/* Upload Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        {/* File Upload Area */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Payment Slip / Bank Receipt *
          </label>
          
          <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
            file ? 'border-[#1E3A8A] bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}>
            <input
              type="file"
              id="payment-slip"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploading}
            />
            
            <label htmlFor="payment-slip" className="cursor-pointer">
              {file ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] rounded-full flex items-center justify-center mx-auto">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 mb-1">{file.name}</div>
                    <div className="text-sm text-gray-600">{formatFileSize(file.size)}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                    disabled={isUploading}
                  >
                    Remove File
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <Upload className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 mb-1">Click to upload</div>
                    <div className="text-sm text-gray-600">
                      JPG, PNG, or PDF (Max 5MB)
                    </div>
                  </div>
                </div>
              )}
            </label>
          </div>
          
          {errors.file && (
            <div className="mt-3 flex items-center space-x-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{errors.file}</span>
            </div>
          )}
        </div>

        {/* Remarks */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Remarks (Optional)
          </label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Add any additional notes about your payment..."
            className="w-full px-4 py-3 rounded-lg border border-gray-300 
                     focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 
                     outline-none transition-colors resize-none"
            rows={3}
            disabled={isUploading}
          />
        </div>

        {/* Instructions */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Important Instructions</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                <span className="text-xs font-semibold text-[#1E3A8A]">✓</span>
              </div>
              <span>Ensure the payment slip is clear and readable</span>
            </li>
            <li className="flex items-start">
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                <span className="text-xs font-semibold text-[#1E3A8A]">✓</span>
              </div>
              <span>Transaction ID/Reference should be visible</span>
            </li>
            <li className="flex items-start">
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                <span className="text-xs font-semibold text-[#1E3A8A]">✓</span>
              </div>
              <span>Upload within 24 hours of payment</span>
            </li>
          </ul>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!file || isUploading}
          className="w-full bg-[#F97316] hover:bg-[#EA580C] disabled:bg-gray-400 
                   text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 
                   hover:scale-[1.02] active:scale-95 shadow-md hover:shadow-lg 
                   disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isUploading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Uploading...</span>
            </div>
          ) : (
            'Submit Payment Slip'
          )}
        </button>
      </form>
    </div>
  );
}