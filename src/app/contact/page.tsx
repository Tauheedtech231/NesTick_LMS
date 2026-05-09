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
import { FaLocationArrow } from "react-icons/fa6";
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
  cards: Card[];
  info: InfoItem[];
}

interface Card {
  id: string;
  card_type: 'email' | 'phone' | 'hours';
  title: string;
  value: string;
  icon_name: string;
}

interface InfoItem {
  id: string;
  info_type: 'address' | 'phone' | 'email' | 'hours' | 'whatsapp';
  title: string;
  value: string;
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

  // Fetch data from API
  useEffect(() => {
    const fetchContactData = async () => {
      try {
        const response = await fetch('/api/management/contact');
        const data = await response.json();
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

  // Get card values for typing animation
  const getCardValue = (type: string) => {
    if (!contactData) return '';
    const card = contactData.cards.find(c => c.card_type === type);
    return card?.value || '';
  };

  // Typing animation effects
  useEffect(() => {
    if (hoveredCard === 'email') {
      const emailText = getCardValue('email');
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
  }, [hoveredCard, contactData]);

  useEffect(() => {
    if (hoveredCard === 'phone') {
      const phoneText = getCardValue('phone');
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
  }, [hoveredCard, contactData]);

  useEffect(() => {
    if (hoveredCard === 'hours') {
      const hoursText = getCardValue('hours');
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
  }, [hoveredCard, contactData]);

  // GSAP Animations
  useEffect(() => {
    if (isLoading || !contactData) return;

    const ctx = gsap.context(() => {
      gsap.set([headingRef.current, descriptionRef.current, heroButtonRef.current], { 
        opacity: 0, y: 30
      });
      gsap.set(mapSectionRef.current, { opacity: 0, y: 40 });
      gsap.set([leftColumnRef.current, rightColumnRef.current], { opacity: 0, y: 30 });
      gsap.set(contactItemsRef.current, { opacity: 0, x: -20 });
      gsap.set(formGroupsRef.current, { opacity: 0, y: 20 });
      gsap.set(buttonRef.current, { opacity: 0, scale: 0.9 });

      const heroTl = gsap.timeline({
        scrollTrigger: { trigger: heroRef.current, start: "top 80%", toggleActions: "play none none reverse" }
      });
      heroTl.to(headingRef.current, { y: 0, opacity: 1, duration: 0.8 })
        .to(descriptionRef.current, { y: 0, opacity: 1, duration: 0.8 }, "-=0.6")
        .to(heroButtonRef.current, { y: 0, opacity: 1, duration: 0.6 }, "-=0.4");

      if (scrollIndicatorRef.current) {
        gsap.to(scrollIndicatorRef.current, { y: 10, opacity: 0.6, duration: 1.5, repeat: -1, yoyo: true });
      }

      gsap.to(mapSectionRef.current, {
        y: 0, opacity: 1, duration: 1,
        scrollTrigger: { trigger: mapSectionRef.current, start: "top 85%", toggleActions: "play none none reverse" }
      });

      const contactTl = gsap.timeline({
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%", toggleActions: "play none none reverse" }
      });
      contactTl.to([leftColumnRef.current, rightColumnRef.current], { y: 0, opacity: 1, duration: 0.9, stagger: 0.15 }, 0.2);
      if (contactItemsRef.current.length) {
        contactTl.to(contactItemsRef.current, { x: 0, opacity: 1, duration: 0.5, stagger: 0.08 }, 0.4);
      }
      if (formGroupsRef.current.length) {
        contactTl.to(formGroupsRef.current, { y: 0, opacity: 1, duration: 0.5, stagger: 0.07 }, 0.5);
      }
      contactTl.to(buttonRef.current, { scale: 1, opacity: 1, duration: 0.5 }, 0.7);
    }, sectionRef);

    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill());
      ctx.revert();
    };
  }, [isLoading, contactData]);

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

  const scrollToMap = () => {
    mapSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Helper to render info value with line breaks
  const renderInfoValue = (value: string) => {
    return value.split('\n').map((line, i) => (
      <p key={i} className="text-gray-600 text-sm">{line}</p>
    ));
  };

  // Loading state with Shimmer
  if (isLoading) {
    return (
      <>
        {/* Hero Shimmer */}
        <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden bg-gray-900">
          <Shimmer />
          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            <div className="h-16 w-64 bg-gray-700 rounded-lg mx-auto mb-4 animate-pulse" />
            <div className="h-6 w-96 bg-gray-700 rounded-lg mx-auto mb-8 animate-pulse" />
            <div className="h-12 w-48 bg-gray-700 rounded-lg mx-auto animate-pulse" />
          </div>
        </section>

        {/* Map Shimmer */}
        <section className="py-16 px-4 bg-[#F4F6F8]">
          <div className="max-w-6xl mx-auto">
            <div className="rounded-2xl overflow-hidden h-[400px] md:h-[450px] bg-gray-200 animate-pulse" />
          </div>
        </section>

        {/* Contact Section Shimmer */}
        <section className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 h-32 animate-pulse" />
              ))}
            </div>
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
              <div className="lg:w-2/5">
                <div className="bg-white rounded-2xl p-6 md:p-8 h-96 animate-pulse" />
              </div>
              <div className="lg:w-3/5">
                <div className="bg-white rounded-2xl p-6 md:p-8 h-96 animate-pulse" />
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  if (!contactData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">No contact data available</p>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section with Image Background */}
      <section 
        ref={heroRef}
        className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden"
      >
        {/* Image Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src={contactData.hero_background_image || "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg"}
            alt="Contact Hero"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 ref={headingRef} className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white drop-shadow-lg">
            {contactData.hero_heading}
          </h1>
          <p ref={descriptionRef} className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            {contactData.hero_description}
          </p>
          <div ref={heroButtonRef}>
            <button
              onClick={scrollToMap}
              className="px-8 py-4 bg-[#1E3A8A] hover:bg-[#B11217] text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl text-base md:text-lg cursor-pointer"
            >
              {contactData.hero_button_text}
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
      <section ref={mapSectionRef} className="py-16 px-4 bg-[#F4F6F8]">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-2xl overflow-hidden shadow-2xl h-[400px] md:h-[450px] relative">
            <iframe
              src={contactData.map_embed_url}
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
      <section ref={sectionRef} className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto relative z-10">
          {/* Three Hover Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {contactData.cards.map((card) => (
              <div
                key={card.id}
                onMouseEnter={() => setHoveredCard(card.card_type)}
                onMouseLeave={() => setHoveredCard(null)}
                className="bg-white rounded-xl p-6 border border-[#E5E7EB] shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-[#1E3A8A]/10">
                    {card.card_type === 'email' && <HiMail className="w-6 h-6" style={{ color: BRAND_COLORS.darkRoyalBlue }} />}
                    {card.card_type === 'phone' && <HiPhone className="w-6 h-6" style={{ color: BRAND_COLORS.darkRoyalBlue }} />}
                    {card.card_type === 'hours' && <HiClock className="w-6 h-6" style={{ color: BRAND_COLORS.darkRoyalBlue }} />}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#0B1C3D]">{card.title}</h3>
                    <div className="min-h-[28px]">
                      {hoveredCard === card.card_type ? (
                        <p className="text-base font-mono text-[#B11217]">
                          {card.card_type === 'email' && displayEmail}
                          {card.card_type === 'phone' && displayPhone}
                          {card.card_type === 'hours' && displayHours}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500">Hover to reveal</p>
                      )}
                    </div>
                  </div>
                  <FaLocationArrow className="w-5 h-5 text-[#1E3A8A] opacity-50" />
                </div>
              </div>
            ))}
          </div>

          {/* Two Column Layout */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Left Column - Contact Information */}
            <div ref={leftColumnRef} className="lg:w-2/5">
              <div className="bg-white rounded-2xl p-6 md:p-8 h-full border border-[#E5E7EB] shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <h3 className="text-xl md:text-2xl font-bold mb-6 text-[#1E3A8A]">Contact Information</h3>

                {contactData.info.map((item, idx) => (
                  <div 
                    key={item.id} 
                    ref={(el) => { if (el) contactItemsRef.current[idx] = el; }}
                    className="flex items-start gap-4 mb-6"
                  >
                    <div className="p-3 rounded-xl shrink-0 bg-[#1E3A8A]/10">
                      {item.info_type === 'address' && <HiLocationMarker className="w-5 h-5 text-[#B11217]" />}
                      {item.info_type === 'phone' && <HiPhone className="w-5 h-5 text-[#B11217]" />}
                      {item.info_type === 'email' && <HiMail className="w-5 h-5 text-[#B11217]" />}
                      {item.info_type === 'hours' && <HiClock className="w-5 h-5 text-[#B11217]" />}
                      {item.info_type === 'whatsapp' && <HiChat className="w-5 h-5 text-[#B11217]" />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-base mb-2 text-[#0B1C3D]">{item.title}</h4>
                      {renderInfoValue(item.value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Contact Form */}
            <div ref={rightColumnRef} className="lg:w-3/5">
              <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#E5E7EB] shadow-xl hover:shadow-2xl transition-shadow duration-300">
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
                  <div ref={(el) => { if (el) formGroupsRef.current[0] = el; }} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label htmlFor="name" className="block text-sm font-medium text-[#0B1C3D]">Your Name *</label>
                      <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your name" className={`w-full px-4 py-3 text-sm rounded-lg border bg-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-[#E5E7EB] focus:border-[#1E3A8A] focus:ring-[#1E3A8A]/20'}`} />
                      {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="email" className="block text-sm font-medium text-[#0B1C3D]">Email Address *</label>
                      <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" className={`w-full px-4 py-3 text-sm rounded-lg border bg-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-[#E5E7EB] focus:border-[#1E3A8A] focus:ring-[#1E3A8A]/20'}`} />
                      {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
                    </div>
                  </div>

                  <div ref={(el) => { if (el) formGroupsRef.current[1] = el; }} className="space-y-1.5">
                    <label htmlFor="subject" className="block text-sm font-medium text-[#0B1C3D]">Subject *</label>
                    <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} placeholder="What is this regarding?" className={`w-full px-4 py-3 text-sm rounded-lg border bg-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${errors.subject ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-[#E5E7EB] focus:border-[#1E3A8A] focus:ring-[#1E3A8A]/20'}`} />
                    {errors.subject && <p className="text-xs text-red-600">{errors.subject}</p>}
                  </div>

                  <div ref={(el) => { if (el) formGroupsRef.current[2] = el; }} className="space-y-1.5">
                    <label htmlFor="message" className="block text-sm font-medium text-[#0B1C3D]">Your Message</label>
                    <textarea id="message" name="message" value={formData.message} onChange={handleChange} placeholder="Write your message here..." rows={5} className="w-full px-4 py-3 text-sm rounded-lg border border-[#E5E7EB] bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-[#1E3A8A] focus:ring-[#1E3A8A]/20 transition-all duration-200 resize-none" />
                  </div>

                  <div ref={buttonRef} className="pt-2">
                    <button type="submit" disabled={isSubmitting} className="w-full px-8 py-4 bg-[#B11217] text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/50 disabled:opacity-70 disabled:cursor-not-allowed inline-flex items-center justify-center text-base cursor-pointer">
                      {isSubmitting ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Sending...</span>
                        </div>
                      ) : 'Send Message'}
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