"use client";

import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export  function ContactForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    course: "",
    message: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs for animation
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const subheadingRef = useRef<HTMLParagraphElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  
  // Individual refs for inputs
  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const courseSelectRef = useRef<HTMLSelectElement>(null);
  const messageTextareaRef = useRef<HTMLTextAreaElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const courses = [
    "BOSH (Building Operating System Hardware)",
    "Fire Safety Engineering",
    "OSHA Training",
    "Hole Watcher Certification",
    "PTW System Training",
    "General Safety Management",
    "Custom Corporate Training",
  ];

  // GSAP Animation Setup - Optimized for mobile
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Check if mobile for optimized settings
      const isMobile = window.innerWidth < 768;
      
      // Collect all input refs
      const inputElements = [
        nameInputRef.current,
        emailInputRef.current,
        phoneInputRef.current,
        courseSelectRef.current,
        messageTextareaRef.current,
        submitButtonRef.current
      ].filter(Boolean);

      // Clear any existing animations
      gsap.set([
        headingRef.current,
        subheadingRef.current,
        formRef.current,
        ...inputElements
      ], { clearProps: "all" });

      // Section fade in - smoother on mobile
      gsap.fromTo(sectionRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: isMobile ? 0.8 : 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 90%", // Trigger earlier on mobile
            end: "bottom 60%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Heading slide in from left - adjusted for mobile
      gsap.fromTo(headingRef.current,
        {
          x: isMobile ? -40 : -80,
          opacity: 0
        },
        {
          x: 0,
          opacity: 1,
          duration: isMobile ? 0.7 : 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 85%",
            end: "bottom 70%",
            toggleActions: "play none none reverse",
          }
        }
      );

      // Subheading slide in from right - adjusted for mobile
      gsap.fromTo(subheadingRef.current,
        {
          x: isMobile ? 40 : 80,
          opacity: 0
        },
        {
          x: 0,
          opacity: 1,
          duration: isMobile ? 0.7 : 1,
          ease: "power3.out",
          delay: isMobile ? 0.1 : 0.2,
          scrollTrigger: {
            trigger: subheadingRef.current,
            start: "top 85%",
            end: "bottom 70%",
            toggleActions: "play none none reverse",
          }
        }
      );

      // Form container slide in from bottom - better for mobile
      gsap.fromTo(formRef.current,
        {
          y: isMobile ? 40 : 60,
          opacity: 0,
          scale: 0.98
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: isMobile ? 0.8 : 1,
          ease: "power3.out",
          delay: isMobile ? 0.2 : 0.3,
          scrollTrigger: {
            trigger: formRef.current,
            start: "top 90%",
            end: "bottom 70%",
            toggleActions: "play none none reverse",
          }
        }
      );

      // Input animations - staggered for better mobile experience
      inputElements.forEach((input, index) => {
        if (input) {
          // Vertical slide for mobile, horizontal for desktop
          const fromY = isMobile ? 30 : 0;
          const fromX = isMobile ? 0 : (index % 2 === 0 ? -30 : 30);
          
          gsap.fromTo(input,
            {
              x: fromX,
              y: fromY,
              opacity: 0,
              scale: 0.95
            },
            {
              x: 0,
              y: 0,
              opacity: 1,
              scale: 1,
              duration: isMobile ? 0.6 : 0.8,
              ease: "back.out(1.2)",
              delay: isMobile ? (index * 0.08) : (index * 0.1),
              scrollTrigger: {
                trigger: input,
                start: "top 95%", // Trigger later for better mobile
                end: "bottom 75%",
                toggleActions: "play none none reverse",
              }
            }
          );
        }
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.course.trim()) {
      newErrors.course = "Course selection is required";
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
          fullName: "",
          email: "",
          phone: "",
          course: "",
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
    <section ref={sectionRef} className="bg-white py-12 md:py-16 px-4 sm:px-5 lg:px-8 overflow-hidden">
      <div className="max-w-3xl mx-auto">
        {/* Section Header - Mobile Optimized */}
        <div className="text-center mb-8 md:mb-10 px-2">
          <h2 
            ref={headingRef} 
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#1F2937] mb-2 md:mb-3 leading-tight"
          >
            Get in Touch
          </h2>
          <p 
            ref={subheadingRef}
            className="text-base md:text-lg text-[#1F2937] mb-2"
          >
            Have questions about our safety courses?
          </p>
          <p className="text-[#DA2F6B] font-medium text-sm md:text-base">
            Send us a message and we&apos;ll respond promptly
          </p>
        </div>

        {/* Success Message */}
        {isSubmitted && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg text-green-700 text-center animate-fadeIn">
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Thank you! Your inquiry has been submitted successfully.</span>
            </div>
          </div>
        )}

        {/* Form Container - Mobile Optimized */}
        <div ref={formRef} className="bg-white rounded-xl border border-gray-200 md:border-[#E5E7EB] p-5 md:p-6 lg:p-8 opacity-0">
          <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
            {/* Mobile: Single Column, Desktop: Two Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 lg:gap-6">
              {/* Full Name Field */}
              <div className="space-y-1.5 md:space-y-2">
                <label 
                  htmlFor="fullName" 
                  className="block text-sm font-medium text-[#1F2937]"
                >
                  Full Name *
                </label>
                <input
                  ref={nameInputRef}
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={`w-full px-4 py-3 md:py-3.5 rounded-lg border ${
                    errors.fullName ? "border-red-400" : "border-gray-300 md:border-[#D1D5DB]"
                  } bg-white text-[#1F2937] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8] transition-all duration-200 text-base md:text-sm opacity-0`}
                  aria-required="true"
                />
                {errors.fullName && (
                  <p className="text-xs text-red-500 animate-shake">{errors.fullName}</p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-1.5 md:space-y-2">
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium text-[#1F2937]"
                >
                  Email Address *
                </label>
                <input
                  ref={emailInputRef}
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  className={`w-full px-4 py-3 md:py-3.5 rounded-lg border ${
                    errors.email ? "border-red-400" : "border-gray-300 md:border-[#D1D5DB]"
                  } bg-white text-[#1F2937] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8] transition-all duration-200 text-base md:text-sm opacity-0`}
                  aria-required="true"
                />
                {errors.email && (
                  <p className="text-xs text-red-500 animate-shake">{errors.email}</p>
                )}
              </div>

              {/* Phone Field */}
              <div className="space-y-1.5 md:space-y-2">
                <label 
                  htmlFor="phone" 
                  className="block text-sm font-medium text-[#1F2937]"
                >
                  Phone Number
                </label>
                <input
                  ref={phoneInputRef}
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className="w-full px-4 py-3 md:py-3.5 rounded-lg border border-gray-300 md:border-[#D1D5DB] bg-white text-[#1F2937] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8] transition-all duration-200 text-base md:text-sm opacity-0"
                />
              </div>

              {/* Course Field */}
              <div className="space-y-1.5 md:space-y-2">
                <label 
                  htmlFor="course" 
                  className="block text-sm font-medium text-[#1F2937]"
                >
                  Course of Interest *
                </label>
                <div className="relative">
                  <select
                    ref={courseSelectRef}
                    id="course"
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 md:py-3.5 rounded-lg border ${
                      errors.course ? "border-red-400" : "border-gray-300 md:border-[#D1D5DB]"
                    } bg-white text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8] transition-all duration-200 appearance-none cursor-pointer text-base md:text-sm opacity-0`}
                    aria-required="true"
                  >
                    <option value="">Select or enter course</option>
                    {courses.map((course) => (
                      <option key={course} value={course}>
                        {course}
                      </option>
                    ))}
                    <option value="other">Other (specify in message)</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {errors.course && (
                  <p className="text-xs text-red-500 animate-shake">{errors.course}</p>
                )}
              </div>
            </div>

            {/* Message Field */}
            <div className="space-y-1.5 md:space-y-2">
              <label 
                htmlFor="message" 
                className="block text-sm font-medium text-[#1F2937]"
              >
                Message / Notes
              </label>
              <textarea
                ref={messageTextareaRef}
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Write your message or inquiry here"
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 md:border-[#D1D5DB] bg-white text-[#1F2937] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6B21A8]/30 focus:border-[#6B21A8] transition-all duration-200 resize-none text-base md:text-sm opacity-0"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2 md:pt-3">
              <button
                ref={submitButtonRef}
                type="submit"
                disabled={isLoading}
                className={`w-full md:w-auto min-w-[180px] px-6 py-3 bg-gradient-to-r from-[#F59E0B] to-[#F59E0B]/90 text-white font-semibold rounded-lg hover:from-[#6B21A8] hover:to-[#6B21A8]/90 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed text-base md:text-sm opacity-0 ${
                  isLoading ? 'animate-pulse' : ''
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  'Submit Inquiry'
                )}
              </button>
            </div>

            {/* Required Fields Note */}
            <div className="text-xs text-gray-500 pt-1">
              * Required fields
            </div>
          </form>
        </div>

        {/* Contact Info Note - Mobile Optimized */}
        <div className="mt-8 text-center text-sm text-gray-600 px-2">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-[#6B21A8]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              <span className="font-medium text-[#1F2937]">03224700200</span>
            </div>
            <span className="hidden sm:inline text-gray-400">•</span>
            <a 
              href="mailto:info@mansolhab.com" 
              className="flex items-center gap-1 text-[#6B21A8] hover:text-[#DA2F6B] transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <span>info@mansolhab.com</span>
            </a>
          </div>
        </div>
      </div>

      {/* Mobile Optimized Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        /* Better touch targets on mobile */
        @media (max-width: 768px) {
          input, select, textarea, button {
            font-size: 16px; /* Prevents iOS zoom on focus */
            min-height: 48px; /* Better touch target */
          }
          
          .min-w-\[180px\] {
            min-width: 100%;
          }
        }
      `}</style>
    </section>
  );
}
export default ContactForm;