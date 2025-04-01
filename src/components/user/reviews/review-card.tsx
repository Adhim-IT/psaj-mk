import { formatDistanceToNow } from "date-fns"
import { Star } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ReviewCardProps {
  name: string
  profilePicture?: string | null
  date: Date | string
  review: string
  rating?: number
  isPending?: boolean
}

export function ReviewCard({ name, profilePicture, date, review, rating, isPending = false }: ReviewCardProps) {
  const formattedDate = formatDistanceToNow(new Date(date), { addSuffix: true })

  // Get initials for avatar fallback
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)

  return (
    <Card className="border rounded-lg overflow-hidden">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profilePicture || ""} alt={name} />
              <AvatarFallback className="bg-[#5596DF]/10 text-[#5596DF]">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{name}</p>
              <p className="text-sm text-gray-500">{formattedDate}</p>
            </div>
          </div>

          {isPending && (
            <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
              Pending Approval
            </Badge>
          )}
        </div>

        {rating && (
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
              />
            ))}
          </div>
        )}

        <p className="text-gray-700">{review}</p>
      </CardContent>
    </Card>
  )
}

