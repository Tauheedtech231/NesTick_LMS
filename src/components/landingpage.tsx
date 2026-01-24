'use client'

import { useState } from 'react'
import HeroSlider from './herosection' 
import { 
  HiOutlineClock, 
  HiOutlineUsers,
  HiOutlineCheckCircle,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineMap,
  HiOutlineGlobe,
  HiOutlineChat,
  HiStar,
  HiOutlineCalendar
} from 'react-icons/hi'

export default function Home() {
  const [courses] = useState([
    {
      id: 1,
      title: "IOSH: Institution of Occupational Safety and Health",
      category: "IOSH – Institution of Occupational Safety & Health",
      instructor: "Masol Hab",
      originalPrice: "Rs44,000",
      currentPrice: "Rs40,000",
      duration: null,
      rating: 0,
      students: 0,
      tag: "New",
      description: "Professional safety certification recognized internationally"
    },
    {
      id: 2,
      title: "Basic First Aid",
      category: "First Aid – First Aid Training",
      instructor: "Masol Hab",
      originalPrice: "Rs20,000",
      currentPrice: "Rs18,000",
      duration: null,
      rating: 0,
      students: 0,
      tag: "Essential",
      description: "Essential first aid training for workplace and home safety"
    },
    {
      id: 3,
      title: "Integrated Safety & Compliance Training Program (7 in 1)",
      category: "All In One",
      instructor: "Masol Hab",
      originalPrice: "Rs165,000",
      currentPrice: "Rs140,000",
      duration: "12h 30m",
      rating: 4,
      students: 12,
      tag: "Popular",
      description: "Comprehensive safety training covering 7 critical areas"
    },
    {
      id: 4,
      title: "Basic Orientation of Safety & Health (BOSH)",
      category: "BOSH – Basic Occupational Safety & Health",
      instructor: "Masol Hab",
      originalPrice: "Rs20,000",
      currentPrice: "Rs16,000",
      duration: "6h",
      rating: 4,
      students: 6,
      tag: "Foundation",
      description: "Fundamental safety orientation for workplace compliance"
    },
    {
      id: 5,
      title: "Fire Safety – By OSHAcademy (USA)",
      category: "Fire Safety – Fire Training",
      instructor: "Masol Hab",
      originalPrice: "Rs20,000",
      currentPrice: "Rs18,000",
      duration: null,
      rating: 5,
      students: 1,
      tag: "Certified",
      description: "USA certified fire safety training program"
    },
    {
      id: 6,
      title: "OSHA – General Industry 30 Hrs (USA) by OSHAcademy",
      category: "OSHA – Occupational Safety & Health Administration",
      instructor: "Masol Hab",
      originalPrice: "Rs50,000",
      currentPrice: "Rs40,000",
      duration: "30h",
      rating: 3,
      students: 30,
      tag: "Advanced",
      description: "30-hour OSHA general industry safety training"
    },
    {
      id: 7,
      title: "Hole Watcher – By OSHAcademy (USA)",
      category: "Hole Watcher",
      instructor: "Masol Hab",
      originalPrice: "Rs20,000",
      currentPrice: "Rs18,000",
      duration: "6h",
      rating: 5,
      students: 6,
      tag: "Specialized",
      description: "Specialized training for hole watching safety procedures"
    },
    {
      id: 8,
      title: "Permit to Work System – By OSHAcademy (USA)",
      category: "PTW – Permit to Work",
      instructor: "Masol Hab",
      originalPrice: "Rs25,000",
      currentPrice: "Rs20,000",
      duration: "6h",
      rating: 6,
      students: 6,
      tag: "Compliance",
      description: "Permit to Work system implementation training"
    }
  ])

  const locations = [
    { city: "General", phone: "03224700200" },
    { city: "Lahore", phone: "03104700200" },
    { city: "Sheikhupura", phone: "03054700202" },
    { city: "Rawalpindi", phone: "03204700607" }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSlider />

      {/* Courses Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#1F2937] mb-4">Our Courses</h2>
            <p className="text-lg text-[#4B5563] max-w-3xl mx-auto">
              Complete International Certifications and secure 100% overseas job placement.
            </p>
            <div className="mt-6 flex items-center justify-center space-x-4">
              <span className="text-sm text-[#DA2F6B] font-medium">Release Date (newest first)</span>
            </div>
          </div>

          {/* Courses Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden group">
                <div className="p-5">
                  {/* Course Tag */}
                  {course.tag && (
                    <div className="mb-3">
                      <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                        course.tag === 'New' ? 'bg-red-100 text-red-800' :
                        course.tag === 'Popular' ? 'bg-purple-100 text-purple-800' :
                        course.tag === 'Essential' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {course.tag}
                      </span>
                    </div>
                  )}

                  {/* Course Title */}
                  <h3 className="text-lg font-bold text-[#1F2937] mb-2 group-hover:text-[#6B21A8] transition-colors line-clamp-2">
                    {course.title}
                  </h3>

                  {/* Course Description */}
                  <p className="text-sm text-[#4B5563] mb-4 line-clamp-2">
                    {course.description}
                  </p>

                  {/* Rating and Duration */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <HiStar className="w-4 h-4 text-[#F59E0B]" />
                        <span className="ml-1 text-sm font-medium text-[#1F2937]">{course.rating || "New"}</span>
                      </div>
                      {course.students > 0 && (
                        <span className="text-xs text-[#4B5563]">• {course.students} enrolled</span>
                      )}
                    </div>
                    {course.duration && (
                      <div className="flex items-center text-sm text-[#4B5563]">
                        <HiOutlineClock className="w-4 h-4 mr-1" />
                        {course.duration}
                      </div>
                    )}
                  </div>

                  {/* Category and Instructor */}
                  <div className="mb-4 space-y-2">
                    <div className="flex items-center text-sm text-[#4B5563]">
                      <HiOutlineUsers className="w-4 h-4 mr-2" />
                      <span className="font-medium">{course.category}</span>
                    </div>
                    <div className="flex items-center text-sm text-[#4B5563]">
                      <span className="font-bold text-[#6B21A8] mr-1">MH</span>
                      <span>By {course.instructor}</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <span className="text-2xl font-bold text-[#6B21A8]">{course.currentPrice}</span>
                      {course.originalPrice && (
                        <span className="ml-2 text-sm text-[#4B5563] line-through">{course.originalPrice}</span>
                      )}
                    </div>
                    <div className="text-sm text-[#10B981] font-medium flex items-center">
                      <HiOutlineCheckCircle className="w-4 h-4 mr-1" />
                      100% Job Placement
                    </div>
                  </div>

                  {/* Enroll Button */}
                  <button className="w-full py-3 bg-[#6B21A8] text-white font-semibold rounded-lg hover:bg-[#7C3AED] transition-colors hover:scale-[1.02] active:scale-[0.98]">
                    Enroll Now
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* View More Button */}
          <div className="text-center mt-12">
            <button className="px-8 py-3 bg-white border-2 border-[#6B21A8] text-[#6B21A8] font-semibold rounded-lg hover:bg-[#6B21A8] hover:text-white transition-all duration-300">
              View More Courses
            </button>
          </div>
        </div>
      </section>

      {/* About & Contact Section */}
      <section className="py-20 bg-[#F5F5F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left Column - Course Details */}
            <div>
              <h2 className="text-3xl font-bold text-[#1F2937] mb-8">About Courses & Contact Details</h2>
              
              {/* Course Descriptions */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-[#6B21A8] mb-3">BOSH</h3>
                  <p className="text-[#4B5563]">Basic Occupational Safety & Health training for workplace compliance.</p>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-[#6B21A8] mb-3">Fire Safety</h3>
                  <p className="text-[#4B5563]">Comprehensive fire safety training including prevention and emergency response.</p>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-[#6B21A8] mb-3">OSHA</h3>
                  <p className="text-[#4B5563]">Occupational Safety & Health Administration standards and compliance.</p>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-[#6B21A8] mb-3">Hole Watcher</h3>
                  <p className="text-[#4B5563]">Specialized training for monitoring and safety in confined spaces.</p>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-[#6B21A8] mb-3">Permit to Work System</h3>
                  <p className="text-[#4B5563] leading-relaxed">
                    Permit to Work (PTW) System is a formal safety procedure used in workplaces to control high-risk activities and ensure that they are carried out safely. It involves issuing a written or digital permit before starting specific tasks such as hot work, electrical maintenance, confined space entry, or work at height. The permit specifies the work to be done, potential hazards, necessary precautions, and authorization from responsible personnel. By clearly defining responsibilities and safety measures, the PTW system helps prevent accidents, ensures coordination between teams, and maintains a controlled working environment where risks are properly managed and minimized.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Contact Information */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-[#1F2937] mb-8">Contact Information</h3>
              
              {/* Location Contacts */}
              <div className="space-y-6">
                {locations.map((location, index) => (
                  <div key={index} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                    <h4 className="text-lg font-bold text-[#6B21A8] mb-2 flex items-center">
                      <HiOutlineMap className="w-5 h-5 mr-2" />
                      {location.city}
                    </h4>
                    <div className="flex items-center text-[#4B5563] ml-7">
                      <HiOutlinePhone className="w-4 h-4 mr-2" />
                      <span className="font-medium">{location.phone}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Other Contact Info */}
              <div className="mt-8 space-y-4">
                <div className="flex items-center text-[#4B5563]">
                  <HiOutlineMail className="w-5 h-5 mr-3 text-[#6B21A8]" />
                  <div>
                    <div className="font-medium">Email</div>
                    <a href="mailto:info@mansolhab.com" className="text-[#6B21A8] hover:underline">
                      info@mansolhab.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center text-[#4B5563]">
                  <HiOutlineChat className="w-5 h-5 mr-3 text-[#10B981]" />
                  <div>
                    <div className="font-medium">WhatsApp</div>
                    <span>03224700200</span>
                  </div>
                </div>
                
                <div className="flex items-center text-[#4B5563]">
                  <HiOutlineCalendar className="w-5 h-5 mr-3 text-[#F59E0B]" />
                  <div>
                    <div className="font-medium">Office Hours</div>
                    <span>Monday to Saturday (9 AM to 5 PM)</span>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="mt-8">
                <button className="w-full py-3 bg-[#6B21A8] text-white font-semibold rounded-lg hover:bg-[#7C3AED] transition-colors flex items-center justify-center">
                  <HiOutlinePhone className="w-5 h-5 mr-2" />
                  Call Now for Consultation
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="py-12 bg-gradient-to-r from-[#6B21A8] to-[#7C3AED]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Enjoy Our Amazing Courses</h2>
            <p className="text-xl opacity-90 mb-8">
              Excellence in education since 2005. Shaping future leaders through quality education and character building.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div>
                <div className="text-4xl font-bold mb-2">18+</div>
                <div className="text-lg">Years Experience</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">100%</div>
                <div className="text-lg">Job Placement</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">5000+</div>
                <div className="text-lg">Students Trained</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1F2937] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand Info */}
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-[#6B21A8] to-[#7C3AED] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">MH</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold">Mansol Hab Trainings</span>
                  <span className="text-sm text-gray-400">Safety & Compliance Specialists</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-6">
                Complete International Certifications and secure 100% overseas job placement.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <HiOutlineGlobe className="w-6 h-6" />
                </a>
                {/* Add other social icons */}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-lg mb-6">Quick Links</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-[#F59E0B] transition-colors">Home</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#F59E0B] transition-colors">Courses</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#F59E0B] transition-colors">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#F59E0B] transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Programs */}
            <div>
              <h4 className="font-bold text-lg mb-6">Programs</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-[#F59E0B] transition-colors">BOSH (Basic Occupational Safety & Health)</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#F59E0B] transition-colors">Fire Safety</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#F59E0B] transition-colors">OSHA (Occupational Safety & Health Administration)</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#F59E0B] transition-colors">Hole Watcher</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#F59E0B] transition-colors">Permit to Work System (PTW System)</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-bold text-lg mb-6">Contact Info</h4>
              <div className="space-y-4 text-gray-400">
                <div className="space-y-2">
                  <div className="font-medium text-white mb-2">Phone Numbers:</div>
                  {locations.map((location, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium">{location.city}:</span> {location.phone}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="font-medium text-white">Email:</div>
                  <a href="mailto:info@mansolhab.com" className="text-sm hover:text-[#F59E0B] transition-colors">
                    info@mansolhab.com
                  </a>
                </div>
                <div>
                  <div className="font-medium text-white">WhatsApp:</div>
                  <span className="text-sm">03224700200</span>
                </div>
                <div>
                  <div className="font-medium text-white">Office Hours:</div>
                  <span className="text-sm">Monday to Saturday<br />9 AM to 5 PM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} Mansol Hab Trainings. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}