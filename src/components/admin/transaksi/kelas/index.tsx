"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CourseTransactionStatus } from "@/types"
import { TransactionTable } from "./transaction-table"

export default function TransaksiKelasComponent({ initialData }: { initialData: any }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<string>(searchParams.get("status") || "")
  const [search, setSearch] = useState<string>(searchParams.get("search") || "")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [transactions, setTransactions] = useState(initialData.data)
  const [meta, setMeta] = useState(initialData.meta)

  useEffect(() => {
    setTransactions(initialData.data)
    setMeta(initialData.meta)
  }, [initialData])

  const handleStatusChange = (value: string) => {
    setStatus(value)
    updateSearchParams({ status: value, page: "1" })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateSearchParams({ search, page: "1" })
  }

  const updateSearchParams = (params: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams)

    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value)
      } else {
        newParams.delete(key)
      }
    })

    router.push(`/admin/transaksi/kelas?${newParams.toString()}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value={CourseTransactionStatus.UNPAID}>Belum Dibayar</SelectItem>
              <SelectItem value={CourseTransactionStatus.PAID}>Dibayar</SelectItem>
              <SelectItem value={CourseTransactionStatus.FAILED}>Gagal</SelectItem>
            </SelectContent>
          </Select>
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <Input
              placeholder="Cari kode, kelas, atau siswa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-[300px]"
            />
            <Button type="submit" size="sm" variant="secondary" disabled={isLoading}>
              Cari
            </Button>
          </form>
        </div>
      </div>

      <TransactionTable transactions={transactions} meta={meta} />
    </div>
  )
}

