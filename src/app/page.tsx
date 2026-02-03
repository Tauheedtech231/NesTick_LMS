"use client"

import dynamic from "next/dynamic"


import ContactForm from "@/components/query"
import AboutSection from "@/components/ourimpact"
import CoursesPage from "./courses/page"

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

    <AboutSection/>

      <CoursesPage/>

      <TutorSlider />

      <ContactForm />

      
    </>
  )
}
