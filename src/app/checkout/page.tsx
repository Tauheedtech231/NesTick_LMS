"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, ArrowLeft, GraduationCap, Calendar, AlertCircle, Loader2 } from "lucide-react";

const BRAND_COLORS = {
  darkNavy: "#0B1C3D",
  darkRoyalBlue: "#1E3A8A",
  deepRed: "#B11217",
  white: "#FFFFFF",
  lightGrey: "#F4F6F8",
  softGrey: "#E5E7EB",
  darkGrey: "#1F2933",
  charcoal: "#111111",
  teal: "#14B8A6",
  amber: "#F59E0B",
  emerald: "#10B981",
};

interface Course {
  id: string;
  course_id: string;
  course_title: string;
  course_price: number;
  created_at: string;
}

const Page: React.FC = () => {
  const router = useRouter();

  const [userEmail, setUserEmail] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedEmail = localStorage.getItem("userEmail");
    if (savedEmail) {
      setUserEmail(savedEmail);
      fetchCourses(savedEmail);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchCourses = async (email: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/student/cart?email=${encodeURIComponent(email)}`
      );
      const data = await res.json();

      if (data.success) {
        const uniqueCourses = data.data.items.filter(
          (course: Course, index: number, self: Course[]) =>
            index === self.findIndex((c) => c.id === course.id)
        );

        setCourses(uniqueCourses);

        const calculatedTotal = uniqueCourses.reduce(
          (sum: number, item: Course) => sum + item.course_price,
          0
        );

        setTotal(calculatedTotal);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = () => {
    if (courses.length === 0) {
      alert("No courses in your cart. Please add courses before enrolling.");
      return;
    }
    router.push("/cartEnrollment");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 bg-[#F4F6F8] flex items-center justify-center">
        <div className="text-center">
          <Loader2 
            className="animate-spin mx-auto mb-4" 
            size={48} 
            style={{ color: BRAND_COLORS.teal }}
          />
          <p className="text-gray-600">Loading your selected courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-[#F4F6F8] to-[#E5E7EB] px-4 md:px-10 pb-10">
      
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-full shadow-md mb-4">
            <BookOpen size={32} style={{ color: BRAND_COLORS.teal }} />
          </div>
          <h1
            className="text-3xl md:text-4xl font-bold mb-2"
            style={{ color: BRAND_COLORS.darkNavy }}
          >
            Courses Selected
          </h1>
          <p className="text-gray-600">
            Review the courses you&apos;ve added to your enrollment list
          </p>
          {userEmail && (
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm">
              <span className="text-sm text-gray-500">👤 Student:</span>
              <span
                className="text-sm font-semibold"
                style={{ color: BRAND_COLORS.darkRoyalBlue }}
              >
                {userEmail}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 hover:scale-105 hover:shadow-md"
            style={{
              backgroundColor: BRAND_COLORS.darkGrey,
              color: BRAND_COLORS.white,
            }}
          >
            <ArrowLeft size={18} />
            Browse More Courses
          </button>

          <button
            onClick={handleEnroll}
            disabled={courses.length === 0}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
              courses.length === 0 
                ? "opacity-50 cursor-not-allowed" 
                : "hover:scale-105 hover:shadow-lg"
            }`}
            style={{
              backgroundColor: BRAND_COLORS.teal,
              color: BRAND_COLORS.white,
            }}
          >
            <GraduationCap size={18} />
            Proceed to Enrollment ({courses.length} {courses.length === 1 ? "Course" : "Courses"})
          </button>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {courses.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                <BookOpen size={40} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Courses Selected</h3>
              <p className="text-gray-500 mb-6">Your enrollment list is empty. Start by browsing available courses.</p>
              <button
                onClick={() => router.push("/")}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all hover:scale-105"
                style={{
                  backgroundColor: BRAND_COLORS.teal,
                  color: BRAND_COLORS.white,
                }}
              >
                <BookOpen size={18} />
                Browse Courses
              </button>
            </div>
          ) : (
            <>
              {/* Course List Header */}
              <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b">
                <div className="md:col-span-7">
                  <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Course Details</span>
                </div>
                <div className="md:col-span-3">
                  <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Date Added</span>
                </div>
                <div className="md:col-span-2 text-right">
                  <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Fee</span>
                </div>
              </div>

              {/* Course List */}
              <div className="divide-y">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="px-4 md:px-6 py-5 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      {/* Course Info */}
                      <div className="flex-1 md:col-span-7">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${BRAND_COLORS.teal}15` }}>
                              <BookOpen size={16} style={{ color: BRAND_COLORS.teal }} />
                            </div>
                          </div>
                          <div>
                            <h2
                              className="text-lg font-semibold mb-1"
                              style={{ color: BRAND_COLORS.darkNavy }}
                            >
                              {course.course_title}
                            </h2>
                            <p className="text-sm text-gray-500">
                              Course ID: {course.course_id}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Date Added - Desktop */}
                      <div className="hidden md:flex md:col-span-3 items-center gap-2 text-sm text-gray-500">
                        <Calendar size={14} />
                        <span>
                          {new Date(course.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>

                      {/* Fee */}
                      <div className="md:col-span-2 text-left md:text-right">
                        <div className="inline-block md:block">
                          <span className="text-sm text-gray-500 md:hidden">Fee: </span>
                          <span
                            className="text-xl font-bold"
                            style={{ color: BRAND_COLORS.deepRed }}
                          >
                            Rs. {course.course_price.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Date Added - Mobile */}
                      <div className="md:hidden flex items-center gap-2 text-xs text-gray-500">
                        <Calendar size={12} />
                        <span>Added: {new Date(course.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Section */}
              <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-6 border-t">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${BRAND_COLORS.teal}10` }}>
                      <GraduationCap size={20} style={{ color: BRAND_COLORS.teal }} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        Total Courses: <span className="font-semibold">{courses.length}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Complete enrollment to secure your spot
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right border-t md:border-t-0 pt-4 md:pt-0">
                    <p className="text-sm text-gray-500 mb-1">Total Enrollment Fee</p>
                    <div className="flex items-baseline gap-2 justify-end">
                      <span
                        className="text-3xl font-bold"
                        style={{ color: BRAND_COLORS.teal }}
                      >
                        Rs. {total.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">*One-time enrollment fee</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => router.push("/")}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold border-2 transition-all hover:bg-gray-50"
                    style={{
                      borderColor: BRAND_COLORS.darkGrey,
                      color: BRAND_COLORS.darkGrey,
                    }}
                  >
                    <ArrowLeft size={18} />
                    Add More Courses
                  </button>
                  <button
                    onClick={handleEnroll}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all hover:scale-105 hover:shadow-lg"
                    style={{
                      backgroundColor: BRAND_COLORS.teal,
                      color: BRAND_COLORS.white,
                    }}
                  >
                    <GraduationCap size={18} />
                    Complete Enrollment
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Information Note */}
        {courses.length > 0 && (
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">
                Please review your selected courses before proceeding to enrollment. Once enrolled, you&apos;ll get immediate access to all course materials.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;