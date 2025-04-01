"use client"

import { useState, useEffect } from "react"
import { Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ReviewCard } from "../reviews/review-card"
import { CourseReviewModal } from "../reviews/course-review-modal"
import { useRouter } from "next/navigation"

interface CourseReview {
  id: string
  rating: number
  review: string
  created_at: string
  students: {
    name: string
    profile_picture: string | null
  }
}

interface CourseReviewsProps {
  courseId: string
  courseName: string
}

export default function CourseReviews({ courseId, courseName }: CourseReviewsProps) {
  const [reviews, setReviews] = useState<CourseReview[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [canReview, setCanReview] = useState(false)
  const [hasReviewed, setHasReviewed] = useState(false)
  const [existingReview, setExistingReview] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [averageRating, setAverageRating] = useState(0)
  const router = useRouter()

  // Fetch reviews and check if user can review
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true)
        // Fetch reviews
        const reviewsResponse = await fetch(`/api/reviews/course?courseId=${courseId}`)
        if (!reviewsResponse.ok) {
          throw new Error("Failed to fetch reviews")
        }
        const reviewsData = await reviewsResponse.json()
        setReviews(reviewsData.data || [])

        // Calculate average rating
        if (reviewsData.data && reviewsData.data.length > 0) {
          const totalRating = reviewsData.data.reduce((sum: number, review: CourseReview) => sum + review.rating, 0)
          setAverageRating(Number.parseFloat((totalRating / reviewsData.data.length).toFixed(1)))
        }

        // Check if user can review
        const eligibilityResponse = await fetch(`/api/reviews/course?courseId=${courseId}&checkEligibility=true`)
        if (eligibilityResponse.ok) {
          const eligibilityData = await eligibilityResponse.json()
          setCanReview(eligibilityData.canReview || false)
          setHasReviewed(eligibilityData.hasReviewed || false)
          if (eligibilityData.reviewData) {
            setExistingReview(eligibilityData.reviewData)
          }
        }
      } catch (err) {
        console.error("Error fetching reviews:", err)
        setError("Failed to load reviews")
      } finally {
        setIsLoading(false)
      }
    }

    fetchReviews()
  }, [courseId])

  const handleOpenReviewModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseReviewModal = () => {
    setIsModalOpen(false)
    // Refresh reviews after modal is closed
    router.refresh()
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5596DF]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div>
      {reviews.length > 0 ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Student Reviews</h3>
            <div className="flex items-center">
              <div className="flex items-center mr-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="font-medium">{averageRating}</span>
            </div>
          </div>

          <div className="flex justify-end mb-4">
            {canReview && (
              <Button
                onClick={handleOpenReviewModal}
                variant="outline"
                className="text-[#5596DF] border-[#5596DF] hover:bg-[#5596DF]/10"
              >
                {hasReviewed ? "Edit Your Review" : "Write a Review"}
              </Button>
            )}
          </div>

          <div className="grid gap-4">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                name={review.students.name}
                profilePicture={review.students.profile_picture}
                date={review.created_at}
                review={review.review}
                rating={review.rating}
              />
            ))}
          </div>
        </div>
      ) : (
        <div>
          <Card className="border border-dashed rounded-xl overflow-hidden">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Star className="w-8 h-8 text-muted-foreground/40" />
              </div>
              <p className="text-muted-foreground mb-4">Belum ada review untuk kelas ini</p>
              {canReview && (
                <Button onClick={handleOpenReviewModal} className="bg-[#5596DF] hover:bg-[#4a89dc] text-white">
                  {hasReviewed ? "Edit Your Review" : "Jadilah yang pertama memberi review"}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Review Modal */}
      {canReview && (
        <CourseReviewModal
          isOpen={isModalOpen}
          onClose={handleCloseReviewModal}
          courseId={courseId}
          courseName={courseName}
          existingReview={existingReview}
        />
      )}
    </div>
  )
}

