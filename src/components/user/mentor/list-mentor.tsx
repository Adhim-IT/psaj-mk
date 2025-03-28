"use client"

import Image from "next/image"
import Link from "next/link"
import type { Mentor } from "@/types"

interface ListMentorProps {
  mentors: Mentor[]
  maxMentors?: number
}

export default function ListMentor({ mentors, maxMentors }: ListMentorProps) {
  // Limit the number of mentors if maxMentors is provided
  const displayedMentors = maxMentors ? mentors.slice(0, maxMentors) : mentors

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {displayedMentors.map((mentor) => (
        <Link href={`/mentor/${mentor.username}`} key={mentor.id} className="block">
          <div className="relative rounded-2xl overflow-hidden shadow-md text-center transition-all duration-500 transform hover:scale-[1.05] hover:shadow-2xl h-full group">
            <div className="relative w-full aspect-[9/15] overflow-hidden rounded-lg">
              <Image
                src={mentor.profile_picture || "/placeholder.svg?height=450&width=300"}
                alt={mentor.name}
                fill
                className="rounded-lg object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent transition-opacity duration-500 group-hover:opacity-100"></div>
            </div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center text-white transition-opacity duration-500 opacity-100 group-hover:opacity-0">
              <h3 className="text-lg font-semibold">{mentor.name}</h3>
              <p className="text-sm">{mentor.specialization}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

