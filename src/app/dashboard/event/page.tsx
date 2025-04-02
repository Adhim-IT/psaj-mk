"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useUser } from "@/hooks/useUser"
import { Calendar, Clock, Loader2, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EventReviewModal } from "@/components/user/reviews/event-review-modal"
import { canReviewEvent } from "@/lib/reviews"
import Swal from "sweetalert2"
import PageHeader from "@/src/components/dashboard/page-header"

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
    whatsapp_group_link: string
  }
}

export default function EventsPage() {
  const { user, status } = useUser()
  const router = useRouter()

  const [registrations, setRegistrations] = useState<EventRegistration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // Review modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<{
    id: string
    title: string
    existingReview?: {
      id: string
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
      // Fetch events
      fetch("/api/dashboard/events")
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch events")
          return res.json()
        })
        .then((data) => {
          if (data.success) {
            setRegistrations(data.data)
          }
        })
        .catch((err) => {
          console.error("Error fetching events:", err)
          setError("Failed to load events. Please try again later.")
        })
        .finally(() => setIsLoading(false))
    }
  }, [user, status, router])

  const handleReviewClick = async (eventId: string, eventTitle: string) => {
    try {
      const result = await canReviewEvent(eventId)

      if (!result.canReview) {
        Swal.fire({
          title: "Cannot Review",
          text: "You can only review events you have registered for and attended",
          icon: "info",
          confirmButtonColor: "#5596DF",
        })
        return
      }

      setSelectedEvent({
        id: eventId,
        title: eventTitle,
        existingReview: result.hasReviewed
          ? {
              id: result.reviewId!,
              review: result.reviewData!.review,
            }
          : undefined,
      })

      setIsReviewModalOpen(true)
    } catch (error) {
      console.error("Error checking if user can review event:", error)
      Swal.fire({
        title: "Error",
        text: "Failed to check review eligibility",
        icon: "error",
        confirmButtonColor: "#5596DF",
      })
    }
  }

  const handleJoinWhatsApp = (whatsappLink: string) => {
    if (!whatsappLink) {
      Swal.fire({
        title: "WhatsApp Link Not Available",
        text: "The WhatsApp group link is not available yet. Please check back later.",
        icon: "info",
        confirmButtonColor: "#5596DF",
      })
      return
    }

    window.open(whatsappLink, "_blank")
  }

  // Loading state
  if (isLoading) {
    return (
      <>
        <PageHeader title="Event Saya" description="Akses dan kelola event yang telah Anda daftar" />
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-[#5596DF] mb-4" />
            <p className="text-gray-500">Loading your events...</p>
          </div>
        </div>
      </>
    )
  }

  // Error state
  if (error) {
    return (
      <>
        <PageHeader title="Event Saya" description="Akses dan kelola event yang telah Anda daftar" />
        <div className="container mx-auto px-4">
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
        </div>
      </>
    )
  }

  // Empty state
  if (registrations.length === 0) {
    return (
      <>
        <PageHeader title="Event Saya" description="Akses dan kelola event yang telah Anda daftar" />
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Belum ada event</h2>
            <p className="text-gray-500 mb-6">Anda belum mendaftar ke event apapun.</p>
            <Link href="/event">
              <Button className="bg-[#5596DF] hover:bg-blue-600">Jelajahi Event</Button>
            </Link>
          </div>
        </div>
      </>
    )
  }

  // Group events by status
  const upcomingEvents = registrations.filter(
    (reg) => reg.status === "paid" && new Date(reg.events.start_date) > new Date(),
  )
  const pastEvents = registrations.filter(
    (reg) => reg.status === "paid" && new Date(reg.events.start_date) <= new Date(),
  )
  const pendingEvents = registrations.filter((reg) => reg.status === "pending")
  const rejectedEvents = registrations.filter((reg) => reg.status === "rejected")

  return (
    <>
      <PageHeader title="Event Saya" description="Akses dan kelola event yang telah Anda daftar" />
      <div className="container mx-auto px-4 pb-8">
        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Event Mendatang</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((registration) => (
                <Card
                  key={registration.id}
                  className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-48 w-full">
                    <Image
                      src={registration.events.thumbnail || "/placeholder.svg?height=192&width=384"}
                      alt={registration.events.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
                    </div>
                  </div>

                  <CardContent className="p-5">
                    <h2 className="text-lg font-semibold mb-2 line-clamp-2">{registration.events.title}</h2>

                    <div className="flex flex-col gap-2 text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{formatDate(registration.events.start_date)}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>
                          {`${new Date(registration.events.start_date).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })} - ${new Date(registration.events.end_date).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })} WIB`}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {registration.events.price ? formatCurrency(Number(registration.events.price)) : "Free"}
                      </span>
                    </div>
                  </CardContent>

                  <CardFooter className="p-5 pt-0 flex justify-between gap-2">
                    <Link href={`/event/${registration.events.slug}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                    <Button
                      onClick={() => handleJoinWhatsApp(registration.events.whatsapp_group_link)}
                      className="bg-[#5596DF] hover:bg-blue-600"
                    >
                      Join WhatsApp
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Event Sebelumnya</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.map((registration) => (
                <Card
                  key={registration.id}
                  className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-48 w-full">
                    <Image
                      src={registration.events.thumbnail || "/placeholder.svg?height=192&width=384"}
                      alt={registration.events.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-gray-100 text-gray-800">Completed</Badge>
                    </div>
                  </div>

                  <CardContent className="p-5">
                    <h2 className="text-lg font-semibold mb-2 line-clamp-2">{registration.events.title}</h2>

                    <div className="flex flex-col gap-2 text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{formatDate(registration.events.start_date)}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>
                          {`${new Date(registration.events.start_date).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })} - ${new Date(registration.events.end_date).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })} WIB`}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {registration.events.price ? formatCurrency(Number(registration.events.price)) : "Free"}
                      </span>
                    </div>
                  </CardContent>

                  <CardFooter className="p-5 pt-0 flex justify-between gap-2">
                    <Link href={`/event/${registration.events.slug}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                    <Button
                      onClick={() => handleReviewClick(registration.events.id, registration.events.title)}
                      className="bg-[#5596DF] hover:bg-blue-600"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Review
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Pending Events */}
        {pendingEvents.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Pendaftaran Tertunda</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingEvents.map((registration) => (
                <Card
                  key={registration.id}
                  className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-48 w-full">
                    <Image
                      src={registration.events.thumbnail || "/placeholder.svg?height=192&width=384"}
                      alt={registration.events.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-amber-100 text-amber-800">Pending</Badge>
                    </div>
                  </div>

                  <CardContent className="p-5">
                    <h2 className="text-lg font-semibold mb-2 line-clamp-2">{registration.events.title}</h2>

                    <div className="flex flex-col gap-2 text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{formatDate(registration.events.start_date)}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>
                          {`${new Date(registration.events.start_date).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })} - ${new Date(registration.events.end_date).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })} WIB`}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {registration.events.price ? formatCurrency(Number(registration.events.price)) : "Free"}
                      </span>
                    </div>
                  </CardContent>

                  <CardFooter className="p-5 pt-0">
                    <Link href={`/event/${registration.events.slug}`} className="w-full">
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Rejected Events */}
        {rejectedEvents.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Pendaftaran Ditolak</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rejectedEvents.map((registration) => (
                <Card
                  key={registration.id}
                  className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-48 w-full">
                    <Image
                      src={registration.events.thumbnail || "/placeholder.svg?height=192&width=384"}
                      alt={registration.events.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-red-100 text-red-800">Rejected</Badge>
                    </div>
                  </div>

                  <CardContent className="p-5">
                    <h2 className="text-lg font-semibold mb-2 line-clamp-2">{registration.events.title}</h2>

                    <div className="flex flex-col gap-2 text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{formatDate(registration.events.start_date)}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>
                          {`${new Date(registration.events.start_date).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })} - ${new Date(registration.events.end_date).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })} WIB`}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {registration.events.price ? formatCurrency(Number(registration.events.price)) : "Free"}
                      </span>
                    </div>
                  </CardContent>

                  <CardFooter className="p-5 pt-0">
                    <Link href={`/event/${registration.events.slug}`} className="w-full">
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Review Modal */}
        {selectedEvent && (
          <EventReviewModal
            isOpen={isReviewModalOpen}
            onClose={() => {
              setIsReviewModalOpen(false)
              setSelectedEvent(null)
            }}
            eventId={selectedEvent.id}
            eventName={selectedEvent.title}
            existingReview={selectedEvent.existingReview}
          />
        )}
      </div>
    </>
  )
}

