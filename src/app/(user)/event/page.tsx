import { getEvents } from "@/lib/list-event"
import ListEventsPage from "@/components/user/event/list-event"
import { Suspense } from "react"

export const metadata = {
  title: "Events | Your Platform Name",
  description: "Browse all our upcoming events and workshops.",
}

export default async function EventsPage() {
  const response = await getEvents()

  return (
    <main className="py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-3xl md:text-4xl font-bold">Upcoming Events</h1>
          <p className="text-gray-600 mt-4">Join our events and workshops to enhance your skills</p>
        </div>

        <Suspense
          fallback={
            <div className="flex justify-center py-12">
              <div className="w-16 h-16 border-4 border-[#4A90E2] border-t-transparent rounded-full animate-spin"></div>
            </div>
          }
        >
          {response.success ? (
            <ListEventsPage events={response.data} />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Failed to load events. Please try again later.</p>
            </div>
          )}
        </Suspense>
      </div>
    </main>
  )
}

