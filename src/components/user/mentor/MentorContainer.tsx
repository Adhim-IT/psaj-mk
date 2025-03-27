import { getAllMentors } from "@/lib/mentor"
import MentorSection from "./Mentor"
import { cache } from "react"

// Cache the getAllMentors function to prevent unnecessary database calls
const getCachedMentors = cache(async () => {
  const { mentors } = await getAllMentors()
  return mentors
})

interface MentorContainerProps {
  maxMentors?: number
}

export default async function MentorContainer({ maxMentors }: MentorContainerProps) {
  // Fetch mentors with caching
  const mentors = await getCachedMentors()

  return (
    <div className="container mx-auto px-4 py-8">
      <MentorSection mentors={mentors} maxMentors={maxMentors} />
    </div>
  )
}

