'use client'
/* eslint-disable */

import { useState, useEffect } from 'react'
import { 
  CheckCircle,
  AlertCircle,
  DollarSign,
  Users,
  Eye,
  Download,
  Search,
  Image as ImageIcon,
  RefreshCw,
  X,
  FileText,
  Send,
  Key,
  Mail,
  ChevronRight,
  Bell,
  Shield,
  FileCheck,
  CreditCard,
  Trash2,
  User,
  Calendar,
  Phone,
  FileSpreadsheet
} from 'lucide-react'

type PaymentStudent = {
  id: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  amount: string;
  paymentDate: string;
  paymentMethod: string;
  transactionId: string;
  status: 'pending' | 'verified' | 'rejected';
  screenshotUrl: string;
  uploadedAt: string;
}

type StudentCredentials = {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  course: string;
  username: string;
  password: string;
  sentDate: string;
  status: 'sent' | 'failed';
}

export default function AdminDashboard() {
  const [paymentStudents, setPaymentStudents] = useState<PaymentStudent[]>([])
  const [studentCredentials, setStudentCredentials] = useState<StudentCredentials[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSendingCredentials, setIsSendingCredentials] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [showScreenshotModal, setShowScreenshotModal] = useState(false)
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null)
  const [selectedStudentDetails, setSelectedStudentDetails] = useState<PaymentStudent | null>(null)
  const [showCredentialsModal, setShowCredentialsModal] = useState(false)
  const [selectedCredentials, setSelectedCredentials] = useState<StudentCredentials | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{type: 'student' | 'credential', id: string, name: string} | null>(null)

  // Brand Colors
  const BRAND_COLORS = {
    darkNavy: '#0B1C3D',
    darkRoyalBlue: '#1E3A8A',
    deepRed: '#B11217',
    white: '#FFFFFF',
    lightGrey: '#F4F6F8',
    softGrey: '#E5E7EB',
    darkGrey: '#1F2933',
    teal: '#1FB6C9',
    brightRed: '#D32F2F'
  }

  // Load data function
  const loadDataFromLocalStorage = () => {
    setIsLoading(true);
    
    try {
      console.log("🔍 Loading payment data from localStorage...");
      
      const studentsWithPayments: PaymentStudent[] = [];
      
      // Check for uploadedFiles
      const uploadedFilesStr = localStorage.getItem('uploadedFiles');
      if (uploadedFilesStr) {
        try {
          const uploadedFiles = JSON.parse(uploadedFilesStr);
          console.log("📁 Uploaded files:", uploadedFiles);
          
          if (uploadedFiles && uploadedFiles.length > 0) {
            uploadedFiles.forEach((file: any) => {
              if (file && file.studentName && file.thumbnail) {
                console.log("✅ Found file with thumbnail:", {
                  name: file.studentName,
                  thumbnailExists: !!file.thumbnail,
                  thumbnailLength: file.thumbnail?.length || 0
                });
                
                studentsWithPayments.push({
                  id: file.id || `file-${Date.now()}`,
                  name: file.studentName,
                  email: file.email || 'Not available',
                  phone: file.phone || 'Not available',
                  course: file.course || 'Unknown Course',
                  amount: file.amount || 'PKR 25,000',
                  paymentDate: file.uploadDate ? new Date(file.uploadDate).toLocaleDateString() : new Date().toLocaleDateString(),
                  paymentMethod: file.paymentMethod || 'JazzCash',
                  transactionId: file.transactionId || `TXN-${Math.random().toString(36).substr(2, 8)}`,
                  status: 'pending',
                  screenshotUrl: file.thumbnail || '',
                  uploadedAt: file.uploadDate || new Date().toISOString()
                });
              }
            });
          }
        } catch (error) {
          console.error("❌ Error parsing uploadedFiles:", error);
        }
      }
      
      // Check for paymentSubmission
      const paymentSubmissionStr = localStorage.getItem('paymentSubmission');
      if (paymentSubmissionStr) {
        try {
          const paymentSubmission = JSON.parse(paymentSubmissionStr);
          console.log("💰 Payment submission:", paymentSubmission);
          
          if (paymentSubmission && paymentSubmission.studentName) {
            const exists = studentsWithPayments.some(s => 
              s.transactionId === paymentSubmission.transactionId
            );
            
            if (!exists) {
              studentsWithPayments.push({
                id: `payment-${Date.now()}`,
                name: paymentSubmission.studentName,
                email: 'Not available',
                phone: 'Not available',
                course: paymentSubmission.course || 'Unknown Course',
                amount: paymentSubmission.amount || 'PKR 25,000',
                paymentDate: paymentSubmission.paymentDate || new Date().toLocaleDateString(),
                paymentMethod: paymentSubmission.paymentMethod || 'JazzCash',
                transactionId: paymentSubmission.transactionId || `TXN-${Math.random().toString(36).substr(2, 8)}`,
                status: 'pending',
                screenshotUrl: paymentSubmission.screenshotUrl || '',
                uploadedAt: paymentSubmission.uploadedAt || new Date().toISOString()
              });
            }
          }
        } catch (error) {
          console.error("❌ Error parsing paymentSubmission:", error);
        }
      }
      
      console.log("🎯 Final loaded students:", studentsWithPayments);
      setPaymentStudents(studentsWithPayments);
      
      // Load credentials from localStorage
      const credentialsStr = localStorage.getItem('studentCredentials');
      if (credentialsStr) {
        try {
          const credentials = JSON.parse(credentialsStr);
          setStudentCredentials(credentials);
          console.log("🔑 Loaded credentials:", credentials);
        } catch (error) {
          console.error("❌ Error parsing credentials:", error);
        }
      }
      
    } catch (error) {
      console.error("❌ Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // Load data on component mount
  useEffect(() => {
    loadDataFromLocalStorage();
  }, [])

  // Handle verify payment
  const handleVerifyPayment = (studentId: string) => {
    setPaymentStudents(prev => prev.map(student => 
      student.id === studentId ? { ...student, status: 'verified' as const } : student
    ));
  }

  // Handle reject payment
  const handleRejectPayment = (studentId: string) => {
    setPaymentStudents(prev => prev.map(student => 
      student.id === studentId ? { ...student, status: 'rejected' as const } : student
    ));
    alert('Payment rejected!');
  }

  // Handle delete item
  const handleDeleteItem = () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === 'student') {
      // Delete student from state
      setPaymentStudents(prev => prev.filter(student => student.id !== itemToDelete.id));
      
      // Also remove from credentials if exists
      setStudentCredentials(prev => prev.filter(cred => cred.studentId !== itemToDelete.id));
      
      // Remove from localStorage
      const uploadedFiles = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');
      const paymentSubmission = JSON.parse(localStorage.getItem('paymentSubmission') || '[]');
      
      const newUploadedFiles = uploadedFiles.filter((file: any) => file.id !== itemToDelete.id);
      const newPaymentSubmission = paymentSubmission.filter((sub: any) => sub.id !== itemToDelete.id);
      
      localStorage.setItem('uploadedFiles', JSON.stringify(newUploadedFiles));
      localStorage.setItem('paymentSubmission', JSON.stringify(newPaymentSubmission));
    } else {
      // Delete credential
      setStudentCredentials(prev => prev.filter(cred => cred.id !== itemToDelete.id));
      
      const credentials = JSON.parse(localStorage.getItem('studentCredentials') || '[]');
      const newCredentials = credentials.filter((cred: StudentCredentials) => cred.id !== itemToDelete.id);
      localStorage.setItem('studentCredentials', JSON.stringify(newCredentials));
    }
    
    setShowDeleteModal(false);
    setItemToDelete(null);
    alert(`${itemToDelete.type === 'student' ? 'Student' : 'Credential'} deleted successfully!`);
  }

  // Send credentials to student
  const sendCredentialsToStudent = async (student: PaymentStudent) => {
    if (!student.email || student.email === 'Not available') {
      alert('Student email is required to send credentials. Please make sure the student provided an email.');
      return;
    }

    setIsSendingCredentials(student.id);
    
    try {
      const response = await fetch('/api/send-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentEmail: student.email,
          studentName: student.name,
          courseName: student.course,
          amount: student.amount,
          paymentMethod: student.paymentMethod
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Save credentials to localStorage
        const newCredential: StudentCredentials = {
          id: `cred-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          studentId: student.id,
          studentName: student.name,
          studentEmail: student.email,
          course: student.course,
          username: result.credentials.username,
          password: result.credentials.password,
          sentDate: new Date().toISOString(),
          status: 'sent'
        };

        const existingCredentials = JSON.parse(localStorage.getItem('studentCredentials') || '[]');
        const updatedCredentials = [...existingCredentials, newCredential];
        
        localStorage.setItem('studentCredentials', JSON.stringify(updatedCredentials));
        setStudentCredentials(updatedCredentials);

        // Verify the payment
        handleVerifyPayment(student.id);
        
        alert(`✅ Credentials sent successfully to ${student.email}!\n\nUsername: ${result.credentials.username}\nPassword: ${result.credentials.password}\n\nCredentials have been saved to localStorage.`);
      } else {
        throw new Error(result.message || 'Failed to send credentials');
      }
    } catch (error: any) {
      console.error('❌ Error sending credentials:', error);
      alert(`❌ Failed to send credentials: ${error.message}`);
      
      // Save failed attempt
      const failedCredential: StudentCredentials = {
        id: `cred-failed-${Date.now()}`,
        studentId: student.id,
        studentName: student.name,
        studentEmail: student.email,
        course: student.course,
        username: 'FAILED',
        password: 'FAILED',
        sentDate: new Date().toISOString(),
        status: 'failed'
      };

      const existingCredentials = JSON.parse(localStorage.getItem('studentCredentials') || '[]');
      const updatedCredentials = [...existingCredentials, failedCredential];
      
      localStorage.setItem('studentCredentials', JSON.stringify(updatedCredentials));
      setStudentCredentials(updatedCredentials);
    } finally {
      setIsSendingCredentials(null);
      setShowScreenshotModal(false);
    }
  }

  // View screenshot
  const viewScreenshot = (student: PaymentStudent) => {
    console.log("👁️ Viewing screenshot for:", {
      name: student.name,
      screenshotUrl: student.screenshotUrl,
      hasScreenshot: !!student.screenshotUrl,
      screenshotLength: student.screenshotUrl?.length || 0
    });
    
    if (student.screenshotUrl && student.screenshotUrl.length > 100) {
      setSelectedScreenshot(student.screenshotUrl);
      setSelectedStudentDetails(student);
      setShowScreenshotModal(true);
    } else {
      alert('No valid screenshot available for this student.');
    }
  }

  // Download screenshot
  const downloadScreenshot = (student: PaymentStudent) => {
    if (student.screenshotUrl) {
      const link = document.createElement('a');
      link.href = student.screenshotUrl;
      link.download = `payment-${student.name}-${student.transactionId}.jpg`;
      link.click();
    } else {
      alert('No screenshot available to download.');
    }
  }

  // View credentials
  const viewCredentials = (credential: StudentCredentials) => {
    setSelectedCredentials(credential);
    setShowCredentialsModal(true);
  }

  // Resend credentials
  const resendCredentials = async (credential: StudentCredentials) => {
    if (confirm(`Resend credentials to ${credential.studentEmail}?`)) {
      try {
        const response = await fetch('/api/send-credentials', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            studentEmail: credential.studentEmail,
            studentName: credential.studentName,
            courseName: credential.course,
            username: credential.username,
            password: credential.password,
            isResend: true
          }),
        });

        const result = await response.json();
        
        if (result.success) {
          alert(`✅ Credentials resent successfully to ${credential.studentEmail}!`);
        } else {
          throw new Error(result.message);
        }
      } catch (error: any) {
        alert(`❌ Failed to resend credentials: ${error.message}`);
      }
    }
  }

  // Filter students
  const filteredStudents = paymentStudents.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || student.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Filter credentials
  const filteredCredentials = studentCredentials.filter(cred => 
    cred.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cred.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cred.studentEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats
  const totalSubmissions = paymentStudents.length;
  const pendingVerifications = paymentStudents.filter(s => s.status === 'pending').length;
  const verifiedPayments = paymentStudents.filter(s => s.status === 'verified').length;
  const rejectedPayments = paymentStudents.filter(s => s.status === 'rejected').length;
  const totalRevenue = paymentStudents.reduce((sum, student) => {
    const amountStr = student.amount.replace('PKR ', '').replace(/,/g, '');
    const amount = parseFloat(amountStr) || 25000;
    return sum + amount;
  }, 0);
  const sentCredentials = studentCredentials.filter(c => c.status === 'sent').length;
  const failedCredentials = studentCredentials.filter(c => c.status === 'failed').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-darkRoyalBlue"></div>
          <p className="mt-4 text-darkGrey">Loading payment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen p-4 sm:p-6">
      {/* Welcome Section */}
      <div className="mb-6 sm:mb-8">
        <div className="bg-lightGrey rounded-xl p-4 sm:p-6 border border-softGrey">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                Welcome back, Admin
              </h1>
              <p className="text-darkGrey mt-1 text-sm sm:text-base">
                Manage student payments and credentials from one dashboard
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-darkGrey">
              <span className="hidden sm:inline">Admin Portal</span>
              <ChevronRight className="w-4 h-4 hidden sm:inline" />
              <span className="font-medium">Payments</span>
            </div>
          </div>
          <div className="mt-4 h-1 w-12 rounded-full" style={{ backgroundColor: BRAND_COLORS.deepRed }}></div>
        </div>
      </div>

      {/* Stats Cards - Payment Overview */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-base sm:text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
          Payment Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-lg border border-softGrey p-4 hover:border-deepRed transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-darkGrey">Total Submissions</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold mt-1" style={{ color: BRAND_COLORS.darkNavy }}>{totalSubmissions}</p>
              </div>
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${BRAND_COLORS.darkRoyalBlue}10` }}>
                <Users className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-softGrey p-4 hover:border-deepRed transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-darkGrey">Pending Verification</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold mt-1" style={{ color: BRAND_COLORS.darkNavy }}>{pendingVerifications}</p>
              </div>
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${BRAND_COLORS.deepRed}10` }}>
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: BRAND_COLORS.deepRed }} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-softGrey p-4 hover:border-deepRed transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-darkGrey">Verified Payments</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold mt-1" style={{ color: BRAND_COLORS.darkNavy }}>{verifiedPayments}</p>
              </div>
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${BRAND_COLORS.teal}10` }}>
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: BRAND_COLORS.teal }} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-softGrey p-4 hover:border-deepRed transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-darkGrey">Total Revenue</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold mt-1" style={{ color: BRAND_COLORS.darkNavy }}>PKR {totalRevenue.toLocaleString()}</p>
              </div>
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${BRAND_COLORS.darkRoyalBlue}10` }}>
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards - Credentials Status */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-base sm:text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
          Credentials Status
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white rounded-lg border border-softGrey p-4 hover:border-deepRed transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-darkGrey">Sent Credentials</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold mt-1" style={{ color: BRAND_COLORS.darkNavy }}>{sentCredentials}</p>
              </div>
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${BRAND_COLORS.teal}10` }}>
                <Mail className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: BRAND_COLORS.teal }} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-softGrey p-4 hover:border-deepRed transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-darkGrey">Failed Credentials</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold mt-1" style={{ color: BRAND_COLORS.darkNavy }}>{failedCredentials}</p>
              </div>
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${BRAND_COLORS.brightRed}10` }}>
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: BRAND_COLORS.brightRed }} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-softGrey p-4 hover:border-deepRed transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-darkGrey">Rejected Payments</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold mt-1" style={{ color: BRAND_COLORS.darkNavy }}>{rejectedPayments}</p>
              </div>
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${BRAND_COLORS.brightRed}10` }}>
                <X className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: BRAND_COLORS.brightRed }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="mb-6 sm:mb-8">
        <div className="bg-white rounded-lg border border-softGrey p-4 sm:p-5">
          <div className="flex flex-col gap-4">
            {/* Search and Filter Row */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5" style={{ color: BRAND_COLORS.darkGrey }} />
                  <input
                    type="text"
                    placeholder="Search by name, course, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20 text-sm sm:text-base"
                  />
                </div>
              </div>
              
              <div className="w-full sm:w-48">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20 bg-white text-sm sm:text-base"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
            
            {/* Button Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  if (confirm('Clear all localStorage data? This will delete all students and credentials.')) {
                    localStorage.removeItem('studentCredentials');
                    localStorage.removeItem('uploadedFiles');
                    localStorage.removeItem('paymentSubmission');
                    alert('LocalStorage cleared!');
                    loadDataFromLocalStorage();
                  }
                }}
                className="px-4 py-2.5 border border-darkRoyalBlue text-darkRoyalBlue rounded-lg hover:bg-darkRoyalBlue/5 transition-colors font-medium text-sm sm:text-base"
              >
                Clear All Data
              </button>
              <button
                onClick={loadDataFromLocalStorage}
                className="px-4 py-2.5 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
                style={{ 
                  backgroundColor: BRAND_COLORS.deepRed,
                  color: BRAND_COLORS.white 
                }}
              >
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Submissions - Mobile Cards View */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-semibold" style={{ color: BRAND_COLORS.darkNavy }}>
            Payment Submissions
          </h2>
          <span className="text-xs sm:text-sm text-darkGrey">
            {filteredStudents.length} students
          </span>
        </div>
        
        {filteredStudents.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredStudents.map((student) => (
              <div key={student.id} className="bg-white rounded-lg border border-softGrey p-4 hover:shadow-md transition-shadow">
                {/* Top Row - Student Info and Status */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-darkGrey text-base sm:text-lg">{student.name}</h3>
                    <p className="text-sm text-darkGrey/70">{student.course}</p>
                    <p className="text-xs text-darkGrey/50 mt-1">{student.email}</p>
                  </div>
                  <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                    student.status === 'verified' 
                      ? 'text-white'
                      : student.status === 'rejected'
                      ? 'text-white'
                      : 'text-white'
                  }`} style={{
                    backgroundColor: student.status === 'verified' 
                      ? BRAND_COLORS.teal
                      : student.status === 'rejected'
                      ? BRAND_COLORS.brightRed
                      : BRAND_COLORS.darkRoyalBlue
                  }}>
                    {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                  </span>
                </div>

                {/* Middle Row - Payment Details */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-darkGrey/70">Amount</p>
                    <p className="font-bold text-sm sm:text-base" style={{ color: BRAND_COLORS.darkRoyalBlue }}>{student.amount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-darkGrey/70">Payment Method</p>
                    <p className="font-medium text-darkGrey text-sm">{student.paymentMethod}</p>
                  </div>
                </div>

                {/* Transaction ID */}
                <div className="mb-3">
                  <p className="text-xs text-darkGrey/70">Transaction ID</p>
                  <p className="font-mono text-xs bg-lightGrey px-2 py-1 rounded text-darkGrey truncate">
                    {student.transactionId}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-3 border-t border-softGrey">
                  <button
                    onClick={() => {
                      setItemToDelete({
                        type: 'student',
                        id: student.id,
                        name: student.name
                      });
                      setShowDeleteModal(true);
                    }}
                    className="p-2 text-brightRed hover:bg-brightRed/5 rounded-lg transition-colors"
                    title="Delete Student"
                  >
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  
                  {student.screenshotUrl && student.screenshotUrl.length > 100 && (
                    <button
                      onClick={() => viewScreenshot(student)}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 border border-darkRoyalBlue text-darkRoyalBlue rounded-lg hover:bg-darkRoyalBlue/5 transition-colors font-medium text-sm flex items-center gap-1 sm:gap-2"
                    >
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">View Details</span>
                      <span className="sm:hidden">View</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12 bg-white rounded-lg border border-softGrey">
            <FileText className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4" style={{ color: BRAND_COLORS.softGrey }} />
            <h3 className="text-base sm:text-lg font-medium mb-2" style={{ color: BRAND_COLORS.darkGrey }}>
              {searchTerm ? 'No matching payments found' : 'No payment submissions yet'}
            </h3>
            <p className="text-darkGrey/70 mb-6 max-w-md mx-auto text-sm sm:text-base">
              {searchTerm 
                ? 'Try a different search term' 
                : 'Students will appear here after they upload payment screenshots'}
            </p>
            
            {!searchTerm && (
              <div className="bg-lightGrey border border-softGrey rounded-lg p-4 max-w-md mx-auto">
                <h4 className="font-medium mb-2 text-sm sm:text-base" style={{ color: BRAND_COLORS.darkRoyalBlue }}>How to test the system:</h4>
                <ol className="text-xs sm:text-sm text-darkGrey space-y-1 list-decimal pl-4">
                  <li>Go to any course page</li>
                  <li>Click "Enroll Now" button</li>
                  <li>Fill the enrollment form</li>
                  <li>Upload payment screenshot (JPG/PNG)</li>
                  <li>Come back here and click "Refresh Data"</li>
                </ol>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sent Credentials - Mobile Cards View */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-semibold" style={{ color: BRAND_COLORS.darkNavy }}>
            Sent Credentials
          </h2>
          <span className="text-xs sm:text-sm text-darkGrey">
            {studentCredentials.length} credentials
          </span>
        </div>
        
        {studentCredentials.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredCredentials.map((credential) => (
              <div key={credential.id} className="bg-white rounded-lg border border-softGrey p-4 hover:shadow-md transition-shadow">
                {/* Top Row - Student Info */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-darkGrey text-base sm:text-lg">{credential.studentName}</h3>
                    <p className="text-sm text-darkGrey/70">{credential.course}</p>
                    <p className="text-xs text-darkGrey/50 mt-1">{credential.studentEmail}</p>
                  </div>
                  <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                    credential.status === 'sent' 
                      ? 'text-white'
                      : 'text-white'
                  }`} style={{
                    backgroundColor: credential.status === 'sent' 
                      ? BRAND_COLORS.teal
                      : BRAND_COLORS.brightRed
                  }}>
                    {credential.status.charAt(0).toUpperCase() + credential.status.slice(1)}
                  </span>
                </div>

                {/* Credentials */}
                <div className="mb-3">
                  <p className="text-xs text-darkGrey/70 mb-1">Credentials</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-darkGrey/70 w-16">Username:</span>
                      <span className="font-mono text-xs bg-lightGrey px-2 py-1 rounded text-darkGrey flex-1 truncate">
                        {credential.username}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-darkGrey/70 w-16">Password:</span>
                      <span className="font-mono text-xs bg-lightGrey px-2 py-1 rounded text-darkGrey flex-1 truncate">
                        {credential.password}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sent Date */}
                <div className="mb-3">
                  <p className="text-xs text-darkGrey/70">Sent Date</p>
                  <p className="text-sm text-darkGrey">
                    {new Date(credential.sentDate).toLocaleDateString()}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-3 border-t border-softGrey">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setItemToDelete({
                          type: 'credential',
                          id: credential.id,
                          name: credential.studentName
                        });
                        setShowDeleteModal(true);
                      }}
                      className="p-2 text-brightRed hover:bg-brightRed/5 rounded-lg transition-colors"
                      title="Delete Credentials"
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    
                    <button
                      onClick={() => {
                        const text = `Username: ${credential.username}\nPassword: ${credential.password}`;
                        navigator.clipboard.writeText(text);
                        alert('Credentials copied to clipboard!');
                      }}
                      className="p-2 text-darkGrey hover:text-darkRoyalBlue hover:bg-lightGrey rounded-lg transition-colors"
                      title="Copy Credentials"
                    >
                      <Key className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => viewCredentials(credential)}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 border border-darkRoyalBlue text-darkRoyalBlue rounded-lg hover:bg-darkRoyalBlue/5 transition-colors font-medium text-sm flex items-center gap-1 sm:gap-2"
                  >
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">View Details</span>
                    <span className="sm:hidden">View</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12 bg-white rounded-lg border border-softGrey">
            <Key className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4" style={{ color: BRAND_COLORS.softGrey }} />
            <h3 className="text-base sm:text-lg font-medium mb-2" style={{ color: BRAND_COLORS.darkGrey }}>No credentials sent yet</h3>
            <p className="text-darkGrey/70 mb-6 max-w-md mx-auto text-sm sm:text-base">
              Verify a payment to send login credentials to students
            </p>
          </div>
        )}
      </div>

      {/* Screenshot Modal with Actions */}
      {showScreenshotModal && selectedScreenshot && selectedStudentDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-softGrey">
            <div className="p-4 border-b border-softGrey flex justify-between items-center bg-lightGrey">
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold truncate" style={{ color: BRAND_COLORS.darkNavy }}>
                  Payment Screenshot - {selectedStudentDetails.name}
                </h3>
                <p className="text-xs sm:text-sm text-darkGrey/70 truncate">
                  Transaction ID: {selectedStudentDetails.transactionId}
                </p>
              </div>
              <button
                onClick={() => setShowScreenshotModal(false)}
                className="p-2 text-darkGrey hover:text-darkGrey hover:bg-white rounded-lg transition-colors ml-2 flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 sm:p-6 overflow-auto max-h-[calc(90vh-100px)]">
              <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                {/* Screenshot Section */}
                <div className="lg:w-2/3">
                  <div className="border border-softGrey rounded-lg overflow-hidden bg-lightGrey">
                    <img
                      src={selectedScreenshot}
                      alt="Payment Screenshot"
                      className="w-full h-auto max-h-[300px] sm:max-h-[400px] object-contain"
                      onError={(e) => {
                        console.error("❌ Image failed to load");
                        e.currentTarget.src = 'https://via.placeholder.com/500x300?text=Image+Failed+to+Load';
                      }}
                    />
                  </div>
                  
                  {/* Action Buttons - All buttons now inside modal */}
                  <div className="mt-4 space-y-3">
                    {/* Download Button */}
                    <div className="flex justify-center">
                      <button
                        onClick={() => downloadScreenshot(selectedStudentDetails)}
                        className="px-4 py-2 border border-darkRoyalBlue text-darkRoyalBlue rounded-lg hover:bg-darkRoyalBlue/5 transition-colors font-medium flex items-center text-sm sm:text-base"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Screenshot
                      </button>
                    </div>
                    
                    {/* Delete Button */}
                    <div className="flex justify-center">
                      <button
                        onClick={() => {
                          setShowScreenshotModal(false);
                          setItemToDelete({
                            type: 'student',
                            id: selectedStudentDetails.id,
                            name: selectedStudentDetails.name
                          });
                          setShowDeleteModal(true);
                        }}
                        className="px-4 py-2 border border-brightRed text-brightRed rounded-lg hover:bg-brightRed/5 transition-colors font-medium flex items-center text-sm sm:text-base"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Student
                      </button>
                    </div>
                    
                    {/* Verify/Reject Buttons - Only for pending status */}
                    {selectedStudentDetails.status === 'pending' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                        <button
                          onClick={() => sendCredentialsToStudent(selectedStudentDetails)}
                          disabled={isSendingCredentials === selectedStudentDetails.id}
                          className="w-full py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                          style={{ 
                            backgroundColor: BRAND_COLORS.deepRed,
                            color: BRAND_COLORS.white 
                          }}
                        >
                          {isSendingCredentials === selectedStudentDetails.id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              Verify & Send Credentials
                            </>
                          )}
                        </button>
                        
                        <button
                          onClick={() => {
                            if (confirm(`Reject payment from ${selectedStudentDetails.name}?`)) {
                              handleRejectPayment(selectedStudentDetails.id);
                              setShowScreenshotModal(false);
                            }
                          }}
                          className="w-full py-3 border border-brightRed text-brightRed rounded-lg hover:bg-brightRed/5 transition-colors font-medium text-sm sm:text-base"
                        >
                          ✗ Reject Payment
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Student Details Section */}
                <div className="lg:w-1/3">
                  <div className="bg-lightGrey rounded-lg p-4 border border-softGrey">
                    <h4 className="font-semibold mb-3 text-sm sm:text-base" style={{ color: BRAND_COLORS.darkNavy }}>
                      Student Details
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <User className="w-4 h-4 text-darkGrey/70 mr-2 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-darkGrey/70">Name</p>
                          <p className="font-medium text-darkGrey text-sm truncate">{selectedStudentDetails.name}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <FileSpreadsheet className="w-4 h-4 text-darkGrey/70 mr-2 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-darkGrey/70">Course</p>
                          <p className="font-medium text-darkGrey text-sm truncate">{selectedStudentDetails.course}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <DollarSign className="w-4 h-4 text-darkGrey/70 mr-2 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-darkGrey/70">Amount</p>
                          <p className="font-bold text-sm" style={{ color: BRAND_COLORS.darkRoyalBlue }}>{selectedStudentDetails.amount}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <CreditCard className="w-4 h-4 text-darkGrey/70 mr-2 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-darkGrey/70">Payment Method</p>
                          <p className="font-medium text-darkGrey text-sm">{selectedStudentDetails.paymentMethod}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Calendar className="w-4 h-4 text-darkGrey/70 mr-2 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-darkGrey/70">Transaction ID</p>
                          <p className="font-mono text-xs bg-white px-2 py-1 rounded border border-softGrey text-darkGrey truncate">
                            {selectedStudentDetails.transactionId}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-darkGrey/70 mr-2 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-darkGrey/70">Status</p>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            selectedStudentDetails.status === 'verified' 
                              ? 'text-white'
                              : selectedStudentDetails.status === 'rejected'
                              ? 'text-white'
                              : 'text-white'
                          }`} style={{
                            backgroundColor: selectedStudentDetails.status === 'verified' 
                              ? BRAND_COLORS.teal
                              : selectedStudentDetails.status === 'rejected'
                              ? BRAND_COLORS.brightRed
                              : BRAND_COLORS.darkRoyalBlue
                          }}>
                            {selectedStudentDetails.status.charAt(0).toUpperCase() + selectedStudentDetails.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      
                      {selectedStudentDetails.email && selectedStudentDetails.email !== 'Not available' && (
                        <div className="flex items-start">
                          <Mail className="w-4 h-4 text-darkGrey/70 mr-2 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-darkGrey/70">Email</p>
                            <p className="font-medium text-darkGrey text-sm truncate">{selectedStudentDetails.email}</p>
                          </div>
                        </div>
                      )}
                      
                      {selectedStudentDetails.phone && selectedStudentDetails.phone !== 'Not available' && (
                        <div className="flex items-start">
                          <Phone className="w-4 h-4 text-darkGrey/70 mr-2 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-darkGrey/70">Phone</p>
                            <p className="font-medium text-darkGrey text-sm truncate">{selectedStudentDetails.phone}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Credentials Details Modal */}
      {showCredentialsModal && selectedCredentials && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full border border-softGrey">
            <div className="p-4 border-b border-softGrey flex justify-between items-center bg-lightGrey">
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold truncate" style={{ color: BRAND_COLORS.darkNavy }}>
                  Credentials Details
                </h3>
                <p className="text-xs sm:text-sm text-darkGrey/70 truncate">
                  {selectedCredentials.studentName}
                </p>
              </div>
              <button
                onClick={() => setShowCredentialsModal(false)}
                className="p-2 text-darkGrey hover:text-darkGrey hover:bg-white rounded-lg transition-colors ml-2 flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 sm:p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-xs sm:text-sm text-darkGrey/70">Student Name</p>
                  <p className="font-medium text-darkGrey text-sm sm:text-base">{selectedCredentials.studentName}</p>
                </div>
                
                <div>
                  <p className="text-xs sm:text-sm text-darkGrey/70">Email</p>
                  <p className="font-medium text-darkGrey text-sm sm:text-base truncate">{selectedCredentials.studentEmail}</p>
                </div>
                
                <div>
                  <p className="text-xs sm:text-sm text-darkGrey/70">Course</p>
                  <p className="font-medium text-darkGrey text-sm sm:text-base">{selectedCredentials.course}</p>
                </div>
                
                <div className="bg-lightGrey p-4 rounded-lg border border-softGrey">
                  <h4 className="font-semibold mb-2 text-sm sm:text-base" style={{ color: BRAND_COLORS.darkNavy }}>Login Credentials</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs sm:text-sm text-darkGrey/70 mb-1">Username</p>
                      <p className="font-mono text-sm sm:text-lg bg-white px-3 py-2 rounded border border-softGrey text-darkGrey break-all">
                        {selectedCredentials.username}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-darkGrey/70 mb-1">Password</p>
                      <p className="font-mono text-sm sm:text-lg bg-white px-3 py-2 rounded border border-softGrey text-darkGrey break-all">
                        {selectedCredentials.password}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs sm:text-sm text-darkGrey/70">Sent Date</p>
                  <p className="font-medium text-darkGrey text-sm sm:text-base">
                    {new Date(selectedCredentials.sentDate).toLocaleDateString()} at{' '}
                    {new Date(selectedCredentials.sentDate).toLocaleTimeString()}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs sm:text-sm text-darkGrey/70">Status</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    selectedCredentials.status === 'sent' 
                      ? 'text-white'
                      : 'text-white'
                  }`} style={{
                    backgroundColor: selectedCredentials.status === 'sent' 
                      ? BRAND_COLORS.teal
                      : BRAND_COLORS.brightRed
                  }}>
                    {selectedCredentials.status.charAt(0).toUpperCase() + selectedCredentials.status.slice(1)}
                  </span>
                </div>
              </div>
              
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    const text = `Username: ${selectedCredentials.username}\nPassword: ${selectedCredentials.password}`;
                    navigator.clipboard.writeText(text);
                    alert('Credentials copied to clipboard!');
                  }}
                  className="flex-1 py-2.5 border border-darkRoyalBlue text-darkRoyalBlue rounded-lg hover:bg-darkRoyalBlue/5 transition-colors font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <Key className="w-4 h-4" />
                  Copy Credentials
                </button>
                
                {selectedCredentials.status === 'sent' && (
                  <button
                    onClick={() => {
                      resendCredentials(selectedCredentials);
                      setShowCredentialsModal(false);
                    }}
                    className="flex-1 py-2.5 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
                    style={{ 
                      backgroundColor: BRAND_COLORS.deepRed,
                      color: BRAND_COLORS.white 
                    }}
                  >
                    <Send className="w-4 h-4" />
                    Resend
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && itemToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full border border-softGrey">
            <div className="p-4 border-b border-softGrey bg-lightGrey rounded-t-xl">
              <h3 className="text-lg font-semibold text-center" style={{ color: BRAND_COLORS.darkNavy }}>
                Confirm Delete
              </h3>
            </div>
            
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brightRed/10 flex items-center justify-center">
                <Trash2 className="w-8 h-8" style={{ color: BRAND_COLORS.brightRed }} />
              </div>
              
              <h4 className="text-lg font-medium mb-2" style={{ color: BRAND_COLORS.darkNavy }}>
                Delete {itemToDelete.type === 'student' ? 'Student' : 'Credentials'}?
              </h4>
              
              <p className="text-darkGrey mb-4">
                Are you sure you want to delete <span className="font-semibold">{itemToDelete.name}</span>? 
                {itemToDelete.type === 'student' ? ' This will also remove any associated credentials.' : ''}
              </p>
              
              <p className="text-sm text-brightRed mb-6">
                This action cannot be undone.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setItemToDelete(null);
                  }}
                  className="flex-1 py-3 border border-softGrey text-darkGrey rounded-lg hover:bg-lightGrey transition-colors font-medium"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleDeleteItem}
                  className="flex-1 py-3 rounded-lg font-medium transition-colors"
                  style={{ 
                    backgroundColor: BRAND_COLORS.brightRed,
                    color: BRAND_COLORS.white 
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}