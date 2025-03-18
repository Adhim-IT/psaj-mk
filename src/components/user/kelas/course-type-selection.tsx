"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarDays, Users, User, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
      <Card
        key={courseType.id}
        className="overflow-hidden transition-all duration-200 hover:shadow-lg border-[#E5E7EB] group min-h-[380px] flex flex-col"
      >
        <CardHeader className="pb-2 bg-gradient-to-r from-[#F9FAFB] to-[#F3F4F6]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-[#EBF5FF] text-[#4A90E2] shadow-sm">{typeIcon}</div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-800">{typeLabel} Class</CardTitle>
              {courseType.batch_number && (
                <CardDescription className="text-sm font-medium text-gray-600">
                  Batch {courseType.batch_number}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 pb-4 flex-grow">
          {renderPrice(courseType)}

          <div className="mt-4 space-y-2">
            {courseType.start_date && courseType.end_date && (
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-[#F9FAFB] p-2 rounded-md">
                <CalendarDays className="h-4 w-4 text-[#4A90E2]" />
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
        <CardFooter className="pt-4 pb-6">
          <Button
            className="w-full bg-[#4A90E2] hover:bg-[#3A7BC8] transition-all duration-300 shadow-sm group-hover:shadow-md"
            onClick={() => handleSelectCourseType(courseType)}
          >
            Pilih Kelas <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white py-16 px-4">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Pilih Tipe Kelas</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Pilih tipe kelas yang sesuai dengan kebutuhan belajar Anda
          </p>
        </div>

        <div className="space-y-8">
          <div className="flex justify-center">
            <div className="bg-gray-100 p-1 rounded-xl w-full max-w-md">
              <div className="bg-white text-[#4A90E2] shadow-sm rounded-lg p-2 text-center font-medium">Semua</div>
            </div>
          </div>

          <div className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allTypes.map((courseType) => renderCourseTypeCard(courseType))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

