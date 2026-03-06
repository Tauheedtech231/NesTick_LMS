"use client";

import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  HiPhone, 
  HiMail, 
  HiClock,
  HiChat,
  HiLocationMarker,
  HiOutlineChevronDown
} from "react-icons/hi";
import { FaLocationArrow} from "react-icons/fa6";


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
  
  // State for hover cards
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [displayEmail, setDisplayEmail] = useState("");
  const [displayPhone, setDisplayPhone] = useState("");
  const [displayHours, setDisplayHours] = useState("");

  // Refs for animations
  const sectionRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const heroButtonRef = useRef<HTMLDivElement>(null);
  const mapSectionRef = useRef<HTMLDivElement>(null);
  const leftColumnRef = useRef<HTMLDivElement>(null);
  const rightColumnRef = useRef<HTMLDivElement>(null);
  const contactItemsRef = useRef<HTMLDivElement[]>([]);
  const formGroupsRef = useRef<HTMLDivElement[]>([]);
  const buttonRef = useRef<HTMLDivElement>(null);
  const emailCardRef = useRef<HTMLDivElement>(null);
  const phoneCardRef = useRef<HTMLDivElement>(null);
  const hoursCardRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  
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
    const ctx = gsap.context(() => {
      // Initial setup
      gsap.set([headingRef.current, descriptionRef.current, heroButtonRef.current], { 
        opacity: 0,
        y: 30,
        willChange: "transform, opacity"
      });
      
      gsap.set(mapSectionRef.current, {
        opacity: 0,
        y: 40,
        willChange: "transform, opacity"
      });
      
      gsap.set([leftColumnRef.current, rightColumnRef.current], { 
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

      // Hero Section Timeline
      const heroTl = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        }
      });

      heroTl.to(headingRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out"
      })
      .to(descriptionRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out"
      }, "-=0.6")
      .to(heroButtonRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: "back.out(1.2)"
      }, "-=0.4");

      // Scroll Indicator Animation
      if (scrollIndicatorRef.current) {
        gsap.to(scrollIndicatorRef.current, {
          y: 10,
          opacity: 0.6,
          duration: 1.5,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut"
        });
      }

      // Map Section Animation
      gsap.to(mapSectionRef.current, {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: mapSectionRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
        }
      });

      // Main Contact Section Timeline
      const contactTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse",
        }
      });

      contactTl.to([leftColumnRef.current, rightColumnRef.current], {
        y: 0,
        opacity: 1,
        duration: 0.9,
        stagger: 0.15,
        ease: "power2.out"
      }, 0.2);

      if (contactItemsRef.current.length) {
        contactTl.to(contactItemsRef.current, {
          x: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.08,
          ease: "power2.out"
        }, 0.4);
      }

      if (formGroupsRef.current.length) {
        contactTl.to(formGroupsRef.current, {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.07,
          ease: "power2.out"
        }, 0.5);
      }

      contactTl.to(buttonRef.current, {
        scale: 1,
        opacity: 1,
        duration: 0.5,
        ease: "back.out(1.2)"
      }, 0.7);

    }, sectionRef);

    return () => {
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
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log("Form submitted:", formData);
        setIsSubmitted(true);
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
        
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

  const scrollToMap = () => {
    mapSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* Hero Section with Video Background */}
      <section 
        ref={heroRef}
        className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden"
      >
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/contact.mp4" type="video/mp4" />
          </video>
          {/* Gradient Overlay */}
         
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 
            ref={headingRef}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white drop-shadow-lg"
          >
            Get in Touch
          </h1>
          <p 
            ref={descriptionRef}
            className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto"
          >
            Have questions about our training programs? We&apos;re here to help you start your journey in technical education.
          </p>
          <div ref={heroButtonRef}>
            <button
              onClick={scrollToMap}
              className="px-8 py-4 bg-[#1E3A8A] hover:bg-[#B11217] text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl text-base md:text-lg"
            >
              Find Us on Map
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div 
          ref={scrollIndicatorRef}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white cursor-pointer"
          onClick={scrollToMap}
        >
          <HiOutlineChevronDown className="w-6 h-6 animate-bounce" />
        </div>
      </section>

      {/* Google Map Section */}
      <section 
        ref={mapSectionRef}
        className="py-16 px-4 bg-[#F4F6F8]"
      >
        <div className="max-w-6xl mx-auto">
          <div className="rounded-2xl overflow-hidden shadow-2xl h-[400px] md:h-[450px] relative">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d217775.8781844442!2d74.25409443359372!3d31.482634399999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39190483e58107d9%3A0xc23abe6ccc7e2462!2sLahore%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0"
              title="Google Map Location"
            />
          </div>
        </div>
      </section>

      {/* Main Contact Section */}
      <section 
        ref={sectionRef}
        className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white"
      >
        <div className="max-w-6xl mx-auto relative z-10">
          {/* Three Hover Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Email Card */}
            <div
              ref={emailCardRef}
              onMouseEnter={() => setHoveredCard('email')}
              onMouseLeave={() => setHoveredCard(null)}
              className="bg-white rounded-xl p-6 border border-[#E5E7EB] shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-[#1E3A8A]/10">
                  <HiMail className="w-6 h-6" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[#0B1C3D]">Email Us</h3>
                  <div className="min-h-[28px]">
                    {hoveredCard === 'email' ? (
                      <p className="text-base font-mono text-[#B11217]">{displayEmail}</p>
                    ) : (
                      <p className="text-sm text-gray-500">Hover to reveal</p>
                    )}
                  </div>
                </div>
                <FaLocationArrow className="w-5 h-5 text-[#1E3A8A] opacity-50" />
              </div>
            </div>

            {/* Phone Card */}
            <div
              ref={phoneCardRef}
              onMouseEnter={() => setHoveredCard('phone')}
              onMouseLeave={() => setHoveredCard(null)}
              className="bg-white rounded-xl p-6 border border-[#E5E7EB] shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-[#1E3A8A]/10">
                  <HiPhone className="w-6 h-6" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[#0B1C3D]">Call Us</h3>
                  <div className="min-h-[28px]">
                    {hoveredCard === 'phone' ? (
                      <p className="text-base font-mono text-[#B11217]">{displayPhone}</p>
                    ) : (
                      <p className="text-sm text-gray-500">Hover to reveal</p>
                    )}
                  </div>
                </div>
                <FaLocationArrow className="w-5 h-5 text-[#1E3A8A] opacity-50" />
              </div>
            </div>

            {/* Hours Card */}
            <div
              ref={hoursCardRef}
              onMouseEnter={() => setHoveredCard('hours')}
              onMouseLeave={() => setHoveredCard(null)}
              className="bg-white rounded-xl p-6 border border-[#E5E7EB] shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-[#1E3A8A]/10">
                  <HiClock className="w-6 h-6" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[#0B1C3D]">Office Hours</h3>
                  <div className="min-h-[28px]">
                    {hoveredCard === 'hours' ? (
                      <p className="text-base font-mono text-[#B11217]">{displayHours}</p>
                    ) : (
                      <p className="text-sm text-gray-500">Hover to reveal</p>
                    )}
                  </div>
                </div>
                <FaLocationArrow className="w-5 h-5 text-[#1E3A8A] opacity-50" />
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Left Column - Contact Information */}
           <div ref={leftColumnRef} className="lg:w-2/5">
  <div className="bg-white rounded-2xl p-6 md:p-8 h-full border border-[#E5E7EB] shadow-xl hover:shadow-2xl transition-shadow duration-300">
    
    <h3 className="text-xl md:text-2xl font-bold mb-6 text-[#1E3A8A]">
      Contact Information
    </h3>

    {/* Address */}
    <div ref={addToContactItems} className="flex items-start gap-4 mb-6">
      <div className="p-3 rounded-xl shrink-0 bg-[#1E3A8A]/10">
        <HiLocationMarker className="w-5 h-5 text-[#B11217]" />
      </div>
      <div>
        <h4 className="font-semibold text-base mb-2 text-[#0B1C3D]">Office Address</h4>
        <p className="text-gray-600 text-sm leading-relaxed">
          123 Business Avenue, Main Boulevard<br />
          Lahore, Punjab 54000<br />
          Pakistan
        </p>
      </div>
    </div>

    {/* Phone Numbers */}
    <div ref={addToContactItems} className="flex items-start gap-4 mb-6">
      <div className="p-3 rounded-xl shrink-0 bg-[#1E3A8A]/10">
        <HiPhone className="w-5 h-5 text-[#B11217]" />
      </div>
      <div>
        <h4 className="font-semibold text-base mb-2 text-[#0B1C3D]">Phone Numbers</h4>
        <ul className="text-gray-600 text-sm space-y-1.5">
          <li><span className="text-[#1E3A8A] font-medium">General:</span> <a href="tel:03224700200" className="hover:text-[#B11217] transition-colors">0322-4700200</a></li>
          <li><span className="text-[#1E3A8A] font-medium">Lahore:</span> <a href="tel:03104700200" className="hover:text-[#B11217] transition-colors">0310-4700200</a></li>
          <li><span className="text-[#1E3A8A] font-medium">Sheikhupura:</span> <a href="tel:03054700202" className="hover:text-[#B11217] transition-colors">0305-4700202</a></li>
          <li><span className="text-[#1E3A8A] font-medium">Rawalpindi:</span> <a href="tel:03204700607" className="hover:text-[#B11217] transition-colors">0320-4700607</a></li>
        </ul>
      </div>
    </div>

    {/* Email */}
    <div ref={addToContactItems} className="flex items-start gap-4 mb-6">
      <div className="p-3 rounded-xl shrink-0 bg-[#1E3A8A]/10">
        <HiMail className="w-5 h-5 text-[#B11217]" />
      </div>
      <div>
        <h4 className="font-semibold text-base mb-2 text-[#0B1C3D]">Email</h4>
        <p className="text-gray-600 text-sm">
          <a href="mailto:info@mansolhab.com" className="hover:text-[#B11217] transition-colors">
            info@mansolhab.com
          </a>
        </p>
      </div>
    </div>

    {/* Office Hours */}
    <div ref={addToContactItems} className="flex items-start gap-4 mb-6">
      <div className="p-3 rounded-xl shrink-0 bg-[#1E3A8A]/10">
        <HiClock className="w-5 h-5 text-[#B11217]" />
      </div>
      <div>
        <h4 className="font-semibold text-base mb-2 text-[#0B1C3D]">Office Hours</h4>
        <p className="text-gray-600 text-sm">Monday - Saturday: 9:00 AM - 5:00 PM</p>
        <p className="text-gray-600 text-sm">Sunday: Closed</p>
      </div>
    </div>

    {/* WhatsApp */}
    <div ref={addToContactItems} className="flex items-start gap-4 mb-6">
      <div className="p-3 rounded-xl shrink-0 bg-[#1E3A8A]/10">
        <HiChat className="w-5 h-5 text-[#B11217]" />
      </div>
      <div>
        <h4 className="font-semibold text-base mb-2 text-[#0B1C3D]">WhatsApp</h4>
        <p className="text-gray-600 text-sm">
          <a href="https://wa.me/923224700200" target="_blank" rel="noopener noreferrer" className="hover:text-[#B11217] transition-colors">
            +92 322 4700200
          </a>
        </p>
      </div>
    </div>

  </div>
</div>

            {/* Right Column - Contact Form */}
            <div 
              ref={rightColumnRef} 
              className="lg:w-3/5"
            >
              <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#E5E7EB] shadow-xl hover:shadow-2xl transition-shadow duration-300">

                {/* Success Message */}
                {isSubmitted && (
                  <div className="mb-6 p-4 rounded-lg text-center bg-green-50 border border-green-200">
                    <div className="flex items-center justify-center gap-2 text-green-700">
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
                  >
                    {/* Name */}
                    <div className="space-y-1.5">
                      <label htmlFor="name" className="block text-sm font-medium text-[#0B1C3D]">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your name"
                        className={`w-full px-4 py-3 text-sm rounded-lg border bg-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                          errors.name 
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                            : 'border-[#E5E7EB] focus:border-[#1E3A8A] focus:ring-[#1E3A8A]/20'
                        }`}
                      />
                      {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label htmlFor="email" className="block text-sm font-medium text-[#0B1C3D]">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        className={`w-full px-4 py-3 text-sm rounded-lg border bg-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                          errors.email 
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                            : 'border-[#E5E7EB] focus:border-[#1E3A8A] focus:ring-[#1E3A8A]/20'
                        }`}
                      />
                      {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
                    </div>
                  </div>

                  {/* Subject */}
                  <div 
                    ref={addToFormGroups}
                    className="space-y-1.5"
                  >
                    <label htmlFor="subject" className="block text-sm font-medium text-[#0B1C3D]">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="What is this regarding?"
                      className={`w-full px-4 py-3 text-sm rounded-lg border bg-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                        errors.subject 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                          : 'border-[#E5E7EB] focus:border-[#1E3A8A] focus:ring-[#1E3A8A]/20'
                      }`}
                    />
                    {errors.subject && <p className="text-xs text-red-600">{errors.subject}</p>}
                  </div>

                  {/* Message */}
                  <div 
                    ref={addToFormGroups}
                    className="space-y-1.5"
                  >
                    <label htmlFor="message" className="block text-sm font-medium text-[#0B1C3D]">
                      Your Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Write your message here..."
                      rows={5}
                      className="w-full px-4 py-3 text-sm rounded-lg border border-[#E5E7EB] bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-[#1E3A8A] focus:ring-[#1E3A8A]/20 transition-all duration-200 resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div 
                    ref={buttonRef}
                    className="pt-2"
                  >
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full px-8 py-4 bg-[#B11217] text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/50 disabled:opacity-70 disabled:cursor-not-allowed inline-flex items-center justify-center text-base"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
    </>
  );
}