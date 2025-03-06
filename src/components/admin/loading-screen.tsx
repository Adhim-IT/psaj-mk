import { Loader2 } from "lucide-react"

export default function LoadingScreen() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        <p className="text-lg font-medium text-gray-700">Loading dashboard...</p>
      </div>
    </div>
  )
}

