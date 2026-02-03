// app/courses/components/EnrollmentForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface EnrollmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  course: {
    id: string;
    title: string;
    fees: number;
  };
}

export default function EnrollmentForm({ isOpen, onClose, onSuccess, course }: EnrollmentFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    level: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{11}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 11-digit phone number';
    }
    
    if (!formData.level) {
      newErrors.level = 'Please select your level';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      // Generate enrollment ID
      const enrollmentId = 'ENR-' + Date.now().toString().slice(-6);
      
      // Store student info in localStorage
      const studentInfo = {
        ...formData,
        enrollmentId,
        courseId: course.id,
        courseTitle: course.title,
        fees: course.fees,
        enrollmentDate: new Date().toISOString(),
      };
      
      localStorage.setItem('studentInfo', JSON.stringify(studentInfo));
      
      // Store enrollment data for voucher
      localStorage.setItem('enrollmentData', JSON.stringify({
        ...studentInfo,
        voucherGenerated: false,
      }));
      
      setIsSubmitting(false);
      onClose();
      onSuccess();
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 
                     max-h-[90vh] overflow-y-auto z-10">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Course Enrollment</h2>
              <p className="text-sm text-gray-600 mt-1">{course.title}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.fullName ? 'border-red-500' : 'border-gray-300'
              } focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 outline-none transition-colors`}
              placeholder="Enter your full name"
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              } focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 outline-none transition-colors`}
              placeholder="student@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              } focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 outline-none transition-colors`}
              placeholder="03XX XXXXXXX"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          {/* Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Level *
            </label>
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.level ? 'border-red-500' : 'border-gray-300'
              } focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 outline-none transition-colors`}
            >
              <option value="">Select your level</option>
              <option value="Matric">Matric (9th-10th)</option>
              <option value="Intermediate">Intermediate (11th-12th)</option>
              <option value="Advanced">Advanced/Diploma</option>
            </select>
            {errors.level && (
              <p className="mt-1 text-sm text-red-600">{errors.level}</p>
            )}
          </div>

          {/* Course Info (Read-only) */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Selected Course</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Course:</span>
                <span className="font-medium text-gray-900">{course.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fees:</span>
                <span className="font-bold text-[#1E3A8A]">PKR {course.fees.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#F97316] hover:bg-[#EA580C] disabled:bg-gray-400 
                     text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 
                     hover:scale-[1.02] active:scale-95 shadow-md hover:shadow-lg 
                     disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              'Proceed to Payment'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}