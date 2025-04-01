"use client"

import { ArrowRight, Calendar, Clock, MapPin, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { RichTextContent } from "@/components/rich-text-content"

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
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Calendar className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Tidak ada event</h3>
        <p className="text-gray-500 text-center max-w-md">
          Tidak ada event yang tersedia saat ini. Silakan periksa kembali nanti untuk event terbaru.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-[#4A90E2] to-[#5A5AE2] bg-clip-text text-transparent">
          Upcoming Events
        </h1>
        <p className="text-gray-600 mt-4 text-lg">
          Join our events and workshops to enhance your skills and connect with experts
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayEvents.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col border border-gray-100"
          >
            <div className="relative h-52 overflow-hidden group">
              <Image
                src={event.thumbnail || "/placeholder.svg"}
                alt={event.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {!event.price ? (
                <Badge className="absolute top-4 right-4 bg-green-500 hover:bg-green-600 px-3 py-1">Gratis</Badge>
              ) : (
                <Badge className="absolute top-4 right-4 bg-[#4A90E2] hover:bg-[#3178c6] px-3 py-1">
                  Rp {formatPrice(event.price)}
                </Badge>
              )}

              {event.event_registrants && event.event_registrants.length > 0 && (
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium text-gray-800 flex items-center shadow-sm">
                  <User className="w-3.5 h-3.5 mr-1.5 text-[#4A90E2]" />
                  {event.event_registrants.length} Peserta
                </div>
              )}
            </div>

            <div className="p-6 flex-grow">
              <h3 className="font-bold text-xl mb-3 line-clamp-2 text-gray-800 group-hover:text-[#4A90E2] transition-colors">
                {event.title}
              </h3>
              <div className="text-gray-600 text-sm mb-5 line-clamp-2">
                {typeof event.description === "string" ? (
                  <RichTextContent content={event.description} />
                ) : (
                  <p>{event.description}</p>
                )}
              </div>

              <div className="space-y-3 mb-5">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3 flex-shrink-0">
                    <Calendar className="w-4 h-4 text-[#4A90E2]" />
                  </div>
                  <span>{formatDate(event.start_date)}</span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3 flex-shrink-0">
                    <Clock className="w-4 h-4 text-[#4A90E2]" />
                  </div>
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
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3 flex-shrink-0">
                      <User className="w-4 h-4 text-[#4A90E2]" />
                    </div>
                    <div>
                      <span className="font-medium">{event.mentors.name}</span>
                      {event.mentors.specialization && (
                        <span className="block text-xs text-gray-500 mt-0.5">{event.mentors.specialization}</span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3 flex-shrink-0">
                    <MapPin className="w-4 h-4 text-[#4A90E2]" />
                  </div>
                  <span>Online via WhatsApp Group</span>
                </div>
              </div>
            </div>

            <div className="px-6 pb-6">
              <Button asChild className="w-full bg-[#4A90E2] hover:bg-[#3178c6] shadow-sm group">
                <Link href={`/event/${event.slug}`} className="flex items-center justify-center">
                  Daftar Sekarang
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </>
  )
}

