"use client"

import dynamic from "next/dynamic"
import Footer from '@/components/footer'
import OurImpact from '@/components/ourimpact'
import ContactForm from '@/components/query'

const HeroSlider = dynamic(() => import('@/components/herosection'), { ssr: false })
const TutorSlider = dynamic(() => import('@/components/tutors'), { ssr: false })
const PopularCourses = dynamic(() => import('@/components/courses'), { ssr: false })

export default function Page() {
  return (
    <>
      <HeroSlider />
      <OurImpact />
      <PopularCourses />
      <TutorSlider/>
      <ContactForm/>
      <Footer/>
    </>
  )
}
