"use client"

import { useState, useEffect } from "react"
import type React from "react"
import { Line, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, CartesianGrid, Area, ComposedChart } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface RevenueChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data?: Array<{ name: string; kelas: number; event: number; total: number; year: number }>
  onYearChange?: (year: number) => Promise<Array<{ name: string; kelas: number; event: number; total: number }>>
}

export function RevenueChart({ className, data = [], onYearChange, ...props }: RevenueChartProps) {
  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [chartData, setChartData] = useState<Array<{ name: string; kelas: number; event: number; total: number }>>([])
  const [isLoading, setIsLoading] = useState(false)

  // Default empty data template with all months
  const emptyYearData = [
    { name: "Jan", kelas: 0, event: 0, total: 0 },
    { name: "Feb", kelas: 0, event: 0, total: 0 },
    { name: "Mar", kelas: 0, event: 0, total: 0 },
    { name: "Apr", kelas: 0, event: 0, total: 0 },
    { name: "May", kelas: 0, event: 0, total: 0 },
    { name: "Jun", kelas: 0, event: 0, total: 0 },
    { name: "Jul", kelas: 0, event: 0, total: 0 },
    { name: "Aug", kelas: 0, event: 0, total: 0 },
    { name: "Sep", kelas: 0, event: 0, total: 0 },
    { name: "Oct", kelas: 0, event: 0, total: 0 },
    { name: "Nov", kelas: 0, event: 0, total: 0 },
    { name: "Dec", kelas: 0, event: 0, total: 0 },
  ]

  // Initialize with current year data or empty data
  useEffect(() => {
    if (data.length > 0) {
      // Filter data for the current year if year property exists
      const initialData = data.some((item) => "year" in item) ? data.filter((item) => item.year === selectedYear) : data

      // If we have data for the selected year, use it
      if (initialData.length > 0) {
        setChartData(initialData.map(({ name, kelas, event, total }) => ({ name, kelas, event, total })))
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
      setChartData(
        yearData.length > 0
          ? yearData.map(({ name, kelas, event, total }) => ({ name, kelas, event, total }))
          : emptyYearData,
      )
    }
  }

  // Format currency for tooltip
  const formatTooltipValue = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg">
          <p className="text-sm font-semibold text-gray-700 mb-2">
            {label} {selectedYear}
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              <p className="text-sm font-medium text-gray-700">
                Kelas: <span className="font-bold text-blue-600">{formatTooltipValue(payload[0].value)}</span>
              </p>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-pink-500 mr-2"></div>
              <p className="text-sm font-medium text-gray-700">
                Event: <span className="font-bold text-pink-600">{formatTooltipValue(payload[1].value)}</span>
              </p>
            </div>
            <div className="flex items-center pt-1 border-t border-gray-100 mt-1">
              <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
              <p className="text-sm font-bold text-gray-800">
                Total: <span className="font-bold text-emerald-600">{formatTooltipValue(payload[2].value)}</span>
              </p>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  // Format y-axis labels
  const formatYAxis = (value: number) => {
    if (value === 0) return "Rp0"
    if (value >= 1000000) return `Rp${value / 1000000}M`
    if (value >= 1000) return `Rp${value / 1000}K`
    return `Rp${value}`
  }

  return (
    <Card className={`${className} overflow-hidden bg-white rounded-xl`} {...props}>
      <CardHeader className="pb-2 px-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-800">Pendapatan {selectedYear}</CardTitle>
            <CardDescription className="text-sm text-gray-500 mt-1">
              Pendapatan per bulan dari kelas dan event
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
          <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <defs>
              <linearGradient id="colorKelas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorEvent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#ec4899" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
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
            <YAxis
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatYAxis}
              padding={{ top: 20 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ opacity: 0.1 }} />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              iconSize={10}
              wrapperStyle={{ paddingBottom: 10, paddingTop: 10 }}
              formatter={(value) => (
                <span
                  className={
                    value === "Kelas"
                      ? "text-blue-600 font-medium"
                      : value === "Event"
                        ? "text-pink-600 font-medium"
                        : "text-emerald-600 font-medium"
                  }
                >
                  {value}
                </span>
              )}
            />
            <Area
              type="monotone"
              dataKey="kelas"
              name="Kelas"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorKelas)"
              strokeWidth={2}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="event"
              name="Event"
              stroke="#ec4899"
              fillOpacity={1}
              fill="url(#colorEvent)"
              strokeWidth={2}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="total"
              name="Total"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 0, fill: "#10b981" }}
              activeDot={{ r: 8, strokeWidth: 0, fill: "#10b981" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

