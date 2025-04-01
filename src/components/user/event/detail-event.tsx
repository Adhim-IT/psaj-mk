"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Share2, User, Users } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { EventRegistrationModal } from "./event-registration-modal"
import Swal from "sweetalert2"
import { isAuthenticated, isStudent } from "@/lib/auth"
import { useRouter } from "next/navigation"
import EventReviews from "./event-reviews"

interface Mentor {
  id: string
  name: string
  specialization: string | null
  profile_picture: string | null
}

interface Event {
  id: string
  title: string
  slug: string
  description: string
  thumbnail: string
  start_date: Date
  end_date: Date
  price: number | null
  whatsapp_group_link: string
  is_active: boolean
  mentors: Mentor
  event_registrants?: { id: string }[]
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date))
}

const formatPrice = (price: number) => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

export default function EventDetail({ event }: { event: Event }) {
  const [copied, setCopied] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [registrationStatus, setRegistrationStatus] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false)
  const [isUserStudent, setIsUserStudent] = useState(false)
  const router = useRouter()

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRegister = async () => {
    // If user is already registered and payment is confirmed, redirect to WhatsApp
    if (registrationStatus === "paid") {
      window.open(event.whatsapp_group_link, "_blank")
      return
    }

    // If user already has a pending registration, show message
    if (registrationStatus === "pending") {
      Swal.fire({
        title: "Pendaftaran Dalam Proses",
        text: "Anda sudah mendaftar untuk event ini. Menunggu konfirmasi admin.",
        icon: "info",
        confirmButtonColor: "#4A90E2",
      })
      return
    }

    // If user's registration was rejected, show message
    if (registrationStatus === "rejected") {
      Swal.fire({
        title: "Pendaftaran Ditolak",
        text: "Pendaftaran Anda untuk event ini telah ditolak. Silakan hubungi admin untuk informasi lebih lanjut.",
        icon: "error",
        confirmButtonColor: "#4A90E2",
      })
      return
    }

    // Check if user is authenticated
    if (!isUserAuthenticated) {
      Swal.fire({
        title: "Login Diperlukan",
        text: "Anda harus login terlebih dahulu untuk mendaftar event ini",
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Login Sekarang",
        cancelButtonText: "Batal",
        confirmButtonColor: "#4A90E2",
      }).then((result) => {
        if (result.isConfirmed) {
          // Redirect to login page with return URL
          router.push(`/login?returnUrl=/events/${event.slug}`)
        }
      })
      return
    }

    // Check if user is a student
    if (!isUserStudent) {
      Swal.fire({
        title: "Profil Belum Lengkap",
        text: "Anda harus melengkapi profil sebagai student terlebih dahulu",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Lengkapi Profil",
        cancelButtonText: "Batal",
        confirmButtonColor: "#4A90E2",
      }).then((result) => {
        if (result.isConfirmed) {
          // Redirect to complete profile page
          router.push("/profile/complete")
        }
      })
      return
    }

    try {
      // Use the event status API instead of a separate check registration API
      // This avoids having to create a new API endpoint
      const response = await fetch(`/api/event-status/${event.id}`)
      if (!response.ok) {
        throw new Error("Failed to check registration status")
      }

      const data = await response.json()

      if (data.registered) {
        // User is already registered, show appropriate message based on status
        if (data.status === "pending") {
          Swal.fire({
            title: "Pendaftaran Dalam Proses",
            text: "Anda sudah mendaftar untuk event ini. Menunggu konfirmasi admin.",
            icon: "info",
            confirmButtonColor: "#4A90E2",
          })
        } else if (data.status === "paid") {
          Swal.fire({
            title: "Sudah Terdaftar",
            text: "Anda sudah terdaftar dan pembayaran sudah dikonfirmasi.",
            icon: "success",
            confirmButtonColor: "#4A90E2",
          })
        } else if (data.status === "rejected") {
          Swal.fire({
            title: "Pendaftaran Ditolak",
            text: "Pendaftaran Anda untuk event ini telah ditolak.",
            icon: "error",
            confirmButtonColor: "#4A90E2",
          })
        }
        return
      }

      // If not registered, open the registration modal
      setIsModalOpen(true)
    } catch (error) {
      console.error("Error checking registration:", error)
      Swal.fire({
        title: "Error",
        text: "Terjadi kesalahan saat memeriksa status pendaftaran",
        icon: "error",
        confirmButtonColor: "#4A90E2",
      })
    }
  }

  const handleSubmitRegistration = async (phoneNumber: string, paymentProof: File | null) => {
    const formData = new FormData()
    formData.append("eventId", event.id)
    formData.append("phoneNumber", phoneNumber)

    if (paymentProof) {
      formData.append("paymentProof", paymentProof)
    }

    try {
      const response = await fetch("/api/event-registration", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()

        // Handle specific error cases
        if (response.status === 409) {
          throw new Error("Anda sudah terdaftar untuk event ini")
        } else {
          throw new Error(errorData.error || "Gagal mendaftar")
        }
      }

      // Update registration status
      await checkRegistrationStatus()
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  }

  const checkRegistrationStatus = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/event-status/${event.id}`)
      const data = await response.json()

      if (data.registered) {
        setRegistrationStatus(data.status)
      } else {
        setRegistrationStatus(null)
      }
    } catch (error) {
      console.error("Error checking registration status:", error)
      Swal.fire({
        title: "Error",
        text: "Gagal memeriksa status pendaftaran",
        icon: "error",
        confirmButtonColor: "#4A90E2",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        const authenticated = await isAuthenticated()
        setIsUserAuthenticated(authenticated)

        if (authenticated) {
          const studentStatus = await isStudent()
          setIsUserStudent(studentStatus)

          // If user is authenticated and is a student, check registration status
          if (studentStatus) {
            await checkRegistrationStatus()
          } else {
            setIsLoading(false)
          }
        } else {
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Error checking authentication:", error)
        setIsLoading(false)
      }
    }

    checkAuth()

    // Poll for status updates every 30 seconds if pending
    const intervalId = setInterval(() => {
      if (isUserAuthenticated && isUserStudent && registrationStatus === "pending") {
        checkRegistrationStatus()
      }
    }, 30000)

    return () => clearInterval(intervalId)
  }, [event.id, registrationStatus])

  const getButtonText = () => {
    if (isLoading) return "Memuat..."
    if (registrationStatus === "paid") return "Masuk Grup WhatsApp"
    if (registrationStatus === "pending") return "Menunggu Konfirmasi"
    if (registrationStatus === "rejected") return "Pendaftaran Ditolak"
    return "Daftar Sekarang"
  }

  const isButtonDisabled = isLoading || registrationStatus === "rejected"

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl mt-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden mb-6">
            <Image src={event.thumbnail || "/placeholder.svg"} alt={event.title} fill className="object-cover" />
          </div>

          <h1 className="text-3xl font-bold mb-4">{event.title}</h1>

          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-full">
              <Calendar className="w-4 h-4 mr-2 text-[#4A90E2]" />
              <span>{formatDate(event.start_date)}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-full">
              <Clock className="w-4 h-4 mr-2 text-[#4A90E2]" />
              <span>
                {`${new Date(event.start_date).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })} - ${new Date(event.end_date).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })} WIB`}
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-full">
              <MapPin className="w-4 h-4 mr-2 text-[#4A90E2]" />
              <span>Online via WhatsApp Group</span>
            </div>
            {event.event_registrants && (
              <div className="flex items-center text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-full">
                <Users className="w-4 h-4 mr-2 text-[#4A90E2]" />
                <span>{event.event_registrants.length} Peserta</span>
              </div>
            )}
          </div>

          <div className="prose max-w-none mb-8">
            <div dangerouslySetInnerHTML={{ __html: event.description }} />
          </div>

          {/* Mentor Section */}
          {event.mentors && (
            <div className="bg-gray-50 p-6 rounded-xl mb-8">
              <h3 className="text-xl font-semibold mb-4">Mentor</h3>
              <div className="flex items-center">
                <Avatar className="h-16 w-16 mr-4">
                  <AvatarImage
                    src={
                      event.mentors.profile_picture ||
                      "https://res.cloudinary.com/dtrfxupze/image/upload/v1742300883/Group_33_2_xbwbi0.png"
                    }
                    alt={event.mentors.name}
                  />
                  <AvatarFallback>{event.mentors.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium text-lg">{event.mentors.name}</h4>
                  {event.mentors.specialization && <p className="text-gray-600">{event.mentors.specialization}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Reviews Section */}
          <div className="bg-gray-50 p-6 rounded-xl mb-8">
            <h3 className="text-xl font-semibold mb-4">Reviews</h3>
            <div className="space-y-4" id="event-reviews">
              {/* Reviews will be loaded dynamically */}
              <EventReviews eventId={event.id} />
            </div>
          </div>

          <Button onClick={handleShare} variant="outline" className="flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            {copied ? "Link Disalin!" : "Bagikan Event"}
          </Button>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
            <h3 className="text-xl font-bold mb-4">Informasi Pendaftaran</h3>

            {event.price ? (
              <div className="mb-6">
                <p className="text-gray-600 mb-1">Biaya Pendaftaran</p>
                <p className="text-2xl font-bold text-[#4A90E2]">Rp {formatPrice(event.price)}</p>
              </div>
            ) : (
              <div className="mb-6">
                <p className="text-gray-600 mb-1">Biaya Pendaftaran</p>
                <p className="text-2xl font-bold text-green-500">Gratis</p>
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-gray-600 mb-1">Tanggal</p>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-[#4A90E2]" />
                  <p>{formatDate(event.start_date)}</p>
                </div>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Waktu</p>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-[#4A90E2]" />
                  <p>
                    {`${new Date(event.start_date).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })} - ${new Date(event.end_date).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })} WIB`}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Lokasi</p>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-[#4A90E2]" />
                  <p>Online via WhatsApp Group</p>
                </div>
              </div>
              {event.mentors && (
                <div>
                  <p className="text-gray-600 mb-1">Mentor</p>
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2 text-[#4A90E2]" />
                    <p>{event.mentors.name}</p>
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={handleRegister}
              disabled={isButtonDisabled}
              className={`w-full ${
                registrationStatus === "paid" ? "bg-green-500 hover:bg-green-600" : "bg-[#4A90E2] hover:bg-[#3178c6]"
              } ${registrationStatus === "pending" ? "opacity-70" : ""} ${
                registrationStatus === "rejected" ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {getButtonText()}
            </Button>

            {registrationStatus === "rejected" && (
              <p className="text-red-500 text-sm mt-2 text-center">
                Pembayaran Anda ditolak. Silakan hubungi admin untuk informasi lebih lanjut.
              </p>
            )}

            {registrationStatus === "pending" && (
              <p className="text-amber-500 text-sm mt-2 text-center">Menunggu konfirmasi pembayaran dari admin.</p>
            )}
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      <EventRegistrationModal
        event={event}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitRegistration}
      />
    </div>
  )
}

