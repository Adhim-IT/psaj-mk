"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useUser } from "@/hooks/useUser"
import { BookOpen, Clock, Loader2, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CourseReviewModal } from "@/components/user/reviews/course-review-modal"
import { canReviewCourse } from "@/lib/reviews"
import Swal from "sweetalert2"

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
  }
}

export default function CoursesPage() {
  const { user, status } = useUser()
  const router = useRouter()

  const [transactions, setTransactions] = useState<CourseTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // Review modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<{
    id: string
    title: string
    existingReview?: {
      id: string
      rating: number
      review: string
    }
  } | null>(null)

  // Format currency to IDR
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  useEffect(() => {
    // Redirect if not authenticated
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (status === "authenticated" && user) {
      // Fetch courses
      fetch("/api/dashboard/courses")
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch courses")
          return res.json()
        })
        .then((data) => {
          if (data.success) {
            setTransactions(data.data)
          }
        })
        .catch((err) => {
          console.error("Error fetching courses:", err)
          setError("Failed to load courses. Please try again later.")
        })
        .finally(() => setIsLoading(false))
    }
  }, [user, status, router])

  const handleReviewClick = async (courseId: string, courseTitle: string) => {
    try {
      const result = await canReviewCourse(courseId)

      if (!result.canReview) {
        Swal.fire({
          title: "Cannot Review",
          text: "You can only review courses you have purchased and completed",
          icon: "info",
          confirmButtonColor: "#5596DF",
        })
        return
      }

      setSelectedCourse({
        id: courseId,
        title: courseTitle,
        existingReview: result.hasReviewed
          ? {
              id: result.reviewId!,
              rating: result.reviewData!.rating,
              review: result.reviewData!.review,
            }
          : undefined,
      })

      setIsReviewModalOpen(true)
    } catch (error) {
      console.error("Error checking if user can review course:", error)
      Swal.fire({
        title: "Error",
        text: "Failed to check review eligibility",
        icon: "error",
        confirmButtonColor: "#5596DF",
      })
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#5596DF] mb-4" />
        <p className="text-gray-500">Loading your courses...</p>
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
        <Button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[#5596DF] text-white rounded-md hover:bg-blue-600"
        >
          Try Again
        </Button>
      </div>
    )
  }

  // Empty state
  if (transactions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 mt-20">
        <h1 className="text-2xl font-bold mb-6">My Courses</h1>
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No courses yet</h2>
          <p className="text-gray-500 mb-6">You haven't purchased any courses yet.</p>
          <Link href="/kelas">
            <Button className="bg-[#5596DF] hover:bg-blue-600">Browse Courses</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <h1 className="text-2xl font-bold mb-6">My Courses</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {transactions.map((transaction) => (
          <Card
            key={transaction.id}
            className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="relative h-48 w-full">
              <Image
                src={transaction.courses.thumbnail || "/placeholder.svg?height=192&width=384"}
                alt={transaction.courses.title}
                fill
                className="object-cover"
              />
              <div className="absolute top-3 right-3">
                <Badge
                  className={`${
                    transaction.status === "paid"
                      ? "bg-green-100 text-green-800"
                      : transaction.status === "unpaid"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {transaction.status === "paid" ? "Paid" : transaction.status === "unpaid" ? "Unpaid" : "Failed"}
                </Badge>
              </div>
            </div>

            <CardContent className="p-5">
              <h2 className="text-lg font-semibold mb-2 line-clamp-2">{transaction.courses.title}</h2>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-1" />
                  <span>{transaction.courses.meetings} Meetings</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{formatDate(transaction.created_at)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-medium">{formatCurrency(Number(transaction.final_price))}</span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {transaction.courses.level}
                </Badge>
              </div>
            </CardContent>

            <CardFooter className="p-5 pt-0 flex justify-between gap-2">
              {transaction.status === "paid" ? (
                <>
                  <Link href={`/kelas/${transaction.courses.slug}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      View Course
                    </Button>
                  </Link>
                  <Button
                    onClick={() => handleReviewClick(transaction.courses.id, transaction.courses.title)}
                    className="bg-[#5596DF] hover:bg-blue-600"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Review
                  </Button>
                </>
              ) : (
                <Link href={`/checkout/payment?transaction=${transaction.id}`} className="w-full">
                  <Button className="w-full bg-[#5596DF] hover:bg-blue-600">Complete Payment</Button>
                </Link>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Review Modal */}
      {selectedCourse && (
        <CourseReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false)
            setSelectedCourse(null)
          }}
          courseId={selectedCourse.id}
          courseName={selectedCourse.title}
          existingReview={selectedCourse.existingReview}
        />
      )}
    </div>
  )
}

