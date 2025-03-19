import { getEvents } from "@/lib/list-event"
import ListEventsPage from "@/components/user/event/list-event"
import { Suspense } from "react"
import { Link } from "lucide-react"

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
      <h1 className="text-4xl md:text-5xl font-bold mb-4 md:ml-5 animate-fade-in-up">
        {title.split("").map((char, index) => (
          <span key={index} className="inline-block animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </h1>
      <div
        className="flex items-center gap-2 text-[#e6f0fc] md:ml-5 opacity-0 animate-fade-in"
        style={{ animationDelay: "400ms", animationFillMode: "forwards" }}
      >
        <Link href="/" className="hover:text-white transition-colors duration-300">
          Home
        </Link>
        <span>›</span>
        <span>{title}</span>
      </div>
    </div>
  </div>
)

export default async function EventsPage() {
  const response = await getEvents()

  return (
    <>
      <PageHeader title="Events" />
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
    </>
  )
}

