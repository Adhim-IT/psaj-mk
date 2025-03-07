import type React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Activity {
  userName: string
  userAvatar: string
  action: string
  time: string
}

interface RecentActivityProps extends React.HTMLAttributes<HTMLDivElement> {
  activities?: Activity[]
}

export function RecentActivity({ className, activities = [], ...props }: RecentActivityProps) {
  // Use provided activities or fallback to empty array
  const displayedActivities =
    activities.length > 0
      ? activities
      : [
          {
            userName: "No recent activity",
            userAvatar: "/placeholder.svg",
            action: "No actions recorded yet",
            time: "-",
          },
        ]

  return (
    <Card className={className} {...props}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-medium">Aktivitas Terbaru</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Aktivitas pengguna terbaru dalam sistem
            </CardDescription>
          </div>
          <select className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option>Hari Ini</option>
            <option>Semua</option>
          </select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {displayedActivities.map((activity, index) => (
            <div key={index} className="flex items-center gap-4">
              <Avatar className="h-10 w-10 border-2 border-blue-100">
                <AvatarImage src={activity.userAvatar} alt={activity.userName} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  {activity.userName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">{activity.userName}</p>
                <p className="text-sm text-muted-foreground">{activity.action}</p>
              </div>
              <div className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                {activity.time}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

