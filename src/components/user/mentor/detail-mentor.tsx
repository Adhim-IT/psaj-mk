"use client"

import type { Mentor } from "@/types"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Phone, Award, BookOpen } from "lucide-react"

interface DetailMentorProps {
  mentor: Mentor
}

export default function DetailMentor({ mentor }: DetailMentorProps) {
  if (!mentor) {
    return <div>Mentor not found</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-[300px_1fr] gap-8">
        {/* Mentor Profile Sidebar */}
        <div className="space-y-6">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl shadow-lg">
            <Image
              src={mentor.profile_picture || "/placeholder.svg?height=400&width=300"}
              alt={mentor.name}
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <span>{mentor.city || "Location not specified"}</span>
            </div>
            {mentor.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <span>{mentor.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-muted-foreground" />
              <span>{mentor.specialization}</span>
            </div>
          </div>
        </div>

        {/* Mentor Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{mentor.name}</h1>
            <p className="text-xl text-muted-foreground">{mentor.specialization}</p>
          </div>

          <Tabs defaultValue="about">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="courses">Courses</TabsTrigger>
            </TabsList>
            <TabsContent value="about" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="prose max-w-none">
                    <h3 className="text-xl font-semibold mb-4">Biography</h3>
                    <div className="whitespace-pre-wrap">{mentor.bio || "No biography available."}</div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="courses" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="mt-4 text-muted-foreground">Courses by this mentor will be displayed here.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

