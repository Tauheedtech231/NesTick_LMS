// app/courses/[id]/enrollment/page.tsx
"use client";
/* eslint-disable */

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  HiArrowLeft,
  HiCheckCircle,
  HiCreditCard,
  HiUpload,
  HiShieldCheck,
  HiUser,
  HiClock,
  HiAcademicCap,
  HiCurrencyRupee,
  HiIdentification,
  HiDocumentText,
  HiPhotograph
} from "react-icons/hi";
import Link from "next/link";
import { IoIosArrowDroprightCircle } from "react-icons/io";
import { TiLocationArrow } from "react-icons/ti";
import PaymentSlipUpload from "@/components/PaymentSlipUpload";

// Brand Colors
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

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  level: string;
  category: string;
  image: string;
  instructorId: string;
  instructorName: string;
  studentCapacity: number;
  status: string;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  cnic: string;
  address: string;
  education: string;
  experience: string;
}

interface DocumentUpload {
  cnicFront: File | null;
  cnicBack: File | null;
  educationalDoc: File | null;
}

interface UploadedUrls {
  cnicFront?: string;
  cnicBack?: string;
  educationalDoc?: string;
}

export default function EnrollmentPage() {
  const params = useParams();
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'voucher' | 'upload'>('form');
  const [enrollmentData, setEnrollmentData] = useState<any>(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enrollmentId, setEnrollmentId] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    cnic: '',
    address: '',
    education: '',
    experience: ''
  });

  // Document upload state
  const [documents, setDocuments] = useState<DocumentUpload>({
    cnicFront: null,
    cnicBack: null,
    educationalDoc: null
  });

  const [uploadedUrls, setUploadedUrls] = useState<UploadedUrls>({});
  const [uploading, setUploading] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<FormData>>({});

  const courseId = params.id as string;

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch from API
      const response = await fetch(`/api/instructors/course/${courseId}`);
      const result = await response.json();

      if (response.ok && result.success) {
        const courseData = result.data.course;
        setCourse({
          id: courseData.id,
          title: courseData.title,
          description: courseData.description || '',
          price: courseData.price || 0,
          duration: courseData.duration || 'Flexible',
          level: courseData.level || 'All Levels',
          category: courseData.category || 'General',
          image: courseData.image || '/placeholder-course.jpg',
          instructorId: courseData.instructor_id,
          instructorName: courseData.instructor_name || 'Instructor',
          studentCapacity: courseData.student_capacity || 0,
          status: courseData.status
        });
      } else {
        setError('Course not found');
      }
    } catch (error) {
      console.error('Error loading course:', error);
      setError('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  // Format CNIC as 12345-1234567-1
  const formatCNIC = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 5) return numbers;
    if (numbers.length <= 12) return `${numbers.slice(0, 5)}-${numbers.slice(5)}`;
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 12)}-${numbers.slice(12, 13)}`;
  };

  const handleCNICChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNIC(e.target.value);
    setFormData({ ...formData, cnic: formatted });
    
    // Clear error if valid
    if (formatted.replace(/\D/g, '').length === 13) {
      setFormErrors({ ...formErrors, cnic: undefined });
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<FormData> = {};
    
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[0-9+\-\s]{10,15}$/.test(formData.phone)) {
      errors.phone = 'Invalid phone number';
    }
    
    const cnicNumbers = formData.cnic.replace(/\D/g, '');
    if (!formData.cnic.trim()) {
      errors.cnic = 'CNIC is required';
    } else if (cnicNumbers.length !== 13) {
      errors.cnic = 'CNIC must be 13 digits';
    }
    
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.education.trim()) errors.education = 'Education is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const uploadToCloudinary = async (file: File, type: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', `enrollment_${type}`);

    const response = await fetch('/api/upload/cloudinary', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || `Failed to upload ${type}`);
    }

    return result.data.secure_url;
  };

  const uploadDocuments = async (): Promise<UploadedUrls> => {
    setUploading(true);
    const urls: UploadedUrls = {};

    try {
      if (documents.cnicFront) {
        urls.cnicFront = await uploadToCloudinary(documents.cnicFront, 'cnic_front');
      }
      if (documents.cnicBack) {
        urls.cnicBack = await uploadToCloudinary(documents.cnicBack, 'cnic_back');
      }
      if (documents.educationalDoc) {
        urls.educationalDoc = await uploadToCloudinary(documents.educationalDoc, 'education');
      }
      
      setUploadedUrls(urls);
      return urls;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please fix the errors in the form');
      return;
    }

    if (!documents.cnicFront || !documents.cnicBack || !documents.educationalDoc) {
      setError('Please upload all required documents');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // First upload documents
      const uploadedDocUrls = await uploadDocuments();

      // Then create enrollment
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: formData.fullName,
          studentEmail: formData.email,
          studentPhone: formData.phone,
          studentCnic: formData.cnic,
          studentAddress: formData.address,
          studentEducation: formData.education,
          studentExperience: formData.experience,
          cnicFrontUrl: uploadedDocUrls.cnicFront,
          cnicBackUrl: uploadedDocUrls.cnicBack,
          educationalDocUrl: uploadedDocUrls.educationalDoc,
          courseId: courseId,
          courseTitle: course?.title,
          coursePrice: course?.price,
          enrollmentDate: new Date().toISOString()
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create enrollment');
      }

      setEnrollmentId(result.data.enrollmentId);
      
      // Move to voucher step
      setEnrollmentData({
        ...formData,
        course: course?.title,
        amount: course?.price,
        courseId: courseId,
        enrollmentId: result.data.enrollmentId
      });
      
      setStep('voucher');
      
    } catch (error: any) {
      console.error('Submission error:', error);
      setError(error.message || 'Failed to submit enrollment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVoucherGenerated = () => {
    setStep('upload');
  };

  const handleUploadComplete = async () => {
    setPaymentConfirmed(true);
    setTimeout(() => {
      router.push('/courses');
    }, 3000);
  };

  const steps = [
    { id: 'form', title: 'Personal Details', icon: HiUser },
    { id: 'voucher', title: 'Payment Voucher', icon: HiCreditCard },
    { id: 'upload', title: 'Upload Slip', icon: HiUpload }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-deepRed mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading enrollment details...</p>
        </div>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Course Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/courses"
            className="inline-block px-6 py-3 rounded-lg font-semibold transition-all duration-300"
            style={{
              backgroundColor: BRAND_COLORS.deepRed,
              color: BRAND_COLORS.white
            }}
          >
            Browse Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link
            href={`/courses/${courseId}`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <HiArrowLeft className="w-5 h-5 mr-2" />
            Back to Course
          </Link>
        </div>

        {/* Progress Steps */}
        <div className="mb-12 relative">
          <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 z-0 rounded-full">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: step === 'form' ? '0%' : step === 'voucher' ? '50%' : '100%',
                backgroundColor: BRAND_COLORS.deepRed,
              }}
            />
          </div>

          <div className="relative z-10 flex justify-between">
            {steps.map((stepItem) => {
              const isActive =
                step === stepItem.id ||
                (step === 'voucher' && stepItem.id === 'form') ||
                (step === 'upload' && ['form', 'voucher'].includes(stepItem.id));

              return (
                <div key={stepItem.id} className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-transform duration-300 ${
                      isActive ? 'scale-110 shadow-lg' : 'scale-100'
                    }`}
                    style={{
                      backgroundColor: isActive ? BRAND_COLORS.deepRed : BRAND_COLORS.lightGrey,
                      color: isActive ? BRAND_COLORS.white : BRAND_COLORS.darkGrey,
                    }}
                  >
                    <stepItem.icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-500'}`}
                  >
                    {stepItem.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 'form' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                key="form"
                className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
              >
                <h2 className="text-xl font-bold mb-6" style={{ color: BRAND_COLORS.darkNavy }}>
                  Personal Information
                </h2>

                <form onSubmit={handleFormSubmit} className="space-y-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => {
                        setFormData({ ...formData, fullName: e.target.value });
                        setFormErrors({ ...formErrors, fullName: undefined });
                      }}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-deepRed/20 ${
                        formErrors.fullName ? 'border-red-500' : 'border-gray-200'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {formErrors.fullName && (
                      <p className="mt-1 text-xs text-red-500">{formErrors.fullName}</p>
                    )}
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          setFormErrors({ ...formErrors, email: undefined });
                        }}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-deepRed/20 ${
                          formErrors.email ? 'border-red-500' : 'border-gray-200'
                        }`}
                        placeholder="your@email.com"
                      />
                      {formErrors.email && (
                        <p className="mt-1 text-xs text-red-500">{formErrors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => {
                          setFormData({ ...formData, phone: e.target.value });
                          setFormErrors({ ...formErrors, phone: undefined });
                        }}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-deepRed/20 ${
                          formErrors.phone ? 'border-red-500' : 'border-gray-200'
                        }`}
                        placeholder="+92 300 1234567"
                      />
                      {formErrors.phone && (
                        <p className="mt-1 text-xs text-red-500">{formErrors.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* CNIC */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CNIC Number * (12345-1234567-1)
                    </label>
                    <input
                      type="text"
                      value={formData.cnic}
                      onChange={handleCNICChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-deepRed/20 ${
                        formErrors.cnic ? 'border-red-500' : 'border-gray-200'
                      }`}
                      placeholder="12345-1234567-1"
                      maxLength={15}
                    />
                    {formErrors.cnic && (
                      <p className="mt-1 text-xs text-red-500">{formErrors.cnic}</p>
                    )}
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address *
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => {
                        setFormData({ ...formData, address: e.target.value });
                        setFormErrors({ ...formErrors, address: undefined });
                      }}
                      rows={3}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-deepRed/20 ${
                        formErrors.address ? 'border-red-500' : 'border-gray-200'
                      }`}
                      placeholder="Your complete address"
                    />
                    {formErrors.address && (
                      <p className="mt-1 text-xs text-red-500">{formErrors.address}</p>
                    )}
                  </div>

                  {/* Education & Experience */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Education *
                      </label>
                      <input
                        type="text"
                        value={formData.education}
                        onChange={(e) => {
                          setFormData({ ...formData, education: e.target.value });
                          setFormErrors({ ...formErrors, education: undefined });
                        }}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-deepRed/20 ${
                          formErrors.education ? 'border-red-500' : 'border-gray-200'
                        }`}
                        placeholder="e.g., Bachelor's in Computer Science"
                      />
                      {formErrors.education && (
                        <p className="mt-1 text-xs text-red-500">{formErrors.education}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Experience
                      </label>
                      <input
                        type="text"
                        value={formData.experience}
                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deepRed/20"
                        placeholder="e.g., 2 years in construction"
                      />
                    </div>
                  </div>

                  {/* Document Uploads */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg" style={{ color: BRAND_COLORS.darkNavy }}>
                      Required Documents
                    </h3>

                    {/* CNIC Front */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CNIC Front Image *
                      </label>
                      <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setDocuments({ 
                            ...documents, 
                            cnicFront: e.target.files?.[0] || null 
                          })}
                          className="w-full"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Upload clear image of your CNIC front side
                        </p>
                      </div>
                    </div>

                    {/* CNIC Back */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CNIC Back Image *
                      </label>
                      <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setDocuments({ 
                            ...documents, 
                            cnicBack: e.target.files?.[0] || null 
                          })}
                          className="w-full"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Upload clear image of your CNIC back side
                        </p>
                      </div>
                    </div>

                    {/* Educational Document */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Educational Certificate/Degree *
                      </label>
                      <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => setDocuments({ 
                            ...documents, 
                            educationalDoc: e.target.files?.[0] || null 
                          })}
                          className="w-full"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Upload your educational certificate (PDF or Image)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting || uploading}
                    className="w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-300 disabled:opacity-50"
                    style={{ backgroundColor: BRAND_COLORS.deepRed }}
                  >
                    {submitting || uploading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        {uploading ? 'Uploading Documents...' : 'Processing...'}
                      </div>
                    ) : (
                      'Proceed to Payment'
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {step === 'voucher' && enrollmentData && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                key="voucher"
                className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
              >
                <h2 className="text-xl font-bold mb-6" style={{ color: BRAND_COLORS.darkNavy }}>
                  Payment Voucher
                </h2>
                
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Enrollment ID</p>
                    <p className="font-mono text-sm">{enrollmentData.enrollmentId}</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Student Name</p>
                    <p className="font-semibold">{enrollmentData.fullName}</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Course</p>
                    <p className="font-semibold">{enrollmentData.course}</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Amount</p>
                    <p className="text-xl font-bold" style={{ color: BRAND_COLORS.deepRed }}>
                      PKR {enrollmentData.amount?.toLocaleString()}
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Payment Instructions:</h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                      <li>Download this voucher</li>
                      <li>Make payment to the following bank account:</li>
                      <li className="ml-4">Bank: Habib Bank Limited (HBL)</li>
                      <li className="ml-4">Account Title: Mansol Hab School of Skills</li>
                      <li className="ml-4">Account Number: 1234-5678-9012-3456</li>
                      <li>Keep the payment slip/receipt</li>
                      <li>Upload the slip in the next step</li>
                    </ol>
                  </div>

                  <button
                    onClick={handleVoucherGenerated}
                    className="w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-300"
                    style={{ backgroundColor: BRAND_COLORS.deepRed }}
                  >
                    I Have Made Payment
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'upload' && enrollmentData && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                key="upload"
                className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
              >
                <h2 className="text-xl font-bold mb-6" style={{ color: BRAND_COLORS.darkNavy }}>
                  Upload Payment Slip
                </h2>

                <PaymentSlipUpload 
                  enrollmentData={enrollmentData}
                  onComplete={handleUploadComplete}
                />
              </motion.div>
            )}

            {paymentConfirmed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-lg p-8 text-center border-2 border-green-100"
              >
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                  <HiCheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-green-700">
                  Enrollment Complete!
                </h3>
                <p className="text-gray-600 mb-6">
                  Your enrollment for <strong>{course?.title}</strong> has been received. 
                  Your documents and payment slip are being verified. You will receive login credentials 
                  within 24-48 hours after verification.
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Enrollment ID: <span className="font-mono">{enrollmentId}</span>
                </p>
                <Link
                  href="/courses"
                  className="inline-block px-6 py-3 rounded-lg font-semibold transition-all duration-300"
                  style={{
                    backgroundColor: BRAND_COLORS.deepRed,
                    color: BRAND_COLORS.white
                  }}
                >
                  Browse More Courses
                </Link>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Summary */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
              <h3 className="text-lg font-bold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
                Course Summary
              </h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <img 
                    src={course?.image} 
                    alt={course?.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{course?.title}</p>
                  <p className="text-sm text-gray-600">{course?.duration}</p>
                  <p className="text-xs text-gray-500 mt-1">by {course?.instructorName}</p>
                </div>
              </div>
              
              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <HiAcademicCap className="w-4 h-4" />
                  <span>Level: {course?.level}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <HiClock className="w-4 h-4" />
                  <span>Category: {course?.category}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <span className="text-gray-600">Total Amount:</span>
                <span className="text-xl font-bold" style={{ color: BRAND_COLORS.deepRed }}>
                  PKR {course?.price.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Security Section */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center mb-4">
                <HiShieldCheck className="w-6 h-6 mr-3" style={{ color: BRAND_COLORS.teal }} />
                <h3 className="text-lg font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
                  Secure Enrollment
                </h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <IoIosArrowDroprightCircle className="w-5 h-5 mt-1 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-600">SSL Encrypted Connection</span>
                </li>
                <li className="flex items-start gap-2">
                  <IoIosArrowDroprightCircle className="w-5 h-5 mt-1 text-blue-500 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Data Privacy Protected</span>
                </li>
                <li className="flex items-start gap-2">
                  <IoIosArrowDroprightCircle className="w-5 h-5 mt-1 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Verified Payment Methods</span>
                </li>
              </ul>
            </div>

            {/* Next Steps */}
            <div
              className="bg-gradient-to-br rounded-2xl shadow-md p-6"
              style={{
                background: `linear-gradient(135deg, ${BRAND_COLORS.darkNavy} 0%, ${BRAND_COLORS.darkRoyalBlue} 100%)`,
              }}
            >
              <h3 className="text-lg font-bold mb-4 text-white">What Happens Next?</h3>
              <div className="space-y-4">
                {[ 
                  'Submit your enrollment form with documents',
                  'Download payment voucher',
                  'Make payment and upload slip',
                  'Receive credentials after verification (24-48 hours)'
                ].map((text, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <TiLocationArrow className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm text-gray-200">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
              <h3 className="text-lg font-bold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
                Need Help?
              </h3>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <IoIosArrowDroprightCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-500">Email</div>
                    <div>support@mansolhab.edu.pk</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <IoIosArrowDroprightCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-500">Phone</div>
                    <div>+92 300 1234567</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <IoIosArrowDroprightCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-500">Hours</div>
                    <div>9 AM - 5 PM, Monday to Friday</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}