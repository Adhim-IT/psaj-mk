"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Share2, User, Users } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

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

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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

            <Button asChild className="w-full bg-[#4A90E2] hover:bg-[#3178c6]">
              <Link href={`/checkout?event_id=${event.id}`}>Daftar Sekarang</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

