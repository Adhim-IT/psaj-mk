"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import CourseList from "@/components/user/kelas/list-course"
import { getListClasses } from "@/lib/list-kelas"
import { ChevronRight, Loader2 } from 'lucide-react'

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

// Enhanced PageHeader component with animations
const PageHeader = ({ title }: { title: string }) => (
  <div className="bg-gradient-to-r from-[#5596DF] to-[#6ba5e7] text-white py-32 px-6 mt-10 min-h-[300px] flex items-center relative overflow-hidden">
    {/* Animated background circles */}
    <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-white/10 rounded-full blur-xl animate-pulse"></div>
    <div className="absolute bottom-[-100px] left-[-20px] w-80 h-80 bg-white/5 rounded-full blur-xl animate-pulse delay-700"></div>

    {/* Floating shapes */}
    <div className="absolute top-1/4 right-1/4 w-12 h-12 bg-white/20 rounded-lg rotate-12 animate-bounce delay-300"></div>
    <div className="absolute bottom-1/3 right-1/3 w-8 h-8 bg-white/15 rounded-full animate-ping opacity-70 delay-1000"></div>
    <div className="absolute top-1/3 left-1/4 w-6 h-6 bg-white/10 rotate-45 animate-bounce delay-700"></div>

    <div className="container mx-auto max-w-7xl relative z-10">
      <h1 className="text-4xl md:text-5xl font-bold mb-4 md:ml-5">
        {title}
      </h1>
      <div className="flex items-center gap-2 text-[#e6f0fc] md:ml-5">
        <Link href="/" className="hover:text-white transition-colors duration-300">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span>{title}</span>
      </div>
    </div>
  </div>
)

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

        const coursesData = (listClasses || [])
          .filter((course: any) => course.is_active)
          .map((course: any) => ({
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

  return (
    <section className="min-h-screen">
      {/* Enhanced PageHeader */}
      <PageHeader title="Kelas" />

      <div className="container mx-auto px-6 py-12 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <p className="text-gray-600">
            Menampilkan {courses.length > 0 ? 1 : 0} - {courses.length} dari {courses.length}{" "}
            kelas
          </p>
        </div>

        <CourseList courses={courses} />
      </div>
    </section>
  )
}
