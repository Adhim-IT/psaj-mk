"use client"

import { Check } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { CourseType } from "@/types"

interface CourseTypeSelectionProps {
  courseTypes: CourseType[]
  onSelectCourseType?: (courseType: CourseType) => void
}

export function CourseTypeSelection({ courseTypes, onSelectCourseType }: CourseTypeSelectionProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null)

  const handleSelectType = (courseType: CourseType) => {
    setSelectedType(courseType.id)
    if (onSelectCourseType) {
      onSelectCourseType(courseType)
    }
  }

  // Format price with Indonesian Rupiah format
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID").format(price)
  }

  // Calculate discounted price if applicable
  const calculatePrice = (courseType: CourseType) => {
    if (!courseType.is_discount || !courseType.discount) {
      return courseType.normal_price
    }

    if (courseType.discount_type === "percentage") {
      return courseType.normal_price - courseType.normal_price * (courseType.discount / 100)
    } else {
      return courseType.normal_price - courseType.discount
    }
  }

  return (
    <div className="py-16 px-6 bg-white">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Pilih Jenis Kelas</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Pilih salah satu jenis kelas yang diinginkan untuk anda</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courseTypes.map((courseType) => {
            const price = calculatePrice(courseType)
            const isSelected = selectedType === courseType.id

            return (
              <Card
                key={courseType.id}
                className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${
                  isSelected ? "ring-2 ring-[#5596DF] shadow-lg" : "border"
                }`}
              >
                <CardContent className="p-0">
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 capitalize">{courseType.type}</h3>

                    {courseType.type === "batch" && courseType.batch_number && (
                      <div className="mb-4">
                        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Batch #{courseType.batch_number}
                        </span>
                      </div>
                    )}

                    <div className="mt-4">
                      <div className="flex items-baseline">
                        <span className="text-4xl font-bold">{formatPrice(price)}</span>
                      </div>

                      {courseType.is_discount && courseType.discount && (
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(courseType.normal_price)}
                          </span>
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                            {courseType.discount_type === "percentage"
                              ? `-${courseType.discount}%`
                              : `-${formatPrice(courseType.discount)}`}
                          </span>
                        </div>
                      )}
                    </div>

                    {courseType.type === "group" && <p className="text-gray-600 mt-2">2-5 Siswa per Kelas</p>}

                    {courseType.type === "private" && <p className="text-gray-600 mt-2">1 Siswa per Kelas</p>}

                    {courseType.type === "batch" && <p className="text-gray-600 mt-2">10-20 Siswa per Kelas</p>}
                  </div>

                  <Separator />

                  <div className="p-6">
                    <ul className="space-y-3">
                      {courseType.type === "group" && (
                        <>
                          <li className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-[#5596DF] shrink-0 mt-0.5" />
                            <span>5 Siswa per Kelas</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-[#5596DF] shrink-0 mt-0.5" />
                            <span>Sertifikat kelulusan</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-[#5596DF] shrink-0 mt-0.5" />
                            <span>Portofolio Project</span>
                          </li>
                        </>
                      )}

                      {courseType.type === "private" && (
                        <>
                          <li className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-[#5596DF] shrink-0 mt-0.5" />
                            <span>1 Siswa per Kelas</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-[#5596DF] shrink-0 mt-0.5" />
                            <span>Sertifikat kelulusan</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-[#5596DF] shrink-0 mt-0.5" />
                            <span>Portofolio Project</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-[#5596DF] shrink-0 mt-0.5" />
                            <span>Jadwal fleksibel</span>
                          </li>
                        </>
                      )}

                      {courseType.type === "batch" && (
                        <>
                          <li className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-[#5596DF] shrink-0 mt-0.5" />
                            <span>10-20 Siswa per Kelas</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-[#5596DF] shrink-0 mt-0.5" />
                            <span>Sertifikat kelulusan</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-[#5596DF] shrink-0 mt-0.5" />
                            <span>Portofolio Project</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-[#5596DF] shrink-0 mt-0.5" />
                            <span>Komunitas belajar</span>
                          </li>
                        </>
                      )}
                    </ul>

                    <Button
                      className="w-full mt-6 bg-[#5596DF] hover:bg-[#4a89dc] text-white rounded-full transition-all duration-200"
                      onClick={() => handleSelectType(courseType)}
                    >
                      Beli Kelas
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}

