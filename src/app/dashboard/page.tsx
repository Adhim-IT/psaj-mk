"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useUser } from "@/hooks/useUser"
import { BookOpen, Calendar, CheckCircle, Clock, CreditCard, Loader2, Settings } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSession } from "next-auth/react"

// Define types for our data
type CourseTransaction = {
  id: string
  code: string
  status: string
  final_price: number
  created_at: string
  courses: {
    id: string
    title: string
    slug: string
    thumbnail: string
    level: string
    meetings: number
    mentors: {
      name: string
      profile_picture: string | null
    }
  }
}

type EventRegistration = {
  id: string
  status: string
  created_at: string
  events: {
    id: string
    title: string
    slug: string
    thumbnail: string
    start_date: string
    end_date: string
    price: number | null
    mentors: {
      name: string
      profile_picture: string | null
    }
  }
}

export default function DashboardPage() {
  // Format currency to IDR
  const formatCurrency: (amount: number) => string = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const { user, status } = useUser()
  const { data: session } = useSession()
  const router = useRouter()

  const [courses, setCourses] = useState<CourseTransaction[]>([])
  const [events, setEvents] = useState<EventRegistration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [userImage, setUserImage] = useState("")
  const [profileData, setProfileData] = useState<any>(null)

  // Function to check if a URL is valid
  const isValidImageUrl = (url: string | null | undefined): url is string => {
    return !!url && typeof url === "string" && url.trim() !== ""
  }

  // Fetch profile data from API
  const fetchProfileData = async () => {
    if (session?.user?.id) {
      try {
        const response = await fetch("/api/dashboard/protfile/")
        if (response.ok) {
          const data = await response.json()
          setProfileData(data)
          console.log("Fetched profile data:", data)

          // Try to get profile picture from different sources in order of priority
          if (data.data?.student && isValidImageUrl(data.data.student.profile_picture)) {
            console.log("Setting profile picture from student:", data.data.student.profile_picture)
            setUserImage(data.data.student.profile_picture)
          } else if (data.data?.mentor && isValidImageUrl(data.data.mentor.profile_picture)) {
            console.log("Setting profile picture from mentor:", data.data.mentor.profile_picture)
            setUserImage(data.data.mentor.profile_picture)
          } else if (data.data?.writer && isValidImageUrl(data.data.writer.profile_picture)) {
            console.log("Setting profile picture from writer:", data.data.writer.profile_picture)
            setUserImage(data.data.writer.profile_picture)
          } else if (isValidImageUrl(session.user.image)) {
            console.log("Setting profile picture from session:", session.user.image)
            setUserImage(session.user.image)
          }
        }
      } catch (error) {
        console.error("Error fetching profile data:", error)
      }
    }
  }

  useEffect(() => {
    // Redirect if not authenticated
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (status === "authenticated" && user) {
      // Fetch profile data
      fetchProfileData()

      // Fetch courses
      fetch("/api/dashboard/courses")
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch courses")
          return res.json()
        })
        .then((data) => {
          if (data.success) {
            setCourses(data.data)
          }
        })
        .catch((err) => {
          console.error("Error fetching courses:", err)
          setError("Failed to load courses. Please try again later.")
        })

      // Fetch events
      fetch("/api/dashboard/events")
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch events")
          return res.json()
        })
        .then((data) => {
          if (data.success) {
            setEvents(data.data)
          }
        })
        .catch((err) => {
          console.error("Error fetching events:", err)
          setError("Failed to load events. Please try again later.")
        })
        .finally(() => setIsLoading(false))
    }
  }, [user, status, router, session])

  const getUserInitials = () => {
    if (!user?.name) return "TC"
    return user.name
      .split(" ")
      .map((name: string) => name[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  // Loading state
  if (status === "loading" || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-500">Loading your dashboard...</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-red-50 p-4 rounded-lg text-red-500 mb-4">
          <p>{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    )
  }

  // Calculate stats
  const totalCourses = courses.length
  const completedCourses = courses.filter((c) => c.status === "paid").length
  const upcomingEvents = events.filter((e) => new Date(e.events.start_date) > new Date() && e.status === "paid").length
  const totalSpent = courses.reduce(
    (sum, course) => (course.status === "paid" ? sum + Number(course.final_price) : sum),
    0,
  )

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      {/* Welcome Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="relative h-16 w-16 rounded-full overflow-hidden bg-gray-100">
            <Avatar className="h-full w-full">
              <AvatarImage
                src={userImage || ""}
                alt={user?.name || "User"}
                className="object-cover"
                onError={() => {
                  console.error("Failed to load dashboard avatar image:", userImage)
                }}
              />
              <AvatarFallback className="bg-blue-100 text-blue-500">{getUserInitials()}</AvatarFallback>
            </Avatar>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user?.name || "Student"}!</h1>
            <p className="text-gray-500">Here's an overview of your learning journey</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-full">
              <BookOpen className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Courses</p>
              <h3 className="text-2xl font-bold">{totalCourses}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Completed</p>
              <h3 className="text-2xl font-bold">{completedCourses}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-full">
              <Calendar className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Upcoming Events</p>
              <h3 className="text-2xl font-bold">{upcomingEvents}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-full">
              <CreditCard className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Investment</p>
              <h3 className="text-2xl font-bold">{formatCurrency(totalSpent)}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link href="/dashboard/courses" className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-full">
              <BookOpen className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold">My Courses</h3>
              <p className="text-gray-500 text-sm">Access your purchased courses</p>
            </div>
          </div>
        </Link>

        <Link href="/dashboard/event" className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-full">
              <Calendar className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <h3 className="font-semibold">My Events</h3>
              <p className="text-gray-500 text-sm">View your registered events</p>
            </div>
          </div>
        </Link>

        <Link href="/settings" className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-50 rounded-full">
              <Settings className="h-6 w-6 text-gray-500" />
            </div>
            <div>
              <h3 className="font-semibold">Account Settings</h3>
              <p className="text-gray-500 text-sm">Update your profile and password</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Courses */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Recent Courses</h2>
          <Link href="/dashboard/courses" className="text-blue-500 hover:text-blue-700 text-sm">
            View All
          </Link>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">You haven't purchased any courses yet.</p>
            <Link
              href="/kelas"
              className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.slice(0, 3).map((course) => (
              <Link
                key={course.id}
                href={`/kelas/${course.courses.slug}`}
                className="block bg-white border rounded-xl overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative h-40 w-full">
                  <Image
                    src={course.courses.thumbnail || "/placeholder.svg?height=160&width=320"}
                    alt={course.courses.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold line-clamp-1">{course.courses.title}</h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        course.status === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {course.status === "paid" ? "Paid" : "Unpaid"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">By {course.courses.mentors.name}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm font-medium">{formatCurrency(Number(course.final_price))}</span>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDate(course.created_at)}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Events */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Recent Events</h2>
          <Link href="/dashboard/event" className="text-blue-500 hover:text-blue-700 text-sm">
            View All
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">You haven't registered for any events yet.</p>
            <Link
              href="/event"
              className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.slice(0, 3).map((event) => (
              <Link
                key={event.id}
                href={`/event/${event.events.slug}`}
                className="block bg-white border rounded-xl overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative h-40 w-full">
                  <Image
                    src={event.events.thumbnail || "/placeholder.svg?height=160&width=320"}
                    alt={event.events.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold line-clamp-1">{event.events.title}</h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        event.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : event.status === "pending"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {event.status === "paid" ? "Confirmed" : event.status === "pending" ? "Pending" : "Rejected"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">By {event.events.mentors.name}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm font-medium">
                      {event.events.price ? formatCurrency(Number(event.events.price)) : "Free"}
                    </span>
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(event.events.start_date)}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

