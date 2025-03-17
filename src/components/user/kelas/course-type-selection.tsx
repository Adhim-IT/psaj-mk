"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarDays, Users, User, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { CourseType } from "@/types"

interface CourseTypeSelectionProps {
  courseTypes: CourseType[]
  onSelectCourseType?: (courseType: CourseType) => void
}

export function CourseTypeSelection({ courseTypes, onSelectCourseType }: CourseTypeSelectionProps) {
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState<string>("all")

  // Filter course types by type
  const allTypes = courseTypes.filter((type) => type.is_active)
  const batchTypes = allTypes.filter((type) => type.type === "batch")
  const privateTypes = allTypes.filter((type) => type.type === "private")
  const groupTypes = allTypes.filter((type) => type.type === "group")

  const handleSelectCourseType = (courseType: CourseType) => {
    if (onSelectCourseType) {
      onSelectCourseType(courseType)
    }

    // Navigate to checkout page with the selected course type
    router.push(`/checkout?course=${courseType.slug}`)
  }

  // Function to render price with discount
  const renderPrice = (courseType: CourseType) => {
    if (!courseType.is_discount || !courseType.discount) {
      return (
        <div className="mt-2">
          <span className="text-2xl font-bold text-[#4A90E2]">
            Rp {courseType.normal_price.toLocaleString("id-ID")}
          </span>
        </div>
      )
    }

    let discountedPrice = courseType.normal_price
    if (courseType.discount_type === "percentage") {
      discountedPrice = courseType.normal_price - (courseType.normal_price * courseType.discount) / 100
    } else {
      discountedPrice = courseType.normal_price - courseType.discount
    }

    return (
      <div className="mt-2">
        <span className="text-2xl font-bold text-[#4A90E2]">Rp {discountedPrice.toLocaleString("id-ID")}</span>
        <span className="ml-2 text-sm line-through text-muted-foreground">
          Rp {courseType.normal_price.toLocaleString("id-ID")}
        </span>
      </div>
    )
  }

  // Function to render course type card
  const renderCourseTypeCard = (courseType: CourseType) => {
    const typeIcon =
      courseType.type === "batch" ? (
        <Users className="h-5 w-5" />
      ) : courseType.type === "private" ? (
        <User className="h-5 w-5" />
      ) : (
        <Users className="h-5 w-5" />
      )

    const typeLabel = courseType.type === "batch" ? "Batch" : courseType.type === "private" ? "Private" : "Group"

    return (
      <Card key={courseType.id} className="overflow-hidden transition-all duration-200 hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-blue-100 text-blue-700">{typeIcon}</div>
            <CardTitle className="text-lg">{typeLabel} Class</CardTitle>
          </div>
          {courseType.batch_number && <CardDescription>Batch {courseType.batch_number}</CardDescription>}
        </CardHeader>
        <CardContent>
          {renderPrice(courseType)}

          <div className="mt-4 space-y-2">
            {courseType.start_date && courseType.end_date && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                <span>
                  {new Date(courseType.start_date).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  -{" "}
                  {new Date(courseType.end_date).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full bg-[#4A90E2] hover:bg-[#3A7BC8]" onClick={() => handleSelectCourseType(courseType)}>
            Pilih Kelas <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <div className="bg-gray-50 py-16 px-4">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Pilih Tipe Kelas</h2>
          <p className="mt-2 text-lg text-muted-foreground">
            Pilih tipe kelas yang sesuai dengan kebutuhan belajar Anda
          </p>
        </div>

        <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
          <div className="flex justify-center mb-8">
            <TabsList className="grid grid-cols-4 w-full max-w-md">
              <TabsTrigger value="all">Semua</TabsTrigger>
              {batchTypes.length > 0 && <TabsTrigger value="batch">Batch</TabsTrigger>}
              {privateTypes.length > 0 && <TabsTrigger value="private">Private</TabsTrigger>}
              {groupTypes.length > 0 && <TabsTrigger value="group">Group</TabsTrigger>}
            </TabsList>
          </div>

          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allTypes.map((courseType) => renderCourseTypeCard(courseType))}
            </div>
          </TabsContent>

          <TabsContent value="batch">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {batchTypes.map((courseType) => renderCourseTypeCard(courseType))}
            </div>
          </TabsContent>

          <TabsContent value="private">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {privateTypes.map((courseType) => renderCourseTypeCard(courseType))}
            </div>
          </TabsContent>

          <TabsContent value="group">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupTypes.map((courseType) => renderCourseTypeCard(courseType))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

