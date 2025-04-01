"use client"

import { useEffect, useState } from "react"
import { getPopularMentors } from "@/lib/mentor-userpage"
import ListMentor from "./list-mentor"
import type { Mentor } from "@/types"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface MentorHomepageProps {
  maxMentors?: number
}

export default function MentorHomepage({ maxMentors = 4 }: MentorHomepageProps) {
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setIsLoading(true)
        const { mentors: popularMentors } = await getPopularMentors(maxMentors)
        setMentors(popularMentors)
      } catch (err) {
        console.error("Error fetching popular mentors:", err)
        setError("Failed to load mentors. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMentors()
  }, [maxMentors])

  return (
    <section className="py-24 bg-gray-50 flex justify-center items-center">
      <div className="container mx-auto px-6 xl:px-8 max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[#4A90E2] font-semibold">Mentor Kami</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2">Belajar dari Ahlinya!</h2>
          <p className="text-gray-600 mt-4 text-lg">
            Para mentor yang berpengalaman di bidangnya siap membimbing kamu.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4A90E2]"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        ) : mentors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No mentors found.</p>
          </div>
        ) : (
          <div className="w-full">
            <ListMentor mentors={mentors} maxMentors={maxMentors} />
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/mentor"
            className="inline-flex items-center text-[#4A90E2] font-medium hover:text-[#3178c6] transition-colors"
          >
            Lihat Semua Mentor
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

