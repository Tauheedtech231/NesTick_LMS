// app/lms/Registration/page.tsx - Create a wrapper
import { Suspense } from 'react'
import RegistrationContent from './RegistrationContent'
import Loading from './loading'

export default function RegistrationPage() {
  return (
    <Suspense fallback={<Loading />}>
      <RegistrationContent />
    </Suspense>
  )
}