"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { 
  HiDownload, 
  HiPrinter, 
  HiCreditCard, 
HiOutlineBan as  HiBanknotes,
 HiQrcode as  HiQrCode,
  HiClipboardCheck,
 
   
} from "react-icons/hi";
/* eslint-disable */

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

interface PaymentVoucherProps {
  enrollmentData: any;
  onGenerated: () => void;
}

export default function PaymentVoucher({ enrollmentData, onGenerated }: PaymentVoucherProps) {
  const voucherRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate unique voucher number
  const voucherNumber = `VCH-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  const expiryDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days from now

  // Bank account details
  const bankAccounts = [
    {
      name: 'JazzCash',
      number: '0300-1234567',
      accountName: 'Mansol Hab School of Skills Development',
      type: 'Mobile Account'
    },
    {
      name: 'EasyPaisa',
      number: '0315-7654321',
      accountName: 'Mansol Hab School of Skills Development',
      type: 'Mobile Account'
    },
    {
      name: 'UBL',
      number: '1234-5678901',
      accountName: 'Mansol Hab School of Skills Development',
      accountType: 'Current Account',
      branch: 'Main Branch, Karachi'
    }
  ];

  const generateVoucher = async () => {
    if (!voucherRef.current) return;

    setIsGenerating(true);
    
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

      // Store in localStorage
      localStorage.setItem('paymentVoucher', JSON.stringify({
        ...enrollmentData,
        voucherNumber,
        generatedAt: new Date().toISOString()
      }));

      onGenerated();
    } catch (error) {
      console.error('Error generating voucher:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Account number copied to clipboard!');
  };

  return (
    <div className="space-y-8">
      {/* Instructions */}
    <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="bg-gradient-to-r rounded-xl shadow-lg p-4" // reduced padding
  style={{ 
    background: `linear-gradient(135deg, ${BRAND_COLORS.darkNavy} 0%, ${BRAND_COLORS.darkRoyalBlue} 100%)`
  }}
>
  <div className="flex items-center mb-3"> {/* reduced margin-bottom */}
    <HiClipboardCheck className="w-5 h-5 mr-2.5 text-white" /> {/* smaller icon */}
    <h2 className="text-lg font-bold text-white">Payment Instructions</h2> {/* slightly smaller text */}
  </div>
  <div className="space-y-2.5"> {/* reduced spacing */}
    {[ 
      "Download the payment voucher below",
      "Pay the amount using any of the provided accounts",
      "Save your payment slip/receipt for upload in next step",
      "Upload the payment slip to complete enrollment"
    ].map((text, index) => (
      <div key={index} className="flex items-start">
        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
          <span className="text-white text-xs font-bold">{index + 1}</span>
        </div>
        <span className="text-gray-200 text-sm">{text}</span> {/* slightly smaller text */}
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
  {/* Header */}
  <div className="flex items-center justify-between mb-6">
    <div>
      <h2 className="text-xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
        Payment Voucher
      </h2>
      <p className="text-gray-500 text-sm">Valid for 3 days only</p>
    </div>
    <div className="flex items-center space-x-3">
      <button
        onClick={generateVoucher}
        disabled={isGenerating}
        className="flex items-center px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95"
        style={{
          backgroundColor: BRAND_COLORS.deepRed,
          color: BRAND_COLORS.white
        }}
      >
        <HiDownload className="w-4 h-4 mr-1" />
        {isGenerating ? 'Generating...' : 'Download'}
      </button>
      <button
        onClick={() => window.print()}
        className="flex items-center px-4 py-2 rounded-lg font-semibold border transition-all duration-300 hover:bg-gray-50"
        style={{ 
          borderColor: BRAND_COLORS.deepRed,
          color: BRAND_COLORS.deepRed
        }}
      >
        <HiPrinter className="w-4 h-4 mr-1" />
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
        Mansol Hab School of Skills Development
      </h1>
      <p className="text-gray-500 text-sm">Industry-Focused Technical Training</p>
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
            <div className="font-bold">{enrollmentData.fullName}</div>
          </div>
          <div>
            <div className="text-gray-500">Course</div>
            <div className="font-bold">{enrollmentData.course}</div>
          </div>
          <div>
            <div className="text-gray-500">Enrollment ID</div>
            <div className="font-medium">{enrollmentData.enrollmentId}</div>
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
            <div className="font-bold text-2xl" style={{ color: BRAND_COLORS.deepRed }}>{enrollmentData.price}</div>
          </div>
          <div>
            <div className="text-gray-500">Due Date</div>
            <div className="font-medium">{expiryDate.toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
          <div>
            <div className="text-gray-500">Status</div>
            <div className="inline-block px-2 py-1 rounded-full font-semibold" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
              PENDING PAYMENT
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Notes */}
    <div className="mt-6 p-3 rounded-md" style={{ backgroundColor: `${BRAND_COLORS.deepRed}10`, border: `1px solid ${BRAND_COLORS.deepRed}20` }}>
      <h4 className="font-bold mb-1 flex items-center text-sm">
        <HiQrCode className="w-4 h-4 mr-2" style={{ color: BRAND_COLORS.deepRed }} />
        Important Instructions
      </h4>
      <ul className="text-xs space-y-1 text-gray-600">
        <li>• This voucher is valid for 3 days only</li>
        <li>• Mention your name and voucher number in payment transaction</li>
        <li>• Save payment receipt for verification</li>
        <li>• Contact support if payment is not reflected within 24 hours</li>
      </ul>
    </div>
  </div>

  {/* Bank Accounts */}
  <div className="mt-6">
    <h3 className="text-lg font-bold mb-4 flex items-center" style={{ color: BRAND_COLORS.darkNavy }}>
      <HiBanknotes className="w-5 h-5 mr-2" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
      Payment Methods
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {bankAccounts.map((account, index) => (
        <div key={index} className="border rounded-xl p-4 hover:shadow-md transition-shadow" style={{ borderColor: BRAND_COLORS.softGrey }}>
          <div className="flex items-center mb-3">
            <HiCreditCard className="w-6 h-6 mr-2" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
            <div>
              <h4 className="font-bold text-sm" style={{ color: BRAND_COLORS.darkNavy }}>{account.name}</h4>
              <p className="text-xs text-gray-500">{account.type || account.accountType}</p>
            </div>
          </div>
          <div className="space-y-1 text-xs">
            <div>
              <div className="text-gray-500">Account Number</div>
              <div className="font-mono font-bold flex items-center justify-between">
                {account.number}
                <button
                  onClick={() => copyToClipboard(account.number)}
                  className="px-2 py-0.5 rounded border text-xs hover:bg-gray-50"
                  style={{ borderColor: BRAND_COLORS.teal, color: BRAND_COLORS.teal }}
                >
                  Copy
                </button>
              </div>
            </div>
            <div>
              <div className="text-gray-500">Account Name</div>
              <div className="font-medium text-sm">{account.accountName}</div>
            </div>
            {account.branch && (
              <div>
                <div className="text-gray-500">Branch</div>
                <div className="font-medium text-sm">{account.branch}</div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>

  {/* QR Code Section */}
 
</motion.div>

    </div>
  );
}