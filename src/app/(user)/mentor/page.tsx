import { getAllMentors } from "@/lib/mentor"
import ListMentor from "@/components/user/mentor/list-mentor"
import Link from "next/link"
import { ChevronRight } from 'lucide-react'

export const metadata = {
  title: "Our Mentors | PSAJMK",
  description: "Meet our expert mentors who will guide you through your learning journey",
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
      <h1 className="text-4xl md:text-5xl font-bold mb-4 md:ml-5">
        {title}
      </h1>
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

export default async function MentorPage() {
  const { mentors } = await getAllMentors()

  return (
    <main className="min-h-screen bg-background">
      <PageHeader title="Mentors" />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Learn From Industry Experts</h2>
          <p className="text-gray-600">
            Our mentors are industry professionals with years of experience in their respective fields.
            They are dedicated to helping you achieve your learning goals and advance your career.
          </p>
        </div>
        <ListMentor mentors={mentors} />
      </div>
    </main>
  )
}
