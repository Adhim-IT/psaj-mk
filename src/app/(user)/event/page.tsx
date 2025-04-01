import { getEvents } from "@/lib/list-event"
import ListEventsPage from "@/components/user/event/list-event"
import { Suspense } from "react"
import { ChevronRight, Calendar, Bell } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Events | Your Platform Name",
  description: "Browse all our upcoming events and workshops.",
}

const PageHeader = ({ title }: { title: string }) => (
  <div className="bg-gradient-to-r from-[#5596DF] to-[#6ba5e7] text-white py-32 px-6 mt-10 min-h-[300px] flex items-center relative overflow-hidden">
    {/* Animated background circles */}
    <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-white/10 rounded-full blur-xl animate-pulse"></div>
    <div className="absolute bottom-[-100px] left-[-20px] w-80 h-80 bg-white/5 rounded-full blur-xl animate-pulse delay-700"></div>

    {/* Floating shapes */}
    <div className="absolute top-1/4 right-1/4 w-12 h-12 bg-white/20 rounded-lg rotate-12 animate-bounce delay-300"></div>
    <div className="absolute bottom-1/3 right-1/3 w-8 h-8 bg-white/15 rounded-full animate-ping opacity-70 delay-1000"></div>
    <div className="absolute top-1/3 left-1/4 w-6 h-6 bg-white/10 rotate-45 animate-bounce delay-700"></div>

    <div className="container mx-auto max-w-7xl relative z-10">
      <h1 className="text-4xl md:text-5xl font-bold mb-4 md:ml-5">{title}</h1>
      <div className="flex items-center gap-2 text-[#e6f0fc] md:ml-5">
        <Link href="/" className="hover:text-white transition-colors duration-300">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span>{title}</span>
      </div>
    </div>
  </div>
)

const NoEventsMessage = () => (
  <div className="text-center py-16 px-4">
    <div className="bg-gray-50 rounded-xl p-8 max-w-2xl mx-auto border border-gray-100 shadow-sm">
      <div className="w-20 h-20 bg-[#EBF3FD] rounded-full flex items-center justify-center mx-auto mb-6">
        <Calendar className="h-10 w-10 text-[#5596DF]" />
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-3">Tidak Ada Acara Mendatang</h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Saat ini tidak ada acara yang dijadwalkan. Silakan periksa kembali nanti untuk acara dan workshop baru!
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
      </div>
    </div>
  </div>
)

export default async function EventsPage() {
  const response = await getEvents()

  // Filter out past events
  const currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0) // Set to beginning of today

  const upcomingEvents = response.success
    ? response.data.filter((event: any) => {
        // Assuming event.date is a string in a format like "YYYY-MM-DD"
        const eventDate = new Date(event.date)
        eventDate.setHours(0, 0, 0, 0) // Set to beginning of event day

        // Keep events that are today or in the future
        return eventDate >= currentDate
      })
    : []

  return (
    <>
      <PageHeader title="Events" />
      <main className="py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          

          <Suspense
            fallback={
              <div className="flex justify-center py-12">
                <div className="w-16 h-16 border-4 border-[#4A90E2] border-t-transparent rounded-full animate-spin"></div>
              </div>
            }
          >
            {response.success ? (
              upcomingEvents.length > 0 ? (
                <ListEventsPage events={upcomingEvents} />
              ) : (
                <NoEventsMessage />
              )
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Failed to load events. Please try again later.</p>
              </div>
            )}
          </Suspense>
        </div>
      </main>
    </>
  )
}

