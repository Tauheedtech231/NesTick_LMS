"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  HiArrowLeft,
  HiCheckCircle,
  HiCreditCard,
  HiDocumentText,
  HiUpload,
  HiLockClosed,
  HiShieldCheck,
 
  HiUser
} from "react-icons/hi";
/* eslint-disable */

import EnrollmentForm from "@/components/EnrollmentForm";
import PaymentVoucher from "@/components/PaymentVoucher";
import PaymentSlipUpload from "@/components/PaymentSlipUpload";
import Link from "next/link";
import { IoIosArrowDroprightCircle } from "react-icons/io";
import { TiLocationArrow } from "react-icons/ti";

// Brand Colors
const BRAND_COLORS = {
  darkNavy: '#0B1C3D',
  darkRoyalBlue: '#1E3A8A',
  deepRed: '#B11217',
  white: '#FFFFFF',
  lightGrey: '#F4F6F8',
  softGrey: '#E5E7EB',
  darkGrey: '#1F2933',
  charcoal: '#111111',
  teal: '#1FB6CB'
};

// Course Data (simplified for enrollment)
const coursesData = {
  'pipe-fitter': {
    title: 'Pipe Fitter',
    price: 'PKR 25,000',
    duration: '8 Weeks',
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
  },
  'safety-inspector': {
    title: 'Safety Inspector',
    price: 'PKR 30,000',
    duration: '6 Weeks',
    image: 'https://images.unsplash.com/photo-1581579431539-9a45e56b61db?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
  },
  'welding': {
    title: 'Professional Welding',
    price: 'PKR 35,000',
    duration: '10 Weeks',
    image: 'https://images.unsplash.com/photo-1569510914741-59c7c54c2c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
  }
};

export default function EnrollmentPage() {
  const params = useParams();
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'voucher' | 'upload'>('form');
  const [enrollmentData, setEnrollmentData] = useState<any>(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  const courseId = params.id as string;
  const course = coursesData[courseId as keyof typeof coursesData];

  useEffect(() => {
    if (!course) {
      router.push('/courses');
    }
  }, [course, router]);

  if (!course) {
    return null;
  }

  const handleFormSubmit = (data: any) => {
    setEnrollmentData({ ...data, course: course.title, amount: course.price });
    setStep('voucher');
    localStorage.setItem('enrollmentData', JSON.stringify(data));
  };

  const handleVoucherGenerated = () => {
    setStep('upload');
  };

  const handleUploadComplete = () => {
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
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
  {/* Progress Line */}
  <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 z-0 rounded-full">
    <div
      className="h-full rounded-full transition-all duration-500"
      style={{
        width: step === 'form' ? '0%' : step === 'voucher' ? '50%' : '100%',
        backgroundColor: BRAND_COLORS.deepRed,
      }}
    />
  </div>

  {/* Steps */}
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
              >
                <EnrollmentForm 
                  course={course.title}
                  price={course.price}
                  onSubmit={handleFormSubmit}
                />
              </motion.div>
            )}

            {step === 'voucher' && enrollmentData && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                key="voucher"
              >
                <PaymentVoucher 
                  enrollmentData={enrollmentData}
                  onGenerated={handleVoucherGenerated}
                />
              </motion.div>
            )}

            {step === 'upload' && enrollmentData && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                key="upload"
              >
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
                  Your payment slip has been submitted for verification. 
                  You will receive login credentials within 24-48 hours after verification.
                </p>
                <Link
                  href="/courses"
                  className="inline-block px-6 py-3 rounded-lg font-semibold transition-all duration-300"
                  style={{
                    backgroundColor: BRAND_COLORS.deepRed,
                    color: BRAND_COLORS.white
                  }}
                >
                  Back to Courses
                </Link>
              </motion.div>
            )}
          </div>

        <div className="space-y-6">

  {/* Security Assurance */}
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
        'Submit your enrollment form',
        'Download & pay via payment voucher',
        'Upload payment slip for verification',
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

  {/* Contact Support */}
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