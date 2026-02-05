"use client";

import { useState } from "react";

// Brand Colors
const BRAND_COLORS = {
  darkNavy: '#0B1C3D',
  darkRoyalBlue: '#1E3A8A',
  deepRed: '#B11217',
  white: '#FFFFFF',
  lightGrey: '#F4F6F8',
  softGrey: '#E5E7EB',
  darkGrey: '#1F2933'
};

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        console.log("Form submitted:", formData);
        setIsSubmitted(true);
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
        
        // Reset success message after 5 seconds
        setTimeout(() => {
          setIsSubmitted(false);
        }, 5000);
      } catch (error) {
        console.error("Submission error:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <section 
      className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: BRAND_COLORS.white }}
    >
      <div className="max-w-3xl mx-auto">
        {/* Section Header - Centered */}
        <div className="text-center mb-12">
          <h2 
            className="text-3xl mt-10 sm:text-4xl font-bold mb-4"
            style={{ color: BRAND_COLORS.darkNavy }}
          >
            Get in Touch
          </h2>
          <p 
            className="text-lg max-w-2xl mx-auto"
            style={{ color: BRAND_COLORS.darkGrey }}
          >
            Have questions about our training programs? Contact our team for more information.
          </p>
        </div>

        {/* Centered Form Container */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mx-auto"
          style={{ 
            border: `1px solid ${BRAND_COLORS.softGrey}`,
            maxWidth: '600px'
          }}>
          
          {/* Success Message */}
          {isSubmitted && (
            <div className="mb-6 p-4 rounded-lg text-center" 
              style={{ 
                backgroundColor: '#B112171A',
                border: `1px solid #B112174D`,
                color: BRAND_COLORS.deepRed
              }}>
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Thank you! Your message has been sent successfully.</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Field */}
              <div className="space-y-2">
                <label 
                  htmlFor="name" 
                  className="block text-sm font-medium"
                  style={{ color: BRAND_COLORS.darkGrey }}
                >
                  Your Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className={`w-full px-4 py-3 rounded-lg border bg-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.name 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                  }`}
                  style={{ borderColor: errors.name ? undefined : BRAND_COLORS.softGrey }}
                  aria-required="true"
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium"
                  style={{ color: BRAND_COLORS.darkGrey }}
                >
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className={`w-full px-4 py-3 rounded-lg border bg-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.email 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                  }`}
                  style={{ borderColor: errors.email ? undefined : BRAND_COLORS.softGrey }}
                  aria-required="true"
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Subject Field */}
            <div className="space-y-2">
              <label 
                htmlFor="subject" 
                className="block text-sm font-medium"
                style={{ color: BRAND_COLORS.darkGrey }}
              >
                Subject *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="What is this regarding?"
                className={`w-full px-4 py-3 rounded-lg border bg-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                  errors.subject 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                }`}
                style={{ borderColor: errors.subject ? undefined : BRAND_COLORS.softGrey }}
                aria-required="true"
              />
              {errors.subject && (
                <p className="text-sm text-red-600">{errors.subject}</p>
              )}
            </div>

            {/* Message Field */}
            <div className="space-y-2">
              <label 
                htmlFor="message" 
                className="block text-sm font-medium"
                style={{ color: BRAND_COLORS.darkGrey }}
              >
                Your Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Write your message here..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg border bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-blue-500 transition-all duration-200 resize-none"
                style={{ 
                  borderColor: BRAND_COLORS.softGrey
                }}
              />
            </div>

            {/* Submit Button - Centered */}
            <div className="pt-2 text-center">
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-3 font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed hover:bg-[#9D0E14] focus:ring-red-200 inline-flex items-center justify-center"
                style={{
                  backgroundColor: BRAND_COLORS.deepRed,
                  color: BRAND_COLORS.white
                }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </div>
                ) : (
                  'Send Message'
                )}
              </button>
            </div>
          </form>
        </div>

       
      </div>
    </section>
  );
}