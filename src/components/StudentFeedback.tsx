'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function StudentFeedback() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Heading animation
      if (headingRef.current) {
        gsap.fromTo(headingRef.current,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: headingRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Cards stagger animation
      if (cardsRef.current) {
        gsap.fromTo(cardsRef.current.children,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.2,
            ease: 'back.out(1.2)',
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-12">
      <h3
        ref={headingRef}
        className="text-2xl md:text-3xl font-bold text-[#1E3A8A] text-center mb-10 relative inline-block w-full"
      >
        Student Feedback
        <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-[#B11217] rounded-full" />
      </h3>

      <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {/* Feedback Card 1 */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border-t-2 border-blue-200 hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="text-4xl mb-3">👩‍🎓</div>
          <p className="text-gray-700 text-sm italic">“The hands-on training gave me confidence to work on real projects. Truly life-changing!”</p>
          <p className="mt-4 font-bold text-[#1E3A8A] text-sm">— Priya K.</p>
        </div>

        {/* Feedback Card 2 */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border-t-2 border-blue-200 hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="text-4xl mb-3">👨‍🎓</div>
          <p className="text-gray-700 text-sm italic">“Instructors are industry experts who care about your growth. Best decision ever.”</p>
          <p className="mt-4 font-bold text-[#1E3A8A] text-sm">— Rahul M.</p>
        </div>

        {/* Feedback Card 3 */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border-t-2 border-blue-200 hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="text-4xl mb-3">👩‍💻</div>
          <p className="text-gray-700 text-sm italic">“The safety focus and ethics taught here set Mansol apart. Highly recommend!”</p>
          <p className="mt-4 font-bold text-[#1E3A8A] text-sm">— Anjali S.</p>
        </div>

        {/* Feedback Card 4 */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border-t-2 border-blue-200 hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="text-4xl mb-3">👨‍🏫</div>
          <p className="text-gray-700 text-sm italic">“Great environment and supportive mentors. I landed my dream job thanks to Mansol.”</p>
          <p className="mt-4 font-bold text-[#1E3A8A] text-sm">— Vikram S.</p>
        </div>
      </div>
    </section>
  );
}