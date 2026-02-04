"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { HiUser, HiMail, HiPhone, HiHome, HiCalendar, HiAcademicCap } from "react-icons/hi";
/* eslint-disable */

const BRAND_COLORS = {
  darkNavy: '#0B1C3D',
  deepRed: '#B11217',
  white: '#FFFFFF',
  softGrey: '#E5E7EB',
  darkGrey: '#1F2933',
  teal: '#1FB6CB'
};

interface EnrollmentFormProps {
  course: string;
  price: string;
  onSubmit: (data: any) => void;
}

export default function EnrollmentForm({ course, price, onSubmit }: EnrollmentFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    education: '',
    experience: '',
    emergencyContact: '',
    dateOfBirth: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.education.trim()) newErrors.education = 'Education level is required';

    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const enrollmentData = {
        ...formData,
        course,
        price,
        enrollmentDate: new Date().toISOString(),
        enrollmentId: `ENR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
      onSubmit(enrollmentData);
      setIsSubmitting(false);
    }, 1000);
  };

  const inputClass = (fieldName: string) => `
    w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50
    ${errors[fieldName] 
      ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
    }
  `;

  const labelClass = "block text-sm font-medium mb-2 text-gray-700";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-2xl  p-8 border border-gray-100"
    >
      <div className="flex items-center mb-8">
        <HiAcademicCap className="w-8 h-8 mr-3" style={{ color: BRAND_COLORS.deepRed }} />
        <div>
          <h2 className="text-2xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
            Enrollment Form
          </h2>
          <p className="text-gray-600">Complete your enrollment by filling the form below</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold pb-2 border-b border-gray-100"
            style={{ color: BRAND_COLORS.darkNavy }}>
            Personal Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>
                <span className="flex items-center">
                  <HiUser className="w-4 h-4 mr-1" />
                  Full Name *
                </span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                className={inputClass('fullName')}
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label className={labelClass}>
                <span className="flex items-center">
                  <HiMail className="w-4 h-4 mr-1" />
                  Email Address *
                </span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={inputClass('email')}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className={labelClass}>
                <span className="flex items-center">
                  <HiPhone className="w-4 h-4 mr-1" />
                  Phone Number *
                </span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+92 300 1234567"
                className={inputClass('phone')}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className={labelClass}>
                <span className="flex items-center">
                  <HiCalendar className="w-4 h-4 mr-1" />
                  Date of Birth
                </span>
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className={inputClass('dateOfBirth')}
              />
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold pb-2 border-b border-gray-100"
            style={{ color: BRAND_COLORS.darkNavy }}>
            Address Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className={labelClass}>
                <span className="flex items-center">
                  <HiHome className="w-4 h-4 mr-1" />
                  Complete Address *
                </span>
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="House #, Street, Area"
                rows={3}
                className={inputClass('address')}
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address}</p>
              )}
            </div>

            <div>
              <label className={labelClass}>
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter your city"
                className={inputClass('city')}
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city}</p>
              )}
            </div>

            <div>
              <label className={labelClass}>
                Emergency Contact
              </label>
              <input
                type="tel"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                placeholder="+92 300 7654321"
                className={inputClass('emergencyContact')}
              />
            </div>
          </div>
        </div>

        {/* Education Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold pb-2 border-b border-gray-100"
            style={{ color: BRAND_COLORS.darkNavy }}>
            Education & Experience
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>
                Highest Education Level *
              </label>
              <select
                name="education"
                value={formData.education}
                onChange={handleChange}
                className={inputClass('education')}
              >
                <option value="">Select education level</option>
                <option value="matric">Matriculation</option>
                <option value="intermediate">Intermediate</option>
                <option value="bachelors">Bachelor's Degree</option>
                <option value="masters">Master's Degree</option>
                <option value="phd">PhD</option>
              </select>
              {errors.education && (
                <p className="mt-1 text-sm text-red-600">{errors.education}</p>
              )}
            </div>

            <div>
              <label className={labelClass}>
                Relevant Experience (if any)
              </label>
              <input
                type="text"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                placeholder="e.g., 2 years in construction"
                className={inputClass('experience')}
              />
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
          <div className="flex items-start">
            <input
              type="checkbox"
              id="terms"
              required
              className="w-4 h-4 mt-1 mr-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <label htmlFor="terms" className="text-sm text-gray-700">
              I agree to the terms and conditions, privacy policy, and confirm that all information 
              provided is accurate. I understand that false information may result in cancellation 
              of enrollment.
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: BRAND_COLORS.deepRed,
              color: BRAND_COLORS.white
            }}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
            ) : (
              'Proceed to Payment Voucher'
            )}
          </button>
          
          <p className="text-sm text-gray-500 text-center mt-4">
            You'll be redirected to download your payment voucher after form submission
          </p>
        </div>
      </form>
    </motion.div>
  );
}