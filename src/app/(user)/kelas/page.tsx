"use client"

import { useEffect, useState } from "react"
import CourseList from "@/components/user/kelas/list-course"
import { getListClasses } from "@/lib/list-kelas"
import { Loader2 } from "lucide-react"

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
    photo?: string
    profile_picture?: string
    specialization?: string
  }
}

export default function Kelas() {
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

        // Get all active courses
        const coursesData = (listClasses || [])
          .filter((course) => course.is_active)
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

        setCourses(coursesData)
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
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="h-12 w-12 animate-spin text-[#4A90E2]" />
        <p className="mt-4 text-lg text-gray-600">Memuat daftar kelas...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="rounded-full bg-red-100 p-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <p className="mt-4 text-lg font-medium text-gray-900">Terjadi kesalahan</p>
        <p className="text-gray-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 rounded-lg bg-[#4A90E2] px-6 py-2 text-white transition-colors hover:bg-[#3178c6]"
        >
          Coba lagi
        </button>
      </div>
    )
  }

  return <CourseList courses={courses} title="Kelas" />
}

