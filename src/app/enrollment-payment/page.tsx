"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Search,
  CreditCard,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Banknote,
  Building,
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Wallet
} from "lucide-react";

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
  id: string;
  course_id: string;
  course_title: string;
  course_price: number;
}

interface Enrollment {
  id: string;
  student_name: string;
  student_email: string;
  student_phone: string;
  student_cnic: string;
  student_address: string;
  student_education: string;
  student_experience: string;
  course_id: string;
  course_title: string;
  course_price: number;
}

interface PaymentData {
  id: string;
  student_name: string;
  student_email: string;
  student_phone: string;
  student_cnic: string;
  student_address: string;
  student_education: string;
  student_experience: string;
  total_amount: number;
  status: string;
  payment_status: string;
  slip_url: string | null;
  created_at: string;
  courses: Course[];
  enrollments: Enrollment[];
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

export default function EnrollmentPaymentPage() {
  const router = useRouter();
  
  // Search state
  const [paymentId, setPaymentId] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  
  // Payment data state
  const [payment, setPayment] = useState<PaymentData | null>(null);
  
  // Payment slip state
  const [paymentSlip, setPaymentSlip] = useState<File | null>(null);
  const [uploadingSlip, setUploadingSlip] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState("");
  
  const paymentSlipInputRef = React.useRef<HTMLInputElement>(null);

  // Fetch payment details by Payment ID
  const fetchPayment = async () => {
    if (!paymentId.trim()) {
      setSearchError("Please enter Payment ID");
      return;
    }
    
    setSearching(true);
    setSearchError("");
    setPayment(null);
    
    try {
      const response = await fetch(`/api/enrollment/public/${paymentId}`);
      const data = await response.json();
      
      console.log("🔍 API Response:", data);
      
      if (data.success) {
        setPayment(data.data);
      } else {
        setSearchError(data.error || "Payment not found");
      }
    } catch (error) {
      console.error("Error fetching payment:", error);
      setSearchError("Failed to fetch payment details");
    } finally {
      setSearching(false);
    }
  };

  const handlePaymentSlipClick = () => {
    paymentSlipInputRef.current?.click();
  };

  const handlePaymentSlipUpload = async () => {
    if (!paymentSlip) {
      setUploadError("Please select a payment slip file to upload");
      return;
    }
    
    if (!payment) {
      setUploadError("Payment data not found");
      return;
    }
    
    setUploadingSlip(true);
    setUploadError("");
    
    const formData = new FormData();
    formData.append("file", paymentSlip);
    formData.append("paymentId", payment.id);
    formData.append("studentEmail", payment.student_email);
    formData.append("isPublic", "true");
    
    try {
      const response = await fetch("/api/payment/upload-slip", {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUploadSuccess(true);
        setPayment(prev => prev ? { ...prev, status: 'pending', payment_status: 'pending', slip_url: data.data.slipUrl } : null);
        
        alert(`✅ Payment slip uploaded successfully!\n\n💳 Payment ID: ${payment.id}\n\nA confirmation email has been sent.`);
      } else {
        setUploadError(data.error || "Failed to upload payment slip");
      }
    } catch (error) {
      console.error("Error uploading payment slip:", error);
      setUploadError("Failed to upload payment slip. Please try again.");
    } finally {
      setUploadingSlip(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Account number copied to clipboard!');
  };

  const resetSearch = () => {
    setPayment(null);
    setPaymentId("");
    setSearchError("");
    setPaymentSlip(null);
    setUploadSuccess(false);
    setUploadError("");
  };

  // Get data from payment object (handles both direct and from enrollments)
  const getStudentName = () => {
    return payment?.student_name || payment?.enrollments?.[0]?.student_name || "Not provided";
  };
  
  const getStudentEmail = () => {
    return payment?.student_email || payment?.enrollments?.[0]?.student_email || "Not provided";
  };
  
  const getStudentPhone = () => {
    return payment?.student_phone || payment?.enrollments?.[0]?.student_phone || "Not provided";
  };
  
  const getStudentCnic = () => {
    return payment?.student_cnic || payment?.enrollments?.[0]?.student_cnic || "Not provided";
  };
  
  const getStudentAddress = () => {
    return payment?.student_address || payment?.enrollments?.[0]?.student_address || null;
  };
  
  const getStudentEducation = () => {
    return payment?.student_education || payment?.enrollments?.[0]?.student_education || null;
  };
  
  const getStudentExperience = () => {
    return payment?.student_experience || payment?.enrollments?.[0]?.student_experience || null;
  };
  
  const getCourses = () => {
    return payment?.courses || payment?.enrollments?.map(e => ({
      id: e.course_id,
      course_id: e.course_id,
      course_title: e.course_title,
      course_price: e.course_price
    })).filter((v, i, a) => a.findIndex(t => t.course_id === v.course_id) === i) || [];
  };
  
  const getTotalAmount = () => {
    return payment?.total_amount || 0;
  };
  
  const getPaymentStatus = () => {
    return payment?.payment_status || payment?.status || "pending";
  };
  
  const getSlipUrl = () => {
    return payment?.slip_url || null;
  };

  const totalCourses = getCourses().length;
  const courses = getCourses();

  return (
    <div className="min-h-screen pt-24 bg-gradient-to-br from-[#F4F6F8] to-[#E5E7EB] px-4 pb-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[#B11217] mb-4 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Home
          </button>
          <h1 className="text-3xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
            Complete Your Payment
          </h1>
          <p className="text-gray-600 mt-2">
            Enter your Payment ID to view details and upload payment slip
          </p>
        </div>

        {/* Search Section */}
        {!payment && (
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-8 h-8 text-[#B11217]" />
              </div>
              <h2 className="text-xl font-semibold" style={{ color: BRAND_COLORS.darkNavy }}>
                Find Your Payment
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Enter the Payment ID you received via email
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Payment ID *
                </label>
                <input
                  type="text"
                  value={paymentId}
                  onChange={(e) => setPaymentId(e.target.value)}
                  placeholder="e.g., PAY-1234567890-ABCDEF"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B11217] focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && fetchPayment()}
                />
              </div>

              {searchError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <p className="text-sm text-red-600">{searchError}</p>
                </div>
              )}

              <button
                onClick={fetchPayment}
                disabled={searching}
                className="w-full py-3 rounded-lg font-semibold text-white transition-all hover:scale-105 disabled:opacity-50"
                style={{ backgroundColor: BRAND_COLORS.deepRed }}
              >
                {searching ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  "Search Payment"
                )}
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Don&apos;t have a Payment ID?{' '}
                <button
                  onClick={() => router.push("/cartEnrollment")}
                  className="text-[#B11217] hover:underline font-medium"
                >
                  Start New Enrollment
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Payment Details Section */}
        {payment && !uploadSuccess && (
          <div className="space-y-6">
            {/* Payment Summary Card */}
            <div className="bg-gradient-to-r from-[#0B1C3D] to-[#1E3A8A] rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Payment Summary</h2>
                    <p className="text-white/80 text-sm">Payment ID: {payment.id}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm ${
                  getPaymentStatus() === 'verified' 
                    ? 'bg-green-500/20 text-green-300' 
                    : getPaymentStatus() === 'pending'
                    ? 'bg-yellow-500/20 text-yellow-300'
                    : 'bg-red-500/20 text-red-300'
                }`}>
                  {getPaymentStatus() === 'verified' ? 'Verified' : 
                   getPaymentStatus() === 'pending' ? 'Pending Verification' : 'Pending Payment'}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-white/70 text-sm">Total Amount</p>
                  <p className="text-2xl font-bold">Rs. {getTotalAmount().toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-white/70 text-sm">Courses</p>
                  <p className="text-lg font-semibold">{totalCourses} Course(s)</p>
                </div>
              </div>
            </div>

            {/* Student Details */}
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
              <h2 className="text-xl font-bold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
                Student Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Full Name</p>
                    <p className="font-medium">{getStudentName()}</p>
                  </div>
                </div>
                
                {/* Email */}
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Email Address</p>
                    <p className="font-medium">{getStudentEmail()}</p>
                  </div>
                </div>
                
                {/* Phone Number */}
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Phone Number</p>
                    <p className="font-medium">{getStudentPhone()}</p>
                  </div>
                </div>
                
                {/* CNIC Number */}
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <CreditCard className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">CNIC Number</p>
                    <p className="font-medium">{getStudentCnic()}</p>
                  </div>
                </div>
                
                {/* Address */}
                {getStudentAddress() && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg md:col-span-2">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Address</p>
                      <p className="font-medium">{getStudentAddress()}</p>
                    </div>
                  </div>
                )}
                
                {/* Education */}
                {getStudentEducation() && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <GraduationCap className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Education</p>
                      <p className="font-medium">{getStudentEducation()}</p>
                    </div>
                  </div>
                )}
                
                {/* Experience */}
                {getStudentExperience() && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Briefcase className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Experience</p>
                      <p className="font-medium">{getStudentExperience()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Selected Courses */}
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
              <h2 className="text-xl font-bold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
                Selected Courses
              </h2>
              <div className="space-y-2">
                {courses.map((course, idx) => (
                  <div key={course.id || idx} className="flex justify-between py-2 border-b border-gray-100">
                    <span>{idx + 1}. {course.course_title}</span>
                   
                  </div>
                ))}
                <div className="flex justify-between mt-3 pt-2 border-t font-bold">
                  <span>Total Amount</span>
                  <span style={{ color: BRAND_COLORS.deepRed }}>Rs. {getTotalAmount().toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: BRAND_COLORS.darkNavy }}>
                <Banknote className="w-5 h-5" style={{ color: BRAND_COLORS.deepRed }} />
                Payment Methods
              </h2>
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
                          style={{ borderColor: BRAND_COLORS.deepRed, color: BRAND_COLORS.deepRed }}
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
                          style={{ borderColor: BRAND_COLORS.deepRed, color: BRAND_COLORS.deepRed }}
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
                          style={{ borderColor: BRAND_COLORS.deepRed, color: BRAND_COLORS.deepRed }}
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

            {/* Payment Slip Upload */}
            {getPaymentStatus() !== 'verified' && !getSlipUrl() && (
              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                <h2 className="text-2xl font-bold mb-4 text-center" style={{ color: BRAND_COLORS.darkNavy }}>
                  Upload Payment Slip
                </h2>
                <p className="text-center text-gray-600 mb-6">
                  After making the payment, upload the payment slip/screenshot for verification
                </p>
                
                <div className="max-w-md mx-auto">
                  <div 
                    onClick={handlePaymentSlipClick}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6 hover:border-red-500 transition-colors cursor-pointer"
                  >
                    <input
                      ref={paymentSlipInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={(e) => setPaymentSlip(e.target.files?.[0] || null)}
                    />
                    <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                    <p className="text-gray-600 mb-2">Click to upload payment slip</p>
                    <p className="text-xs text-gray-400">JPG, PNG, PDF (Max 5MB)</p>
                    {paymentSlip && (
                      <p className="mt-2 text-sm text-green-600">✓ Selected: {paymentSlip.name}</p>
                    )}
                  </div>
                  
                  {uploadError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <p className="text-sm text-red-600">{uploadError}</p>
                    </div>
                  )}
                  
                  <button
                    onClick={handlePaymentSlipUpload}
                    disabled={!paymentSlip || uploadingSlip}
                    className="w-full py-3 rounded-lg font-semibold transition-all hover:scale-105 disabled:opacity-50"
                    style={{ backgroundColor: BRAND_COLORS.deepRed, color: BRAND_COLORS.white }}
                  >
                    {uploadingSlip ? (
                      <Loader2 size={20} className="animate-spin mx-auto" />
                    ) : (
                      "Upload Payment Slip"
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Already Uploaded Message */}
            {getSlipUrl() && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
                <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-xl font-semibold text-green-700 mb-2">Payment Slip Already Uploaded</h3>
                <p className="text-gray-600">
                  Your payment slip has been submitted. Our team will verify your payment within 24-48 hours.
                </p>
                <button
                  onClick={() => router.push("/")}
                  className="mt-4 px-6 py-2 rounded-lg font-semibold transition-all hover:scale-105"
                  style={{ backgroundColor: BRAND_COLORS.deepRed, color: BRAND_COLORS.white }}
                >
                  Go to Home
                </button>
              </div>
            )}

            {/* Success Message */}
            {uploadSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
                <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-xl font-semibold text-green-700 mb-2">Payment Slip Submitted!</h3>
                <p className="text-gray-600 mb-4">
                  Your payment slip has been uploaded successfully. A confirmation email has been sent to {getStudentEmail()}.
                </p>
                <p className="text-sm text-gray-500">
                  Our team will verify your payment within 24-48 hours. You will receive another email once verified.
                </p>
                <button
                  onClick={() => router.push("/")}
                  className="mt-4 px-6 py-2 rounded-lg font-semibold transition-all hover:scale-105"
                  style={{ backgroundColor: BRAND_COLORS.deepRed, color: BRAND_COLORS.white }}
                >
                  Go to Home
                </button>
              </div>
            )}

            {/* Search Another Button */}
            {!uploadSuccess && (
              <div className="flex justify-center">
                <button
                  onClick={resetSearch}
                  className="inline-flex items-center gap-2 px-6 py-2 rounded-lg font-semibold border-2"
                  style={{ borderColor: BRAND_COLORS.darkGrey, color: BRAND_COLORS.darkGrey }}
                >
                  <Search size={18} />
                  Search Another Payment
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}