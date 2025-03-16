"use client"

import { useEffect, useState } from "react"
import { getListClasses } from "@/lib/list-kelas"
import CourseList from "@/components/user/kelas/list-course"
import { BookOpen } from "lucide-react"

type CourseData = {
  id: string
  title: string
  description: string
  thumbnail: string
  level: string
  meetings: number
  slug: string
  is_popular: boolean
  mentor: {
    id: string
    name: string
    profile_picture?: string
    specialization?: string
  }
}

export default function PopularCourses({ maxCourses }: { maxCourses?: number }) {
  const [courses, setCourses] = useState<CourseData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true)
        const { listClasses, error } = await getListClasses()

        if (error) {
          setError(error)
          return
        }

        // Filter only popular courses
        const popularCourses = (listClasses || [])
          .filter((course) => course.is_active && course.is_popular)
          .map((course) => ({
            id: course.id,
            title: course.title,
            description: course.description,
            thumbnail: course.thumbnail,
            level: course.level,
            meetings: course.meetings,
            slug: course.slug,
            is_popular: course.is_popular,
            mentor: {
              id: course.mentors?.id || "",
              name: course.mentors?.name || "Mentor",
              profile_picture: course.mentors?.profile_picture ?? "/images/mentor.png",
              specialization: course.mentors?.specialization,
            },
          }))

        setCourses(popularCourses)
      } catch (err) {
        setError("Failed to fetch courses")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#4A90E2] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4 text-gray-600">Memuat kursus populer...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-24 text-center">
        <div className="max-w-md mx-auto bg-red-50 p-6 rounded-lg border border-red-100">
          <p className="text-red-600 font-medium">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    )
  }

  if (courses.length === 0) {
    return (
      <section className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-6 xl:px-8 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-block bg-blue-50 text-[#4A90E2] font-semibold px-4 py-1 rounded-full mb-3">
              Kursus Populer
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 bg-clip-text text-transparent bg-gradient-to-r from-[#4A90E2] to-[#5596DF]">
              Pilih Kursus Sesuai Minatmu
            </h2>
            <p className="text-gray-600 mt-4 text-lg">
              Kami menyediakan berbagai kursus IT yang dirancang untuk pemula hingga tingkat lanjut
            </p>
            <div className="mt-12 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Belum ada kursus populer saat ini.</p>
              <p className="text-gray-400 text-sm mt-2">Silakan periksa kembali nanti.</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-6 xl:px-8 max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block bg-blue-50 text-[#4A90E2] font-semibold px-4 py-1 rounded-full mb-3">
            Kursus Populer
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 bg-clip-text text-transparent bg-gradient-to-r from-[#4A90E2] to-[#5596DF]">
            Pilih Kursus Sesuai Minatmu
          </h2>
          <p className="text-gray-600 mt-4 text-lg max-w-2xl mx-auto">
            Kami menyediakan berbagai kursus IT yang dirancang untuk pemula hingga tingkat lanjut
          </p>
        </div>
        <CourseList courses={courses} maxCourses={maxCourses} />

        {courses.length > (maxCourses || 0) && maxCourses && (
          <div className="text-center mt-12">
            <a
              href="/kelas"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-[#4A90E2] text-[#4A90E2] rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              Lihat Semua Kursus
            </a>
          </div>
        )}
      </div>
    </section>
  )
}

