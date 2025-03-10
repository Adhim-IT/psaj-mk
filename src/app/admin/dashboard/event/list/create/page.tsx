import { Suspense } from "react"
import { getMentorsForDropdown } from "@/lib/list-event"
import { EventForm } from "@/components/admin/event/list-event/event-form"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { HomeIcon } from "lucide-react"

export default function CreateEventPage() {
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
            <BreadcrumbLink href="/admin/dashboard/event/list">List</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>Create</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Buat Event Baru</h1>
        <p className="text-muted-foreground">Buat event baru untuk ditambahkan ke daftar.</p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <CreateEventForm />
      </Suspense>
    </div>
  )
}

async function CreateEventForm() {
  const { success, data: mentors, error } = await getMentorsForDropdown()

  if (!success) {
    return <div className="text-red-500">Error: {error}</div>
  }

  return <EventForm mentors={mentors || []} isEditing={false} />
}

