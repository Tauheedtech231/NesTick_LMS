// app/courses/enrollment/page.tsx - CREATE THIS FILE
'use client';

import PaymentVoucher from '@/components/PaymentVoucher';
import PaymentSlipUpload from '@/components/PaymentSlipUpload';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function EnrollmentPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [enrollmentData, setEnrollmentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if enrollment exists in localStorage
    const data = localStorage.getItem('enrollmentData');
    
    if (!data) {
      // No enrollment data found, redirect to courses
      router.push('/courses');
      return;
    }
    
    try {
      const parsedData = JSON.parse(data);
      setEnrollmentData(parsedData);
    } catch (error) {
      console.error('Error parsing enrollment data:', error);
      router.push('/courses');
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#1E3A8A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading enrollment data...</p>
        </div>
      </div>
    );
  }

  if (!enrollmentData) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/courses"
                className="flex items-center text-gray-600 hover:text-[#1E3A8A] transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Courses
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Enrollment Process</h1>
                <p className="text-gray-600 text-sm">Complete your course enrollment</p>
              </div>
            </div>
            
            {/* Step Indicator */}
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Step <span className="font-bold text-[#1E3A8A]">{step}</span> of 2
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center space-x-4 py-4">
            <div className={`flex items-center ${step >= 1 ? 'text-[#1E3A8A]' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                step >= 1 ? 'bg-[#1E3A8A] text-white' : 'bg-gray-200'
              }`}>
                1
              </div>
              <span className="font-medium">Payment Voucher</span>
            </div>
            
            <div className="flex-1 h-1 bg-gray-200">
              <div 
                className={`h-full transition-all duration-300 ${
                  step >= 2 ? 'bg-[#1E3A8A]' : 'bg-gray-200'
                }`}
                style={{ width: step >= 2 ? '100%' : '0%' }}
              ></div>
            </div>
            
            <div className={`flex items-center ${step >= 2 ? 'text-[#1E3A8A]' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                step >= 2 ? 'bg-[#1E3A8A] text-white' : 'bg-gray-200'
              }`}>
                2
              </div>
              <span className="font-medium">Upload Payment</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {step === 1 ? (
          <div className="space-y-8">
            <PaymentVoucher />
            
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h3>
              <div className="space-y-3 text-gray-700">
                <p>1. Download or print your payment voucher</p>
                <p>2. Make payment using the voucher as reference</p>
                <p>3. Upload the payment slip in the next step</p>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="px-8 py-3 bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
                >
                  Continue to Payment Upload
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <PaymentSlipUpload />
            
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back to Voucher
                </button>
                
                <div className="text-sm text-gray-600">
                  After uploading, your enrollment will be verified within 24-48 hours
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}