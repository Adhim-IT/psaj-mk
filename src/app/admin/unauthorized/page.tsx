import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md p-6 space-y-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
        <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full dark:bg-red-900/20">
          <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">Access Denied</h1>
        <p className="text-center text-gray-600 dark:text-gray-400">
          You don't have permission to access this page. Please contact your administrator if you believe this is an
          error.
        </p>
        <div className="flex justify-center">
          <Button asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

