"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Loader2, BookOpen, Clock, AlertCircle } from "lucide-react"
import { getTransactions } from "@/lib/transaction"
import { getCurrentUser } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function CoursesPage() {
  const [transactions, setTransactions] = useState<any[]>([])
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

        // Get transactions for the current user
        const { transactions: transactionsData, error: transactionsError } = await getTransactions(userData.studentId)

        if (transactionsError) {
          setError(transactionsError)
          setLoading(false)
          return
        }

        setTransactions(transactionsData || [])
      } catch (err) {
        console.error("Error loading data:", err)
        setError("Gagal memuat data kelas")
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
        <p className="mt-4 text-lg text-gray-600">Memuat data kelas...</p>
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

  const paidTransactions = transactions.filter((transaction) => transaction.status === "paid")
  const pendingTransactions = transactions.filter((transaction) => transaction.status === "unpaid")

  return (
    <div className="container max-w-6xl py-12 px-4 md:px-6 mt-16">
      <h1 className="text-3xl font-bold mb-2">Kelas Saya</h1>
      <p className="text-muted-foreground mb-8">Akses semua kelas yang telah Anda beli</p>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="active">Kelas Aktif ({paidTransactions.length})</TabsTrigger>
          <TabsTrigger value="pending">Menunggu Pembayaran ({pendingTransactions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {paidTransactions.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-lg">
              <BookOpen className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-4 text-lg font-medium">Belum ada kelas aktif</h3>
              <p className="mt-2 text-muted-foreground">Anda belum memiliki kelas yang aktif</p>
              <Button className="mt-6" asChild>
                <Link href="/kelas">Jelajahi Kelas</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paidTransactions.map((transaction) => (
                <Card key={transaction.id} className="overflow-hidden transition-all duration-200 hover:shadow-md">
                  <div className="relative h-48">
                    <Image
                      src={transaction.courses.thumbnail || "/placeholder.svg?height=200&width=400"}
                      alt={transaction.courses.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-green-500 hover:bg-green-600">Aktif</Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{transaction.courses.title}</CardTitle>
                    <CardDescription>
                      {transaction.type === "batch" ? "Batch" : transaction.type === "private" ? "Private" : "Group"}
                      {transaction.batch_number && ` (Batch ${transaction.batch_number})`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        Dibeli pada{" "}
                        {new Date(transaction.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full bg-[#4A90E2] hover:bg-[#3A7BC8]" asChild>
                      <Link href={`/dashboard/courses/${transaction.id}`}>Akses Kelas</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending">
          {pendingTransactions.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-lg">
              <Clock className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-4 text-lg font-medium">Tidak ada pembayaran tertunda</h3>
              <p className="mt-2 text-muted-foreground">Anda tidak memiliki kelas yang menunggu pembayaran</p>
              <Button className="mt-6" asChild>
                <Link href="/kelas">Jelajahi Kelas</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingTransactions.map((transaction) => (
                <Card key={transaction.id} className="overflow-hidden transition-all duration-200 hover:shadow-md">
                  <div className="relative h-48">
                    <Image
                      src={transaction.courses.thumbnail || "/placeholder.svg?height=200&width=400"}
                      alt={transaction.courses.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge
                        variant="outline"
                        className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200"
                      >
                        Menunggu Pembayaran
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{transaction.courses.title}</CardTitle>
                    <CardDescription>
                      {transaction.type === "batch" ? "Batch" : transaction.type === "private" ? "Private" : "Group"}
                      {transaction.batch_number && ` (Batch ${transaction.batch_number})`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        Dibuat pada{" "}
                        {new Date(transaction.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="mt-2">
                      <span className="font-medium">Total: </span>
                      <span>Rp {Number(transaction.final_price).toLocaleString("id-ID")}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" variant="outline" asChild>
                      <Link href={`/checkout/payment?id=${transaction.id}`}>Lanjutkan Pembayaran</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

