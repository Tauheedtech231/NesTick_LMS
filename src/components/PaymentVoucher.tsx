// app/courses/components/PaymentVoucher.tsx
'use client';

import { useEffect, useState } from 'react';
import { Download, Printer, Copy, CheckCircle } from 'lucide-react';

interface VoucherData {
  enrollmentId: string;
  fullName: string;
  email: string;
  phone: string;
  level: string;
  courseTitle: string;
  fees: number;
  enrollmentDate: string;
}

export default function PaymentVoucher() {
  const [voucherData, setVoucherData] = useState<VoucherData | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPrinted, setIsPrinted] = useState(false);

  useEffect(() => {
    // Load student info from localStorage
    const studentInfo = localStorage.getItem('studentInfo');
    if (studentInfo) {
      const parsedData = JSON.parse(studentInfo);
      setVoucherData(parsedData);
      
      // Mark voucher as generated
      const enrollmentData = localStorage.getItem('enrollmentData');
      if (enrollmentData) {
        const data = JSON.parse(enrollmentData);
        data.voucherGenerated = true;
        localStorage.setItem('enrollmentData', JSON.stringify(data));
      }
    }
  }, []);

  const handlePrint = () => {
    window.print();
    setIsPrinted(true);
  };

  const handleCopyDetails = () => {
    if (!voucherData) return;
    
    const details = `
Enrollment ID: ${voucherData.enrollmentId}
Student Name: ${voucherData.fullName}
Course: ${voucherData.courseTitle}
Fees: PKR ${voucherData.fees.toLocaleString()}
    `.trim();
    
    navigator.clipboard.writeText(details);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!voucherData) return;
    
    // Create a printable voucher HTML
    const voucherHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Payment Voucher - ${voucherData.enrollmentId}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .voucher { max-width: 600px; margin: 0 auto; border: 2px solid #1E3A8A; padding: 30px; border-radius: 10px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #1E3A8A; margin-bottom: 10px; }
        .title { font-size: 20px; font-weight: bold; color: #333; margin-bottom: 5px; }
        .subtitle { color: #666; margin-bottom: 20px; }
        .details { margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
        .label { font-weight: bold; color: #555; }
        .value { color: #333; }
        .total { font-size: 18px; font-weight: bold; color: #1E3A8A; }
        .instructions { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 30px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="voucher">
        <div class="header">
            <div class="logo">TechSafe Education</div>
            <div class="title">Payment Voucher</div>
            <div class="subtitle">Enrollment ID: ${voucherData.enrollmentId}</div>
        </div>
        
        <div class="details">
            <div class="detail-row">
                <span class="label">Student Name:</span>
                <span class="value">${voucherData.fullName}</span>
            </div>
            <div class="detail-row">
                <span class="label">Enrollment ID:</span>
                <span class="value">${voucherData.enrollmentId}</span>
            </div>
            <div class="detail-row">
                <span class="label">Course:</span>
                <span class="value">${voucherData.courseTitle}</span>
            </div>
            <div class="detail-row">
                <span class="label">Level:</span>
                <span class="value">${voucherData.level}</span>
            </div>
            <div class="detail-row">
                <span class="label">Enrollment Date:</span>
                <span class="value">${new Date(voucherData.enrollmentDate).toLocaleDateString()}</span>
            </div>
            <div class="detail-row total">
                <span class="label">Total Fees:</span>
                <span class="value">PKR ${voucherData.fees.toLocaleString()}</span>
            </div>
        </div>
        
        <div class="instructions">
            <h3>Payment Instructions:</h3>
            <ol>
                <li>Make payment to our bank account</li>
                <li>Upload the payment slip in the next step</li>
                <li>Keep this voucher for reference</li>
                <li>Contact support if you face any issues</li>
            </ol>
        </div>
        
        <div class="footer">
            <p>Generated on ${new Date().toLocaleDateString()}</p>
            <p>TechSafe Education © ${new Date().getFullYear()}</p>
        </div>
    </div>
</body>
</html>
    `;
    
    // Create blob and download
    const blob = new Blob([voucherHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-voucher-${voucherData.enrollmentId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!voucherData) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 border-4 border-[#1E3A8A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading voucher...</p>
      </div>
    );
  }

  // Bank details
  const bankDetails = {
    bankName: "National Bank of Pakistan",
    accountTitle: "TechSafe Education Pvt Ltd",
    accountNumber: "1001-23456789-01",
    iban: "PK36NBPA1001234567890101",
    swiftCode: "NBPAKKAXXX",
    branch: "Main Branch, Islamabad"
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Voucher</h1>
        <p className="text-gray-600">Your enrollment has been submitted successfully</p>
      </div>

      {/* Voucher Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Voucher Header */}
        <div className="bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">TechSafe Education</h2>
              <p className="text-blue-100">Official Payment Voucher</p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="text-center md:text-right">
                <div className="text-sm text-blue-100">Enrollment ID</div>
                <div className="text-xl font-bold text-white tracking-wider">
                  {voucherData.enrollmentId}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Voucher Body */}
        <div className="p-8">
          {/* Student & Course Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Student Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                Student Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Full Name:</span>
                  <span className="font-medium text-gray-900">{voucherData.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium text-gray-900">{voucherData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium text-gray-900">{voucherData.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Level:</span>
                  <span className="font-medium text-gray-900">{voucherData.level}</span>
                </div>
              </div>
            </div>

            {/* Course Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                Course Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Course:</span>
                  <span className="font-medium text-gray-900 text-right">{voucherData.courseTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Enrollment Date:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(voucherData.enrollmentDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-green-600">Pending Payment</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bank Details Section - YEH ADD KIYA HAI */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
              </svg>
              Bank Account Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Bank Name</label>
                  <div className="p-3 bg-white rounded-lg border border-gray-300">
                    <span className="font-medium text-gray-900">{bankDetails.bankName}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Account Title</label>
                  <div className="p-3 bg-white rounded-lg border border-gray-300">
                    <span className="font-medium text-gray-900">{bankDetails.accountTitle}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Account Number</label>
                  <div className="p-3 bg-white rounded-lg border border-gray-300">
                    <span className="font-medium text-gray-900 tracking-wider">{bankDetails.accountNumber}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">IBAN</label>
                  <div className="p-3 bg-white rounded-lg border border-gray-300">
                    <span className="font-medium text-gray-900 tracking-wider">{bankDetails.iban}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">SWIFT Code</label>
                  <div className="p-3 bg-white rounded-lg border border-gray-300">
                    <span className="font-medium text-gray-900">{bankDetails.swiftCode}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Branch</label>
                  <div className="p-3 bg-white rounded-lg border border-gray-300">
                    <span className="font-medium text-gray-900">{bankDetails.branch}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-gray-700 p-3 bg-yellow-100 rounded-lg">
              <span className="font-bold">Important:</span> Please use Enrollment ID <span className="font-mono font-bold">{voucherData.enrollmentId}</span> as payment reference.
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Course Fees:</span>
                <span className="font-medium text-gray-900">PKR {voucherData.fees.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Registration Fee:</span>
                <span className="font-medium text-gray-900">PKR 500</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-lg font-bold text-gray-900">Total Amount:</span>
                <span className="text-xl font-bold text-[#1E3A8A]">
                  PKR {(voucherData.fees + 500).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Instructions</h3>
            <ol className="space-y-2 list-decimal list-inside text-gray-700">
              <li>Make payment to the bank account details provided above</li>
              <li>Use Enrollment ID as payment reference: <span className="font-bold">{voucherData.enrollmentId}</span></li>
              <li>Upload the payment slip in the next step for verification</li>
              <li>Keep this voucher safe for future reference</li>
              <li>Contact support at info@techsafe.edu.pk for any queries</li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={handleDownload}
              className="flex items-center justify-center space-x-2 bg-white border border-[#1E3A8A] 
                       text-[#1E3A8A] font-semibold py-3 px-4 rounded-lg hover:bg-blue-50 
                       transition-all duration-300"
            >
              <Download className="w-5 h-5" />
              <span>Download Voucher</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center justify-center space-x-2 bg-white border border-gray-300 
                       text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-50 
                       transition-all duration-300"
            >
              <Printer className="w-5 h-5" />
              <span>Print Voucher</span>
            </button>

            <button
              onClick={handleCopyDetails}
              className="flex items-center justify-center space-x-2 bg-white border border-gray-300 
                       text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-50 
                       transition-all duration-300"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  <span>Copy Details</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Next Step */}
      <div className="mt-8 text-center">
        <p className="text-gray-600 mb-4">
          After downloading the voucher, proceed to upload your payment slip
        </p>
        <div className="w-8 h-1 bg-gradient-to-r from-[#1E3A8A] to-[#F97316] mx-auto mb-4 rounded-full" />
        <div className="text-sm text-gray-500">Step 2/3 • Payment Slip Upload</div>
      </div>
    </div>
  );
}