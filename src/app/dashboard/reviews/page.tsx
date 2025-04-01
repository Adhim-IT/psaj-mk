"use client"

import { Badge } from "@/components/ui/badge"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useUser } from "@/hooks/useUser"
import { BookOpen, Calendar, Loader2, Pencil, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CourseReviewModal } from "@/components/user/reviews/course-review-modal"
import { EventReviewModal } from "@/components/user/reviews/event-review-modal"
import { getUserCourseReviews, getUserEventReviews } from "@/lib/reviews"

// Update the CourseReview type to match what's coming from the server
type CourseReview = {
  id: string
  course_id: string
  rating: number
  review: string
  is_approved: boolean
  created_at: Date | null
  updated_at: Date | null
  student_id: string
  courses: {
    id: string
    title: string
    thumbnail: string
    slug: string
  }
}

// Update the EventReview type to match what's coming from the server
type EventReview = {
  id: string
  event_id: string
  review: string
  is_approved: boolean
  created_at: Date | null
  updated_at: Date | null
  student_id: string
  events: {
    id: string
    title: string
    thumbnail: string
    slug: string
  }
}

export default function ReviewsPage() {
  const { user, status } = useUser()
  const router = useRouter()

  const [courseReviews, setCourseReviews] = useState<CourseReview[]>([])
  const [eventReviews, setEventReviews] = useState<EventReview[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // Review modal state
  const [isCourseReviewModalOpen, setIsCourseReviewModalOpen] = useState(false)
  const [isEventReviewModalOpen, setIsEventReviewModalOpen] = useState(false)
  const [selectedCourseReview, setSelectedCourseReview] = useState<{
    id: string
    courseId: string
    title: string
    rating: number
    review: string
  } | null>(null)
  const [selectedEventReview, setSelectedEventReview] = useState<{
    id: string
    eventId: string
    title: string
    review: string
  } | null>(null)

  useEffect(() => {
    // Redirect if not authenticated
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (status === "authenticated" && user) {
      const fetchReviews = async () => {
        try {
          setIsLoading(true)

          // Fetch course reviews
          const courseReviewsResult = await getUserCourseReviews()
          if (courseReviewsResult.success) {
            setCourseReviews(courseReviewsResult.data || [])
          }

          // Fetch event reviews
          const eventReviewsResult = await getUserEventReviews()
          if (eventReviewsResult.success) {
            setEventReviews(eventReviewsResult.data || [])
          }
        } catch (err) {
          console.error("Error fetching reviews:", err)
          setError("Failed to load reviews. Please try again later.")
        } finally {
          setIsLoading(false)
        }
      }

      fetchReviews()
    }
  }, [user, status, router])

  const handleEditCourseReview = (review: CourseReview) => {
    setSelectedCourseReview({
      id: review.id,
      courseId: review.course_id,
      title: review.courses.title,
      rating: review.rating,
      review: review.review,
    })
    setIsCourseReviewModalOpen(true)
  }

  const handleEditEventReview = (review: EventReview) => {
    setSelectedEventReview({
      id: review.id,
      eventId: review.event_id,
      title: review.events.title,
      review: review.review,
    })
    setIsEventReviewModalOpen(true)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#5596DF] mb-4" />
        <p className="text-gray-500">Loading your reviews...</p>
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
  if (courseReviews.length === 0 && eventReviews.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 mt-20">
        <h1 className="text-2xl font-bold mb-6">My Reviews</h1>
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No reviews yet</h2>
          <p className="text-gray-500 mb-6">You haven't submitted any reviews yet.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard/courses">
              <Button className="bg-[#5596DF] hover:bg-blue-600">Review Courses</Button>
            </Link>
            <Link href="/dashboard/event">
              <Button variant="outline">Review Events</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <h1 className="text-2xl font-bold mb-6">My Reviews</h1>

      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="courses" className="data-[state=active]:bg-[#5596DF] data-[state=active]:text-white">
            <BookOpen className="w-4 h-4 mr-2" />
            Course Reviews
          </TabsTrigger>
          <TabsTrigger value="events" className="data-[state=active]:bg-[#5596DF] data-[state=active]:text-white">
            <Calendar className="w-4 h-4 mr-2" />
            Event Reviews
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses">
          {courseReviews.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No course reviews yet</h2>
              <p className="text-gray-500 mb-6">You haven't submitted any course reviews yet.</p>
              <Link href="/dashboard/courses">
                <Button className="bg-[#5596DF] hover:bg-blue-600">Go to My Courses</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courseReviews.map((review) => (
                <div key={review.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="flex items-center p-4 border-b">
                    <div className="relative h-16 w-16 rounded-md overflow-hidden mr-4">
                      <Image
                        src={review.courses.thumbnail || "/placeholder.svg?height=64&width=64"}
                        alt={review.courses.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium line-clamp-1">{review.courses.title}</h3>
                      <div className="flex items-center mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditCourseReview(review)}
                      className="text-gray-500 hover:text-[#5596DF]"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-700 mb-3">{review.review}</p>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>
                        {new Date(review.created_at || "").toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                      {!review.is_approved && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                          Pending Approval
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="events">
          {eventReviews.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No event reviews yet</h2>
              <p className="text-gray-500 mb-6">You haven't submitted any event reviews yet.</p>
              <Link href="/dashboard/event">
                <Button className="bg-[#5596DF] hover:bg-blue-600">Go to My Events</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {eventReviews.map((review) => (
                <div key={review.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="flex items-center p-4 border-b">
                    <div className="relative h-16 w-16 rounded-md overflow-hidden mr-4">
                      <Image
                        src={review.events.thumbnail || "/placeholder.svg?height=64&width=64"}
                        alt={review.events.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium line-clamp-1">{review.events.title}</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditEventReview(review)}
                      className="text-gray-500 hover:text-[#5596DF]"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-700 mb-3">{review.review}</p>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>
                        {new Date(review.created_at || "").toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                      {!review.is_approved && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                          Pending Approval
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Course Review Modal */}
      {selectedCourseReview && (
        <CourseReviewModal
          isOpen={isCourseReviewModalOpen}
          onClose={() => {
            setIsCourseReviewModalOpen(false)
            setSelectedCourseReview(null)
          }}
          courseId={selectedCourseReview.courseId}
          courseName={selectedCourseReview.title}
          existingReview={{
            id: selectedCourseReview.id,
            rating: selectedCourseReview.rating,
            review: selectedCourseReview.review,
          }}
        />
      )}

      {/* Event Review Modal */}
      {selectedEventReview && (
        <EventReviewModal
          isOpen={isEventReviewModalOpen}
          onClose={() => {
            setIsEventReviewModalOpen(false)
            setSelectedEventReview(null)
          }}
          eventId={selectedEventReview.eventId}
          eventName={selectedEventReview.title}
          existingReview={{
            id: selectedEventReview.id,
            review: selectedEventReview.review,
          }}
        />
      )}
    </div>
  )
}

