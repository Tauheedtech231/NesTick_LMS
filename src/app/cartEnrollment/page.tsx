"use client";
/* eslint-disable */
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  User, 
  Mail, 
  Phone, 
  CreditCard, 
  GraduationCap, 
  Briefcase, 
  MapPin,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Download,
  Building,
  Banknote,
  Printer,
  X,
  Eye
} from "lucide-react";

// Import voucher generation utilities
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

const BRAND_COLORS = {
  darkNavy: '#0B1C3D',
  darkRoyalBlue: '#1E3A8A',
  deepRed: '#B11217',
  white: '#FFFFFF',
  lightGrey: '#F4F6F8',
  softGrey: '#E5E7EB',
  darkGrey: '#1F2933',
};

interface Course {
  price: number;
  id: string;
  course_id: string;
  course_title: string;
  course_price: number;
}

interface StudentDetails {
  student_name: string;
  student_email: string;
  student_phone: string;
  student_cnic: string;
  student_address: string;
  student_education: string;
  student_experience: string;
}

interface UploadedDocument {
  url: string;
  public_id: string;
  file_name: string;
}

interface ExistingEnrollment {
  id: string;
  student_name: string;
  student_email: string;
  student_phone: string;
  student_cnic: string;
  student_address: string;
  student_education: string;
  student_experience: string;
  courses: any[];
  total_amount: number;
  status: string;
  payment_status: string;
  voucher_generated: boolean;
  voucher_downloaded?: boolean;
  created_at: string;
}

// Bank Details
const BANK_DETAILS = {
  bankName: "Habib Bank Limited (HBL)",
  accountTitle: "LMS Education System",
  accountNumber: "1234-567890-12",
  iban: "PK12 HBLP 1234 5678 9012 3456",
  branchCode: "1234",
  branchAddress: "Main Branch, Karachi, Pakistan",
  jazzCash: "0300-1234567",
  easyPaisa: "0315-7654321"
};

const CartEnrollmentPage: React.FC = () => {
  const router = useRouter();
  const voucherRef = useRef<HTMLDivElement>(null);
  
  // File input refs for document uploads
  const cnicFrontInputRef = useRef<HTMLInputElement>(null);
  const cnicBackInputRef = useRef<HTMLInputElement>(null);
  const educationalDocInputRef = useRef<HTMLInputElement>(null);
  const paymentSlipInputRef = useRef<HTMLInputElement>(null);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [courses, setCourses] = useState<Course[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [userEmail, setUserEmail] = useState("");
  const [enrollmentId, setEnrollmentId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Existing Enrollment Check
  const [showExistingEnrollmentModal, setShowExistingEnrollmentModal] = useState(false);
  const [existingEnrollmentId, setExistingEnrollmentId] = useState("");
  const [existingEnrollment, setExistingEnrollment] = useState<ExistingEnrollment | null>(null);
  const [checkingEnrollment, setCheckingEnrollment] = useState(false);
  const [existingEnrollmentError, setExistingEnrollmentError] = useState("");
  
  // Step 1: Student Details
  const [studentDetails, setStudentDetails] = useState<StudentDetails>({
    student_name: "",
    student_email: "",
    student_phone: "",
    student_cnic: "",
    student_address: "",
    student_education: "",
    student_experience: "",
  });
  
  const [uploadedDocs, setUploadedDocs] = useState({
    cnic_front: null as UploadedDocument | null,
    cnic_back: null as UploadedDocument | null,
    educational_doc: null as UploadedDocument | null,
  });
  
  const [uploading, setUploading] = useState(false);
  const [uploadingType, setUploadingType] = useState<string>("");
  
  // Step 2: Voucher
  const [voucherNumber, setVoucherNumber] = useState("");
  const [voucherDownloaded, setVoucherDownloaded] = useState(false);
  const [isGeneratingVoucher, setIsGeneratingVoucher] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [existingEnrollmentLoaded, setExistingEnrollmentLoaded] = useState(false);
  const [showReviewMode, setShowReviewMode] = useState(false);
  
  // Step 3: Payment Slip
  const [paymentSlip, setPaymentSlip] = useState<File | null>(null);
  const [uploadingSlip, setUploadingSlip] = useState(false);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [isPublicPortal, setIsPublicPortal] = useState(false);
  const [publicEnrollmentId, setPublicEnrollmentId] = useState("");

  useEffect(() => {
    const savedEmail = localStorage.getItem("userEmail");
    const urlParams = new URLSearchParams(window.location.search);
    const enrollmentIdParam = urlParams.get('enrollment_id');
    
    if (enrollmentIdParam) {
      // Public portal mode - user came with enrollment ID
      setIsPublicPortal(true);
      setPublicEnrollmentId(enrollmentIdParam);
      setCurrentStep(3);
      fetchExistingEnrollment(enrollmentIdParam);
    } else if (savedEmail) {
      setUserEmail(savedEmail);
      setStudentDetails(prev => ({ ...prev, student_email: savedEmail }));
      fetchCartCourses(savedEmail);
    } else {
      router.push("/");
    }
  }, []);

  const fetchCartCourses = async (email: string) => {
    try {
      const res = await fetch(`/api/student/cart?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      
      if (data.success) {
        const uniqueCourses = data.data.items.filter(
          (course: Course, index: number, self: Course[]) =>
            index === self.findIndex((c) => c.id === course.id)
        );
        setCourses(uniqueCourses);
        
        const total = uniqueCourses.reduce((sum: number, item: Course) => sum + item.course_price, 0);
        setTotalAmount(total);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  const fetchExistingEnrollment = async (enrollmentId: string) => {
    setCheckingEnrollment(true);
    setExistingEnrollmentError("");
    
    try {
      const response = await fetch(`/api/enrollment/public/${enrollmentId}`);
      const data = await response.json();
      
      if (data.success) {
        setExistingEnrollment(data.data);
        setEnrollmentId(data.data.id);
        setTotalAmount(data.data.total_amount);
        
        // Auto-fill student details from existing enrollment
        setStudentDetails({
          student_name: data.data.student_name,
          student_email: data.data.student_email,
          student_phone: data.data.student_phone || "",
          student_cnic: data.data.student_cnic || "",
          student_address: data.data.student_address || "",
          student_education: data.data.student_education || "",
          student_experience: data.data.student_experience || "",
        });
        
        // Set courses from existing enrollment
        if (data.data.courses && data.data.courses.length > 0) {
          setCourses(data.data.courses);
        }
        
        // Check if voucher was already downloaded
        const hasVoucherDownloaded = localStorage.getItem(`voucher_downloaded_${data.data.id}`) === 'true';
        
        if (hasVoucherDownloaded || data.data.voucher_generated) {
          // Voucher already downloaded, go directly to payment step
          setVoucherDownloaded(true);
          setExistingEnrollmentLoaded(true);
          setCurrentStep(3);
        } else {
          // New enrollment, go to review mode
          setExistingEnrollmentLoaded(true);
          setShowReviewMode(true);
          setCurrentStep(2);
        }
      } else {
        setExistingEnrollmentError(data.error || "Enrollment not found");
      }
    } catch (error) {
      console.error("Error fetching enrollment:", error);
      setExistingEnrollmentError("Failed to fetch enrollment details");
    } finally {
      setCheckingEnrollment(false);
    }
  };

  const checkExistingEnrollment = async () => {
    if (!existingEnrollmentId.trim()) {
      setExistingEnrollmentError("Please enter Enrollment ID");
      return;
    }
    
    setCheckingEnrollment(true);
    setExistingEnrollmentError("");
    
    try {
      const response = await fetch(`/api/enrollment/public/${existingEnrollmentId}`);
      const data = await response.json();
      
      if (data.success) {
        setExistingEnrollment(data.data);
        setShowExistingEnrollmentModal(false);
        setEnrollmentId(data.data.id);
        setTotalAmount(data.data.total_amount);
        
        // Auto-fill student details
        setStudentDetails({
          student_name: data.data.student_name,
          student_email: data.data.student_email,
          student_phone: data.data.student_phone || "",
          student_cnic: data.data.student_cnic || "",
          student_address: data.data.student_address || "",
          student_education: data.data.student_education || "",
          student_experience: data.data.student_experience || "",
        });
        
        // Set courses
        if (data.data.courses && data.data.courses.length > 0) {
          setCourses(data.data.courses);
        }
        
        // Check if voucher was already downloaded
        const hasVoucherDownloaded = localStorage.getItem(`voucher_downloaded_${data.data.id}`) === 'true';
        
        if (hasVoucherDownloaded || data.data.voucher_generated) {
          setVoucherDownloaded(true);
          setExistingEnrollmentLoaded(true);
          setCurrentStep(3);
        } else {
          setExistingEnrollmentLoaded(true);
          setShowReviewMode(true);
          setCurrentStep(2);
        }
      } else {
        setExistingEnrollmentError(data.error || "Enrollment not found");
      }
    } catch (error) {
      console.error("Error checking enrollment:", error);
      setExistingEnrollmentError("Failed to check enrollment");
    } finally {
      setCheckingEnrollment(false);
    }
  };

  const uploadFile = async (file: File, type: string): Promise<UploadedDocument | null> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    
    try {
      const response = await fetch("/api/upload/cloudinary", {
        method: "POST",
        body: formData,
      });
      
      const result = await response.json();
      if (result.success) {
        return {
          url: result.data.secure_url,
          public_id: result.data.public_id,
          file_name: file.name,
        };
      }
      return null;
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      return null;
    }
  };

  const handleDocumentUpload = async (file: File, type: string) => {
    setUploading(true);
    setUploadingType(type);
    const uploaded = await uploadFile(file, type);
    if (uploaded) {
      setUploadedDocs(prev => ({ ...prev, [type]: uploaded }));
    }
    setUploading(false);
    setUploadingType("");
  };

  // Click handlers for document upload areas
  const handleCnicFrontClick = () => {
    cnicFrontInputRef.current?.click();
  };

  const handleCnicBackClick = () => {
    cnicBackInputRef.current?.click();
  };

  const handleEducationalDocClick = () => {
    educationalDocInputRef.current?.click();
  };

  const handlePaymentSlipClick = () => {
    paymentSlipInputRef.current?.click();
  };

  // Save enrollment data to localStorage
  const saveEnrollmentDataToLocal = () => {
    const enrollmentData = {
      studentDetails,
      courses,
      totalAmount,
      documents: uploadedDocs,
      generatedAt: new Date().toISOString(),
      status: 'pending_payment'
    };
    
    localStorage.setItem("pendingEnrollment", JSON.stringify(enrollmentData));
    const newEnrollmentId = `ENR-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    setEnrollmentId(newEnrollmentId);
    localStorage.setItem("enrollmentId", newEnrollmentId);
    
    return newEnrollmentId;
  };

  const handleSubmitDetails = async () => {
    if (!studentDetails.student_name || !studentDetails.student_email || 
        !studentDetails.student_phone || !studentDetails.student_cnic ||
        !uploadedDocs.cnic_front || !uploadedDocs.cnic_back) {
      alert("Please fill all required fields and upload CNIC front/back");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const newEnrollmentId = saveEnrollmentDataToLocal();
      setEnrollmentId(newEnrollmentId);
      
      const newVoucherNumber = `VCH-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      setVoucherNumber(newVoucherNumber);
      
      setCurrentStep(2);
    } catch (error) {
      console.error("Error saving details:", error);
      alert("Failed to save enrollment details");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate voucher PDF - Only allow once per enrollment
  const generateVoucherPDF = async () => {
    if (!voucherRef.current) return;
    
    // Check if voucher was already downloaded for this enrollment
    const voucherKey = `voucher_downloaded_${enrollmentId}`;
    const alreadyDownloaded = localStorage.getItem(voucherKey) === 'true';
    
    if (alreadyDownloaded) {
      alert("Voucher has already been downloaded. You cannot download it again. Please proceed to payment.");
      setVoucherDownloaded(true);
      return;
    }

    setIsGeneratingVoucher(true);
    
    try {
      const dataUrl = await toPng(voucherRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#FFFFFF'
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`payment-voucher-${voucherNumber}.pdf`);

      setVoucherDownloaded(true);
      
      // Mark voucher as downloaded for this enrollment
      localStorage.setItem(voucherKey, 'true');
      
      // Only clear cart if not in public portal mode and not existing enrollment
      if (!isPublicPortal && !existingEnrollmentLoaded) {
        await clearCartAfterVoucher();
      }
      
      // Only save to database if it's a new enrollment
      if (!existingEnrollmentLoaded) {
        await saveToDatabaseAndSendEmail();
      }
      
    } catch (error) {
      console.error('Error generating voucher:', error);
      alert('Failed to generate voucher. Please try again.');
    } finally {
      setIsGeneratingVoucher(false);
    }
  };

  // Clear cart function
  const clearCartAfterVoucher = async () => {
    try {
      const response = await fetch("/api/student/cart/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });
      
      const data = await response.json();
      if (data.success) {
        console.log('✅ Cart cleared successfully after voucher download');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  // Save to database AND send email
  const saveToDatabaseAndSendEmail = async () => {
    try {
      const pendingData = localStorage.getItem("pendingEnrollment");
      if (!pendingData) return;
      
      const enrollmentData = JSON.parse(pendingData);
      
      const response = await fetch("/api/enrollment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentDetails: enrollmentData.studentDetails,
          courses: enrollmentData.courses,
          totalAmount: enrollmentData.totalAmount,
          documents: enrollmentData.documents,
          enrollmentId: enrollmentId,
          voucherNumber: voucherNumber,
          sendEmail: true,
          isUpdate: false
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        if (data.emailSent) {
          setEmailSent(true);
          console.log('✅ Confirmation email sent to student');
        }
        
        localStorage.removeItem("pendingEnrollment");
        
        alert(`✅ Enrollment created successfully!\n\nA confirmation email has been sent to ${studentDetails.student_email}.`);
      } else {
        console.error("Failed to save:", data.error);
      }
    } catch (error) {
      console.error("Error saving:", error);
    }
  };

  const handlePaymentSlipUpload = async () => {
    if (!paymentSlip) {
      alert("Please select a payment slip file to upload");
      return;
    }
    
    setUploadingSlip(true);
    
    const formData = new FormData();
    formData.append("file", paymentSlip);
    formData.append("enrollmentId", enrollmentId);
    formData.append("studentId", studentDetails.student_email);
    formData.append("studentEmail", studentDetails.student_email);
    formData.append("isPublic", String(isPublicPortal || existingEnrollmentLoaded));
    
    try {
      const response = await fetch("/api/payment/upload-slip", {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPaymentSubmitted(true);
        alert(`✅ Payment slip uploaded successfully!\n\nA confirmation email has been sent to ${studentDetails.student_email}.`);
        
        setTimeout(() => {
          router.push("/");
        }, 3000);
      } else {
        alert(data.error || "Failed to upload payment slip");
      }
    } catch (error) {
      console.error("Error uploading payment slip:", error);
      alert("Failed to upload payment slip. Please try again.");
    } finally {
      setUploadingSlip(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Account number copied to clipboard!');
  };

  const StepIndicator = () => (
    <div className="flex justify-center mb-8">
      <div className="flex items-center gap-4">
        {[1, 2, 3].map((step) => (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  currentStep >= step
                    ? "text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
                style={currentStep >= step ? { backgroundColor: BRAND_COLORS.deepRed } : {}}
              >
                {currentStep > step ? <CheckCircle size={20} /> : step}
              </div>
              <span className="text-xs mt-2 text-gray-600">
                {step === 1 ? "Student Details" : step === 2 ? "Voucher" : "Payment"}
              </span>
            </div>
            {step < 3 && (
              <div
                className={`w-16 h-0.5 ${
                  currentStep > step ? "bg-red-500" : "bg-gray-200"
                }`}
                style={currentStep > step ? { backgroundColor: BRAND_COLORS.deepRed } : {}}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const expiryDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  return (
    <>
      {/* Existing Enrollment Modal */}
      {showExistingEnrollmentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>Continue Existing Enrollment</h2>
              <button onClick={() => setShowExistingEnrollmentModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">Enter your Enrollment ID to continue where you left off.</p>
            <input
              type="text"
              value={existingEnrollmentId}
              onChange={(e) => setExistingEnrollmentId(e.target.value)}
              placeholder="e.g., ENR-1234567890-ABCDEF"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
            />
            {existingEnrollmentError && (
              <p className="text-red-500 text-sm mb-4">{existingEnrollmentError}</p>
            )}
            <button
              onClick={checkExistingEnrollment}
              disabled={checkingEnrollment}
              className="w-full py-2 rounded-lg font-semibold text-white"
              style={{ backgroundColor: BRAND_COLORS.deepRed }}
            >
              {checkingEnrollment ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Continue Enrollment"}
            </button>
          </div>
        </div>
      )}

      <div className="min-h-screen pt-20 bg-[#F4F6F8] px-4 md:px-10 pb-10">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
              {isPublicPortal ? "Complete Your Payment" : existingEnrollmentLoaded ? "Review Your Enrollment" : "Course Enrollment"}
            </h1>
            <p className="text-gray-600 mt-2">
              {isPublicPortal 
                ? "Upload your payment slip to complete enrollment" 
                : existingEnrollmentLoaded 
                  ? "Please review your enrollment details before proceeding" 
                  : "Complete the following steps to enroll in your selected courses"}
            </p>
            {!isPublicPortal && !existingEnrollmentLoaded && (
              <button
                onClick={() => setShowExistingEnrollmentModal(true)}
                className="mt-3 text-sm text-red-600 hover:text-red-700 underline"
              >
                Already have an enrollment? Continue here
              </button>
            )}
          </div>
          
          {!isPublicPortal && !existingEnrollmentLoaded && <StepIndicator />}
          
          {/* Review Mode for Existing Enrollment */}
          {existingEnrollmentLoaded && showReviewMode && currentStep === 2 && (
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <Eye className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: BRAND_COLORS.darkNavy }}>
                  Enrollment Found
                </h2>
                <p className="text-gray-600">
                  Your enrollment details have been loaded. Please review and proceed.
                </p>
              </div>

              {/* Student Details Review */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Full Name</label>
                  <p className="text-gray-900 font-medium">{studentDetails.student_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Email Address</label>
                  <p className="text-gray-900 font-medium">{studentDetails.student_email}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Phone Number</label>
                  <p className="text-gray-900 font-medium">{studentDetails.student_phone || "Not provided"}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">CNIC Number</label>
                  <p className="text-gray-900 font-medium">{studentDetails.student_cnic || "Not provided"}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Address</label>
                  <p className="text-gray-900 font-medium">{studentDetails.student_address || "Not provided"}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Highest Education</label>
                  <p className="text-gray-900 font-medium">{studentDetails.student_education || "Not provided"}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Experience</label>
                  <p className="text-gray-900 font-medium">{studentDetails.student_experience || "Not provided"}</p>
                </div>
              </div>

              {/* Selected Courses */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-3" style={{ color: BRAND_COLORS.darkNavy }}>
                  Selected Courses
                </h3>
                {courses.map((course, idx) => (
                  <div key={course.id || idx} className="flex justify-between py-2 border-b last:border-0">
                    <span>{idx + 1}. {course.course_title}</span>
                    <span className="font-semibold" style={{ color: BRAND_COLORS.deepRed }}>
                      Rs. {(course.course_price || course.price).toLocaleString()}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between mt-3 pt-2 border-t font-bold">
                  <span>Total Amount</span>
                  <span style={{ color: BRAND_COLORS.deepRed }}>Rs. {totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  onClick={() => router.push("/")}
                  className="inline-flex items-center gap-2 px-6 py-2 rounded-lg font-semibold border-2"
                  style={{ borderColor: BRAND_COLORS.darkGrey, color: BRAND_COLORS.darkGrey }}
                >
                  <ArrowLeft size={18} />
                  Back to Home
                </button>
                <button
                  onClick={() => {
                    // Generate voucher number for existing enrollment
                    const newVoucherNumber = `VCH-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
                    setVoucherNumber(newVoucherNumber);
                    setShowReviewMode(false);
                    // Proceed to voucher generation
                  }}
                  className="inline-flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all hover:scale-105"
                  style={{ backgroundColor: BRAND_COLORS.deepRed, color: BRAND_COLORS.white }}
                >
                  Proceed to Payment
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}
          
          {/* Step 1: Student Details - Only for new enrollment */}
          {currentStep === 1 && !isPublicPortal && !existingEnrollmentLoaded && (
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
              {/* ... existing student details form ... */}
              <h2 className="text-2xl font-bold mb-6" style={{ color: BRAND_COLORS.darkNavy }}>
                Student Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={studentDetails.student_name}
                      onChange={(e) => setStudentDetails({ ...studentDetails, student_name: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      value={studentDetails.student_email}
                      onChange={(e) => setStudentDetails({ ...studentDetails, student_email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="tel"
                      value={studentDetails.student_phone}
                      onChange={(e) => setStudentDetails({ ...studentDetails, student_phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">CNIC Number *</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={studentDetails.student_cnic}
                      onChange={(e) => setStudentDetails({ ...studentDetails, student_cnic: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="12345-6789012-3"
                    />
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                    <textarea
                      value={studentDetails.student_address}
                      onChange={(e) => setStudentDetails({ ...studentDetails, student_address: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      rows={2}
                      placeholder="Enter your address"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Highest Education</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={studentDetails.student_education}
                      onChange={(e) => setStudentDetails({ ...studentDetails, student_education: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="e.g., Bachelor's in Computer Science"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Experience</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={studentDetails.student_experience}
                      onChange={(e) => setStudentDetails({ ...studentDetails, student_experience: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Years of experience"
                    />
                  </div>
                </div>
              </div>
              
              {/* Document Uploads */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
                  Required Documents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div onClick={handleCnicFrontClick} className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-red-500 transition-colors">
                    <input ref={cnicFrontInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleDocumentUpload(e.target.files[0], "cnic_front"); }} />
                    <CreditCard className="mx-auto mb-2 text-gray-400" size={32} />
                    <p className="font-semibold text-sm">CNIC Front *</p>
                    {uploading && uploadingType === "cnic_front" ? (
                      <div className="mt-2"><Loader2 className="w-5 h-5 animate-spin mx-auto text-red-500" /><p className="text-xs text-gray-500 mt-1">Uploading...</p></div>
                    ) : uploadedDocs.cnic_front ? (
                      <div className="mt-2"><CheckCircle size={20} className="mx-auto text-green-500" /><p className="text-xs text-gray-500 mt-1 truncate">{uploadedDocs.cnic_front.file_name}</p></div>
                    ) : (<p className="text-xs text-gray-400 mt-2">Click to upload</p>)}
                  </div>
                  
                  <div onClick={handleCnicBackClick} className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-red-500 transition-colors">
                    <input ref={cnicBackInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleDocumentUpload(e.target.files[0], "cnic_back"); }} />
                    <CreditCard className="mx-auto mb-2 text-gray-400" size={32} />
                    <p className="font-semibold text-sm">CNIC Back *</p>
                    {uploading && uploadingType === "cnic_back" ? (
                      <div className="mt-2"><Loader2 className="w-5 h-5 animate-spin mx-auto text-red-500" /><p className="text-xs text-gray-500 mt-1">Uploading...</p></div>
                    ) : uploadedDocs.cnic_back ? (
                      <div className="mt-2"><CheckCircle size={20} className="mx-auto text-green-500" /><p className="text-xs text-gray-500 mt-1 truncate">{uploadedDocs.cnic_back.file_name}</p></div>
                    ) : (<p className="text-xs text-gray-400 mt-2">Click to upload</p>)}
                  </div>
                  
                  <div onClick={handleEducationalDocClick} className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-red-500 transition-colors">
                    <input ref={educationalDocInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleDocumentUpload(e.target.files[0], "educational_doc"); }} />
                    <FileText className="mx-auto mb-2 text-gray-400" size={32} />
                    <p className="font-semibold text-sm">Educational Document</p>
                    {uploading && uploadingType === "educational_doc" ? (
                      <div className="mt-2"><Loader2 className="w-5 h-5 animate-spin mx-auto text-red-500" /><p className="text-xs text-gray-500 mt-1">Uploading...</p></div>
                    ) : uploadedDocs.educational_doc ? (
                      <div className="mt-2"><CheckCircle size={20} className="mx-auto text-green-500" /><p className="text-xs text-gray-500 mt-1 truncate">{uploadedDocs.educational_doc.file_name}</p></div>
                    ) : (<p className="text-xs text-gray-400 mt-2">Click to upload</p>)}
                  </div>
                </div>
              </div>
              
              {/* Selected Courses Summary */}
              {/* <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-3" style={{ color: BRAND_COLORS.darkNavy }}>Selected Courses</h3>
                {courses.map((course) => (
                  <div key={course.id} className="flex justify-between py-2 border-b last:border-0">
                    <span>{course.course_title}</span>
                    <span className="font-semibold" style={{ color: BRAND_COLORS.deepRed }}>Rs. {course.course_price.toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between mt-3 pt-2 border-t font-bold">
                  <span>Total Amount</span>
                  <span style={{ color: BRAND_COLORS.deepRed }}>Rs. {totalAmount.toLocaleString()}</span>
                </div>
              </div> */}
              
              <div className="flex justify-between mt-6">
                <button onClick={() => router.push("/")} className="inline-flex items-center gap-2 px-6 py-2 rounded-lg font-semibold border-2" style={{ borderColor: BRAND_COLORS.darkGrey, color: BRAND_COLORS.darkGrey }}>
                  <ArrowLeft size={18} /> Back
                </button>
                <button onClick={handleSubmitDetails} disabled={isSubmitting || uploading} className="inline-flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all hover:scale-105" style={{ backgroundColor: BRAND_COLORS.deepRed, color: BRAND_COLORS.white }}>
                  {isSubmitting || uploading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                  {isSubmitting ? "Processing..." : uploading ? "Uploading..." : "Proceed to Voucher"}
                </button>
              </div>
            </div>
          )}
          
          {/* Step 2: Voucher Generation (Only for new enrollment or after review) */}
          {currentStep === 2 && !showReviewMode && !existingEnrollmentLoaded && (
            <div className="space-y-6">
              {/* Email Notification Banner */}
              {emailSent && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                  <Mail className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-green-800 font-semibold">Enrollment Confirmation Sent!</p>
                    <p className="text-green-600 text-sm">A confirmation email has been sent to {studentDetails.student_email}</p>
                  </div>
                </motion.div>
              )}
              
              {/* Instructions */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r rounded-xl shadow-lg p-4" style={{ background: `linear-gradient(135deg, ${BRAND_COLORS.darkNavy} 0%, ${BRAND_COLORS.darkRoyalBlue} 100%)` }}>
                <div className="flex items-center mb-3">
                  <GraduationCap className="w-5 h-5 mr-2.5 text-white" />
                  <h2 className="text-lg font-bold text-white">Enrollment Instructions</h2>
                </div>
                <div className="space-y-2.5">
                  {[ "Download the payment voucher below (one time only)", "Pay the amount using any of the provided accounts", "Save your payment slip/receipt for upload", "Upload the payment slip to complete enrollment" ].map((text, index) => (
                    <div key={index} className="flex items-start">
                      <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      </div>
                      <span className="text-gray-200 text-sm">{text}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Voucher Preview */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                  <div>
                    <h2 className="text-xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>Payment Voucher</h2>
                    <p className="text-gray-500 text-sm">Valid for 3 days only</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button onClick={generateVoucherPDF} disabled={isGeneratingVoucher || voucherDownloaded} className={`flex items-center px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${!voucherDownloaded ? 'hover:scale-105' : 'opacity-50 cursor-not-allowed'}`} style={{ backgroundColor: BRAND_COLORS.deepRed, color: BRAND_COLORS.white }}>
                      {isGeneratingVoucher ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Download className="w-4 h-4 mr-1" />}
                      {isGeneratingVoucher ? 'Generating...' : voucherDownloaded ? 'Voucher Downloaded' : 'Download Voucher'}
                    </button>
                    <button onClick={() => window.print()} className="flex items-center px-4 py-2 rounded-lg font-semibold border transition-all duration-300 hover:bg-gray-50" style={{ borderColor: BRAND_COLORS.deepRed, color: BRAND_COLORS.deepRed }}>
                      <Printer className="w-4 h-4 mr-1" /> Print
                    </button>
                  </div>
                </div>

                {/* Voucher Card */}
                <div ref={voucherRef} className="border-2 border-dashed rounded-xl p-6 mb-6" style={{ borderColor: BRAND_COLORS.deepRed }}>
                  <div className="text-center mb-6">
                    <div className="inline-block px-3 py-1 rounded-full mb-3" style={{ backgroundColor: BRAND_COLORS.deepRed, color: BRAND_COLORS.white }}>
                      <span className="font-bold text-xs">OFFICIAL PAYMENT VOUCHER</span>
                    </div>
                    <h1 className="text-2xl font-bold mb-1" style={{ color: BRAND_COLORS.darkNavy }}>LMS Education System</h1>
                    <p className="text-gray-500 text-sm">Empowering Futures Through Education</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-bold mb-3 pb-1 border-b" style={{ color: BRAND_COLORS.darkNavy, borderColor: BRAND_COLORS.softGrey }}>Student Information</h3>
                      <div className="space-y-2 text-sm">
                        <div><div className="text-gray-500">Full Name</div><div className="font-bold">{studentDetails.student_name}</div></div>
                        <div><div className="text-gray-500">Email Address</div><div className="font-medium">{studentDetails.student_email}</div></div>
                        <div><div className="text-gray-500">Phone Number</div><div className="font-medium">{studentDetails.student_phone}</div></div>
                        <div><div className="text-gray-500">Enrollment ID</div><div className="font-medium">{enrollmentId}</div></div>
                        <div><div className="text-gray-500">Voucher Number</div><div className="font-medium text-blue-600">{voucherNumber}</div></div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-3 pb-1 border-b" style={{ color: BRAND_COLORS.darkNavy, borderColor: BRAND_COLORS.softGrey }}>Payment Information</h3>
                      <div className="space-y-2 text-sm">
                        <div><div className="text-gray-500">Amount Payable</div><div className="font-bold text-2xl" style={{ color: BRAND_COLORS.deepRed }}>Rs. {totalAmount.toLocaleString()}</div></div>
                        <div><div className="text-gray-500">Due Date</div><div className="font-medium">{expiryDate.toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div></div>
                        <div><div className="text-gray-500">Courses Enrolled</div><div className="font-medium">{courses.length} course(s)</div></div>
                        <div><div className="text-gray-500">Payment Status</div><div className="inline-block px-2 py-1 rounded-full font-semibold" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>PENDING PAYMENT</div></div>
                      </div>
                    </div>
                  </div>

                  {/* <div className="mt-6">
                    <h3 className="text-md font-bold mb-2" style={{ color: BRAND_COLORS.darkNavy }}>Selected Courses</h3>
                    <div className="space-y-1">
                      {courses.map((course, idx) => (
                        <div key={course.id} className="flex justify-between text-sm py-1 border-b border-gray-100">
                          <span>{idx + 1}. {course.course_title}</span>
                          <span className="font-semibold">Rs. {course.course_price.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div> */}

                  <div className="mt-6 p-3 rounded-md" style={{ backgroundColor: `${BRAND_COLORS.deepRed}10`, border: `1px solid ${BRAND_COLORS.deepRed}20` }}>
                    <h4 className="font-bold mb-1 flex items-center text-sm"><AlertCircle className="w-4 h-4 mr-2" style={{ color: BRAND_COLORS.deepRed }} />Important Instructions</h4>
                    <ul className="text-xs space-y-1 text-gray-600">
                      <li>• This voucher is valid for 3 days only</li>
                      <li>• Mention your name and voucher number in payment transaction</li>
                      <li>• Save payment receipt for verification</li>
                      <li>• You can only download this voucher once</li>
                    </ul>
                  </div>
                </div>

                {/* Bank Accounts */}
                <div className="mt-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center" style={{ color: BRAND_COLORS.darkNavy }}><Banknote className="w-5 h-5 mr-2" style={{ color: BRAND_COLORS.darkRoyalBlue }} />Payment Methods</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-xl p-4 hover:shadow-md transition-shadow" style={{ borderColor: BRAND_COLORS.softGrey }}>
                      <div className="flex items-center mb-3"><CreditCard className="w-6 h-6 mr-2" style={{ color: BRAND_COLORS.darkRoyalBlue }} /><div><h4 className="font-bold text-sm" style={{ color: BRAND_COLORS.darkNavy }}>JazzCash</h4><p className="text-xs text-gray-500">Mobile Account</p></div></div>
                      <div className="space-y-1 text-xs"><div><div className="text-gray-500">Account Number</div><div className="font-mono font-bold flex items-center justify-between">{BANK_DETAILS.jazzCash}<button onClick={() => copyToClipboard(BANK_DETAILS.jazzCash)} className="px-2 py-0.5 rounded border text-xs hover:bg-gray-50" style={{ borderColor: BRAND_COLORS.deepRed, color: BRAND_COLORS.deepRed }}>Copy</button></div></div><div><div className="text-gray-500">Account Name</div><div className="font-medium text-sm">{BANK_DETAILS.accountTitle}</div></div></div>
                    </div>
                    <div className="border rounded-xl p-4 hover:shadow-md transition-shadow" style={{ borderColor: BRAND_COLORS.softGrey }}>
                      <div className="flex items-center mb-3"><CreditCard className="w-6 h-6 mr-2" style={{ color: BRAND_COLORS.darkRoyalBlue }} /><div><h4 className="font-bold text-sm" style={{ color: BRAND_COLORS.darkNavy }}>EasyPaisa</h4><p className="text-xs text-gray-500">Mobile Account</p></div></div>
                      <div className="space-y-1 text-xs"><div><div className="text-gray-500">Account Number</div><div className="font-mono font-bold flex items-center justify-between">{BANK_DETAILS.easyPaisa}<button onClick={() => copyToClipboard(BANK_DETAILS.easyPaisa)} className="px-2 py-0.5 rounded border text-xs hover:bg-gray-50" style={{ borderColor: BRAND_COLORS.deepRed, color: BRAND_COLORS.deepRed }}>Copy</button></div></div><div><div className="text-gray-500">Account Name</div><div className="font-medium text-sm">{BANK_DETAILS.accountTitle}</div></div></div>
                    </div>
                    <div className="border rounded-xl p-4 hover:shadow-md transition-shadow" style={{ borderColor: BRAND_COLORS.softGrey }}>
                      <div className="flex items-center mb-3"><Building className="w-6 h-6 mr-2" style={{ color: BRAND_COLORS.darkRoyalBlue }} /><div><h4 className="font-bold text-sm" style={{ color: BRAND_COLORS.darkNavy }}>{BANK_DETAILS.bankName}</h4><p className="text-xs text-gray-500">Current Account</p></div></div>
                      <div className="space-y-1 text-xs"><div><div className="text-gray-500">Account Number</div><div className="font-mono font-bold flex items-center justify-between">{BANK_DETAILS.accountNumber}<button onClick={() => copyToClipboard(BANK_DETAILS.accountNumber)} className="px-2 py-0.5 rounded border text-xs hover:bg-gray-50" style={{ borderColor: BRAND_COLORS.deepRed, color: BRAND_COLORS.deepRed }}>Copy</button></div></div><div><div className="text-gray-500">Account Name</div><div className="font-medium text-sm">{BANK_DETAILS.accountTitle}</div></div><div><div className="text-gray-500">IBAN</div><div className="font-mono text-xs">{BANK_DETAILS.iban}</div></div></div>
                    </div>
                  </div>
                </div>

                {voucherDownloaded && (
                  <div className="mt-6 p-4 bg-green-50 rounded-lg flex items-center gap-3">
                    <CheckCircle size={20} className="text-green-500" />
                    <p className="text-green-700">Voucher downloaded! Proceed to payment and upload your slip.</p>
                  </div>
                )}
              </motion.div>

              <div className="flex justify-between mt-6">
                <button onClick={() => setCurrentStep(1)} className="inline-flex items-center gap-2 px-6 py-2 rounded-lg font-semibold border-2" style={{ borderColor: BRAND_COLORS.darkGrey, color: BRAND_COLORS.darkGrey }}>
                  <ArrowLeft size={18} /> Back
                </button>
                <button onClick={() => setCurrentStep(3)} disabled={!voucherDownloaded} className={`inline-flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all ${voucherDownloaded ? "hover:scale-105" : "opacity-50 cursor-not-allowed"}`} style={{ backgroundColor: BRAND_COLORS.deepRed, color: BRAND_COLORS.white }}>
                  Proceed to Payment <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}
          
          {/* Step 3: Payment Slip Upload */}
          {(currentStep === 3 || isPublicPortal) && (
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-4 text-center" style={{ color: BRAND_COLORS.darkNavy }}>Upload Payment Slip</h2>
              <p className="text-center text-gray-600 mb-6">After making the payment, upload the payment slip/screenshot for verification</p>
              
              <div className="max-w-md mx-auto mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <p className="flex justify-between"><span className="text-gray-600">Total Amount to Pay:</span><span className="font-bold text-xl" style={{ color: BRAND_COLORS.deepRed }}>Rs. {totalAmount.toLocaleString()}</span></p>
                  <p className="flex justify-between text-sm"><span className="text-gray-500">Enrollment ID:</span><span className="font-mono text-xs">{enrollmentId}</span></p>
                  {voucherNumber && <p className="flex justify-between text-sm"><span className="text-gray-500">Voucher Number:</span><span className="font-mono text-xs">{voucherNumber}</span></p>}
                </div>
              </div>
              
              <div className="max-w-md mx-auto">
                {!paymentSubmitted ? (
                  <>
                    <div onClick={handlePaymentSlipClick} className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6 hover:border-red-500 transition-colors cursor-pointer">
                      <input ref={paymentSlipInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => setPaymentSlip(e.target.files?.[0] || null)} />
                      <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                      <p className="text-gray-600 mb-2">Click to upload payment slip</p>
                      <p className="text-xs text-gray-400">JPG, PNG, PDF (Max 5MB)</p>
                      {paymentSlip && <p className="mt-2 text-sm text-green-600">✓ Selected: {paymentSlip.name}</p>}
                    </div>
                    <button onClick={handlePaymentSlipUpload} disabled={!paymentSlip || uploadingSlip} className="w-full py-3 rounded-lg font-semibold transition-all hover:scale-105 disabled:opacity-50" style={{ backgroundColor: BRAND_COLORS.deepRed, color: BRAND_COLORS.white }}>
                      {uploadingSlip ? <Loader2 size={20} className="animate-spin mx-auto" /> : "Upload Payment Slip"}
                    </button>
                  </>
                ) : (
                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Payment Slip Submitted!</h3>
                    <p className="text-gray-600 mb-4">Your payment slip has been uploaded successfully. A confirmation email has been sent to {studentDetails.student_email}.</p>
                    <p className="text-sm text-gray-500">Our team will verify your payment within 24-48 hours. You will receive another email once verified.</p>
                    <button onClick={() => router.push("/")} className="mt-6 px-6 py-2 rounded-lg font-semibold transition-all hover:scale-105" style={{ backgroundColor: BRAND_COLORS.deepRed, color: BRAND_COLORS.white }}>Home</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartEnrollmentPage;