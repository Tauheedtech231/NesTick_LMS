"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { 
  HiUser, 
  HiMail, 
  HiPhone, 
  HiHome, 
  HiCalendar, 
  HiAcademicCap,
  HiIdentification,
  HiCamera,
  HiDocumentText,
  HiChat,
  HiUpload
} from "react-icons/hi";
import Image from "next/image";
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
    whatsappNumber: '',
    passportNumber: '',
    address: '',
    city: '',
    education: '',
    experience: '',
    dateOfBirth: ''
  });

  const [files, setFiles] = useState({
    cnicFront: null as File | null,
    cnicBack: null as File | null,
    educationalDocs: null as File | null,
    passportPhoto: null as File | null
  });

  const [previews, setPreviews] = useState({
    cnicFront: '',
    cnicBack: '',
    educationalDocs: '',
    passportPhoto: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // File input refs
  const cnicFrontRef = useRef<HTMLInputElement>(null);
  const cnicBackRef = useRef<HTMLInputElement>(null);
  const educationalDocsRef = useRef<HTMLInputElement>(null);
  const passportPhotoRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, [field]: 'File size must be less than 5MB' }));
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/') && field !== 'educationalDocs') {
      setErrors(prev => ({ ...prev, [field]: 'Please upload an image file' }));
      return;
    }

    setFiles(prev => ({ ...prev, [field]: file }));

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviews(prev => ({ ...prev, [field]: reader.result as string }));
    };
    reader.readAsDataURL(file);

    // Clear error
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const removeFile = (field: string) => {
    setFiles(prev => ({ ...prev, [field]: null }));
    setPreviews(prev => ({ ...prev, [field]: '' }));
    
    // Reset file input
    switch(field) {
      case 'cnicFront':
        if (cnicFrontRef.current) cnicFrontRef.current.value = '';
        break;
      case 'cnicBack':
        if (cnicBackRef.current) cnicBackRef.current.value = '';
        break;
      case 'educationalDocs':
        if (educationalDocsRef.current) educationalDocsRef.current.value = '';
        break;
      case 'passportPhoto':
        if (passportPhotoRef.current) passportPhotoRef.current.value = '';
        break;
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
    if (!formData.whatsappNumber.trim()) newErrors.whatsappNumber = 'WhatsApp number is required';
    if (!formData.passportNumber.trim()) newErrors.passportNumber = 'Passport number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.education.trim()) newErrors.education = 'Education level is required';
    
    // File validations
    if (!files.cnicFront) newErrors.cnicFront = 'Front CNIC image is required';
    if (!files.cnicBack) newErrors.cnicBack = 'Back CNIC image is required';
    if (!files.passportPhoto) newErrors.passportPhoto = 'Passport size photo is required';
    if (!files.educationalDocs) newErrors.educationalDocs = 'Educational documents are required';

    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Scroll to top of form to show errors
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call with file upload
    setTimeout(() => {
      const enrollmentData = {
        ...formData,
        files: {
          cnicFront: files.cnicFront?.name,
          cnicBack: files.cnicBack?.name,
          educationalDocs: files.educationalDocs?.name,
          passportPhoto: files.passportPhoto?.name
        },
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
      : 'border-gray-300 focus:border-[#B11217] focus:ring-[#B11217]/20'
    }
  `;

  const labelClass = "block text-sm font-medium mb-2 text-gray-700";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 border border-gray-100 max-w-5xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-0 mb-6 sm:mb-8">
        <HiAcademicCap className="w-8 h-8 sm:w-10 sm:h-10 mr-0 sm:mr-3" style={{ color: BRAND_COLORS.deepRed }} />
        <div>
          <h2 className="text-xl sm:text-2xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
            Enrollment Form
          </h2>
          <p className="text-sm sm:text-base text-gray-600">Complete your enrollment by filling the form below</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        {/* Personal Information Section */}
        <div className="space-y-4 sm:space-y-6">
          <h3 className="text-base sm:text-lg font-semibold pb-2 border-b border-gray-100"
            style={{ color: BRAND_COLORS.darkNavy }}>
            Personal Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="col-span-1 sm:col-span-2 lg:col-span-3">
              <label className={labelClass}>
                <span className="flex items-center text-sm sm:text-base">
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
                <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label className={labelClass}>
                <span className="flex items-center text-sm sm:text-base">
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
                <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className={labelClass}>
                <span className="flex items-center text-sm sm:text-base">
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
                <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className={labelClass}>
                <span className="flex items-center text-sm sm:text-base">
                  <HiChat className="w-4 h-4 mr-1" />
                  WhatsApp Number *
                </span>
              </label>
              <input
                type="tel"
                name="whatsappNumber"
                value={formData.whatsappNumber}
                onChange={handleChange}
                placeholder="+92 300 1234567"
                className={inputClass('whatsappNumber')}
              />
              {errors.whatsappNumber && (
                <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.whatsappNumber}</p>
              )}
            </div>

            <div>
              <label className={labelClass}>
                <span className="flex items-center text-sm sm:text-base">
                  <HiIdentification className="w-4 h-4 mr-1" />
                  Passport Number *
                </span>
              </label>
              <input
                type="text"
                name="passportNumber"
                value={formData.passportNumber}
                onChange={handleChange}
                placeholder="e.g., 12345-6789012-3"
                className={inputClass('passportNumber')}
              />
              {errors.passportNumber && (
                <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.passportNumber}</p>
              )}
            </div>

            <div>
              <label className={labelClass}>
                <span className="flex items-center text-sm sm:text-base">
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

        {/* Document Upload Section */}
        <div className="space-y-4 sm:space-y-6">
          <h3 className="text-base sm:text-lg font-semibold pb-2 border-b border-gray-100"
            style={{ color: BRAND_COLORS.darkNavy }}>
            Required Documents
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Passport Size Photo */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-1">
              <label className={labelClass}>
                <span className="flex items-center text-sm sm:text-base">
                  <HiCamera className="w-4 h-4 mr-1" />
                  Passport Size Photo *
                </span>
              </label>
              <div className={`border-2 border-dashed rounded-lg p-3 sm:p-4 text-center ${errors.passportPhoto ? 'border-red-300' : 'border-gray-300'}`}>
                <input
                  type="file"
                  ref={passportPhotoRef}
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'passportPhoto')}
                  className="hidden"
                  id="passportPhoto"
                />
                {!previews.passportPhoto ? (
                  <label htmlFor="passportPhoto" className="cursor-pointer block">
                    <HiUpload className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 text-gray-400" />
                    <p className="text-xs sm:text-sm text-gray-600">Click to upload passport photo</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG (Max 5MB)</p>
                  </label>
                ) : (
                  <div className="relative">
                    <Image src={previews.passportPhoto} alt="Passport" width={100} height={100} className="mx-auto rounded-lg object-cover" />
                    <button
                      type="button"
                      onClick={() => removeFile('passportPhoto')}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
              {errors.passportPhoto && (
                <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.passportPhoto}</p>
              )}
            </div>

            {/* CNIC Front */}
            <div>
              <label className={labelClass}>
                <span className="flex items-center text-sm sm:text-base">
                  <HiIdentification className="w-4 h-4 mr-1" />
                  CNIC Front *
                </span>
              </label>
              <div className={`border-2 border-dashed rounded-lg p-3 sm:p-4 text-center ${errors.cnicFront ? 'border-red-300' : 'border-gray-300'}`}>
                <input
                  type="file"
                  ref={cnicFrontRef}
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'cnicFront')}
                  className="hidden"
                  id="cnicFront"
                />
                {!previews.cnicFront ? (
                  <label htmlFor="cnicFront" className="cursor-pointer block">
                    <HiUpload className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 text-gray-400" />
                    <p className="text-xs sm:text-sm text-gray-600">Upload front side</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG (Max 5MB)</p>
                  </label>
                ) : (
                  <div className="relative">
                    <Image src={previews.cnicFront} alt="CNIC Front" width={120} height={80} className="mx-auto rounded-lg object-cover" />
                    <button
                      type="button"
                      onClick={() => removeFile('cnicFront')}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
              {errors.cnicFront && (
                <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.cnicFront}</p>
              )}
            </div>

            {/* CNIC Back */}
            <div>
              <label className={labelClass}>
                <span className="flex items-center text-sm sm:text-base">
                  <HiIdentification className="w-4 h-4 mr-1" />
                  CNIC Back *
                </span>
              </label>
              <div className={`border-2 border-dashed rounded-lg p-3 sm:p-4 text-center ${errors.cnicBack ? 'border-red-300' : 'border-gray-300'}`}>
                <input
                  type="file"
                  ref={cnicBackRef}
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'cnicBack')}
                  className="hidden"
                  id="cnicBack"
                />
                {!previews.cnicBack ? (
                  <label htmlFor="cnicBack" className="cursor-pointer block">
                    <HiUpload className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 text-gray-400" />
                    <p className="text-xs sm:text-sm text-gray-600">Upload back side</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG (Max 5MB)</p>
                  </label>
                ) : (
                  <div className="relative">
                    <Image src={previews.cnicBack} alt="CNIC Back" width={120} height={80} className="mx-auto rounded-lg object-cover" />
                    <button
                      type="button"
                      onClick={() => removeFile('cnicBack')}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
              {errors.cnicBack && (
                <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.cnicBack}</p>
              )}
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div className="space-y-4 sm:space-y-6">
          <h3 className="text-base sm:text-lg font-semibold pb-2 border-b border-gray-100"
            style={{ color: BRAND_COLORS.darkNavy }}>
            Address Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="sm:col-span-2">
              <label className={labelClass}>
                <span className="flex items-center text-sm sm:text-base">
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
                <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.address}</p>
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
                <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.city}</p>
              )}
            </div>
          </div>
        </div>

        {/* Education Section */}
        <div className="space-y-4 sm:space-y-6">
          <h3 className="text-base sm:text-lg font-semibold pb-2 border-b border-gray-100"
            style={{ color: BRAND_COLORS.darkNavy }}>
            Education & Experience
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
                <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.education}</p>
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

            {/* Educational Documents Upload */}
            <div className="sm:col-span-2">
              <label className={labelClass}>
                <span className="flex items-center text-sm sm:text-base">
                  <HiDocumentText className="w-4 h-4 mr-1" />
                  Educational Documents (Matric/Intermediate Certificate) *
                </span>
              </label>
              <div className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center ${errors.educationalDocs ? 'border-red-300' : 'border-gray-300'}`}>
                <input
                  type="file"
                  ref={educationalDocsRef}
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange(e, 'educationalDocs')}
                  className="hidden"
                  id="educationalDocs"
                />
                {!previews.educationalDocs ? (
                  <label htmlFor="educationalDocs" className="cursor-pointer block">
                    <HiUpload className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-sm sm:text-base text-gray-600">Click to upload educational documents</p>
                    <p className="text-xs text-gray-400 mt-2">PDF, JPG, PNG (Max 5MB)</p>
                  </label>
                ) : (
                  <div className="relative inline-block">
                    <Image src={previews.educationalDocs} alt="Educational Document" width={150} height={100} className="mx-auto rounded-lg object-cover" />
                    <button
                      type="button"
                      onClick={() => removeFile('educationalDocs')}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
              {errors.educationalDocs && (
                <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.educationalDocs}</p>
              )}
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="p-3 sm:p-4 rounded-lg border border-gray-200 bg-gray-50">
          <div className="flex items-start">
            <input
              type="checkbox"
              id="terms"
              required
              className="w-4 h-4 mt-1 mr-3 text-[#B11217] bg-gray-100 border-gray-300 rounded focus:ring-[#B11217] focus:ring-2"
            />
            <label htmlFor="terms" className="text-xs sm:text-sm text-gray-700">
              I agree to the terms and conditions, privacy policy, and confirm that all information 
              provided is accurate. I understand that false information may result in cancellation 
              of enrollment.
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2 sm:pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-bold text-sm sm:text-base lg:text-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
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
          
          <p className="text-xs sm:text-sm text-gray-500 text-center mt-3 sm:mt-4">
            You'll be redirected to download your payment voucher after form submission
          </p>
        </div>
      </form>
    </motion.div>
  );
}