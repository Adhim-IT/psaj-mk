import { getMentorByUsername } from "@/lib/mentor"
import DetailMentor from "@/components/user/mentor/detail-mentor"
import { notFound } from "next/navigation"

interface MentorDetailPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: MentorDetailPageProps) {
  const { mentor } = await getMentorByUsername(params.slug)

  if (!mentor) {
    return {
      title: "Mentor Not Found | PSAJMK",
      description: "The mentor you're looking for could not be found",
    }
  }

  return {
    title: `${mentor.name} - ${mentor.specialization} | PSAJMK`,
    description: `Learn more about ${mentor.name}, an expert in ${mentor.specialization}`,
  }
}

export default async function MentorDetailPage({ params }: MentorDetailPageProps) {
  const { mentor } = await getMentorByUsername(params.slug)

  if (!mentor) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="bg-primary/5 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center">{mentor.name}</h1>
          <p className="text-center text-muted-foreground mt-4 max-w-2xl mx-auto">{mentor.specialization}</p>
        </div>
      </div>

      <DetailMentor mentor={mentor} />
    </main>
  )
}

