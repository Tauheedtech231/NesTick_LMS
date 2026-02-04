"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { 
  HiUpload, 
  HiCheckCircle, 
  HiXCircle,
  HiDocumentText,
  HiPhotograph,
  HiCloudUpload,
  HiTrash,
  HiEye
} from "react-icons/hi";

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

interface PaymentSlipUploadProps {
  enrollmentData: any;
  onComplete: () => void;
}

export default function PaymentSlipUpload({ enrollmentData, onComplete }: PaymentSlipUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('jazzcash');
  const [paymentDate, setPaymentDate] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedFileTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  const maxFileSize = 5 * 1024 * 1024; // 5MB

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!allowedFileTypes.includes(selectedFile.type)) {
      alert('Please upload only JPG, PNG, or PDF files');
      return;
    }

    // Validate file size
    if (selectedFile.size > maxFileSize) {
      alert('File size must be less than 5MB');
      return;
    }

    setFile(selectedFile);

    // Generate preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const simulateUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          
          // Store payment data in localStorage
          const paymentData = {
            ...enrollmentData,
            transactionId,
            paymentMethod,
            paymentDate: paymentDate || new Date().toISOString(),
            uploadedAt: new Date().toISOString(),
            status: 'pending_verification'
          };
          localStorage.setItem('paymentSubmission', JSON.stringify(paymentData));
          
          // Call onComplete after a delay
          setTimeout(onComplete, 1000);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      alert('Please upload your payment slip');
      return;
    }

    if (!transactionId.trim()) {
      alert('Please enter your transaction ID');
      return;
    }

    simulateUpload();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
    >
      <div className="flex items-center mb-8">
        <HiCloudUpload className="w-8 h-8 mr-3" style={{ color: BRAND_COLORS.deepRed }} />
        <div>
          <h2 className="text-2xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
            Upload Payment Slip
          </h2>
          <p className="text-gray-600">Upload your payment slip for verification</p>
        </div>
      </div>

      {/* Progress Bar */}
      {isUploading && (
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${uploadProgress}%`,
                backgroundColor: BRAND_COLORS.deepRed
              }}
            />
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Payment Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Transaction ID / Reference Number *
            </label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Enter transaction ID from receipt"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Find this on your payment receipt
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Payment Method *
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
              required
            >
              <option value="jazzcash">JazzCash</option>
              <option value="easypaisa">EasyPaisa</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cash">Cash Deposit</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Payment Date *
            </label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Amount Paid *
            </label>
            <input
              type="text"
              value={enrollmentData.price}
              readOnly
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 font-bold"
              style={{ color: BRAND_COLORS.deepRed }}
            />
          </div>
        </div>

        {/* File Upload Area */}
        <div>
          <label className="block text-sm font-medium mb-4 text-gray-700">
            Payment Slip / Receipt *
          </label>
          
          {!file ? (
            <div 
              className="border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 hover:border-blue-400 hover:bg-blue-50"
              onClick={() => fileInputRef.current?.click()}
              style={{ borderColor: BRAND_COLORS.softGrey }}
            >
              <HiCloudUpload className="w-16 h-16 mx-auto mb-4" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
              <div className="mb-2">
                <span className="font-semibold text-blue-600">Click to upload</span>
                <span className="text-gray-600"> or drag and drop</span>
              </div>
              <p className="text-sm text-gray-500">
                PNG, JPG, PDF up to 5MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
              />
            </div>
          ) : (
            <div className="border rounded-xl p-6"
              style={{ borderColor: BRAND_COLORS.softGrey }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {file.type.startsWith('image/') ? (
                    <HiPhotograph className="w-8 h-8 mr-3 text-blue-500" />
                  ) : (
                    <HiDocumentText className="w-8 h-8 mr-3 text-blue-500" />
                  )}
                  <div>
                    <h4 className="font-medium">{file.name}</h4>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type.split('/')[1].toUpperCase()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => window.open(preview || '#', '_blank')}
                    className="flex items-center px-3 py-2 rounded-lg border hover:bg-gray-50 transition-colors"
                    style={{ 
                      borderColor: BRAND_COLORS.teal,
                      color: BRAND_COLORS.teal
                    }}
                  >
                    <HiEye className="w-4 h-4 mr-1" />
                    Preview
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="flex items-center px-3 py-2 rounded-lg border hover:bg-red-50 transition-colors"
                    style={{ 
                      borderColor: BRAND_COLORS.deepRed,
                      color: BRAND_COLORS.deepRed
                    }}
                  >
                    <HiTrash className="w-4 h-4 mr-1" />
                    Remove
                  </button>
                </div>
              </div>

              {preview && file.type.startsWith('image/') && (
                <div className="mt-4">
                  <img
                    src={preview}
                    alt="Payment slip preview"
                    className="max-w-md mx-auto rounded-lg shadow border border-gray-200"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Upload Guidelines */}
        <div className="p-6 rounded-lg border"
          style={{ 
            backgroundColor: `${BRAND_COLORS.darkNavy}05`,
            borderColor: BRAND_COLORS.softGrey
          }}>
          <h4 className="font-bold mb-4 flex items-center">
            <HiCheckCircle className="w-5 h-5 mr-2" style={{ color: BRAND_COLORS.teal }} />
            Upload Guidelines
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <HiCheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
              <span className="text-sm text-gray-600">Ensure slip is clear and readable</span>
            </div>
            <div className="flex items-start">
              <HiCheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
              <span className="text-sm text-gray-600">Transaction ID should be visible</span>
            </div>
            <div className="flex items-start">
              <HiCheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
              <span className="text-sm text-gray-600">Payment date must match receipt</span>
            </div>
            <div className="flex items-start">
              <HiCheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
              <span className="text-sm text-gray-600">Amount should match course fee</span>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="p-6 rounded-lg border border-yellow-200 bg-yellow-50">
          <div className="flex">
            <HiEye className="w-6 h-6 mr-3 text-yellow-600 flex-shrink-0" />
            <div>
              <h4 className="font-bold mb-2 text-yellow-800">Important Notice</h4>
              <p className="text-yellow-700 text-sm">
                Your enrollment will be confirmed only after payment verification by our admin team. 
                This process usually takes 24-48 hours. You will receive login credentials via email 
                once verification is complete. Keep your payment receipt safe for reference.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isUploading || !file}
            className="w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: BRAND_COLORS.deepRed,
              color: BRAND_COLORS.white
            }}
          >
            {isUploading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Uploading & Submitting...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <HiUpload className="w-5 h-5 mr-2" />
                Submit for Verification
              </span>
            )}
          </button>
          
          <p className="text-sm text-gray-500 text-center mt-4">
            By submitting, you confirm that all information is accurate
          </p>
        </div>
      </form>
    </motion.div>
  );
}