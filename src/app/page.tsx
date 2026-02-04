"use client"

import dynamic from "next/dynamic"


import ContactForm from "@/components/query"
import AboutSection from "@/components/ourimpact"
import CoursesPage from "./courses/page"
import TrainersSection from "@/components/tutors"
import TrainersSlider from "@/components/tutors"

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





export default function Page() {
  return (
    <>
      {/* Hero will NEVER appear late now */}
      <HeroSlider />

    <AboutSection/>

      <CoursesPage/>

      <TrainersSlider/>

      <ContactForm />

      
    </>
  )
}
