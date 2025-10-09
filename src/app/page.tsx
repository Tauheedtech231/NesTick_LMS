"use client"

import PopularCourses from '@/components/courses'
import Footer from '@/components/footer'
import HeroSlider from '@/components/herosection'

import OurImpact from '@/components/ourimpact'
import TopTutorsPage from '@/components/tutors'

export default function Page() {
  return (
    <>
      <HeroSlider />
      <OurImpact />
      <PopularCourses />
      <TopTutorsPage/>
      <Footer/>
    </>
  )
}
