// app/lms/Registration/loading.tsx
export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
        <p className="mt-4 text-gray-600">Loading registration form...</p>
      </div>
    </div>
  )
}