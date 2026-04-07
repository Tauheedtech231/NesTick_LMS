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
  Eye,
  Save
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

interface UploadedDocument {
  url: string;
  public_id: string;
  file_name: string;
}

// Dynamic Form Field Interface
interface FormField {
  id: string;
  label: string;
  name: string;
  type: string;
  placeholder: string;
  required: boolean;
  order: number;
  options: string[] | null;
  status: string;
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

// File Input Component
const DynamicFileInput = ({ field, value, error, onFileUpload, isUploading, uploadedFile }: { 
  field: FormField;
  value: any;
  error?: string;
  onFileUpload: (file: File, fieldName: string) => void;
  isUploading: boolean;
  uploadedFile: UploadedDocument | null;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleClick = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div className="md:col-span-2">
      <label className="block text-sm font-semibold mb-2 text-gray-700">
        {field.label} {field.required && <span className="text-red-500">*</span>}
      </label>
      <div 
        onClick={handleClick}
        className="group relative bg-white border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center cursor-pointer hover:border-red-500 hover:shadow-lg transition-all duration-300"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              onFileUpload(e.target.files[0], field.name);
            }
          }}
        />
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-red-50 transition-colors">
            <FileText className="w-8 h-8 text-gray-400 group-hover:text-red-500 transition-colors" />
          </div>
          <p className="font-semibold text-gray-700 mb-1">{field.label}</p>
          <p className="text-xs text-gray-400 mb-3">{field.placeholder || `Upload ${field.label}`}</p>
          
          {isUploading ? (
            <div className="flex items-center gap-2 text-red-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs">Uploading...</span>
            </div>
          ) : uploadedFile ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle size={16} />
              <span className="text-xs font-medium">Uploaded</span>
              <p className="text-xs text-gray-500 truncate max-w-[150px]">{uploadedFile.file_name}</p>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-400">
              <Upload className="w-4 h-4" />
              <span className="text-xs">Click to upload</span>
            </div>
          )}
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

const CartEnrollmentPage: React.FC = () => {
  const router = useRouter();
  const voucherRef = useRef<HTMLDivElement>(null);
  
  // File input refs
  const paymentSlipInputRef = useRef<HTMLInputElement>(null);
  
  // Ref to prevent duplicate enrollment creation
  const isCreatingEnrollment = useRef(false);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [courses, setCourses] = useState<Course[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [userEmail, setUserEmail] = useState("");
  const [enrollmentId, setEnrollmentId] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Dynamic Form Fields State
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [loadingFields, setLoadingFields] = useState(true);
  const [dynamicFormData, setDynamicFormData] = useState<Record<string, any>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});
  const [uploadedFileUrls, setUploadedFileUrls] = useState<Record<string, UploadedDocument>>({});
  
  // Step 2: Voucher
  const [voucherNumber, setVoucherNumber] = useState("");
  const [voucherDownloaded, setVoucherDownloaded] = useState(false);
  const [isGeneratingVoucher, setIsGeneratingVoucher] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [enrollmentCreated, setEnrollmentCreated] = useState(false);
  
  // Step 3: Payment Slip
  const [paymentSlip, setPaymentSlip] = useState<File | null>(null);
  const [uploadingSlip, setUploadingSlip] = useState(false);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [isPublicPortal, setIsPublicPortal] = useState(false);
  const [publicEnrollmentId, setPublicEnrollmentId] = useState("");

  // Load saved form data from sessionStorage (temporary, clears on tab close)
  useEffect(() => {
    const savedFormData = sessionStorage.getItem("enrollment_form_data");
    if (savedFormData) {
      try {
        const parsed = JSON.parse(savedFormData);
        if (parsed.dynamicFormData) setDynamicFormData(parsed.dynamicFormData);
        if (parsed.uploadedFileUrls) setUploadedFileUrls(parsed.uploadedFileUrls);
        if (parsed.courses) setCourses(parsed.courses);
        if (parsed.totalAmount) setTotalAmount(parsed.totalAmount);
        if (parsed.voucherNumber) setVoucherNumber(parsed.voucherNumber);
        if (parsed.voucherDownloaded) setVoucherDownloaded(parsed.voucherDownloaded);
        if (parsed.currentStep) setCurrentStep(parsed.currentStep);
        if (parsed.enrollmentCreated) setEnrollmentCreated(parsed.enrollmentCreated);
        if (parsed.enrollmentId) setEnrollmentId(parsed.enrollmentId);
        if (parsed.paymentId) setPaymentId(parsed.paymentId);
        console.log("✅ Loaded saved form data from sessionStorage");
      } catch (e) {
        console.error("Error loading saved form data:", e);
      }
    }
  }, []);

  // Save form data to sessionStorage (temporary, clears on tab close)
  useEffect(() => {
    const formDataToSave = {
      dynamicFormData,
      uploadedFileUrls,
      courses,
      totalAmount,
      voucherNumber,
      voucherDownloaded,
      currentStep,
      enrollmentCreated,
      enrollmentId,
      paymentId,
      lastUpdated: new Date().toISOString()
    };
    sessionStorage.setItem("enrollment_form_data", JSON.stringify(formDataToSave));
  }, [dynamicFormData, uploadedFileUrls, courses, totalAmount, voucherNumber, voucherDownloaded, currentStep, enrollmentCreated, enrollmentId, paymentId]);

  // Clear saved form data
  const clearSavedFormData = () => {
    sessionStorage.removeItem("enrollment_form_data");
    console.log("🗑️ Cleared saved form data");
  };

  // Fetch dynamic form fields
  useEffect(() => {
    fetchFormFields();
  }, []);

  const fetchFormFields = async () => {
    try {
      setLoadingFields(true);
      const response = await fetch('/api/student-form-fields');
      const result = await response.json();
      
      if (response.ok && result.success) {
        const activeFields = result.data
          .filter((field: FormField) => field.status === 'active')
          .sort((a: FormField, b: FormField) => a.order - b.order);
        
        setFormFields(activeFields);
        
        const savedData = sessionStorage.getItem("enrollment_form_data");
        if (!savedData) {
          const initialData: Record<string, any> = {};
          activeFields.forEach((field: FormField) => {
            initialData[field.name] = '';
          });
          setDynamicFormData(initialData);
        }
      }
    } catch (error) {
      console.error('Error fetching form fields:', error);
    } finally {
      setLoadingFields(false);
    }
  };

  useEffect(() => {
    const savedEmail = localStorage.getItem("userEmail");
    const urlParams = new URLSearchParams(window.location.search);
    const enrollmentIdParam = urlParams.get('enrollment_id');
    
    if (enrollmentIdParam) {
      setIsPublicPortal(true);
      setPublicEnrollmentId(enrollmentIdParam);
      setCurrentStep(3);
    } else if (savedEmail) {
      setUserEmail(savedEmail);
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
        const total = uniqueCourses.reduce((sum: number, item: Course) => {
          const raw = item.course_price;
          if (raw === null || raw === undefined) return sum;
          const price = Number(raw);
          return isNaN(price) ? sum : sum + price;
        }, 0);
        setTotalAmount(total);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  const uploadFile = async (file: File, fieldName: string): Promise<UploadedDocument | null> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", fieldName);
    
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
      console.error(`Error uploading ${fieldName}:`, error);
      return null;
    }
  };

  const handleDynamicFileUpload = async (file: File, fieldName: string) => {
    setUploadingFiles(prev => ({ ...prev, [fieldName]: true }));
    const uploaded = await uploadFile(file, fieldName);
    if (uploaded) {
      setUploadedFileUrls(prev => ({ ...prev, [fieldName]: uploaded }));
      setDynamicFormData(prev => ({ ...prev, [fieldName]: uploaded.url }));
    }
    setUploadingFiles(prev => ({ ...prev, [fieldName]: false }));
  };

  const handlePaymentSlipClick = () => {
    paymentSlipInputRef.current?.click();
  };

  const handleDynamicFieldChange = (name: string, value: any) => {
    setDynamicFormData(prev => ({ ...prev, [name]: value }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const renderDynamicField = (field: FormField) => {
    const value = dynamicFormData[field.name] || '';
    const error = formErrors[field.name];
    
    if (field.type === 'file') {
      return (
        <DynamicFileInput
          key={field.id}
          field={field}
          value={value}
          error={error}
          onFileUpload={handleDynamicFileUpload}
          isUploading={uploadingFiles[field.name] || false}
          uploadedFile={uploadedFileUrls[field.name] || null}
        />
      );
    }
    
    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.id} className="md:col-span-2">
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={value}
              onChange={(e) => handleDynamicFieldChange(field.name, e.target.value)}
              placeholder={field.placeholder || `Enter ${field.label}`}
              rows={3}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
              required={field.required}
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
          </div>
        );
      
      case 'select':
        return (
          <div key={field.id}>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <select
              value={value}
              onChange={(e) => handleDynamicFieldChange(field.name, e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
              required={field.required}
            >
              <option value="">Select {field.label}</option>
              {field.options?.map((opt, idx) => (
                <option key={idx} value={opt}>{opt}</option>
              ))}
            </select>
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
          </div>
        );
      
      case 'radio':
        return (
          <div key={field.id}>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-2">
              {field.options?.map((opt, idx) => (
                <label key={idx} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={field.name}
                    value={opt}
                    checked={value === opt}
                    onChange={(e) => handleDynamicFieldChange(field.name, e.target.value)}
                    className="w-4 h-4 text-red-500"
                    required={field.required}
                  />
                  <span className="text-sm text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
          </div>
        );
      
      case 'checkbox':
        return (
          <div key={field.id}>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-2">
              {field.options?.map((opt, idx) => (
                <label key={idx} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name={field.name}
                    value={opt}
                    checked={Array.isArray(value) ? value.includes(opt) : value === opt}
                    onChange={(e) => {
                      let newValue = Array.isArray(value) ? [...value] : [];
                      if (e.target.checked) {
                        newValue.push(opt);
                      } else {
                        newValue = newValue.filter(v => v !== opt);
                      }
                      handleDynamicFieldChange(field.name, newValue);
                    }}
                    className="w-4 h-4 text-red-500 rounded"
                  />
                  <span className="text-sm text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
          </div>
        );
      
      default:
        return (
          <div key={field.id}>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type={field.type}
              value={value}
              onChange={(e) => handleDynamicFieldChange(field.name, e.target.value)}
              placeholder={field.placeholder || `Enter ${field.label}`}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
              required={field.required}
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
          </div>
        );
    }
  };

  const saveEnrollmentDataToLocal = () => {
    const enrollmentData = {
      dynamicFields: dynamicFormData,
      uploadedFiles: uploadedFileUrls,
      courses,
      totalAmount,
      generatedAt: new Date().toISOString(),
      status: 'pending_payment'
    };
    
    sessionStorage.setItem("pendingEnrollment", JSON.stringify(enrollmentData));
    return;
  };

  const handleSubmitDetails = async () => {
    // Check all required fields
    const missingRequired = formFields.filter(f => f.required && !dynamicFormData[f.name]);
    if (missingRequired.length > 0) {
      alert(`Please fill all required fields: ${missingRequired.map(f => f.label).join(", ")}`);
      return;
    }
    
    // Check all file fields are uploaded
    const fileFields = formFields.filter(f => f.type === 'file');
    const missingFiles = fileFields.filter(f => f.required && !uploadedFileUrls[f.name]);
    if (missingFiles.length > 0) {
      alert(`Please upload: ${missingFiles.map(f => f.label).join(", ")}`);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      saveEnrollmentDataToLocal();
      const newVoucherNumber = `VCH-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
      setVoucherNumber(newVoucherNumber);
      setCurrentStep(2);
    } catch (error) {
      console.error("Error saving details:", error);
      alert("Failed to save enrollment details");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save to database with payment ID
  const saveToDatabaseAndSendEmail = async (): Promise<boolean> => {
    if (isCreatingEnrollment.current) {
      console.log('⏳ Enrollment creation already in progress...');
      return false;
    }
    
    try {
      isCreatingEnrollment.current = true;
      
      const pendingData = sessionStorage.getItem("pendingEnrollment");
      if (!pendingData) return false;
      
      const enrollmentData = JSON.parse(pendingData);
      
      const response = await fetch("/api/enrollment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dynamicFields: enrollmentData.dynamicFields,
          uploadedFiles: enrollmentData.uploadedFiles,
          courses: enrollmentData.courses,
          totalAmount: enrollmentData.totalAmount,
          voucherNumber: voucherNumber,
          sendEmail: true
        }),
      });
      
      const data = await response.json();
      console.log("📥 Enrollment response:", data);
      
      if (data.success) {
        // Store PAYMENT ID and ENROLLMENT IDs
        const newPaymentId = data.data.paymentId;
        const enrollmentIds = data.data.enrollmentIds;
        const primaryEnrollmentId = data.data.primaryEnrollmentId;
        
        setPaymentId(newPaymentId);
        setEnrollmentId(primaryEnrollmentId);
        setEnrollmentCreated(true);
        
        sessionStorage.setItem("paymentId", newPaymentId);
        sessionStorage.setItem("enrollmentId", primaryEnrollmentId);
        sessionStorage.setItem("enrollmentIds", JSON.stringify(enrollmentIds));
        
        if (data.emailSent) {
          setEmailSent(true);
        }
        
        sessionStorage.removeItem("pendingEnrollment");
        
        alert(`✅ Enrollment created successfully!\n\n💳 Payment ID: ${newPaymentId}\n📌 Enrollment ID: ${primaryEnrollmentId}\n\n📧 Confirmation email sent to ${userEmail}\n\nPlease use the Payment ID for payment reference.`);
        
        return true;
      } else {
        console.error("Failed to save:", data.error);
        alert(`❌ Failed to create enrollment: ${data.error}`);
        return false;
      }
    } catch (error) {
      console.error("Error saving:", error);
      alert("❌ Failed to create enrollment. Please try again.");
      return false;
    } finally {
      isCreatingEnrollment.current = false;
    }
  };

  // ✅ UPDATED: Generate voucher - NO DOWNLOAD RESTRICTION, can download multiple times
  const generateVoucherPDF = async () => {
    if (!voucherRef.current) return;

    setIsGeneratingVoucher(true);
    
    try {
      // Check if enrollment already exists
      const existingEnrollmentId = sessionStorage.getItem("enrollmentId");
      let currentEnrollmentId = enrollmentId;
      let currentPaymentId = paymentId;
      
      // If enrollment not created yet, create it first
      if (!existingEnrollmentId || !enrollmentCreated) {
        const enrollmentCreated_success = await saveToDatabaseAndSendEmail();
        
        if (!enrollmentCreated_success) {
          const savedId = sessionStorage.getItem("enrollmentId");
          if (savedId) {
            setEnrollmentId(savedId);
            setEnrollmentCreated(true);
            currentEnrollmentId = savedId;
            currentPaymentId = sessionStorage.getItem("paymentId") || "";
          } else {
            setIsGeneratingVoucher(false);
            return;
          }
        } else {
          currentEnrollmentId = enrollmentId;
          currentPaymentId = paymentId;
        }
      } else {
        currentEnrollmentId = existingEnrollmentId;
        currentPaymentId = sessionStorage.getItem("paymentId") || paymentId;
      }
      
      // Generate voucher PDF
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
      
      // Clear cart after successful voucher generation
      await clearCartAfterVoucher();
      
      alert(`✅ Voucher downloaded successfully!\n\n💳 Payment ID: ${currentPaymentId}\n📌 Use this Payment ID for payment.\n\n📧 Confirmation email sent to ${userEmail}`);
      
    } catch (error) {
      console.error('Error generating voucher:', error);
      alert('❌ Failed to generate voucher. Please try again.');
    } finally {
      setIsGeneratingVoucher(false);
    }
  };

  const clearCartAfterVoucher = async () => {
    try {
      const response = await fetch("/api/student/cart/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });
      
      const data = await response.json();
      if (data.success) {
        console.log('✅ Cart cleared successfully');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const handlePaymentSlipUpload = async () => {
    if (!paymentSlip) {
      alert("Please select a payment slip file to upload");
      return;
    }
    
    if (!paymentId && !enrollmentId) {
      alert("❌ Payment ID is missing. Please download the voucher first.");
      return;
    }
    
    setUploadingSlip(true);
    
    const formData = new FormData();
    formData.append("file", paymentSlip);
    formData.append("paymentId", paymentId);
    formData.append("studentEmail", userEmail);
    formData.append("enrollmentId", enrollmentId);
    formData.append("isPublic", String(isPublicPortal));
    
    try {
      const response = await fetch("/api/payment/upload-slip", {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPaymentSubmitted(true);
        clearSavedFormData();
        alert(`✅ Payment slip uploaded successfully!\n\n💳 Payment ID: ${paymentId}\n\n📧 A confirmation email has been sent to ${userEmail}.`);
        
        setTimeout(() => {
          router.push("/");
        }, 3000);
      } else {
        alert(data.error || "Failed to upload payment slip");
      }
    } catch (error) {
      console.error("Error uploading payment slip:", error);
      alert("❌ Failed to upload payment slip. Please try again.");
    } finally {
      setUploadingSlip(false);
    }
  };

  const handleClearSavedData = () => {
    if (confirm("Are you sure you want to clear all saved form data?")) {
      clearSavedFormData();
      const initialData: Record<string, any> = {};
      formFields.forEach((field: FormField) => {
        initialData[field.name] = '';
      });
      setDynamicFormData(initialData);
      setUploadedFileUrls({});
      setCourses([]);
      setTotalAmount(0);
      setVoucherNumber("");
      setVoucherDownloaded(false);
      setEnrollmentCreated(false);
      setEnrollmentId("");
      setPaymentId("");
      setCurrentStep(1);
      alert("✅ Saved form data cleared!");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Account number copied!');
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
      <div className="min-h-screen pt-20 bg-[#F4F6F8] px-4 md:px-10 pb-10">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
              {isPublicPortal ? "Complete Your Payment" : "Course Enrollment"}
            </h1>
            <p className="text-gray-600 mt-2">
              {isPublicPortal 
                ? "Upload your payment slip to complete enrollment" 
                : "Complete the following steps to enroll in your selected courses"}
            </p>
            {!isPublicPortal && (
              <button
                onClick={handleClearSavedData}
                className="mt-3 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-red-600"
              >
                <X size={14} />
                Clear Saved Data
              </button>
            )}
          </div>
          
          {!isPublicPortal && <StepIndicator />}
          
          {/* Step 1: Student Details - Dynamic Fields */}
          {currentStep === 1 && !isPublicPortal && (
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
                  Student Information
                </h2>
                <div className="text-xs text-gray-400 flex items-center gap-1">
                  <Save size={12} />
                  <span>Auto-saved</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {!loadingFields && formFields.map((field) => renderDynamicField(field))}
                {loadingFields && (
                  <div className="md:col-span-2 text-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-red-500" />
                    <p className="text-xs text-gray-500 mt-1">Loading form fields...</p>
                  </div>
                )}
              </div>
              
              {/* Selected Courses Summary */}
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-3" style={{ color: BRAND_COLORS.darkNavy }}>
                  Selected Courses
                </h3>
                {courses.map((course) => (
                  <div key={course.id} className="flex justify-between py-2 border-b last:border-0">
                    <span>{course.course_title}</span>
                    <span className="font-semibold" style={{ color: BRAND_COLORS.deepRed }}>
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
                <button onClick={() => router.push("/")} className="inline-flex items-center gap-2 px-6 py-2 rounded-lg font-semibold border-2" style={{ borderColor: BRAND_COLORS.darkGrey, color: BRAND_COLORS.darkGrey }}>
                  <ArrowLeft size={18} /> Back
                </button>
                <button onClick={handleSubmitDetails} disabled={isSubmitting} className="inline-flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all hover:scale-105" style={{ backgroundColor: BRAND_COLORS.deepRed, color: BRAND_COLORS.white }}>
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                  {isSubmitting ? "Processing..." : "Proceed to Voucher"}
                </button>
              </div>
            </div>
          )}
          
          {/* Step 2: Voucher Generation */}
          {currentStep === 2 && !isPublicPortal && (
            <div className="space-y-6">
              {emailSent && (
                <motion.div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                  <Mail className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-green-800 font-semibold">Enrollment Confirmation Sent!</p>
                    <p className="text-green-600 text-sm">A confirmation email has been sent to {userEmail}</p>
                  </div>
                </motion.div>
              )}
              
              <motion.div className="bg-gradient-to-r rounded-xl shadow-lg p-4" style={{ background: `linear-gradient(135deg, ${BRAND_COLORS.darkNavy} 0%, ${BRAND_COLORS.darkRoyalBlue} 100%)` }}>
                <div className="flex items-center mb-3">
                  <GraduationCap className="w-5 h-5 mr-2.5 text-white" />
                  <h2 className="text-lg font-bold text-white">Enrollment Instructions</h2>
                </div>
                <div className="space-y-2.5">
                  {[ "Download the payment voucher below", "Pay the amount using any of the provided accounts", "Save your payment slip/receipt for upload", "Upload the payment slip to complete enrollment" ].map((text, index) => (
                    <div key={index} className="flex items-start">
                      <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center mr-3">
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      </div>
                      <span className="text-gray-200 text-sm">{text}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                  <div>
                    <h2 className="text-xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>Payment Voucher</h2>
                    <p className="text-gray-500 text-sm">Valid for 3 days only</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button onClick={generateVoucherPDF} disabled={isGeneratingVoucher} className={`flex items-center px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105`} style={{ backgroundColor: BRAND_COLORS.deepRed, color: BRAND_COLORS.white }}>
                      {isGeneratingVoucher ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Download className="w-4 h-4 mr-1" />}
                      {isGeneratingVoucher ? 'Creating Enrollment...' : 'Download Voucher'}
                    </button>
                    <button onClick={() => window.print()} className="flex items-center px-4 py-2 rounded-lg font-semibold border transition-all duration-300 hover:bg-gray-50" style={{ borderColor: BRAND_COLORS.deepRed, color: BRAND_COLORS.deepRed }}>
                      <Printer className="w-4 h-4 mr-1" /> Print
                    </button>
                  </div>
                </div>

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
                      <h3 className="text-lg font-bold mb-3 pb-1 border-b" style={{ color: BRAND_COLORS.darkNavy }}>Student Information</h3>
                      <div className="space-y-2 text-sm">
                        {formFields.map((field) => (
                          <div key={field.id}>
                            <div className="text-gray-500">{field.label}</div>
                            <div className="font-medium">
                              {field.type === 'file' 
                                ? (uploadedFileUrls[field.name]?.file_name || 'Not uploaded')
                                : (dynamicFormData[field.name] || 'Not provided')}
                            </div>
                          </div>
                        ))}
                        <div><div className="text-gray-500">Payment ID</div><div className="font-medium font-mono text-red-600">{paymentId || 'Will be generated'}</div></div>
                        <div><div className="text-gray-500">Enrollment ID</div><div className="font-medium">{enrollmentId || 'Will be generated'}</div></div>
                        <div><div className="text-gray-500">Voucher Number</div><div className="font-medium text-blue-600">{voucherNumber}</div></div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-3 pb-1 border-b" style={{ color: BRAND_COLORS.darkNavy }}>Payment Information</h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <div className="text-gray-500">Amount Payable</div>
                          <div className="font-bold text-2xl" style={{ color: BRAND_COLORS.deepRed }}>Rs. {totalAmount.toLocaleString()}</div>
                        </div>
                        <div><div className="text-gray-500">Due Date</div><div className="font-medium">{expiryDate.toLocaleDateString('en-PK')}</div></div>
                        <div><div className="text-gray-500">Courses Enrolled</div><div className="font-medium">{courses.length} course(s)</div></div>
                        <div><div className="text-gray-500">Payment Status</div><div className="inline-block px-2 py-1 rounded-full font-semibold" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>PENDING PAYMENT</div></div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-3 rounded-md" style={{ backgroundColor: `${BRAND_COLORS.deepRed}10` }}>
                    <h4 className="font-bold mb-1 flex items-center text-sm"><AlertCircle className="w-4 h-4 mr-2" style={{ color: BRAND_COLORS.deepRed }} />Important Instructions</h4>
                    <ul className="text-xs space-y-1 text-gray-600">
                      <li>• Use <strong>Payment ID: {paymentId || 'from email'}</strong> for transaction reference</li>
                      <li>• This voucher is valid for 3 days only</li>
                      <li>• Save payment receipt for verification</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center"><Banknote className="w-5 h-5 mr-2" />Payment Methods</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-xl p-4">
                      <div><h4 className="font-bold">JazzCash</h4><p className="text-xs">Mobile Account</p></div>
                      <div className="font-mono font-bold flex justify-between">{BANK_DETAILS.jazzCash}<button onClick={() => copyToClipboard(BANK_DETAILS.jazzCash)} className="px-2 py-0.5 rounded border text-xs">Copy</button></div>
                      <div>Account Name: {BANK_DETAILS.accountTitle}</div>
                    </div>
                    <div className="border rounded-xl p-4">
                      <div><h4 className="font-bold">EasyPaisa</h4><p className="text-xs">Mobile Account</p></div>
                      <div className="font-mono font-bold flex justify-between">{BANK_DETAILS.easyPaisa}<button onClick={() => copyToClipboard(BANK_DETAILS.easyPaisa)} className="px-2 py-0.5 rounded border text-xs">Copy</button></div>
                      <div>Account Name: {BANK_DETAILS.accountTitle}</div>
                    </div>
                    <div className="border rounded-xl p-4">
                      <div><h4 className="font-bold">{BANK_DETAILS.bankName}</h4><p className="text-xs">Current Account</p></div>
                      <div className="font-mono font-bold flex justify-between">{BANK_DETAILS.accountNumber}<button onClick={() => copyToClipboard(BANK_DETAILS.accountNumber)} className="px-2 py-0.5 rounded border text-xs">Copy</button></div>
                      <div>Account Name: {BANK_DETAILS.accountTitle}</div>
                      <div className="text-xs">IBAN: {BANK_DETAILS.iban}</div>
                    </div>
                  </div>
                </div>

                {voucherDownloaded && (
                  <div className="mt-6 p-4 bg-green-50 rounded-lg">
                    <CheckCircle size={20} className="text-green-500" />
                    <p>Voucher downloaded! Proceed to payment.</p>
                  </div>
                )}
              </motion.div>

              <div className="flex justify-between mt-6">
                <button onClick={() => setCurrentStep(1)} className="inline-flex items-center gap-2 px-6 py-2 rounded-lg border-2">Back</button>
                <button onClick={() => setCurrentStep(3)} disabled={!voucherDownloaded} className={`inline-flex items-center gap-2 px-6 py-2 rounded-lg font-semibold ${voucherDownloaded ? "hover:scale-105" : "opacity-50"}`} style={{ backgroundColor: BRAND_COLORS.deepRed, color: BRAND_COLORS.white }}>Proceed to Payment <ArrowRight size={18} /></button>
              </div>
            </div>
          )}
          
          {/* Step 3: Payment Slip Upload */}
          {(currentStep === 3 || isPublicPortal) && (
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-4 text-center">Upload Payment Slip</h2>
              <p className="text-center text-gray-600 mb-6">After making the payment, upload the payment slip/screenshot for verification</p>
              
              {enrollmentCreated && (
                <div className="max-w-md mx-auto mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700 text-center">✅ Enrollment created! Payment ID: <strong>{paymentId}</strong></p>
                </div>
              )}
              
              <div className="max-w-md mx-auto mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <p className="flex justify-between"><span>Total Amount:</span><span className="font-bold text-xl text-red-600">Rs. {totalAmount.toLocaleString()}</span></p>
                  <p className="flex justify-between text-sm"><span>Payment ID:</span><span className="font-mono text-xs font-bold text-red-600">{paymentId || 'Will be generated after download'}</span></p>
                  <p className="flex justify-between text-sm"><span>Enrollment ID:</span><span className="font-mono text-xs">{enrollmentId}</span></p>
                </div>
              </div>
              
              <div className="max-w-md mx-auto">
                {!paymentSubmitted ? (
                  <>
                    <div onClick={handlePaymentSlipClick} className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6 hover:border-red-500 cursor-pointer">
                      <input ref={paymentSlipInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => setPaymentSlip(e.target.files?.[0] || null)} />
                      <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                      <p className="text-gray-600 mb-2">Click to upload payment slip</p>
                      <p className="text-xs text-gray-400">JPG, PNG, PDF (Max 5MB)</p>
                      {paymentSlip && <p className="mt-2 text-sm text-green-600">✓ Selected: {paymentSlip.name}</p>}
                    </div>
                    <button onClick={handlePaymentSlipUpload} disabled={!paymentSlip || uploadingSlip || !enrollmentCreated} className={`w-full py-3 rounded-lg font-semibold transition-all hover:scale-105 disabled:opacity-50`} style={{ backgroundColor: BRAND_COLORS.deepRed, color: BRAND_COLORS.white }}>
                      {uploadingSlip ? <Loader2 size={20} className="animate-spin mx-auto" /> : "Upload Payment Slip"}
                    </button>
                    {!enrollmentCreated && <p className="text-center text-xs text-amber-600 mt-2">⚠️ Please download the voucher first to create enrollment.</p>}
                  </>
                ) : (
                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Payment Slip Submitted!</h3>
                    <p>Your payment slip has been uploaded successfully. A confirmation email has been sent to {userEmail}.</p>
                    <button onClick={() => router.push("/")} className="mt-6 px-6 py-2 rounded-lg font-semibold bg-red-600 text-white">Home</button>
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