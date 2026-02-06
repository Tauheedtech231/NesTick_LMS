"use client";
import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const coursesData = [
  {
    name: "BOSH",
    description:
      "BOSH (Building Operating System Hardware) is an open-source tool developed by VMware that helps deploy, manage, and maintain large-scale distributed software systems in a consistent and automated way. It handles tasks like provisioning virtual machines, deploying software, monitoring health, and applying updates with minimal downtime. BOSH is often used with cloud platforms such as AWS, Google Cloud, or OpenStack and is widely recognized for its reliability and reproducibility in managing complex environments like Cloud Foundry. Its main strength lies in enabling developers and operators to manage the entire lifecycle of applications and infrastructure from a single, unified system."
  },
  {
    name: "Fire Safety",
    description:
      "Fire Safety refers to the set of practices and precautions designed to prevent fires, reduce their impact, and ensure the safety of people and property in case a fire occurs. It includes measures such as proper installation of fire alarms, extinguishers, and sprinkler systems, maintaining clear emergency exits, and conducting regular fire drills to prepare occupants for evacuation. Fire safety also involves awareness and training on how to handle flammable materials, electrical equipment, and emergency response procedures. By implementing effective fire safety protocols, the risk of injury, loss of life, and property damage can be significantly minimized.",
  },
  {
    name: "OSHA",
    description:
     "OSHA (Occupational Safety and Health Administration) is a U.S. government agency under the Department of Labor that was established in 1970 to ensure safe and healthy working conditions for employees. OSHA sets and enforces workplace safety standards, provides training, outreach, and education, and conducts inspections to ensure compliance. Its mission is to prevent work-related injuries, illnesses, and deaths by promoting safe practices across all industries. Through regulations, employee rights, and employer responsibilities, OSHA plays a vital role in creating safer workplaces and fostering a culture of occupational health and safety."
  },
  {
    name: "Hole Watcher",
    description:
     "Hole Watcher is a safety role in industrial or construction environments, responsible for monitoring workers who enter confined spaces such as tanks, vessels, or pits. The hole watcher ensures that proper entry procedures are followed, maintains constant communication with workers inside, and watches for any signs of danger like gas leaks, lack of oxygen, or equipment failure. They are trained to respond quickly in emergencies by alerting rescue teams and preventing others from entering unsafe areas. The hole watcher plays a crucial role in ensuring confined space safety and preventing accidents or fatalities during maintenance or construction operations."
  },
  {
    name: "Permit to Work System",
    description:
      "Permit to Work (PTW) System is a formal safety procedure used in workplaces to control high-risk activities and ensure that they are carried out safely. It involves issuing a written or digital permit before starting specific tasks such as hot work, electrical maintenance, confined space entry, or work at height. The permit specifies the work to be done, potential hazards, necessary precautions, and authorization from responsible personnel. By clearly defining responsibilities and safety measures, the PTW system helps prevent accidents, ensures coordination between teams, and maintains a controlled working environment where risks are properly managed and minimized."
  },
];

export default function CoursesTab() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Clear existing animations
      const elements = [
        headingRef.current,
        cardRef.current,
        tabsRef.current,
        contentRef.current
      ].filter(Boolean);
      
      if (elements.length > 0) {
        gsap.set(elements, { clearProps: "all" });
      }

      // Heading animation - from left
      if (headingRef.current) {
        gsap.fromTo(headingRef.current,
          {
            x: -80,
            opacity: 0
          },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: headingRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            }
          }
        );
      }

      // Card animation - from left
      if (cardRef.current) {
        gsap.fromTo(cardRef.current,
          {
            x: -50,
            opacity: 0
          },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            delay: 0.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: cardRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            }
          }
        );
      }

      // Tabs animation - staggered
      if (tabsRef.current) {
        const tabs = tabsRef.current.querySelectorAll('button');
        gsap.fromTo(tabs,
          {
            y: 20,
            opacity: 0
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.08,
            ease: "power2.out",
            delay: 0.3,
            scrollTrigger: {
              trigger: tabsRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            }
          }
        );
      }

      // Content animation
      if (contentRef.current) {
        gsap.fromTo(contentRef.current,
          {
            opacity: 0
          },
          {
            opacity: 1,
            duration: 0.6,
            delay: 0.4,
            ease: "power2.out",
            scrollTrigger: {
              trigger: contentRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            }
          }
        );
      }

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Content change animation
  useEffect(() => {
    if (contentRef.current) {
      // Animate out
      gsap.to(contentRef.current, {
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          // Animate in
          gsap.to(contentRef.current, {
            opacity: 1,
            duration: 0.4,
            ease: "power2.out"
          });
        }
      });
    }
  }, [activeIndex]);

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h2 
        ref={headingRef}
        className="text-3xl md:text-4xl font-bold text-center mb-8"
      >
        About Courses
      </h2>

      {/* Tabs */}
      <div 
        ref={cardRef}
        className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
      >
        <div 
          ref={tabsRef}
          className="flex flex-wrap justify-start gap-6 border-b border-gray-200 mb-6"
        >
          {coursesData.map((course, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`text-sm md:text-base font-semibold pb-2 transition-all ${
                activeIndex === index
                  ? "text-red-700 border-b-2 border-red-700"
                  : "text-gray-600 hover:text-red-700"
              }`}
            >
              {course.name}
            </button>
          ))}
        </div>

        {/* Description */}
        <div 
          ref={contentRef}
          className="text-gray-700 text-sm md:text-base leading-relaxed"
        >
          {coursesData[activeIndex].description}
        </div>
      </div>
    </div>
  );
}