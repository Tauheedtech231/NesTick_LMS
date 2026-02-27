"use client"




import ContactForm from "@/components/query"
import AboutSection from "@/components/ourimpact"


import TrainersSlider from "@/components/tutors"
import CoursesTab from "@/components/stats"
import CoursesPage1 from "@/components/courses"
import HeroSection from "@/components/herosection"








export default function Page() {
  return (
    <>
      {/* Hero will NEVER appear late now */}
      <HeroSection/>
    

     <AboutSection/>

       <CoursesPage1/>

      <TrainersSlider/>
     <CoursesTab/>

      <ContactForm />   

      
    </>
  )
}
