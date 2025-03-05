"use client"

import Image from "next/image"
import Link from "next/link"
import { Calendar, Clock, MapPin, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

// Helper function for consistent number formatting
function formatPrice(price: number): string {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

// Sample events data
const events = [
  {
    id: 1,
    title: "Web Development Workshop",
    description: "Belajar membuat website responsive dengan HTML, CSS, dan JavaScript dalam workshop intensif 2 hari.",
    image: "/placeholder.svg?height=200&width=400",
    date: "15 April 2025",
    time: "09:00 - 16:00 WIB",
    location: "Online via Zoom",
    category: "Workshop",
    isFree: false,
    price: 150000,
    registrationUrl: "/event/web-development-workshop",
  },
  {
    id: 2,
    title: "Tech Talk: Future of AI",
    description:
      "Diskusi mendalam tentang perkembangan AI terkini dan bagaimana pengaruhnya terhadap industri teknologi di masa depan.",
    image: "/placeholder.svg?height=200&width=400",
    date: "22 April 2025",
    time: "19:00 - 21:00 WIB",
    location: "Online via Zoom",
    category: "Webinar",
    isFree: true,
    price: 0,
    registrationUrl: "/event/tech-talk-ai",
  },
  {
    id: 3,
    title: "Hackathon: Solusi Teknologi untuk Pendidikan",
    description:
      "Kompetisi pengembangan aplikasi untuk memecahkan masalah di bidang pendidikan dengan hadiah total Rp 50 juta.",
    image: "/placeholder.svg?height=200&width=400",
    date: "5-7 Mei 2025",
    time: "48 jam non-stop",
    location: "Jakarta Digital Valley",
    category: "Competition",
    isFree: false,
    price: 200000,
    registrationUrl: "/event/hackathon-edtech",
  },
]

interface UpcomingEventsProps {
  maxEvents?: number
}

export default function UpcomingEvents({ maxEvents = 3 }: UpcomingEventsProps) {
  const displayedEvents = events.slice(0, maxEvents)

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-6 xl:px-8 max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[#4A90E2] font-semibold">Event</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2">Event Mendatang</h2>
          <p className="text-gray-600 mt-4 text-lg">
            Ikuti berbagai event menarik untuk mengembangkan skill dan memperluas jaringan
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col"
            >
              <div className="relative h-48">
                <Image src={event.image || "/placeholder.svg"} alt={event.title} fill className="object-cover" />
                <div className="absolute top-3 left-3 bg-[#4A90E2] px-3 py-1 rounded-full text-xs font-medium text-white">
                  {event.category}
                </div>
                {event.isFree && (
                  <div className="absolute top-3 right-3 bg-green-500 px-3 py-1 rounded-full text-xs font-medium text-white">
                    Gratis
                  </div>
                )}
              </div>
              <div className="p-6 flex-grow">
                <h3 className="font-bold text-xl mb-3">{event.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{event.description}</p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-2 text-[#4A90E2]" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-2 text-[#4A90E2]" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="w-4 h-4 mr-2 text-[#4A90E2]" />
                    <span>{event.location}</span>
                  </div>
                </div>
              </div>
              <div className="p-6 pt-0 mt-auto">
                {!event.isFree && (
                  <p className="text-[#4A90E2] font-bold text-lg mb-3">Rp {formatPrice(event.price)}</p>
                )}
                <Button asChild className="w-full bg-[#4A90E2] hover:bg-[#3178c6]">
                  <Link href={event.registrationUrl}>Daftar Sekarang</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/event"
            className="inline-flex items-center text-[#4A90E2] font-medium hover:text-[#3178c6] transition-colors"
          >
            Lihat Semua Event
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

