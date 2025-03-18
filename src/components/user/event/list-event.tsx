"use client"

import { ArrowRight, Calendar, Clock, MapPin, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

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
  event_registrants: { id: string }[]
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

export default function ListEventsPage({ events, maxEvents }: { events: Event[]; maxEvents?: number }) {
  const displayEvents = maxEvents ? events.slice(0, maxEvents) : events

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Tidak ada event yang tersedia saat ini.</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayEvents.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col"
          >
            <div className="relative h-48">
              <Image src={event.thumbnail || "/placeholder.svg"} alt={event.title} fill className="object-cover" />
              {!event.price && (
                <div className="absolute top-3 right-3 bg-green-500 px-3 py-1 rounded-full text-xs font-medium text-white">
                  Gratis
                </div>
              )}
              {event.event_registrants && (
                <div className="absolute bottom-3 left-3 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-800 flex items-center">
                  <User className="w-3 h-3 mr-1" />
                  {event.event_registrants.length} Peserta
                </div>
              )}
            </div>
            <div className="p-6 flex-grow">
              <h3 className="font-bold text-xl mb-3 line-clamp-2">{event.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-2 text-[#4A90E2]" />
                  <span>{formatDate(event.start_date)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
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
                {event.mentors && (
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="w-4 h-4 mr-2 text-[#4A90E2]" />
                    <span>{event.mentors.name}</span>
                    {event.mentors.specialization && (
                      <span className="ml-1 text-gray-400">• {event.mentors.specialization}</span>
                    )}
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="w-4 h-4 mr-2 text-[#4A90E2]" />
                  <span>Online via WhatsApp Group</span>
                </div>
              </div>
            </div>
            <div className="p-6 pt-0 mt-auto">
              {event.price ? (
                <p className="text-[#4A90E2] font-bold text-lg mb-3">Rp {formatPrice(event.price)}</p>
              ) : (
                <p className="text-green-500 font-bold text-lg mb-3">Gratis</p>
              )}
              <Button asChild className="w-full bg-[#4A90E2] hover:bg-[#3178c6]">
                <Link href={`/event/${event.slug}`}>Daftar Sekarang</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
      {!maxEvents && events.length > 0 && (
        <div className="mt-12 text-center">
          <Link
            href="/event"
            className="inline-flex items-center text-[#4A90E2] font-medium hover:text-[#3178c6] transition-colors"
          >
            Lihat Semua Event
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      )}
    </>
  )
}

