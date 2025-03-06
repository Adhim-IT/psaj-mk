"use client"

import type React from "react"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const data = [
  {
    name: "2025",
    pendaftar: 8,
  },
  {
    name: "2026",
    pendaftar: 3,
  },
]

interface OverviewProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Overview({ className, ...props }: OverviewProps) {
  return (
    <Card className={className} {...props}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-medium">Data Pendaftar 2025</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Jumlah pendaftar per tahun</CardDescription>
          </div>
          <select className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option>Semua Tahun</option>
            <option>2025</option>
            <option>2026</option>
          </select>
        </div>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
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

