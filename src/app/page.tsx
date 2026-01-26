"use client"

import dynamic from "next/dynamic"
import Footer from "@/components/footer"
import OurImpact from "@/components/ourimpact"
import ContactForm from "@/components/query"

//Professional skeleton for Hero (prevents late rendering issue)
const HeroSlider = dynamic(
  () => import("@/components/herosection"),
  {
    ssr: false,
    loading: () => (
      <section className="h-[90vh] w-full bg-white flex items-center justify-center">
        <div className="w-4/5 h-3/4 bg-gray-200 animate-pulse rounded-2xl" />
      </section>
    ),
  }
)


const PopularCourses = dynamic(
  () => import("@/components/courses"),
  {
    ssr: false,
    loading: () => (
      <div className="py-20 bg-white">
        <div className="max-w-6xl mx-auto h-48 bg-gray-100 animate-pulse rounded-xl" />
      </div>
    ),
  }
)

const TutorSlider = dynamic(
  () => import("@/components/tutors"),
  {
    ssr: false,
    loading: () => (
      <div className="py-20 bg-white">
        <div className="max-w-6xl mx-auto h-40 bg-gray-100 animate-pulse rounded-xl" />
      </div>
    ),
  }
)

export default function Page() {
  return (
    <>
      {/* Hero will NEVER appear late now */}
      <HeroSlider />

      <OurImpact />

      <PopularCourses />

      <TutorSlider />

      <ContactForm />

      
    </>
  )
}
