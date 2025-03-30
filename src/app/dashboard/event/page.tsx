"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Loader2, Calendar, Clock, AlertCircle } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface EventRegistration {
  id: string
  event_id: string
  student_id: string
  status: "pending" | "paid" | "rejected"
  created_at: string
  updated_at: string
  events: {
    title: string
    thumbnail: string
    start_date: string
    end_date: string
    whatsapp_group_link: string
  }
}

export default function EventsPage() {
  const [registrations, setRegistrations] = useState<EventRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    async function loadData() {
      try {
        // Get current user
        const userData = await getCurrentUser()
        setUser(userData)

        if (!userData || !userData.studentId) {
          setError("Anda harus login terlebih dahulu")
          setLoading(false)
          return
        }

        // Get event registrations for the current user
        const response = await fetch(`/api/event-registrations?studentId=${userData.studentId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch event registrations")
        }

        const data = await response.json()
        setRegistrations(data.registrations || [])
      } catch (err) {
        console.error("Error loading data:", err)
        setError("Gagal memuat data event")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="h-12 w-12 animate-spin text-[#4A90E2]" />
        <p className="mt-4 text-lg text-gray-600">Memuat data event...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="mt-4 text-lg text-gray-800 font-medium">{error}</p>
        <Button className="mt-6" asChild>
          <Link href="/login">Login</Link>
        </Button>
      </div>
    )
  }

  const approvedRegistrations = registrations.filter((reg) => reg.status === "paid")
  const pendingRegistrations = registrations.filter((reg) => reg.status === "pending")

  return (
    <div className="container max-w-6xl py-12 px-4 md:px-6 mt-16">
      <h1 className="text-3xl font-bold mb-2">Event Saya</h1>
      <p className="text-muted-foreground mb-8">Akses semua event yang telah Anda daftar</p>

      <div className="space-y-10">
        <div>
          <h2 className="text-xl font-semibold mb-4">Event Aktif ({approvedRegistrations.length})</h2>
          {approvedRegistrations.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-lg">
              <Calendar className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-4 text-lg font-medium">Belum ada event aktif</h3>
              <p className="mt-2 text-muted-foreground">Anda belum memiliki event yang aktif</p>
              <Button className="mt-6" asChild>
                <Link href="/event">Jelajahi Event</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {approvedRegistrations.map((registration) => (
                <Card key={registration.id} className="overflow-hidden transition-all duration-200 hover:shadow-md">
                  <div className="relative h-48">
                    <Image
                      src={registration.events.thumbnail || "/placeholder.svg?height=200&width=400"}
                      alt={registration.events.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-green-500 hover:bg-green-600">Terdaftar</Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{registration.events.title}</CardTitle>
                    <CardDescription>
                      {new Date(registration.events.start_date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                      {" - "}
                      {new Date(registration.events.end_date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        Terdaftar pada{" "}
                        {new Date(registration.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full bg-[#4A90E2] hover:bg-[#3A7BC8]" asChild>
                      <Link href={registration.events.whatsapp_group_link} target="_blank" rel="noopener noreferrer">
                        Gabung Grup WhatsApp
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Menunggu Konfirmasi ({pendingRegistrations.length})</h2>
          {pendingRegistrations.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-lg">
              <Clock className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-4 text-lg font-medium">Tidak ada pendaftaran tertunda</h3>
              <p className="mt-2 text-muted-foreground">Anda tidak memiliki event yang menunggu konfirmasi</p>
              <Button className="mt-6" asChild>
                <Link href="/event">Jelajahi Event</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingRegistrations.map((registration) => (
                <Card key={registration.id} className="overflow-hidden transition-all duration-200 hover:shadow-md">
                  <div className="relative h-48">
                    <Image
                      src={registration.events.thumbnail || "/placeholder.svg?height=200&width=400"}
                      alt={registration.events.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge
                        variant="outline"
                        className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200"
                      >
                        Menunggu Konfirmasi
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{registration.events.title}</CardTitle>
                    <CardDescription>
                      {new Date(registration.events.start_date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                      {" - "}
                      {new Date(registration.events.end_date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        Terdaftar pada{" "}
                        {new Date(registration.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" variant="outline" asChild>
                      <Link href={`/event/${registration.event_id}`}>Lihat Detail Event</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

