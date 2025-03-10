import { getEvents } from "@/lib/list-event"
import { EventList } from "@/components/admin/event/list-event/event-list"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { HomeIcon } from "lucide-react"

export default async function ListEventsPage() {
    const { data: events, error } = await getEvents()
  
    return (
      <div className="space-y-6">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/dashboard">
                <HomeIcon className="h-4 w-4 mr-1" />
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/dashboard/event">Event</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>List</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
  
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Daftar Event</h1>
          <p className="text-muted-foreground">Kelola daftar event Anda.</p>
        </div>
  
        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">{error}</div>
        ) : (
          <EventList
            events={
              events?.map((event : any) => ({
                ...event,
                start_date: new Date(event.start_date),
                end_date: new Date(event.end_date),
                price: event.price ? Number(event.price) : 0,
              })) || []
            }
          />
        )}
      </div>
    )
  }
  

