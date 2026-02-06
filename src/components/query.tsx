"use client";

import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  HiPhone, 
  HiMail, 
  HiClock,
  HiChat,
  HiLocationMarker 
} from "react-icons/hi";

gsap.registerPlugin(ScrollTrigger);

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

  // Refs for animations
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const leftColumnRef = useRef<HTMLDivElement>(null);
  const rightColumnRef = useRef<HTMLDivElement>(null);
  const formElementsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Clear existing animations
      const elements = [
        headingRef.current,
        descriptionRef.current,
        leftColumnRef.current,
        rightColumnRef.current,
        ...formElementsRef.current.filter(Boolean)
      ].filter(Boolean);
      
      if (elements.length > 0) {
        gsap.set(elements, { clearProps: "all" });
      }

      // Section entrance animation
      if (sectionRef.current) {
        gsap.fromTo(sectionRef.current,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 90%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // Heading animation - from left
      if (headingRef.current) {
        gsap.fromTo(headingRef.current,
          {
            x: -100,
            opacity: 0
          },
          {
            x: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: headingRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            }
          }
        );
      }

      // Description animation - from right
      if (descriptionRef.current) {
        gsap.fromTo(descriptionRef.current,
          {
            x: 100,
            opacity: 0
          },
          {
            x: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: descriptionRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            }
          }
        );
      }

      // Left column animation - from left with delay
      if (leftColumnRef.current) {
        gsap.fromTo(leftColumnRef.current,
          {
            x: -80,
            opacity: 0,
            scale: 0.95
          },
          {
            x: 0,
            opacity: 1,
            scale: 1,
            duration: 1,
            delay: 0.2,
            ease: "back.out(1.2)",
            scrollTrigger: {
              trigger: leftColumnRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            }
          }
        );
      }

      // Right column animation - from right with delay
      if (rightColumnRef.current) {
        gsap.fromTo(rightColumnRef.current,
          {
            x: 80,
            opacity: 0,
            scale: 0.95
          },
          {
            x: 0,
            opacity: 1,
            scale: 1,
            duration: 1,
            delay: 0.3,
            ease: "back.out(1.2)",
            scrollTrigger: {
              trigger: rightColumnRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            }
          }
        );
      }

      // Form elements animation - from bottom with stagger
      const validFormElements = formElementsRef.current.filter(Boolean) as HTMLElement[];
      if (validFormElements.length > 0) {
        gsap.fromTo(validFormElements,
          {
            y: 40,
            opacity: 0
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out",
            delay: 0.4,
            scrollTrigger: {
              trigger: rightColumnRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            }
          }
        );
      }

      // Contact items animation in left column
      if (leftColumnRef.current) {
        const contactItems = leftColumnRef.current.querySelectorAll('.contact-item');
        gsap.fromTo(contactItems,
          {
            y: 30,
            opacity: 0
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.15,
            ease: "power2.out",
            delay: 0.5,
            scrollTrigger: {
              trigger: leftColumnRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            }
          }
        );
      }

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Initialize form elements refs
  useEffect(() => {
    formElementsRef.current = formElementsRef.current.slice(0, 6); // 6 form elements
  }, []);

  const setFormElementRef = (index: number) => (el: HTMLDivElement | null) => {
    formElementsRef.current[index] = el;
  };

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
      ref={sectionRef}
      className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
      style={{ backgroundColor: BRAND_COLORS.white }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header - Centered */}
        <div className="text-center mb-12">
          <h2 
            ref={headingRef}
            className="text-3xl sm:text-4xl font-bold mb-4"
            style={{ color: BRAND_COLORS.darkNavy }}
          >
            Get in Touch
          </h2>
          <p 
            ref={descriptionRef}
            className="text-lg max-w-2xl mx-auto"
            style={{ color: BRAND_COLORS.darkGrey }}
          >
            Have questions about our training programs? Contact our team for more information.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left Column - Contact Information */}
         <div ref={leftColumnRef} className="lg:w-2/5">
  <div className="bg-white rounded-2xl p-6 md:p-8 h-full border border-gray-200">

    <h3 className="text-xl font-bold mb-6 text-[#B11217]">
      Contact Information
    </h3>

    {/* Contact Details */}
    <div className="space-y-6">

      {/* Phone Numbers */}
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-[#B11217]/10">
          <HiPhone className="w-5 h-5 text-[#B11217]" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">Phone Numbers</h4>
          <ul className="text-gray-700 text-sm space-y-1">
            <li><span className="text-[#B11217]">•</span> General: <a href="tel:03224700200" className="hover:underline">03224700200</a></li>
            <li><span className="text-[#B11217]">•</span> Lahore: <a href="tel:03104700200" className="hover:underline">03104700200</a></li>
            <li><span className="text-[#B11217]">•</span> Sheikhupura: <a href="tel:03054700202" className="hover:underline">03054700202</a></li>
            <li><span className="text-[#B11217]">•</span> Rawalpindi: <a href="tel:03204700607" className="hover:underline">03204700607</a></li>
          </ul>
        </div>
      </div>

      {/* Email */}
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-[#B11217]/10">
          <HiMail className="w-5 h-5 text-[#B11217]" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">Email</h4>
          <p className="text-gray-700 text-sm">
            <span className="text-[#B11217]">•</span> <a href="mailto:info@mansolhab.com" className="hover:underline">info@mansolhab.com</a>
          </p>
        </div>
      </div>

      {/* WhatsApp */}
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-[#B11217]/10">
          <HiChat className="w-5 h-5 text-[#B11217]" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">WhatsApp</h4>
          <p className="text-gray-700 text-sm">
            <span className="text-[#B11217]">•</span> <a href="https://wa.me/923224700200" target="_blank" rel="noopener noreferrer" className="hover:underline">03224700200</a>
          </p>
        </div>
      </div>

      {/* Office Hours */}
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-[#B11217]/10">
          <HiClock className="w-5 h-5 text-[#B11217]" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">Office Hours</h4>
          <p className="text-gray-700 text-sm">
            <span className="text-[#B11217]">•</span> Monday to Saturday<br />
            <span className="text-[#B11217]">•</span> 9:00 AM - 5:00 PM
          </p>
        </div>
      </div>

    </div>

    {/* Note */}
    <div className="pt-4 mt-6 border-t border-gray-200">
      <p className="text-gray-700 text-sm">
        Feel free to contact us for any queries regarding our training programs, 
        admissions, or partnership opportunities.
      </p>
    </div>

  </div>
</div>


          {/* Right Column - Contact Form */}
       <div ref={rightColumnRef} className="lg:w-3/5">
  <div className="bg-white rounded-2xl  p-6 md:p-8 border ">

    {/* Success Message */}
    {isSubmitted && (
      <div className="mb-6 p-4 rounded-lg text-center bg-[#B112171A] border border-[#B112174D] text-[#B11217]">
        <div className="flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>Thank you! Your message has been sent successfully.</span>
        </div>
      </div>
    )}

    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Name & Email */}
      <div ref={setFormElementRef(0)} className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Name */}
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-800">
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
                : 'border-gray-300 focus:border-[#B11217] focus:ring-[#B112174D]'
            }`}
            aria-required="true"
          />
          {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-800">
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
                : 'border-gray-300 focus:border-[#B11217] focus:ring-[#B112174D]'
            }`}
            aria-required="true"
          />
          {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
        </div>
      </div>

      {/* Subject */}
      <div ref={setFormElementRef(1)} className="space-y-2">
        <label htmlFor="subject" className="block text-sm font-medium text-gray-800">
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
              : 'border-gray-300 focus:border-[#B11217] focus:ring-[#B112174D]'
          }`}
          aria-required="true"
        />
        {errors.subject && <p className="text-sm text-red-600">{errors.subject}</p>}
      </div>

      {/* Message */}
      <div ref={setFormElementRef(2)} className="space-y-2">
        <label htmlFor="message" className="block text-sm font-medium text-gray-800">
          Your Message
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Write your message here..."
          rows={4}
          className="w-full px-4 py-3 rounded-lg border bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-[#B11217] transition-all duration-200 resize-none"
        />
      </div>

      {/* Submit Button */}
      <div ref={setFormElementRef(3)} className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-8 py-3 font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed hover:bg-[#9D0E14] focus:ring-[#B112174D] inline-flex items-center justify-center"
          style={{ backgroundColor: '#B11217', color: '#FFFFFF' }}
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

        </div>
      </div>
    </section>
  );
}