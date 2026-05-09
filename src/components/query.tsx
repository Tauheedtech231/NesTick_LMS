'use client';

import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  HiPhone, 
  HiMail, 
  HiClock,
  HiChat
} from "react-icons/hi";
import Image from "next/image";

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

// Types
interface ContactData {
  id: string;
  hero_heading: string;
  hero_description: string;
  hero_button_text: string;
  hero_background_image: string;
  map_embed_url: string;
  cards: Array<{
    id: string;
    card_type: string;
    title: string;
    value: string;
    icon_name: string;
  }>;
  info: Array<{
    id: string;
    info_type: string;
    title: string;
    value: string;
    url: string | null;
  }>;
}

// Shimmer Component
const Shimmer = () => {
  return (
    <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse" />
  );
};

export default function ContactForm() {
  const [contactData, setContactData] = useState<ContactData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs for animations
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const leftColumnRef = useRef<HTMLDivElement>(null);
  const rightColumnRef = useRef<HTMLDivElement>(null);
  const contactItemsRef = useRef<HTMLDivElement[]>([]);
  const formGroupsRef = useRef<HTMLDivElement[]>([]);
  const buttonRef = useRef<HTMLDivElement>(null);

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

  // Fetch contact data from API
  useEffect(() => {
    const fetchContactData = async () => {
      console.log('🔄 Fetching contact data...');
      try {
        const response = await fetch('/api/management/contact');
        const data = await response.json();
        console.log('Contact API response:', data);
        
        if (data.success && data.data) {
          setContactData(data.data);
        }
      } catch (error) {
        console.error('Error fetching contact data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchContactData();
  }, []);

  // GSAP Animations
  useEffect(() => {
    if (isLoading) return;

    const ctx = gsap.context(() => {
      gsap.set([headingRef.current, descriptionRef.current, leftColumnRef.current, rightColumnRef.current], { 
        opacity: 0, y: 30
      });
      
      gsap.set(contactItemsRef.current, { opacity: 0, x: -20 });
      gsap.set(formGroupsRef.current, { opacity: 0, y: 20 });
      gsap.set(buttonRef.current, { opacity: 0, scale: 0.9 });

      const masterTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        }
      });

      masterTl.to(sectionRef.current, { opacity: 1, duration: 0.6, ease: "power2.out" }, 0);
      masterTl.to(headingRef.current, { x: 0, y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, 0.1);
      masterTl.to(descriptionRef.current, { x: 0, y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, 0.15);
      masterTl.to(leftColumnRef.current, { x: 0, y: 0, opacity: 1, duration: 0.9, ease: "power2.out" }, 0.2);
      masterTl.to(rightColumnRef.current, { x: 0, y: 0, opacity: 1, duration: 0.9, ease: "power2.out" }, 0.25);

      if (contactItemsRef.current.length) {
        masterTl.to(contactItemsRef.current, { x: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: "power2.out" }, 0.3);
      }

      if (formGroupsRef.current.length) {
        masterTl.to(formGroupsRef.current, { y: 0, opacity: 1, duration: 0.5, stagger: 0.07, ease: "power2.out" }, 0.4);
      }

      masterTl.to(buttonRef.current, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.2)" }, 0.6);

    }, sectionRef);

    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill());
      ctx.revert();
    };
  }, [isLoading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email address is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Please enter a valid email address";
    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log("Form submitted:", formData);
        setIsSubmitted(true);
        setFormData({ name: "", email: "", subject: "", message: "" });
        setTimeout(() => setIsSubmitted(false), 5000);
      } catch (error) {
        console.error("Submission error:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Helper to render info value with line breaks
  const renderInfoValue = (value: string) => {
    return value.split('\n').map((line, i) => (
      <p key={i} className="text-gray-700 text-sm">{line}</p>
    ));
  };

  // Get icon based on info type
  const getIcon = (infoType: string) => {
    switch (infoType) {
      case 'phone':
        return <HiPhone className="w-5 h-5" style={{ color: BRAND_COLORS.deepRed }} />;
      case 'email':
        return <HiMail className="w-5 h-5" style={{ color: BRAND_COLORS.deepRed }} />;
      case 'whatsapp':
        return <HiChat className="w-5 h-5" style={{ color: BRAND_COLORS.deepRed }} />;
      case 'hours':
        return <HiClock className="w-5 h-5" style={{ color: BRAND_COLORS.deepRed }} />;
      default:
        return <HiPhone className="w-5 h-5" style={{ color: BRAND_COLORS.deepRed }} />;
    }
  };

  // Loading state with Shimmer
  if (isLoading) {
    return (
      <section className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-[600px]">
        <Shimmer />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <div className="h-10 w-48 bg-gray-200 rounded-lg mx-auto animate-pulse mb-4" />
            <div className="h-6 w-96 bg-gray-200 rounded-lg mx-auto animate-pulse" />
          </div>
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            <div className="lg:w-2/5">
              <div className="bg-white/95 rounded-2xl p-6 md:p-8 h-96 animate-pulse" />
            </div>
            <div className="lg:w-3/5">
              <div className="bg-white/95 rounded-2xl p-6 md:p-8 h-96 animate-pulse" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      ref={sectionRef}
      className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden opacity-0"
      style={{ willChange: "transform, opacity" }}
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src={contactData?.hero_background_image || "https://images.pexels.com/photos/33925031/pexels-photo-33925031.jpeg"}
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
        <div className="text-center mb-12">
          <h2 
            ref={headingRef}
            className="text-3xl md:text-4xl font-bold mb-4 text-white drop-shadow-lg"
            style={{ transform: "translateX(-30px)" }}
          >
            {contactData?.hero_heading || "Get in Touch"}
          </h2>
          <p 
            ref={descriptionRef}
            className="text-base md:text-lg max-w-2xl mx-auto text-white/90 drop-shadow"
            style={{ transform: "translateX(30px)" }}
          >
            {contactData?.hero_description || "Have questions about our training programs? Contact our team for more information."}
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left Column - Contact Information */}
          <div 
            ref={leftColumnRef} 
            className="lg:w-2/5"
            style={{ transform: "translateX(-30px)" }}
          >
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 md:p-8 h-full border border-white/30 shadow-xl">
              <h3 className="text-xl md:text-2xl font-bold mb-6" style={{ color: BRAND_COLORS.deepRed }}>
                Contact Information
              </h3>

              {/* Contact Details from API */}
              <div className="space-y-6">
                {contactData?.info.map((item, idx) => (
                  <div 
                    key={item.id}
                    ref={addToContactItems}
                    className="flex items-start gap-4"
                    style={{ transform: "translateX(-20px)" }}
                  >
                    <div className="p-3 rounded-xl shrink-0" style={{ backgroundColor: `${BRAND_COLORS.deepRed}15` }}>
                      {getIcon(item.info_type)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-base mb-2" style={{ color: BRAND_COLORS.darkNavy }}>
                        {item.title}
                      </h4>
                      {item.url ? (
                        <p className="text-gray-700 text-sm">
                          <span style={{ color: BRAND_COLORS.deepRed }}>•</span>{' '}
                          <a 
                            href={item.url} 
                            target={item.info_type === 'hours' ? '_self' : '_blank'}
                            rel="noopener noreferrer" 
                            className="hover:underline hover:text-[#B11217] transition-colors"
                          >
                            {item.info_type === 'hours' ? renderInfoValue(item.value) : item.value}
                          </a>
                        </p>
                      ) : (
                        <div className="text-gray-700 text-sm">
                          <span style={{ color: BRAND_COLORS.deepRed }}>•</span>{' '}
                          {item.info_type === 'hours' ? renderInfoValue(item.value) : item.value}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
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
                    disabled={isSubmitting}
                    className="w-full px-8 py-3 font-semibold text-sm rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed inline-flex items-center justify-center cursor-pointer"
                    style={{ backgroundColor: '#B11217', color: '#FFFFFF' }}
                  >
                    {isSubmitting ? (
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