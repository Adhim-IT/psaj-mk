"use client"

import { useSession, signOut } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { Star, ArrowRight, Users, BookOpen, Award } from "lucide-react"
import { useState, useEffect } from "react"
import CoursePopular from "@/src/components/user/kelas/Populer-course"
import AboutSection from "@/components/user/About"
import Navbar from "../components/user/Navbar"
import Footer from "../components/user/Footer"
import UpcomingEvents from "@/components/user/event/upcoming-events"
import MentorHomepage from "@/components/user/mentor/mentor-homepage"

export default function Home() {
  const { data: session, status } = useSession()

  useEffect(() => {
    const hadPreviousSession = typeof window !== "undefined" && localStorage.getItem("previouslyLoggedIn") === "false"

    if (status === "authenticated") {
      localStorage.setItem("previouslyLoggedIn", "true")
    } else if (status === "unauthenticated" && hadPreviousSession) {
      signOut({ callbackUrl: "/login" })
    }
  }, [status])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div>
      <Navbar />
      <main className="min-h-screen overflow-hidden">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[#4A90E2] to-[#3178c6] text-white relative overflow-hidden mt-20">
          {/* Animated background elements */}
          <div className="absolute -right-20 -top-20 w-72 h-72 sm:w-96 sm:h-96 bg-blue-300/20 rounded-full animate-pulse"></div>
          <div className="absolute left-1/4 bottom-0 w-40 h-40 sm:w-64 sm:h-64 bg-blue-300/10 rounded-full animate-bounce"></div>
          <div className="absolute right-1/3 top-1/4 w-20 h-20 sm:w-32 sm:h-32 bg-blue-300/15 rounded-full animate-pulse"></div>

          <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-6 sm:gap-8 xl:gap-12">
              <div
                className={`space-y-6 sm:space-y-8 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
              >
                <div>
                  <span className="inline-block px-3 sm:px-4 py-1 bg-white/20 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4 backdrop-blur-sm mt-10">
                    Platform Belajar IT #1 di Indonesia
                  </span>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-bold leading-tight">
                    Belajar IT Jadi <br className="hidden md:block" />
                    <span className="text-yellow-300">Mudah & Seru!</span> 🚀
                  </h1>
                  <p className="text-lg sm:text-xl md:text-2xl mt-4 sm:mt-6 text-blue-100">
                    Belajar di TeenCode, Jadi Jago IT!
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 sm:gap-4">
                  <Link
                    href="#courses"
                    className="inline-flex items-center bg-white text-[#4A90E2] px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-medium hover:bg-gray-100 transition-all duration-300 text-sm sm:text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 group"
                  >
                    Lihat Kursus
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="#about"
                    className="inline-flex items-center bg-transparent border-2 border-white/70 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-medium hover:bg-white/10 transition-all duration-300 text-sm sm:text-lg"
                  >
                    Tentang Kami
                  </Link>
                </div>

                <div className="flex items-center space-x-2 text-blue-100">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 sm:w-5 h-4 sm:h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-sm sm:text-base">Dipercaya oleh 10,000+ pelajar di Indonesia</span>
                </div>
              </div>
              <div
                className={`md:mt-20 relative z-10 flex justify-center lg:justify-end transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
              >
                <div className="relative w-full max-w-xs sm:max-w-md lg:max-w-xl xl:max-w-2xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-3xl opacity-30 -z-10 transform -rotate-6"></div>
                  <Image
                    src="/images/hero-img.png"
                    width={600}
                    height={600}
                    alt="Student with laptop"
                    className="object-contain drop-shadow-2xl"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="bg-white/10 backdrop-blur-md py-4 sm:py-6 relative z-10">
            <div className="container mx-auto px-4 sm:px-6 xl:px-8 max-w-7xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start space-x-2 sm:space-x-3">
                  <Users className="w-6 sm:w-8 h-6 sm:h-8 text-yellow-300" />
                  <div>
                    <p className="text-xl sm:text-2xl font-bold">10,000+</p>
                    <p className="text-blue-100 text-xs sm:text-sm">Pelajar Aktif</p>
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                  <BookOpen className="w-6 sm:w-8 h-6 sm:h-8 text-yellow-300" />
                  <div>
                    <p className="text-xl sm:text-2xl font-bold">50+</p>
                    <p className="text-blue-100 text-xs sm:text-sm">Kursus Tersedia</p>
                  </div>
                </div>
                <div className="flex items-center justify-center sm:justify-end space-x-2 sm:space-x-3">
                  <Award className="w-6 sm:w-8 h-6 sm:h-8 text-yellow-300" />
                  <div>
                    <p className="text-xl sm:text-2xl font-bold">95%</p>
                    <p className="text-blue-100 text-xs sm:text-sm">Tingkat Kelulusan</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Upcoming Events Section */}
        <UpcomingEvents maxEvents={3} />

        {/* Features Section */}
        <AboutSection />

        {/* Courses Section */}
        <CoursePopular maxCourses={1} />

        {/* Testimonials */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6 xl:px-8 max-w-7xl">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-[#4A90E2] font-semibold">Testimonial</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2">Apa Kata Mereka?</h2>
              <p className="text-gray-600 mt-4 text-lg">Pengalaman belajar dari para siswa TeenCode</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "Budi Santoso",
                  role: "Siswa SMA",
                  quote:
                    "TeenCode membantu saya memahami dasar-dasar pemrograman dengan cara yang menyenangkan. Sekarang saya bisa membuat website sendiri!",
                  avatar: "/placeholder.svg?height=100&width=100",
                },
                {
                  name: "Siti Rahma",
                  role: "Mahasiswa Teknik",
                  quote:
                    "Mentor-mentor di TeenCode sangat membantu dan selalu siap menjawab pertanyaan. Materi kursusnya juga up-to-date dengan teknologi terbaru.",
                  avatar: "/placeholder.svg?height=100&width=100",
                },
                {
                  name: "Andi Wijaya",
                  role: "Fresh Graduate",
                  quote:
                    "Berkat sertifikat dari TeenCode, saya berhasil mendapatkan pekerjaan pertama saya sebagai web developer di startup teknologi.",
                  avatar: "/placeholder.svg?height=100&width=100",
                },
              ].map((testimonial, index) => (
                <div key={index} className="bg-gray-50 p-8 rounded-2xl hover:shadow-lg transition-shadow">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center mb-6">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 flex-grow">"{testimonial.quote}"</p>
                    <div className="flex items-center mt-6 pt-6 border-t border-gray-200">
                      <Image
                        src={testimonial.avatar || "/placeholder.svg"}
                        width={48}
                        height={48}
                        alt={testimonial.name}
                        className="rounded-full"
                      />
                      <div className="ml-4">
                        <h4 className="font-semibold">{testimonial.name}</h4>
                        <p className="text-gray-500 text-sm">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mentor Section */}
        <MentorHomepage maxMentors={4} />
      </main>
      <Footer />
    </div>
  )
}

