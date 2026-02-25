"use client";

import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  HiPhone, 
  HiMail, 
  HiClock,
  HiChat
} from "react-icons/hi";
import { FaLocationArrow } from "react-icons/fa6";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

// Brand Colors (matching About section)
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
  
  // State for hover cards
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [displayEmail, setDisplayEmail] = useState("");
  const [displayPhone, setDisplayPhone] = useState("");
  const [displayHours, setDisplayHours] = useState("");

  // Refs for animations
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const leftColumnRef = useRef<HTMLDivElement>(null);
  const rightColumnRef = useRef<HTMLDivElement>(null);
  const contactItemsRef = useRef<HTMLDivElement[]>([]);
  const formGroupsRef = useRef<HTMLDivElement[]>([]);
  const buttonRef = useRef<HTMLDivElement>(null);
  const emailCardRef = useRef<HTMLDivElement>(null);
  const phoneCardRef = useRef<HTMLDivElement>(null);
  const hoursCardRef = useRef<HTMLDivElement>(null);
  
  // Add to refs arrays
  const addToContactItems = (el: HTMLDivElement | null) => {
    if (el && !contactItemsRef.current.includes(el)) {
      contactItemsRef.current.push(el);
    }
  };
  
  const addToFormGroups = (el: HTMLDivElement | null) => {
    if (el && !formGroupsRef.current.includes(el)) {
      formGroupsRef.current.push(el);
    }
  };

  // Typing animation effect for email card
  useEffect(() => {
    if (hoveredCard === 'email') {
      const emailText = "info@mansolhab.com";
      let i = 0;
      setDisplayEmail("");
      
      const typing = setInterval(() => {
        if (i < emailText.length) {
          setDisplayEmail(prev => prev + emailText.charAt(i));
          i++;
        } else {
          clearInterval(typing);
        }
      }, 50);
      
      return () => clearInterval(typing);
    } else {
      setDisplayEmail("");
    }
  }, [hoveredCard]);

  // Typing animation effect for phone card
  useEffect(() => {
    if (hoveredCard === 'phone') {
      const phoneText = "0322-4700200";
      let i = 0;
      setDisplayPhone("");
      
      const typing = setInterval(() => {
        if (i < phoneText.length) {
          setDisplayPhone(prev => prev + phoneText.charAt(i));
          i++;
        } else {
          clearInterval(typing);
        }
      }, 50);
      
      return () => clearInterval(typing);
    } else {
      setDisplayPhone("");
    }
  }, [hoveredCard]);

  // Typing animation effect for hours card
  useEffect(() => {
    if (hoveredCard === 'hours') {
      const hoursText = "Mon-Sat: 9:00 AM - 5:00 PM";
      let i = 0;
      setDisplayHours("");
      
      const typing = setInterval(() => {
        if (i < hoursText.length) {
          setDisplayHours(prev => prev + hoursText.charAt(i));
          i++;
        } else {
          clearInterval(typing);
        }
      }, 50);
      
      return () => clearInterval(typing);
    } else {
      setDisplayHours("");
    }
  }, [hoveredCard]);

  useEffect(() => {
    // Create a timeline for smoother, coordinated animations
    const ctx = gsap.context(() => {
      // Initial setup - ensure elements are hidden but not with display:none
      gsap.set([headingRef.current, descriptionRef.current, leftColumnRef.current, rightColumnRef.current], { 
        opacity: 0,
        y: 30,
        willChange: "transform, opacity"
      });
      
      gsap.set(contactItemsRef.current, { 
        opacity: 0,
        x: -20,
        willChange: "transform, opacity"
      });
      
      gsap.set(formGroupsRef.current, { 
        opacity: 0,
        y: 20,
        willChange: "transform, opacity"
      });
      
      gsap.set(buttonRef.current, { 
        opacity: 0,
        scale: 0.9,
        willChange: "transform, opacity"
      });

      // Main master timeline for coordinated entrance
      const masterTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
          invalidateOnRefresh: true, // Better performance on resize
        }
      });

      // Section fade in
      masterTl.to(sectionRef.current, {
        opacity: 1,
        duration: 0.6,
        ease: "power2.out"
      }, 0);

      // Heading animation - smooth from left
      masterTl.to(headingRef.current, {
        x: 0,
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out"
      }, 0.1);

      // Description animation - smooth from right
      masterTl.to(descriptionRef.current, {
        x: 0,
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out"
      }, 0.15);

      // Left column animation
      masterTl.to(leftColumnRef.current, {
        x: 0,
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: "power2.out"
      }, 0.2);

      // Right column animation
      masterTl.to(rightColumnRef.current, {
        x: 0,
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: "power2.out"
      }, 0.25);

      // Contact items staggered animation - smoother with reduced motion
      if (contactItemsRef.current.length) {
        masterTl.to(contactItemsRef.current, {
          x: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.08,
          ease: "power2.out"
        }, 0.3);
      }

      // Form groups staggered animation
      if (formGroupsRef.current.length) {
        masterTl.to(formGroupsRef.current, {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.07,
          ease: "power2.out"
        }, 0.4);
      }

      // Button animation
      masterTl.to(buttonRef.current, {
        scale: 1,
        opacity: 1,
        duration: 0.5,
        ease: "back.out(1.2)"
      }, 0.6);

    }, sectionRef);

    return () => {
      // Clean up all ScrollTrigger instances and animations
      ScrollTrigger.getAll().forEach(st => st.kill());
      ctx.revert();
    };
  }, []);

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
      className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden opacity-0" // Start hidden
      style={{ willChange: "transform, opacity" }}
    >
      {/* Background Image with Overlay - optimized */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.pexels.com/photos/33925031/pexels-photo-33925031.jpeg"
          alt="Background"
          fill
          className="object-cover"
          priority
          sizes="100vw"
          quality={85}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1C3D]/95 via-[#1E3A8A]/90 to-[#B11217]/80" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 
            ref={headingRef}
            className="text-3xl md:text-4xl font-bold mb-4 text-white drop-shadow-lg"
            style={{ transform: "translateX(-30px)" }}
          >
            Get in Touch
          </h2>
          <p 
            ref={descriptionRef}
            className="text-base md:text-lg max-w-2xl mx-auto text-white/90 drop-shadow"
            style={{ transform: "translateX(30px)" }}
          >
            Have questions about our training programs? Contact our team for more information.
          </p>
        </div>

        {/* Three Hover Cards - Email, Phone, and Hours */}
        <div className="grid md:grid-cols-3 gap-6 mb-10 max-w-4xl mx-auto">
          {/* Email Card */}
          <div
            ref={emailCardRef}
            onMouseEnter={() => setHoveredCard('email')}
            onMouseLeave={() => setHoveredCard(null)}
            className="bg-white/95 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-[#B11217]/10">
                <HiMail className="w-6 h-6" style={{ color: BRAND_COLORS.deepRed }} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold" style={{ color: BRAND_COLORS.darkNavy }}>Email Us</h3>
                <div className="min-h-[28px]">
                  {hoveredCard === 'email' ? (
                    <p className="text-base font-mono text-[#B11217]">{displayEmail}</p>
                  ) : (
                    <p className="text-sm text-gray-500">Hover to reveal</p>
                  )}
                </div>
              </div>
              <FaLocationArrow className="w-5 h-5 text-[#B11217] opacity-50" />
            </div>
          </div>

          {/* Phone Card */}
          <div
            ref={phoneCardRef}
            onMouseEnter={() => setHoveredCard('phone')}
            onMouseLeave={() => setHoveredCard(null)}
            className="bg-white/95 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-[#B11217]/10">
                <HiPhone className="w-6 h-6" style={{ color: BRAND_COLORS.deepRed }} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold" style={{ color: BRAND_COLORS.darkNavy }}>Call Us</h3>
                <div className="min-h-[28px]">
                  {hoveredCard === 'phone' ? (
                    <p className="text-base font-mono text-[#B11217]">{displayPhone}</p>
                  ) : (
                    <p className="text-sm text-gray-500">Hover to reveal</p>
                  )}
                </div>
              </div>
              <FaLocationArrow className="w-5 h-5 text-[#B11217] opacity-50" />
            </div>
          </div>

          {/* Hours Card */}
          <div
            ref={hoursCardRef}
            onMouseEnter={() => setHoveredCard('hours')}
            onMouseLeave={() => setHoveredCard(null)}
            className="bg-white/95 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-[#B11217]/10">
                <HiClock className="w-6 h-6" style={{ color: BRAND_COLORS.deepRed }} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold" style={{ color: BRAND_COLORS.darkNavy }}>Office Hours</h3>
                <div className="min-h-[28px]">
                  {hoveredCard === 'hours' ? (
                    <p className="text-base font-mono text-[#B11217]">{displayHours}</p>
                  ) : (
                    <p className="text-sm text-gray-500">Hover to reveal</p>
                  )}
                </div>
              </div>
              <FaLocationArrow className="w-5 h-5 text-[#B11217] opacity-50" />
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left Column - Contact Information (without office hours) */}
          <div 
            ref={leftColumnRef} 
            className="lg:w-2/5"
            style={{ transform: "translateX(-30px)" }}
          >
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 md:p-8 h-full border border-white/30 shadow-xl">
              <h3 className="text-xl md:text-2xl font-bold mb-6" style={{ color: BRAND_COLORS.deepRed }}>
                Contact Information
              </h3>

              {/* Contact Details */}
              <div className="space-y-6">
                {/* Phone Numbers */}
                <div 
                  ref={addToContactItems}
                  className="flex items-start gap-4"
                  style={{ transform: "translateX(-20px)" }}
                >
                  <div className="p-3 rounded-xl shrink-0" style={{ backgroundColor: `${BRAND_COLORS.deepRed}15` }}>
                    <HiPhone className="w-5 h-5" style={{ color: BRAND_COLORS.deepRed }} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-base mb-2" style={{ color: BRAND_COLORS.darkNavy }}>Phone Numbers</h4>
                    <ul className="text-gray-700 text-sm space-y-1.5">
                      <li><span style={{ color: BRAND_COLORS.deepRed }}>•</span> General: <a href="tel:03224700200" className="hover:underline hover:text-[#B11217] transition-colors">03224700200</a></li>
                      <li><span style={{ color: BRAND_COLORS.deepRed }}>•</span> Lahore: <a href="tel:03104700200" className="hover:underline hover:text-[#B11217] transition-colors">03104700200</a></li>
                      <li><span style={{ color: BRAND_COLORS.deepRed }}>•</span> Sheikhupura: <a href="tel:03054700202" className="hover:underline hover:text-[#B11217] transition-colors">03054700202</a></li>
                      <li><span style={{ color: BRAND_COLORS.deepRed }}>•</span> Rawalpindi: <a href="tel:03204700607" className="hover:underline hover:text-[#B11217] transition-colors">03204700607</a></li>
                    </ul>
                  </div>
                </div>

                {/* Email */}
                <div 
                  ref={addToContactItems}
                  className="flex items-start gap-4"
                  style={{ transform: "translateX(-20px)" }}
                >
                  <div className="p-3 rounded-xl shrink-0" style={{ backgroundColor: `${BRAND_COLORS.deepRed}15` }}>
                    <HiMail className="w-5 h-5" style={{ color: BRAND_COLORS.deepRed }} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-base mb-2" style={{ color: BRAND_COLORS.darkNavy }}>Email</h4>
                    <p className="text-gray-700 text-sm">
                      <span style={{ color: BRAND_COLORS.deepRed }}>•</span> <a href="mailto:info@mansolhab.com" className="hover:underline hover:text-[#B11217] transition-colors">info@mansolhab.com</a>
                    </p>
                  </div>
                </div>

                {/* WhatsApp */}
                <div 
                  ref={addToContactItems}
                  className="flex items-start gap-4"
                  style={{ transform: "translateX(-20px)" }}
                >
                  <div className="p-3 rounded-xl shrink-0" style={{ backgroundColor: `${BRAND_COLORS.deepRed}15` }}>
                    <HiChat className="w-5 h-5" style={{ color: BRAND_COLORS.deepRed }} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-base mb-2" style={{ color: BRAND_COLORS.darkNavy }}>WhatsApp</h4>
                    <p className="text-gray-700 text-sm">
                      <span style={{ color: BRAND_COLORS.deepRed }}>•</span> <a href="https://wa.me/923224700200" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-[#B11217] transition-colors">03224700200</a>
                    </p>
                  </div>
                </div>
              </div>

              {/* Note */}
              <div className="pt-4 mt-6 border-t border-gray-200">
                <p className="text-gray-700 text-sm leading-relaxed">
                  Feel free to contact us for any queries regarding our training programs, 
                  admissions, or partnership opportunities.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div 
            ref={rightColumnRef} 
            className="lg:w-3/5"
            style={{ transform: "translateX(30px)" }}
          >
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/30 shadow-xl">

              {/* Success Message */}
              {isSubmitted && (
                <div className="mb-6 p-4 rounded-lg text-center" 
                  style={{ 
                    backgroundColor: `${BRAND_COLORS.deepRed}15`,
                    border: `1px solid ${BRAND_COLORS.deepRed}40`,
                    color: BRAND_COLORS.deepRed 
                  }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">Thank you! Your message has been sent successfully.</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Name & Email */}
                <div 
                  ref={addToFormGroups}
                  className="grid grid-cols-1 md:grid-cols-2 gap-5"
                  style={{ transform: "translateY(20px)" }}
                >
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label htmlFor="name" className="block text-sm font-medium" style={{ color: BRAND_COLORS.darkNavy }}>
                      Your Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      className={`w-full px-4 py-2.5 text-sm rounded-lg border bg-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                        errors.name 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                          : 'border-gray-300 focus:border-[#B11217] focus:ring-[#B112174D]'
                      }`}
                    />
                    {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="block text-sm font-medium" style={{ color: BRAND_COLORS.darkNavy }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className={`w-full px-4 py-2.5 text-sm rounded-lg border bg-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                        errors.email 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                          : 'border-gray-300 focus:border-[#B11217] focus:ring-[#B112174D]'
                      }`}
                    />
                    {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
                  </div>
                </div>

                {/* Subject */}
                <div 
                  ref={addToFormGroups}
                  className="space-y-1.5"
                  style={{ transform: "translateY(20px)" }}
                >
                  <label htmlFor="subject" className="block text-sm font-medium" style={{ color: BRAND_COLORS.darkNavy }}>
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What is this regarding?"
                    className={`w-full px-4 py-2.5 text-sm rounded-lg border bg-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                      errors.subject 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-300 focus:border-[#B11217] focus:ring-[#B112174D]'
                    }`}
                  />
                  {errors.subject && <p className="text-xs text-red-600">{errors.subject}</p>}
                </div>

                {/* Message */}
                <div 
                  ref={addToFormGroups}
                  className="space-y-1.5"
                  style={{ transform: "translateY(20px)" }}
                >
                  <label htmlFor="message" className="block text-sm font-medium" style={{ color: BRAND_COLORS.darkNavy }}>
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Write your message here..."
                    rows={4}
                    className="w-full px-4 py-2.5 text-sm rounded-lg border bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-[#B11217] transition-all duration-200 resize-none"
                  />
                </div>

                {/* Submit Button */}
                <div 
                  ref={buttonRef}
                  className="pt-2"
                  style={{ transform: "scale(0.9)" }}
                >
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-8 py-3 font-semibold text-sm rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed hover:bg-[#9D0E14] focus:ring-[#B112174D] inline-flex items-center justify-center"
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