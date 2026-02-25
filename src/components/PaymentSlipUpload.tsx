"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HiUpload, 
  HiCheckCircle,
  HiDocumentText,
  HiPhotograph,
  HiCloudUpload,
  HiTrash,
  HiEye,
  HiUser,
  HiMail,
  HiPhone,
  HiAcademicCap,
  HiCurrencyRupee,
  HiIdentification,
  HiHome,
  HiChat,
  HiBell,
  HiX
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  const [showDetails, setShowDetails] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState<'success' | 'error' | 'info'>('success');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedFileTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  const maxFileSize = 2 * 1024 * 1024; // 2MB

  // Debug: Log enrollment data on component mount
  useEffect(() => {
    console.log('📋 Enrollment Data Received:', enrollmentData);
  }, [enrollmentData]);

  // Auto-hide popup after 3 seconds
  useEffect(() => {
    if (showPopup) {
      const timer = setTimeout(() => {
        setShowPopup(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showPopup]);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setPopupMessage(message);
    setPopupType(type);
    setShowPopup(true);
  };

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
        whatsapp: enrollmentData?.whatsappNumber || '',
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
        passportNumber: enrollmentData?.passportNumber || '',
        address: enrollmentData?.address || '',
        city: enrollmentData?.city || '',
        education: enrollmentData?.education || '',
        dateOfBirth: enrollmentData?.dateOfBirth || ''
      };
      
      console.log('📁 File object created:', {
        studentName: fileToStore.studentName,
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        whatsapp: enrollmentData?.whatsappNumber || '',
        fileId: fileMetadata?.id || null,
        hasFile: !!fileMetadata,
        screenshotUrl: fileMetadata?.thumbnail || null,
        // Store complete enrollment data
        enrollmentDetails: {
          fullName: enrollmentData?.fullName,
          email: enrollmentData?.email,
          phone: enrollmentData?.phone,
          whatsapp: enrollmentData?.whatsappNumber,
          passportNumber: enrollmentData?.passportNumber,
          address: enrollmentData?.address,
          city: enrollmentData?.city,
          education: enrollmentData?.education,
          dateOfBirth: enrollmentData?.dateOfBirth,
          course: enrollmentData?.course,
          price: enrollmentData?.price,
          enrollmentId: enrollmentData?.enrollmentId
        }
      };
      
      // Store payment submission
      localStorage.setItem('paymentSubmission', JSON.stringify(paymentData));
      
      console.log('✅ Payment data stored with enrollment details');
      
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
        
        console.log('✅ File metadata stored successfully');
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
      
      // Show success popup ONLY on successful submit
      showNotification('Payment slip uploaded successfully! Verification in progress.', 'success');
      
      // Wait a moment then complete
      setTimeout(() => {
        onComplete();
      }, 2000);
      
    } catch (error) {
      console.error('❌ Upload error:', error);
      clearInterval(progressInterval);
      
      // Show error popup ONLY on failed submit
      showNotification('Upload failed. Please try again.', 'error');
      
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

    if (!paymentDate) {
      alert('Please select payment date');
      return;
    }

    if (file.size > maxFileSize) {
      alert('File is too large. Please upload an image under 2MB.');
      return;
    }

    simulateUpload();
  };

  return (
    <>
      {/* Cool Popup Notification - Only appears on submit */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ y: -100, opacity: 0, scale: 0.5 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -100, opacity: 0, scale: 0.5 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4"
          >
            <div 
              className="rounded-2xl shadow-2xl overflow-hidden backdrop-blur-lg"
              style={{ 
                backgroundColor: popupType === 'success' ? '#10B981' : popupType === 'error' ? '#EF4444' : '#3B82F6',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2), 0 10px 10px -5px rgba(0,0,0,0.1)'
              }}
            >
              <div className="relative p-4">
                {/* Animated background rings */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute inset-0 rounded-full bg-white/30"
                  style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
                />
                
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center space-x-3">
                    <motion.div
                      initial={{ rotate: 0 }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      {popupType === 'success' ? (
                        <HiCheckCircle className="w-8 h-8 text-white" />
                      ) : popupType === 'error' ? (
                        <HiX className="w-8 h-8 text-white" />
                      ) : (
                        <HiBell className="w-8 h-8 text-white" />
                      )}
                    </motion.div>
                    <div>
                      <p className="text-white font-bold text-lg">
                        {popupType === 'success' ? 'Success!' : popupType === 'error' ? 'Error!' : 'Info'}
                      </p>
                      <p className="text-white/90 text-sm">{popupMessage}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPopup(false)}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <HiX className="w-5 h-5" />
                  </button>
                </div>

                {/* Progress bar for auto-dismiss */}
                <motion.div
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 3, ease: "linear" }}
                  className="absolute bottom-0 left-0 h-1 bg-white/50"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 border border-gray-100 max-w-4xl mx-auto"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-0 mb-6 sm:mb-8">
          <div className="p-3 rounded-full" style={{ backgroundColor: `${BRAND_COLORS.deepRed}15` }}>
            <HiCloudUpload className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: BRAND_COLORS.deepRed }} />
          </div>
          <div className="sm:ml-4">
            <h2 className="text-xl sm:text-2xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
              Upload Payment Slip
            </h2>
            <p className="text-sm sm:text-base text-gray-600">Complete your enrollment by uploading payment proof</p>
            <p className="text-xs text-green-600 mt-1">
              ✅ PNG and JPG files supported (max 2MB)
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        {isUploading && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <motion.div 
                className="h-2.5 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
                style={{ backgroundColor: BRAND_COLORS.deepRed }}
              />
            </div>
          </motion.div>
        )}

        {/* Toggle Details Button */}
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="mb-6 flex items-center text-sm font-medium"
          style={{ color: BRAND_COLORS.deepRed }}
        >
          <HiEye className="w-4 h-4 mr-1" />
          {showDetails ? 'Hide' : 'Show'} Enrollment Details
        </button>

        {/* Enrollment Details Card - Shows User's Previously Entered Data */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8 overflow-hidden"
            >
              <div className="p-6 rounded-xl border" style={{ backgroundColor: `${BRAND_COLORS.darkNavy}02`, borderColor: BRAND_COLORS.softGrey }}>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <HiCheckCircle className="w-5 h-5 mr-2" style={{ color: BRAND_COLORS.teal }} />
                  Your Enrollment Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Personal Info */}
                  <div className="flex items-start p-3 bg-white rounded-lg">
                    <HiUser className="w-5 h-5 mr-3 mt-0.5" style={{ color: BRAND_COLORS.deepRed }} />
                    <div>
                      <p className="text-xs text-gray-500">Full Name</p>
                      <p className="font-medium">{enrollmentData?.fullName || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start p-3 bg-white rounded-lg">
                    <HiMail className="w-5 h-5 mr-3 mt-0.5" style={{ color: BRAND_COLORS.deepRed }} />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-medium">{enrollmentData?.email || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start p-3 bg-white rounded-lg">
                    <HiPhone className="w-5 h-5 mr-3 mt-0.5" style={{ color: BRAND_COLORS.deepRed }} />
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="font-medium">{enrollmentData?.phone || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start p-3 bg-white rounded-lg">
                    <HiChat className="w-5 h-5 mr-3 mt-0.5" style={{ color: BRAND_COLORS.deepRed }} />
                    <div>
                      <p className="text-xs text-gray-500">WhatsApp</p>
                      <p className="font-medium">{enrollmentData?.whatsappNumber || enrollmentData?.phone || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start p-3 bg-white rounded-lg">
                    <HiAcademicCap className="w-5 h-5 mr-3 mt-0.5" style={{ color: BRAND_COLORS.deepRed }} />
                    <div>
                      <p className="text-xs text-gray-500">Course</p>
                      <p className="font-medium">{enrollmentData?.course || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start p-3 bg-white rounded-lg">
                    <HiCurrencyRupee className="w-5 h-5 mr-3 mt-0.5" style={{ color: BRAND_COLORS.deepRed }} />
                    <div>
                      <p className="text-xs text-gray-500">Amount</p>
                      <p className="font-bold" style={{ color: BRAND_COLORS.deepRed }}>{enrollmentData?.price || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start p-3 bg-white rounded-lg">
                    <HiIdentification className="w-5 h-5 mr-3 mt-0.5" style={{ color: BRAND_COLORS.deepRed }} />
                    <div>
                      <p className="text-xs text-gray-500">Passport/CNIC</p>
                      <p className="font-medium">{enrollmentData?.passportNumber || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start p-3 bg-white rounded-lg">
                    <HiHome className="w-5 h-5 mr-3 mt-0.5" style={{ color: BRAND_COLORS.deepRed }} />
                    <div>
                      <p className="text-xs text-gray-500">City</p>
                      <p className="font-medium">{enrollmentData?.city || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                
                {enrollmentData?.enrollmentId && (
                  <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                    <p className="text-xs text-gray-500">Enrollment ID</p>
                    <p className="font-mono text-sm">{enrollmentData.enrollmentId}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#B11217] focus:border-transparent transition-all duration-200"
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
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#B11217] focus:border-transparent transition-all duration-200"
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
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#B11217] focus:border-transparent transition-all duration-200"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Amount Paid *
              </label>
              <input
                type="text"
                value={enrollmentData?.price || 'PKR 25,000'}
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
                className="border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 hover:border-[#B11217] hover:bg-[#B11217]/5"
                onClick={() => fileInputRef.current?.click()}
                style={{ borderColor: BRAND_COLORS.softGrey }}
              >
                <HiCloudUpload className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4" style={{ color: BRAND_COLORS.deepRed }} />
                <div className="mb-2">
                  <span className="font-semibold" style={{ color: BRAND_COLORS.deepRed }}>Click to upload</span>
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
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border rounded-xl p-4 sm:p-6"
                style={{ borderColor: BRAND_COLORS.softGrey }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center">
                    <div className="p-3 rounded-lg" style={{ backgroundColor: `${BRAND_COLORS.teal}15` }}>
                      <HiPhotograph className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: BRAND_COLORS.teal }} />
                    </div>
                    <div className="ml-4">
                      <h4 className="font-medium text-sm sm:text-base break-all">{file.name}</h4>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type.split('/')[1]?.toUpperCase()}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        ✅ Ready to upload
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 self-end sm:self-auto">
                    {preview && (
                      <button
                        type="button"
                        onClick={() => window.open(preview, '_blank')}
                        className="flex items-center px-3 py-2 rounded-lg border hover:bg-gray-50 transition-colors text-sm"
                        style={{ borderColor: BRAND_COLORS.teal, color: BRAND_COLORS.teal }}
                      >
                        <HiEye className="w-4 h-4 mr-1" />
                        Preview
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="flex items-center px-3 py-2 rounded-lg border hover:bg-red-50 transition-colors text-sm"
                      style={{ borderColor: BRAND_COLORS.deepRed, color: BRAND_COLORS.deepRed }}
                    >
                      <HiTrash className="w-4 h-4 mr-1" />
                      Remove
                    </button>
                  </div>
                </div>

                {preview && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4"
                  >
                    <img
                      src={preview}
                      alt="Payment slip preview"
                      className="max-h-48 sm:max-h-64 mx-auto rounded-lg shadow border border-gray-200 object-contain"
                    />
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>

          {/* Upload Guidelines */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="p-4 sm:p-6 rounded-lg border"
            style={{ 
              backgroundColor: `${BRAND_COLORS.darkNavy}05`,
              borderColor: BRAND_COLORS.softGrey
            }}
          >
            <h4 className="font-bold mb-4 flex items-center text-sm sm:text-base">
              <HiCheckCircle className="w-5 h-5 mr-2" style={{ color: BRAND_COLORS.teal }} />
              Upload Guidelines
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="flex items-start">
                <HiCheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-600">Ensure slip is clear and readable</span>
              </div>
              <div className="flex items-start">
                <HiCheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-600">Transaction ID should be visible</span>
              </div>
              <div className="flex items-start">
                <HiCheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-600">Payment date must match receipt</span>
              </div>
              <div className="flex items-start">
                <HiCheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-600">PNG and JPG files are supported</span>
              </div>
            </div>
          </motion.div>

          {/* Important Notice */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="p-4 sm:p-6 rounded-lg border border-yellow-200 bg-yellow-50"
          >
            <div className="flex">
              <HiEye className="w-5 h-5 sm:w-6 sm:h-6 mr-3 text-yellow-600 flex-shrink-0" />
              <div>
                <h4 className="font-bold mb-2 text-yellow-800 text-sm sm:text-base">Important Notice</h4>
                <p className="text-yellow-700 text-xs sm:text-sm">
                  Your enrollment will be confirmed only after payment verification by our admin team. 
                  This process usually takes 24-48 hours. You will receive login credentials via email 
                  once verification is complete. Keep your payment receipt safe for reference.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Submit Button */}
          <div className="pt-4">
            <motion.button
              type="submit"
              disabled={isUploading || !file}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
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
            </motion.button>
            
            <p className="text-xs sm:text-sm text-gray-500 text-center mt-4">
              By submitting, you confirm that all information is accurate
            </p>
          </div>
        </form>
      </motion.div>
    </>
  );
}