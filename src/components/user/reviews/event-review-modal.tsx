"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { submitEventReview } from "@/lib/reviews"
import Swal from "sweetalert2"

interface EventReviewModalProps {
  isOpen: boolean
  onClose: () => void
  eventId: string
  eventName: string
  existingReview?: {
    id: string
    review: string
  }
}

export function EventReviewModal({ isOpen, onClose, eventId, eventName, existingReview }: EventReviewModalProps) {
  const router = useRouter()
  const [review, setReview] = useState(existingReview?.review || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
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
      const result = await submitEventReview({
        eventId,
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
            <h3 className="font-medium mb-2">Event: {eventName}</h3>
          </div>

          <div className="space-y-2">
            <label htmlFor="review" className="font-medium">
              Your Review
            </label>
            <Textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your experience with this event..."
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

