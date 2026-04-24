/* eslint-disable react/no-unescaped-entities */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HiArrowLeft, HiMail, HiUser, HiCheckCircle, } from 'react-icons/hi';
import { Loader2 } from 'lucide-react';

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
};

// Success Modal Component
function SuccessModal({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-green-500">
            <HiCheckCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900">Request Sent!</h3>
          <p className="text-gray-600 mb-6">{message}</p>
          <button
            onClick={onClose}
            className="px-6 py-2 text-white rounded-lg bg-red-600 hover:bg-red-700"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    issue: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return;
    }
    
    if (!formData.email.trim()) {
      setError('Please enter your email address');
      return;
    }
    
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (!formData.issue.trim()) {
      setError('Please describe your issue');
      return;
    }
    
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          userEmail: formData.email.trim(),
          issue: formData.issue.trim()
        })
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage(result.message || 'Your request has been sent to admin. You will receive a response shortly.');
        setShowSuccess(true);
        setFormData({ name: '', email: '', issue: '' });
      } else {
        setError(result.error || 'Failed to send request. Please try again.');
      }
    } catch (error) {
      console.error('Error sending request:', error);
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    router.push('/lms/auth/login');
  };

  return (
    <>
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          {/* Back to Login */}
          <div className="flex justify-start">
            <Link 
              href="/lms/auth/login" 
              className="inline-flex items-center text-gray-600 hover:text-red-600 transition-colors"
            >
              <HiArrowLeft className="w-5 h-5 mr-2" />
              Back to Login
            </Link>
          </div>

          {/* Forgot Password Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
            {/* Header */}
            <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-center mb-4">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${BRAND_COLORS.deepRed} 0%, ${BRAND_COLORS.brightRed} 100%)` }}
                >
                    <HiMail className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Forgot Password?
                </h1>
                <p className="text-sm text-gray-600">
                  Don't worry! Fill out the form below and we'll help you reset your password.
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-center text-red-600 font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Full Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                      <HiUser className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                      placeholder="Enter your full name"
                      disabled={submitting}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Enter your name as registered in the system
                  </p>
                </div>

                {/* Email Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                      <HiMail className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                      placeholder="you@example.com"
                      disabled={submitting}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    We'll send password reset instructions to this email
                  </p>
                </div>

                {/* Issue Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Describe Your Issue *
                  </label>
                  <textarea
                    name="issue"
                    value={formData.issue}
                    onChange={handleChange}
                    rows={4}
                    className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    placeholder="I forgot my password and cannot login. Please help me reset it..."
                    disabled={submitting}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Provide details so admin can help you quickly
                  </p>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`w-full py-2.5 px-4 rounded-lg text-white font-medium transition-all ${
                      submitting ? 'opacity-75 cursor-not-allowed' : 'hover:opacity-90'
                    }`}
                    style={{ 
                      background: `linear-gradient(135deg, ${BRAND_COLORS.deepRed} 0%, ${BRAND_COLORS.brightRed} 100%)`
                    }}
                  >
                    {submitting ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Sending Request...
                      </div>
                    ) : (
                      'Send Reset Request'
                    )}
                  </button>
                </div>
              </form>

              {/* Help Text */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  An email will be sent to the admin. You will receive a response within 24 hours.
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Need immediate help? Contact support at{' '}
                  <a href="mailto:tauheeddeveloper13@gmail.com" className="text-red-600 hover:underline">
                    tauheeddeveloper13@gmail.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <SuccessModal
          message={successMessage}
          onClose={handleSuccessClose}
        />
      )}
    </>
  );
}