"use client";

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
  Printer
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
  teal: '#1FB6CB'
};

interface Course {
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
  
  const [currentStep, setCurrentStep] = useState(1);
  const [courses, setCourses] = useState<Course[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [userEmail, setUserEmail] = useState("");
  const [enrollmentId, setEnrollmentId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
  
  // Step 2: Voucher
  const [voucherNumber, setVoucherNumber] = useState("");
  const [voucherDownloaded, setVoucherDownloaded] = useState(false);
  const [isGeneratingVoucher, setIsGeneratingVoucher] = useState(false);
  const [enrollmentDataSaved, setEnrollmentDataSaved] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  // Step 3: Payment Slip
  const [paymentSlip, setPaymentSlip] = useState<File | null>(null);
  const [uploadingSlip, setUploadingSlip] = useState(false);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem("userEmail");
    if (savedEmail) {
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
    const uploaded = await uploadFile(file, type);
    if (uploaded) {
      setUploadedDocs(prev => ({ ...prev, [type]: uploaded }));
    }
    setUploading(false);
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

  // Generate voucher PDF and clear cart
  const generateVoucherPDF = async () => {
    if (!voucherRef.current) return;

    setIsGeneratingVoucher(true);
    
    try {
      // Generate image from voucher
      const dataUrl = await toPng(voucherRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#FFFFFF'
      });

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Add voucher to PDF
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`payment-voucher-${voucherNumber}.pdf`);

      setVoucherDownloaded(true);
      
      // ✅ CLEAR CART HERE - After voucher download, before payment
      await clearCartAfterVoucher();
      
      // Save to database and send email
      await saveToDatabaseAndSendEmail();
      
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
      } else {
        console.error('Failed to clear cart:', data.error);
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
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setEnrollmentDataSaved(true);
        
        if (data.emailSent) {
          setEmailSent(true);
          console.log('✅ Confirmation email sent to student');
        }
        
        const enrollmentIds = data.data.enrollmentIds || [enrollmentId];
        localStorage.setItem("enrollmentIds", JSON.stringify(enrollmentIds));
        
        // Show success message
        alert(`✅ Enrollment created successfully!\n\nA confirmation email has been sent to ${studentDetails.student_email}. Please check your inbox.`);
        
      } else {
        console.error("Failed to save to database:", data.error);
        alert("Failed to create enrollment. Please try again.");
      }
    } catch (error) {
      console.error("Error saving to database:", error);
      alert("Failed to create enrollment. Please try again.");
    }
  };

  const handlePaymentSlipUpload = async () => {
    if (!paymentSlip) {
      alert("Please select a payment slip file to upload");
      return;
    }
    
    if (!voucherDownloaded) {
      alert("Please download and review the voucher first");
      return;
    }
    
    setUploadingSlip(true);
    
    const pendingData = localStorage.getItem("pendingEnrollment");
    if (!pendingData) {
      alert("Enrollment data not found. Please start over.");
      setUploadingSlip(false);
      return;
    }
    
    const formData = new FormData();
    formData.append("file", paymentSlip);
    formData.append("enrollmentId", enrollmentId);
    formData.append("studentId", studentDetails.student_email);
    formData.append("studentEmail", studentDetails.student_email);
    formData.append("enrollmentData", pendingData);
    
    try {
      console.log('Uploading payment slip...', {
        enrollmentId,
        fileName: paymentSlip.name,
        fileSize: paymentSlip.size
      });
      
      const response = await fetch("/api/payment/upload-slip", {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();
      console.log('Upload response:', data);
      
      if (data.success) {
        setPaymentSubmitted(true);
        
        alert(`✅ Payment slip uploaded successfully!\n\nA confirmation email has been sent to ${studentDetails.student_email}. Our team will verify your payment within 24-48 hours.`);
        
        // Clear pending enrollment from localStorage
        localStorage.removeItem("pendingEnrollment");
        
        setTimeout(() => {
          router.push("/dashboard");
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
                style={currentStep >= step ? { backgroundColor: BRAND_COLORS.teal } : {}}
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
                  currentStep > step ? "bg-teal-500" : "bg-gray-200"
                }`}
                style={currentStep > step ? { backgroundColor: BRAND_COLORS.teal } : {}}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const expiryDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  return (
    <div className="min-h-screen pt-20 bg-[#F4F6F8] px-4 md:px-10 pb-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
            Course Enrollment
          </h1>
          <p className="text-gray-600 mt-2">Complete the following steps to enroll in your selected courses</p>
        </div>
        
        <StepIndicator />
        
        {/* Step 1: Student Details - Same as before */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: BRAND_COLORS.darkNavy }}>
              Student Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={studentDetails.student_name}
                    onChange={(e) => setStudentDetails({ ...studentDetails, student_name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ outlineColor: BRAND_COLORS.teal }}
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
              
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={studentDetails.student_email}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    readOnly
                  />
                </div>
              </div>
              
              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="tel"
                    value={studentDetails.student_phone}
                    onChange={(e) => setStudentDetails({ ...studentDetails, student_phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ outlineColor: BRAND_COLORS.teal }}
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
              
              {/* CNIC */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">CNIC Number *</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={studentDetails.student_cnic}
                    onChange={(e) => setStudentDetails({ ...studentDetails, student_cnic: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ outlineColor: BRAND_COLORS.teal }}
                    placeholder="12345-6789012-3"
                  />
                </div>
              </div>
              
              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2 text-gray-700">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                  <textarea
                    value={studentDetails.student_address}
                    onChange={(e) => setStudentDetails({ ...studentDetails, student_address: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ outlineColor: BRAND_COLORS.teal }}
                    rows={2}
                    placeholder="Enter your address"
                  />
                </div>
              </div>
              
              {/* Education */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Highest Education</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={studentDetails.student_education}
                    onChange={(e) => setStudentDetails({ ...studentDetails, student_education: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ outlineColor: BRAND_COLORS.teal }}
                    placeholder="e.g., Bachelor's in Computer Science"
                  />
                </div>
              </div>
              
              {/* Experience */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Experience</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={studentDetails.student_experience}
                    onChange={(e) => setStudentDetails({ ...studentDetails, student_experience: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ outlineColor: BRAND_COLORS.teal }}
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
                {/* CNIC Front */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <CreditCard className="mx-auto mb-2 text-gray-400" size={32} />
                  <p className="font-semibold text-sm">CNIC Front *</p>
                  {uploadedDocs.cnic_front ? (
                    <div className="mt-2">
                      <CheckCircle size={20} className="mx-auto text-green-500" />
                      <p className="text-xs text-gray-500 mt-1 truncate">{uploadedDocs.cnic_front.file_name}</p>
                    </div>
                  ) : (
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleDocumentUpload(e.target.files[0], "cnic_front");
                        }
                      }}
                      className="mt-2 text-sm"
                    />
                  )}
                </div>
                
                {/* CNIC Back */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <CreditCard className="mx-auto mb-2 text-gray-400" size={32} />
                  <p className="font-semibold text-sm">CNIC Back *</p>
                  {uploadedDocs.cnic_back ? (
                    <div className="mt-2">
                      <CheckCircle size={20} className="mx-auto text-green-500" />
                      <p className="text-xs text-gray-500 mt-1 truncate">{uploadedDocs.cnic_back.file_name}</p>
                    </div>
                  ) : (
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleDocumentUpload(e.target.files[0], "cnic_back");
                        }
                      }}
                      className="mt-2 text-sm"
                    />
                  )}
                </div>
                
                {/* Educational Document */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <FileText className="mx-auto mb-2 text-gray-400" size={32} />
                  <p className="font-semibold text-sm">Educational Document</p>
                  {uploadedDocs.educational_doc ? (
                    <div className="mt-2">
                      <CheckCircle size={20} className="mx-auto text-green-500" />
                      <p className="text-xs text-gray-500 mt-1 truncate">{uploadedDocs.educational_doc.file_name}</p>
                    </div>
                  ) : (
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleDocumentUpload(e.target.files[0], "educational_doc");
                        }
                      }}
                      className="mt-2 text-sm"
                    />
                  )}
                </div>
              </div>
            </div>
            
            {/* Selected Courses Summary */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-3" style={{ color: BRAND_COLORS.darkNavy }}>
                Selected Courses
              </h3>
              {courses.map((course) => (
                <div key={course.id} className="flex justify-between py-2 border-b last:border-0">
                  <span>{course.course_title}</span>
                  <span className="font-semibold" style={{ color: BRAND_COLORS.teal }}>
                    Rs. {course.course_price.toLocaleString()}
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
                Back
              </button>
              <button
                onClick={handleSubmitDetails}
                disabled={isSubmitting || uploading}
                className="inline-flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all hover:scale-105"
                style={{ backgroundColor: BRAND_COLORS.teal, color: BRAND_COLORS.white }}
              >
                {isSubmitting || uploading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                {isSubmitting ? "Processing..." : uploading ? "Uploading..." : "Proceed to Voucher"}
              </button>
            </div>
          </div>
        )}
        
        {/* Step 2: Voucher with Cart Clear on Download */}
        {currentStep === 2 && (
          <div className="space-y-6">
            {/* Email Notification Banner */}
            {emailSent && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3"
              >
                <Mail className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-green-800 font-semibold">Enrollment Confirmation Sent!</p>
                  <p className="text-green-600 text-sm">A confirmation email has been sent to {studentDetails.student_email}</p>
                </div>
              </motion.div>
            )}
            
            {/* Instructions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r rounded-xl shadow-lg p-4"
              style={{ 
                background: `linear-gradient(135deg, ${BRAND_COLORS.darkNavy} 0%, ${BRAND_COLORS.darkRoyalBlue} 100%)`
              }}
            >
              <div className="flex items-center mb-3">
                <GraduationCap className="w-5 h-5 mr-2.5 text-white" />
                <h2 className="text-lg font-bold text-white">Enrollment Instructions</h2>
              </div>
              <div className="space-y-2.5">
                {[ 
                  "Download the payment voucher below (this will clear your cart)",
                  "Pay the amount using any of the provided accounts",
                  "Save your payment slip/receipt for upload in next step",
                  "Upload the payment slip to complete enrollment",
                  "You'll receive email confirmation after successful submission"
                ].map((text, index) => (
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-md p-6 border border-gray-200"
            >
              {/* Header with Actions */}
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div>
                  <h2 className="text-xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
                    Payment Voucher
                  </h2>
                  <p className="text-gray-500 text-sm">Valid for 3 days only</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={generateVoucherPDF}
                    disabled={isGeneratingVoucher}
                    className="flex items-center px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95"
                    style={{
                      backgroundColor: BRAND_COLORS.deepRed,
                      color: BRAND_COLORS.white
                    }}
                  >
                    {isGeneratingVoucher ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-1" />
                    )}
                    {isGeneratingVoucher ? 'Generating...' : 'Download Voucher & Clear Cart'}
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center px-4 py-2 rounded-lg font-semibold border transition-all duration-300 hover:bg-gray-50"
                    style={{ 
                      borderColor: BRAND_COLORS.deepRed,
                      color: BRAND_COLORS.deepRed
                    }}
                  >
                    <Printer className="w-4 h-4 mr-1" />
                    Print
                  </button>
                </div>
              </div>

              {/* Voucher Card */}
              <div ref={voucherRef} className="border-2 border-dashed rounded-xl p-6 mb-6" style={{ borderColor: BRAND_COLORS.deepRed }}>
                <div className="text-center mb-6">
                  <div className="inline-block px-3 py-1 rounded-full mb-3" style={{ backgroundColor: BRAND_COLORS.deepRed, color: BRAND_COLORS.white }}>
                    <span className="font-bold text-xs">OFFICIAL PAYMENT VOUCHER</span>
                  </div>
                  <h1 className="text-2xl font-bold mb-1" style={{ color: BRAND_COLORS.darkNavy }}>
                    LMS Education System
                  </h1>
                  <p className="text-gray-500 text-sm">Empowering Futures Through Education</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Student Info */}
                  <div>
                    <h3 className="text-lg font-bold mb-3 pb-1 border-b" style={{ color: BRAND_COLORS.darkNavy, borderColor: BRAND_COLORS.softGrey }}>
                      Student Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <div className="text-gray-500">Full Name</div>
                        <div className="font-bold">{studentDetails.student_name}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Email Address</div>
                        <div className="font-medium">{studentDetails.student_email}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Phone Number</div>
                        <div className="font-medium">{studentDetails.student_phone}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Enrollment ID</div>
                        <div className="font-medium">{enrollmentId}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Voucher Number</div>
                        <div className="font-medium text-blue-600">{voucherNumber}</div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div>
                    <h3 className="text-lg font-bold mb-3 pb-1 border-b" style={{ color: BRAND_COLORS.darkNavy, borderColor: BRAND_COLORS.softGrey }}>
                      Payment Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <div className="text-gray-500">Amount Payable</div>
                        <div className="font-bold text-2xl" style={{ color: BRAND_COLORS.deepRed }}>Rs. {totalAmount.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Due Date</div>
                        <div className="font-medium">{expiryDate.toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Courses Enrolled</div>
                        <div className="font-medium">{courses.length} course(s)</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Payment Status</div>
                        <div className="inline-block px-2 py-1 rounded-full font-semibold" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
                          PENDING PAYMENT
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Course List */}
                <div className="mt-6">
                  <h3 className="text-md font-bold mb-2" style={{ color: BRAND_COLORS.darkNavy }}>Selected Courses</h3>
                  <div className="space-y-1">
                    {courses.map((course, idx) => (
                      <div key={course.id} className="flex justify-between text-sm py-1 border-b border-gray-100">
                        <span>{idx + 1}. {course.course_title}</span>
                        <span className="font-semibold">Rs. {course.course_price.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="mt-6 p-3 rounded-md" style={{ backgroundColor: `${BRAND_COLORS.deepRed}10`, border: `1px solid ${BRAND_COLORS.deepRed}20` }}>
                  <h4 className="font-bold mb-1 flex items-center text-sm">
                    <AlertCircle className="w-4 h-4 mr-2" style={{ color: BRAND_COLORS.deepRed }} />
                    Important Instructions
                  </h4>
                  <ul className="text-xs space-y-1 text-gray-600">
                    <li>• This voucher is valid for 3 days only</li>
                    <li>• Mention your name and voucher number in payment transaction</li>
                    <li>• Save payment receipt for verification</li>
                    <li>• You will receive email confirmation after payment verification</li>
                  </ul>
                </div>
              </div>

              {/* Bank Accounts */}
              <div className="mt-6">
                <h3 className="text-lg font-bold mb-4 flex items-center" style={{ color: BRAND_COLORS.darkNavy }}>
                  <Banknote className="w-5 h-5 mr-2" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
                  Payment Methods
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* JazzCash */}
                  <div className="border rounded-xl p-4 hover:shadow-md transition-shadow" style={{ borderColor: BRAND_COLORS.softGrey }}>
                    <div className="flex items-center mb-3">
                      <CreditCard className="w-6 h-6 mr-2" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
                      <div>
                        <h4 className="font-bold text-sm" style={{ color: BRAND_COLORS.darkNavy }}>JazzCash</h4>
                        <p className="text-xs text-gray-500">Mobile Account</p>
                      </div>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div>
                        <div className="text-gray-500">Account Number</div>
                        <div className="font-mono font-bold flex items-center justify-between">
                          {BANK_DETAILS.jazzCash}
                          <button
                            onClick={() => copyToClipboard(BANK_DETAILS.jazzCash)}
                            className="px-2 py-0.5 rounded border text-xs hover:bg-gray-50"
                            style={{ borderColor: BRAND_COLORS.teal, color: BRAND_COLORS.teal }}
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Account Name</div>
                        <div className="font-medium text-sm">{BANK_DETAILS.accountTitle}</div>
                      </div>
                    </div>
                  </div>

                  {/* EasyPaisa */}
                  <div className="border rounded-xl p-4 hover:shadow-md transition-shadow" style={{ borderColor: BRAND_COLORS.softGrey }}>
                    <div className="flex items-center mb-3">
                      <CreditCard className="w-6 h-6 mr-2" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
                      <div>
                        <h4 className="font-bold text-sm" style={{ color: BRAND_COLORS.darkNavy }}>EasyPaisa</h4>
                        <p className="text-xs text-gray-500">Mobile Account</p>
                      </div>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div>
                        <div className="text-gray-500">Account Number</div>
                        <div className="font-mono font-bold flex items-center justify-between">
                          {BANK_DETAILS.easyPaisa}
                          <button
                            onClick={() => copyToClipboard(BANK_DETAILS.easyPaisa)}
                            className="px-2 py-0.5 rounded border text-xs hover:bg-gray-50"
                            style={{ borderColor: BRAND_COLORS.teal, color: BRAND_COLORS.teal }}
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Account Name</div>
                        <div className="font-medium text-sm">{BANK_DETAILS.accountTitle}</div>
                      </div>
                    </div>
                  </div>

                  {/* Bank Account */}
                  <div className="border rounded-xl p-4 hover:shadow-md transition-shadow" style={{ borderColor: BRAND_COLORS.softGrey }}>
                    <div className="flex items-center mb-3">
                      <Building className="w-6 h-6 mr-2" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
                      <div>
                        <h4 className="font-bold text-sm" style={{ color: BRAND_COLORS.darkNavy }}>{BANK_DETAILS.bankName}</h4>
                        <p className="text-xs text-gray-500">Current Account</p>
                      </div>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div>
                        <div className="text-gray-500">Account Number</div>
                        <div className="font-mono font-bold flex items-center justify-between">
                          {BANK_DETAILS.accountNumber}
                          <button
                            onClick={() => copyToClipboard(BANK_DETAILS.accountNumber)}
                            className="px-2 py-0.5 rounded border text-xs hover:bg-gray-50"
                            style={{ borderColor: BRAND_COLORS.teal, color: BRAND_COLORS.teal }}
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Account Name</div>
                        <div className="font-medium text-sm">{BANK_DETAILS.accountTitle}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">IBAN</div>
                        <div className="font-mono text-xs">{BANK_DETAILS.iban}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Download Confirmation */}
              {voucherDownloaded && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg flex items-center gap-3">
                  <CheckCircle size={20} className="text-green-500" />
                  <p className="text-green-700">Voucher downloaded and cart cleared! Proceed to payment and upload your slip.</p>
                </div>
              )}
            </motion.div>

            <div className="flex justify-between mt-6">
              <button
                onClick={() => setCurrentStep(1)}
                className="inline-flex items-center gap-2 px-6 py-2 rounded-lg font-semibold border-2"
                style={{ borderColor: BRAND_COLORS.darkGrey, color: BRAND_COLORS.darkGrey }}
              >
                <ArrowLeft size={18} />
                Back
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                disabled={!voucherDownloaded}
                className={`inline-flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all ${
                  voucherDownloaded ? "hover:scale-105" : "opacity-50 cursor-not-allowed"
                }`}
                style={{ backgroundColor: BRAND_COLORS.teal, color: BRAND_COLORS.white }}
              >
                Proceed to Payment
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}
        
        {/* Step 3: Payment Slip Upload */}
        {currentStep === 3 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-4 text-center" style={{ color: BRAND_COLORS.darkNavy }}>
              Upload Payment Slip
            </h2>
            <p className="text-center text-gray-600 mb-6">
              After making the payment, upload the payment slip/screenshot for verification
            </p>
            
            {/* Payment Summary */}
            <div className="max-w-md mx-auto mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-2">
                <p className="flex justify-between">
                  <span className="text-gray-600">Total Amount to Pay:</span>
                  <span className="font-bold text-xl" style={{ color: BRAND_COLORS.deepRed }}>
                    Rs. {totalAmount.toLocaleString()}
                  </span>
                </p>
                <p className="flex justify-between text-sm">
                  <span className="text-gray-500">Enrollment ID:</span>
                  <span className="font-mono text-xs">{enrollmentId}</span>
                </p>
                <p className="flex justify-between text-sm">
                  <span className="text-gray-500">Voucher Number:</span>
                  <span className="font-mono text-xs">{voucherNumber}</span>
                </p>
              </div>
            </div>
            
            <div className="max-w-md mx-auto">
              {!paymentSubmitted ? (
                <>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6 hover:border-teal-500 transition-colors">
                    <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                    <p className="text-gray-600 mb-2">Click to upload payment slip</p>
                    <p className="text-xs text-gray-400">JPG, PNG, PDF (Max 5MB)</p>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => setPaymentSlip(e.target.files?.[0] || null)}
                      className="mt-4 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                    />
                    {paymentSlip && (
                      <p className="mt-2 text-sm text-green-600">✓ Selected: {paymentSlip.name}</p>
                    )}
                  </div>
                  
                  <button
                    onClick={handlePaymentSlipUpload}
                    disabled={!paymentSlip || uploadingSlip}
                    className="w-full py-3 rounded-lg font-semibold transition-all hover:scale-105 disabled:opacity-50"
                    style={{ backgroundColor: BRAND_COLORS.teal, color: BRAND_COLORS.white }}
                  >
                    {uploadingSlip ? (
                      <Loader2 size={20} className="animate-spin mx-auto" />
                    ) : (
                      "Upload Payment Slip"
                    )}
                  </button>
                </>
              ) : (
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Payment Slip Submitted!</h3>
                  <p className="text-gray-600 mb-4">
                    Your payment slip has been uploaded successfully. A confirmation email has been sent to {studentDetails.student_email}.
                  </p>
                  <p className="text-sm text-gray-500">
                    Our team will verify your payment within 24-48 hours. You will receive another email once verified.
                  </p>
                  <button
                    onClick={() => router.push("/")}
                    className="mt-6 px-6 py-2 rounded-lg font-semibold transition-all hover:scale-105"
                    style={{ backgroundColor: BRAND_COLORS.teal, color: BRAND_COLORS.white }}
                  >
                    Home
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartEnrollmentPage;