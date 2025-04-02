import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface PageHeaderProps {
  title: string
  description?: string
}

export default function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="bg-[#5596DF] text-white py-20 px-4 md:px-8 mb-8 rounded-b-lg shadow-md">
      <div className="container mx-auto">
        <div className="flex flex-col space-y-3">
          <Link href="/dashboard" className="flex items-center text-white/90 hover:text-white transition-colors w-fit">
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Kembali ke Dashboard</span>
          </Link>

          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
            {description && <p className="text-white/80 mt-2">{description}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

