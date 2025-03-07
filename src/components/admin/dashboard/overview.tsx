"use client"

import { useState, useEffect } from "react"
import type React from "react"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface OverviewProps extends React.HTMLAttributes<HTMLDivElement> {
  data?: Array<{ name: string; pendaftar: number; year: number }>
  onYearChange?: (year: number) => Promise<Array<{ name: string; pendaftar: number }>>
}

export function Overview({ className, data = [], onYearChange, ...props }: OverviewProps) {
  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [chartData, setChartData] = useState<Array<{ name: string; pendaftar: number }>>([])
  const [isLoading, setIsLoading] = useState(false)

  // Default empty data template with all months
  const emptyYearData = [
    { name: "Jan", pendaftar: 0 },
    { name: "Feb", pendaftar: 0 },
    { name: "Mar", pendaftar: 0 },
    { name: "Apr", pendaftar: 0 },
    { name: "May", pendaftar: 0 },
    { name: "Jun", pendaftar: 0 },
    { name: "Jul", pendaftar: 0 },
    { name: "Aug", pendaftar: 0 },
    { name: "Sep", pendaftar: 0 },
    { name: "Oct", pendaftar: 0 },
    { name: "Nov", pendaftar: 0 },
    { name: "Dec", pendaftar: 0 },
  ]

  // Initialize with current year data or empty data
  useEffect(() => {
    if (data.length > 0) {
      // Filter data for the current year if year property exists
      const initialData = data.some((item) => "year" in item) ? data.filter((item) => item.year === selectedYear) : data

      // If we have data for the selected year, use it
      if (initialData.length > 0) {
        setChartData(initialData.map(({ name, pendaftar }) => ({ name, pendaftar })))
      } else {
        setChartData(emptyYearData)
      }
    } else {
      setChartData(emptyYearData)
    }
  }, [data, selectedYear])

  // Handle year change
  const handleYearChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = Number.parseInt(e.target.value)
    setSelectedYear(newYear)

    if (onYearChange) {
      try {
        setIsLoading(true)
        const newData = await onYearChange(newYear)
        setChartData(newData.length > 0 ? newData : emptyYearData)
      } catch (error) {
        console.error("Error fetching data for year:", newYear, error)
        setChartData(emptyYearData)
      } finally {
        setIsLoading(false)
      }
    } else if (data.some((item) => "year" in item)) {
      // If we have multi-year data but no onYearChange function, filter client-side
      const yearData = data.filter((item) => item.year === newYear)
      setChartData(yearData.length > 0 ? yearData.map(({ name, pendaftar }) => ({ name, pendaftar })) : emptyYearData)
    }
  }

  return (
    <Card className={className} {...props}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-medium">Data Pendaftar {selectedYear}</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Jumlah pendaftar per bulan
              {isLoading && " (Loading...)"}
            </CardDescription>
          </div>
          <select
            className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={selectedYear}
            onChange={handleYearChange}
          >
            <option value={currentYear}>Tahun {currentYear}</option>
            <option value={currentYear - 1}>Tahun {currentYear - 1}</option>
            <option value={currentYear - 2}>Tahun {currentYear - 2}</option>
            <option value={currentYear + 1}>Tahun {currentYear + 1}</option>
          </select>
        </div>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                border: "none",
              }}
              labelStyle={{ fontWeight: "bold", color: "#333" }}
            />
            <Line
              type="monotone"
              dataKey="pendaftar"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ r: 6, fill: "#3b82f6", strokeWidth: 3, stroke: "white" }}
              activeDot={{ r: 8, fill: "#3b82f6", strokeWidth: 3, stroke: "white" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

