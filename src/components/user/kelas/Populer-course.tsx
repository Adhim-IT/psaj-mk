"use client"

import { useEffect, useState } from "react"
import { getListClasses } from "@/lib/list-kelas"
import CourseList from "./list-course"

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
        <p>Loading popular courses...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-24 text-center">
        <p className="text-red-500">Error: {error}</p>
      </div>
    )
  }

  if (courses.length === 0) {
    return (
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6 xl:px-8 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-[#4A90E2] font-semibold">Kursus Populer</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">Pilih Kursus Sesuai Minatmu</h2>
            <p className="text-gray-600 mt-4 text-lg">
              Kami menyediakan berbagai kursus IT yang dirancang untuk pemula hingga tingkat lanjut
            </p>
            <div className="mt-8">
              <p className="text-gray-600">Belum ada kursus populer saat ini.</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-6 xl:px-8 max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[#4A90E2] font-semibold">Kursus Populer</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2">Pilih Kursus Sesuai Minatmu</h2>
          <p className="text-gray-600 mt-4 text-lg">
            Kami menyediakan berbagai kursus IT yang dirancang untuk pemula hingga tingkat lanjut
          </p>
        </div>
        <CourseList courses={courses} maxCourses={maxCourses} />
      </div>
    </section>
  )
}

