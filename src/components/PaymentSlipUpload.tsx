"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { 
  HiUpload, 
  HiCheckCircle,
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

  const allowedFileTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  const maxFileSize = 2 * 1024 * 1024; // 2MB

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!allowedFileTypes.includes(selectedFile.type)) {
      alert('Please upload only JPG or PNG files (max 2MB)');
      return;
    }

    // Validate file size
    if (selectedFile.size > maxFileSize) {
      alert('File size must be less than 2MB');
      return;
    }

    setFile(selectedFile);

    // Generate preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Image compression function
  const compressImage = (dataUrl: string, maxWidth: number = 800, maxHeight: number = 600, quality: number = 0.7): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = dataUrl;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw image with new dimensions
        ctx.drawImage(img, 0, 0, width, height);
        
        // Determine image format based on original
        const format = dataUrl.includes('image/png') ? 'image/png' : 'image/jpeg';
        const compressed = canvas.toDataURL(format, quality);
        resolve(compressed);
      };
      
      img.onerror = () => {
        resolve(dataUrl);
      };
    });
  };

  const storeUploadedFileInLocalStorage = async (file: File, previewDataUrl: string | null) => {
    try {
      // Get existing uploaded files
      const existingFilesStr = localStorage.getItem('uploadedFiles');
      const existingFiles = existingFilesStr ? JSON.parse(existingFilesStr) : [];
      
      // Compress image for storage
      let compressedImage = previewDataUrl;
      if (previewDataUrl && previewDataUrl.length > 100000) { // If > 100KB
        compressedImage = await compressImage(previewDataUrl, 800, 600, 0.7);
      }
      
      // Create file object with ALL necessary data
      const fileToStore = {
        id: `file-${Date.now()}`,
        name: file.name,
        studentName: enrollmentData?.fullName || 'Unknown Student',
        email: enrollmentData?.email || '',
        phone: enrollmentData?.phone || '',
        course: enrollmentData?.course || 'Unknown Course',
        amount: enrollmentData?.price || 'PKR 25,000',
        transactionId: transactionId || `TXN-${Date.now()}`,
        paymentMethod: paymentMethod,
        paymentDate: paymentDate || new Date().toISOString().split('T')[0],
        thumbnail: compressedImage, // ACTUAL base64 string
        hasPreview: !!compressedImage,
        uploadDate: new Date().toISOString(),
        enrollmentId: enrollmentData?.enrollmentId || `ENR-${Date.now()}`,
        // Additional data for admin
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        address: enrollmentData?.address || '',
        city: enrollmentData?.city || '',
        education: enrollmentData?.education || '',
        emergencyContact: enrollmentData?.emergencyContact || '',
        dateOfBirth: enrollmentData?.dateOfBirth || ''
      };
      
      console.log('📁 File object created:', {
        studentName: fileToStore.studentName,
        thumbnailLength: fileToStore.thumbnail ? fileToStore.thumbnail.length : 0,
        thumbnailType: typeof fileToStore.thumbnail,
        hasThumbnail: !!fileToStore.thumbnail,
        fileType: file.type
      });
      
      // Add to array (keep only last 10 files)
      const updatedFiles = [fileToStore, ...existingFiles].slice(0, 10);
      
      // Store in localStorage
      localStorage.setItem('uploadedFiles', JSON.stringify(updatedFiles));
      
      return fileToStore;
    } catch (error) {
      console.error('❌ Error storing file:', error);
      return null;
    }
  };

  const storePaymentSubmission = (fileMetadata: any) => {
    try {
      // Create payment data
      const paymentData = {
        transactionId,
        paymentMethod,
        paymentDate: paymentDate || new Date().toISOString().split('T')[0],
        uploadedAt: new Date().toISOString(),
        status: 'pending_verification',
        studentName: enrollmentData?.fullName || 'Unknown',
        course: enrollmentData?.course || 'Unknown',
        amount: enrollmentData?.price || 'N/A',
        email: enrollmentData?.email || '',
        phone: enrollmentData?.phone || '',
        fileId: fileMetadata?.id || null,
        hasFile: !!fileMetadata,
        // Store screenshot URL if available
        screenshotUrl: fileMetadata?.thumbnail || null
      };
      
      // Store payment submission
      localStorage.setItem('paymentSubmission', JSON.stringify(paymentData));
      
      console.log('✅ Payment data stored:', {
        transactionId,
        studentName: paymentData.studentName
      });
      
      return true;
    } catch (error) {
      console.error('❌ Error storing payment data:', error);
      
      // Store minimal data as fallback
      try {
        const minimalData = {
          txn: transactionId,
          method: paymentMethod,
          date: paymentDate,
          student: enrollmentData?.fullName || 'Student',
          course: enrollmentData?.course || 'Course',
          status: 'pending'
        };
        
        localStorage.setItem('payment_minimal', JSON.stringify(minimalData));
        return true;
      } catch (e) {
        console.error('Even minimal storage failed:', e);
        return false;
      }
    }
  };

  const simulateUpload = async () => {
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 150);

    try {
      // Store file metadata with thumbnail
      let fileMetadata = null;
      if (file && preview) {
        fileMetadata = await storeUploadedFileInLocalStorage(file, preview);
        
        if (!fileMetadata) {
          throw new Error('Failed to store file metadata');
        }
        
        console.log('✅ File metadata stored successfully:', {
          id: fileMetadata.id,
          name: fileMetadata.studentName,
          thumbnailStored: !!fileMetadata.thumbnail
        });
      }
      
      // Store payment submission
      const paymentStored = storePaymentSubmission(fileMetadata);
      
      if (!paymentStored) {
        throw new Error('Failed to store payment data');
      }
      
      // Complete progress
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      console.log('✅ Upload completed successfully!');
      
      // Wait a moment then complete
      setTimeout(() => {
        onComplete();
      }, 500);
      
    } catch (error) {
      console.error('❌ Upload error:', error);
      clearInterval(progressInterval);
      alert('Upload failed. Please try again.');
      setIsUploading(false);
    }
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

    if (file.size > maxFileSize) {
      alert('File is too large. Please upload an image under 2MB.');
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
          <p className="text-xs text-green-600 mt-1">
            ✅ PNG and JPG files supported (max 2MB)
          </p>
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
            Payment Slip / Receipt * (JPG/PNG, max 2MB)
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
                PNG, JPG up to 2MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png"
                className="hidden"
              />
            </div>
          ) : (
            <div className="border rounded-xl p-6"
              style={{ borderColor: BRAND_COLORS.softGrey }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <HiPhotograph className="w-8 h-8 mr-3 text-blue-500" />
                  <div>
                    <h4 className="font-medium">{file.name}</h4>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type.split('/')[1].toUpperCase()}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      ✅ Ready to upload
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

              {preview && (
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
              <span className="text-sm text-gray-600">PNG and JPG files are supported</span>
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