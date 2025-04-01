"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Star } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { submitCourseReview } from "@/lib/reviews"
import Swal from "sweetalert2"

interface CourseReviewModalProps {
  isOpen: boolean
  onClose: () => void
  courseId: string
  courseName: string
  existingReview?: {
    id: string
    rating: number
    review: string
  }
}

export function CourseReviewModal({ isOpen, onClose, courseId, courseName, existingReview }: CourseReviewModalProps) {
  const router = useRouter()
  const [rating, setRating] = useState(existingReview?.rating || 0)
  const [review, setReview] = useState(existingReview?.review || "")
  const [hoveredRating, setHoveredRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) {
      Swal.fire({
        title: "Error",
        text: "Please select a rating",
        icon: "error",
        confirmButtonColor: "#5596DF",
      })
      return
    }

    if (review.trim().length < 5) {
      Swal.fire({
        title: "Error",
        text: "Review must be at least 5 characters",
        icon: "error",
        confirmButtonColor: "#5596DF",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const result = await submitCourseReview({
        courseId,
        rating,
        review,
      })

      if (result.success) {
        Swal.fire({
          title: "Success",
          text: result.message,
          icon: "success",
          confirmButtonColor: "#5596DF",
        })
        router.refresh()
        onClose()
      } else {
        Swal.fire({
          title: "Error",
          text: result.error,
          icon: "error",
          confirmButtonColor: "#5596DF",
        })
      }
    } catch (error) {
      console.error("Error submitting review:", error)
      Swal.fire({
        title: "Error",
        text: "Failed to submit review. Please try again.",
        icon: "error",
        confirmButtonColor: "#5596DF",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{existingReview ? "Edit Review" : "Write a Review"}</DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-6">
          <div>
            <h3 className="font-medium mb-2">Course: {courseName}</h3>
          </div>

          <div className="space-y-2">
            <label className="font-medium">Rating</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-8 h-8 cursor-pointer transition-colors ${
                    star <= (hoveredRating || rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                  }`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="review" className="font-medium">
              Your Review
            </label>
            <Textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your experience with this course..."
              rows={5}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-[#5596DF] hover:bg-[#4a89dc]">
            {isSubmitting ? "Submitting..." : existingReview ? "Update Review" : "Submit Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

