import { getEventBySlug } from "@/lib/list-event"
import EventDetail from "@/components/user/event/detail-event"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

interface PageProps {
  params: {
    slug: string
  }
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = params

  try {
    const response = await getEventBySlug(slug)

    if (!response.success || !response.data) {
      notFound()
    }

    return (
      <main className="py-8">
        <EventDetail event={response.data} />
      </main>
    )
  } catch (error) {
    console.error("Error fetching event:", error)
    notFound()
  }
}

// Generate metadata for the page
export async function generateMetadata({ params }: PageProps) {
  const { slug } = params

  try {
    const response = await getEventBySlug(slug)

    if (!response.success || !response.data) {
      return {
        title: "Event Not Found",
        description: "The requested event could not be found.",
      }
    }

    const event = response.data

    return {
      title: `${event.title} | Your Platform Name`,
      description: event.description.substring(0, 160),
      openGraph: {
        title: event.title,
        description: event.description.substring(0, 160),
        images: [
          {
            url: event.thumbnail,
            width: 1200,
            height: 630,
            alt: event.title,
          },
        ],
      },
    }
  } catch (error) {
    return {
      title: "Event | Your Platform Name",
      description: "View our upcoming events.",
    }
  }
}

