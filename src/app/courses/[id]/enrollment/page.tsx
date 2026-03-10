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
  HiPhotograph,
  HiEye,
  HiEyeOff
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

// ✅ Dynamic Form Field Interface
interface FormField {
  id: string;
  label: string;
  name: string;
  type: 'text' | 'email' | 'number' | 'file' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date';
  placeholder: string;
  required: boolean;
  order: number;
  options: string[] | null;
  status: 'active' | 'inactive';
}

interface FormData {
  [key: string]: string | File | null;
}

interface FormErrors {
  [key: string]: string | undefined;
}

interface DocumentUpload {
  [key: string]: File | null;
}

interface UploadedUrls {
  [key: string]: string;
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
  const [user, setUser] = useState<any>(null);

  // ✅ Dynamic Form Fields State
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [formData, setFormData] = useState<FormData>({});
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // File upload states
  const [uploadedUrls, setUploadedUrls] = useState<UploadedUrls>({});
  const [uploading, setUploading] = useState(false);

  const courseId = params.id as string;

  // Load user from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);
    }
  }, []);

  // Load course and form fields
  useEffect(() => {
    loadCourse();
    loadFormFields();
  }, [courseId]);

  // ✅ Fetch dynamic form fields from API
  const loadFormFields = async () => {
    try {
      const response = await fetch('/api/student-form-fields');
      const result = await response.json();
      
      if (response.ok && result.success) {
        // Filter active fields and sort by order
        const activeFields = result.data
          .filter((field: FormField) => field.status === 'active')
          .sort((a: FormField, b: FormField) => a.order - b.order);
        
        setFormFields(activeFields);
        
        // Initialize form data with empty values
        const initialData: FormData = {};
        activeFields.forEach((field: FormField) => {
          initialData[field.name] = '';
        });
        setFormData(initialData);
      }
    } catch (error) {
      console.error('Error loading form fields:', error);
    }
  };

  const loadCourse = async () => {
    try {
      setLoading(true);
      setError(null);

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

  // Format CNIC helper
  const formatCNIC = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 5) return numbers;
    if (numbers.length <= 12) return `${numbers.slice(0, 5)}-${numbers.slice(5)}`;
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 12)}-${numbers.slice(12, 13)}`;
  };

  // Handle input change
  const handleInputChange = (field: FormField, value: string) => {
    // Special formatting for CNIC field
    if (field.name === 'cnic') {
      value = formatCNIC(value);
    }

    setFormData({ ...formData, [field.name]: value });
    
    // Clear error for this field
    if (formErrors[field.name]) {
      setFormErrors({ ...formErrors, [field.name]: undefined });
    }
  };

  // Handle file change
  const handleFileChange = (field: FormField, file: File | null) => {
    setFormData({ ...formData, [field.name]: file });
    
    if (formErrors[field.name]) {
      setFormErrors({ ...formErrors, [field.name]: undefined });
    }
  };

  // Validate form based on field definitions
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    formFields.forEach(field => {
      if (!field.required) return;
      
      const value = formData[field.name];
      
      if (!value) {
        errors[field.name] = `${field.label} is required`;
        return;
      }

      // Email validation
      if (field.type === 'email' && typeof value === 'string') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors[field.name] = 'Invalid email format';
        }
      }

      // File validation
      if (field.type === 'file' && value instanceof File) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!allowedTypes.includes(value.type)) {
          errors[field.name] = 'Please upload a valid image or PDF file';
        }
        if (value.size > 5 * 1024 * 1024) { // 5MB limit
          errors[field.name] = 'File size should be less than 5MB';
        }
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Upload file to Cloudinary
  const uploadToCloudinary = async (file: File, fieldName: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', `enrollment_${fieldName}`);

    const response = await fetch('/api/upload/cloudinary', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || `Failed to upload ${fieldName}`);
    }

    return result.data.secure_url;
  };

  // Upload all files
  const uploadFiles = async (): Promise<UploadedUrls> => {
    setUploading(true);
    const urls: UploadedUrls = {};

    try {
      // Find all file fields
      const fileFields = formFields.filter(f => f.type === 'file');
      
      for (const field of fileFields) {
        const file = formData[field.name];
        if (file instanceof File) {
          urls[field.name] = await uploadToCloudinary(file, field.name);
        }
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

    // Check if all required files are uploaded
    const fileFields = formFields.filter(f => f.type === 'file' && f.required);
    const missingFiles = fileFields.some(f => !(formData[f.name] instanceof File));
    
    if (missingFiles) {
      setError('Please upload all required documents');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Upload files first
      const uploadedDocUrls = await uploadFiles();

      // Prepare data for enrollment
      const enrollmentPayload: any = {
        courseId: courseId,
        courseTitle: course?.title,
        coursePrice: course?.price,
        enrollmentDate: new Date().toISOString()
      };

      // Add all form fields to payload
      formFields.forEach(field => {
        if (field.type === 'file') {
          enrollmentPayload[`${field.name}Url`] = uploadedDocUrls[field.name];
        } else {
          enrollmentPayload[field.name] = formData[field.name];
        }
      });

      // Create enrollment
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enrollmentPayload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create enrollment');
      }

      setEnrollmentId(result.data.enrollmentId);
      
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

  // ✅ Dynamic Field Renderer
  const renderField = (field: FormField) => {
    const value = formData[field.name] || '';
    const error = formErrors[field.name];
    const isFile = field.type === 'file';

    return (
      <div key={field.id} className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>

        {field.type === 'textarea' ? (
          <textarea
            value={value as string}
            onChange={(e) => handleInputChange(field, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-deepRed/20 ${
              error ? 'border-red-500' : 'border-gray-200'
            }`}
          />
        ) : field.type === 'select' && field.options ? (
          <select
            value={value as string}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-deepRed/20 ${
              error ? 'border-red-500' : 'border-gray-200'
            }`}
          >
            <option value="">Select {field.label}</option>
            {field.options.map((opt, idx) => (
              <option key={idx} value={opt}>{opt}</option>
            ))}
          </select>
        ) : field.type === 'radio' && field.options ? (
          <div className="space-y-2">
            {field.options.map((opt, idx) => (
              <label key={idx} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={field.name}
                  value={opt}
                  checked={value === opt}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                  className="w-4 h-4 text-deepRed"
                />
                <span className="text-sm text-gray-700">{opt}</span>
              </label>
            ))}
          </div>
        ) : field.type === 'checkbox' && field.options ? (
          <div className="space-y-2">
            {field.options.map((opt, idx) => (
              <label key={idx} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name={field.name}
                  value={opt}
                  checked={(value as string)?.includes(opt)}
                  onChange={(e) => {
                    const currentValues = (value as string || '').split(',').filter(Boolean);
                    if (e.target.checked) {
                      currentValues.push(opt);
                    } else {
                      const index = currentValues.indexOf(opt);
                      if (index > -1) currentValues.splice(index, 1);
                    }
                    handleInputChange(field, currentValues.join(','));
                  }}
                  className="w-4 h-4 text-deepRed rounded"
                />
                <span className="text-sm text-gray-700">{opt}</span>
              </label>
            ))}
          </div>
        ) : field.type === 'file' ? (
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={(e) => handleFileChange(field, e.target.files?.[0] || null)}
              className="w-full"
            />
            {value instanceof File && (
              <p className="text-xs text-green-600 mt-2">
                Selected: {value.name}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              {field.placeholder}
            </p>
          </div>
        ) : (
          <input
            type={field.type}
            value={value as string}
            onChange={(e) => handleInputChange(field, e.target.value)}
            placeholder={field.placeholder}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-deepRed/20 ${
              error ? 'border-red-500' : 'border-gray-200'
            }`}
          />
        )}

        {error && (
          <p className="mt-1 text-xs text-red-500">{error}</p>
        )}
      </div>
    );
  };

  const steps = [
    { id: 'form', title: 'Personal Details', icon: HiUser },
    { id: 'voucher', title: 'Payment Voucher', icon: HiCreditCard },
    { id: 'upload', title: 'Upload Slip', icon: HiUpload }
  ];

  const handleVoucherGenerated = () => {
    setStep('upload');
  };

  const handleUploadComplete = async () => {
    setPaymentConfirmed(true);
    setTimeout(() => {
      router.push('/courses');
    }, 3000);
  };

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

                <form onSubmit={handleFormSubmit} className="space-y-4">
                  {/* ✅ Dynamically render all form fields */}
                  {formFields.map(field => renderField(field))}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting || uploading}
                    className="w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-300 disabled:opacity-50 mt-6"
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
                    <p className="font-semibold">{enrollmentData.full_name}</p>
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