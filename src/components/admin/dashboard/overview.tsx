"use client"

import { useState, useEffect } from "react"
import type React from "react"
import { ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Area, AreaChart } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface OverviewProps extends React.HTMLAttributes<HTMLDivElement> {
  data?: Array<{ name: string; total?: number; pendaftar?: any; year?: number }>
  onYearChange?: (year: number) => Promise<Array<{ name: string; total?: number; pendaftar?: any }>>
}

export function Overview({ className, data = [], onYearChange, ...props }: OverviewProps) {
  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [chartData, setChartData] = useState<Array<{ name: string; total: number }>>([])
  const [isLoading, setIsLoading] = useState(false)

  // Default empty data template with all months
  const emptyYearData = [
    { name: "Jan", total: 0 },
    { name: "Feb", total: 0 },
    { name: "Mar", total: 0 },
    { name: "Apr", total: 0 },
    { name: "May", total: 0 },
    { name: "Jun", total: 0 },
    { name: "Jul", total: 0 },
    { name: "Aug", total: 0 },
    { name: "Sep", total: 0 },
    { name: "Oct", total: 0 },
    { name: "Nov", total: 0 },
    { name: "Dec", total: 0 },
  ]

  // Initialize with current year data or empty data
  useEffect(() => {
    if (data.length > 0) {
      // Filter data for the current year if year property exists
      const initialData = data.some((item) => "year" in item) ? data.filter((item) => item.year === selectedYear) : data

      // If we have data for the selected year, use it
      if (initialData.length > 0) {
        setChartData(
          initialData.map(({ name, total, pendaftar }) => ({
            name,
            total: total !== undefined ? total : pendaftar !== undefined ? pendaftar : 0,
          })),
        )
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
        setChartData(
          newData.length > 0
            ? newData.map(({ name, total, pendaftar }) => ({
                name,
                total: total !== undefined ? total : pendaftar !== undefined ? pendaftar : 0,
              }))
            : emptyYearData,
        )
      } catch (error) {
        console.error("Error fetching data for year:", newYear, error)
        setChartData(emptyYearData)
      } finally {
        setIsLoading(false)
      }
    } else if (data.some((item) => "year" in item)) {
      // If we have multi-year data but no onYearChange function, filter client-side
      const yearData = data.filter((item) => item.year === newYear)
      setChartData(
        yearData.length > 0
          ? yearData.map(({ name, total, pendaftar }) => ({
              name,
              total: total !== undefined ? total : pendaftar !== undefined ? pendaftar : 0,
            }))
          : emptyYearData,
      )
    }
  }

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg">
          <p className="text-sm font-semibold text-gray-700 mb-2">
            {label} {selectedYear}
          </p>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            <p className="text-sm font-medium text-gray-700">
              Pendaftar: <span className="font-bold text-blue-600">{payload[0].value}</span>
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <Card className={`${className} overflow-hidden bg-white rounded-xl`} {...props}>
      <CardHeader className="pb-2 px-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-800">Data Pendaftar {selectedYear}</CardTitle>
            <CardDescription className="text-sm text-gray-500 mt-1">
              Jumlah pendaftar per bulan
              {isLoading && " (Loading...)"}
            </CardDescription>
          </div>
          <select
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
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
      <CardContent className="px-2 pt-4 pb-6">
        <ResponsiveContainer width="100%" height={380}>
          <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis
              dataKey="name"
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              padding={{ left: 10, right: 10 }}
            />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} padding={{ top: 20 }} />
            <Tooltip content={<CustomTooltip />} cursor={{ opacity: 0.1 }} />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorTotal)"
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 0, fill: "#3b82f6" }}
              activeDot={{ r: 8, strokeWidth: 0, fill: "#3b82f6" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

