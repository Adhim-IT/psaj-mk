import { getMentorByUsername } from "@/lib/mentor"
import DetailMentor from "@/src/components/user/mentor/detail-mentor"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

interface MentorDetailPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: MentorDetailPageProps): Promise<Metadata> {
  const { mentor } = await getMentorByUsername(params.slug)

  if (!mentor) {
    return {
      title: "Mentor Not Found | PSAJMK",
      description: "The mentor you are looking for could not be found.",
    }
  }

  return {
    title: `${mentor.name} - ${mentor.specialization} | PSAJMK`,
    description: mentor.bio?.substring(0, 160) || `Learn from ${mentor.name}, an expert in ${mentor.specialization}`,
  }
}

const PageHeader = ({ title, mentorName }: { title: string; mentorName: string }) => (
  <div className="bg-gradient-to-r from-[#5596DF] to-[#6ba5e7] text-white py-20 px-6 mt-10 min-h-[200px] flex items-center relative overflow-hidden">
    {/* Animated background circles */}
    <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-white/10 rounded-full blur-xl animate-pulse"></div>
    <div className="absolute bottom-[-100px] left-[-20px] w-80 h-80 bg-white/5 rounded-full blur-xl animate-pulse delay-700"></div>

    <div className="container mx-auto max-w-7xl relative z-10">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">{mentorName}</h1>
      <div className="flex items-center gap-2 text-[#e6f0fc]">
        <Link href="/" className="hover:text-white transition-colors duration-300">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/mentor" className="hover:text-white transition-colors duration-300">
          {title}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span>{mentorName}</span>
      </div>
    </div>
  </div>
)

export default async function MentorDetailPage({ params }: MentorDetailPageProps) {
  const { mentor, courses, courseGroups, events } = await getMentorByUsername(params.slug)

  if (!mentor) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-background">
      <PageHeader title="Mentors" mentorName={mentor.name} />
      <div className="py-8">
        <DetailMentor mentor={mentor} courses={courses} courseGroups={courseGroups} events={events} />
      </div>
    </main>
  )
}

