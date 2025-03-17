"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Loader2, AlertCircle, ArrowLeft, BookOpen, Calendar, Clock } from "lucide-react"
import { getTransactionById } from "@/lib/checkout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function CourseDetailPage() {
  const router = useRouter()
  const params = useParams()
  const transactionId = params.id as string

  const [transaction, setTransaction] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadTransaction() {
      if (!transactionId) {
        setError("Transaksi tidak ditemukan")
        setLoading(false)
        return
      }

      try {
        const result = await getTransactionById(transactionId)
        if (result.error) {
          setError(result.error)
          setLoading(false)
          return
        }

        setTransaction(result.transaction)
      } catch (err) {
        console.error("Error loading transaction:", err)
        setError("Gagal memuat data transaksi")
      } finally {
        setLoading(false)
      }
    }

    loadTransaction()
  }, [transactionId])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="h-12 w-12 animate-spin text-[#4A90E2]" />
        <p className="mt-4 text-lg text-gray-600">Memuat data kelas...</p>
      </div>
    )
  }

  if (error || !transaction) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="mt-4 text-lg text-gray-800 font-medium">{error || "Transaksi tidak ditemukan"}</p>
        <Button className="mt-6" onClick={() => router.push("/dashboard/courses")}>
          Kembali ke Daftar Kelas
        </Button>
      </div>
    )
  }

  const isPaid = transaction.status === "paid"

  if (!isPaid) {
    return (
      <div className="container max-w-3xl py-12 px-4 md:px-6 mt-16">
        <Button variant="ghost" className="mb-6" onClick={() => router.push("/dashboard/courses")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>

        <Card>
          <CardHeader className="bg-amber-50">
            <CardTitle>Pembayaran Belum Selesai</CardTitle>
            <CardDescription>Anda belum dapat mengakses kelas ini karena pembayaran belum selesai</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="relative w-full md:w-48 h-32 rounded-lg overflow-hidden">
                <Image
                  src={transaction.courses.thumbnail || "/placeholder.svg?height=200&width=400"}
                  alt={transaction.courses.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{transaction.courses.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {transaction.type === "batch" ? "Batch" : transaction.type === "private" ? "Private" : "Group"}
                  {transaction.batch_number && ` (Batch ${transaction.batch_number})`}
                </p>

                <div className="mt-4">
                  <Button asChild>
                    <Link href={`/checkout/payment?id=${transaction.id}`}>Lanjutkan Pembayaran</Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-6xl py-12 px-4 md:px-6 mt-16">
      <Button variant="ghost" className="mb-6" onClick={() => router.push("/dashboard/courses")}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Daftar Kelas
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{transaction.courses.title}</h1>
            <p className="text-muted-foreground mt-2">
              {transaction.type === "batch" ? "Batch" : transaction.type === "private" ? "Private" : "Group"}
              {transaction.batch_number && ` (Batch ${transaction.batch_number})`}
            </p>
          </div>

          <Tabs defaultValue="materi" className="w-full">
            <TabsList className="grid w-full grid-cols-3 rounded-xl bg-gray-100 p-1 overflow-hidden">
              <TabsTrigger
                value="materi"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#5596DF] data-[state=active]:shadow-sm flex gap-2 py-3 px-4 transition-all duration-200"
              >
                <BookOpen className="w-5 h-5" />
                Materi
              </TabsTrigger>
              <TabsTrigger
                value="jadwal"
                className="rounded-lg data-[state=active]:bg-[#5596DF] data-[state=active]:text-white flex gap-2 py-3 px-4 transition-all duration-200"
              >
                <Calendar className="w-5 h-5" />
                Jadwal
              </TabsTrigger>
              <TabsTrigger
                value="diskusi"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#5596DF] data-[state=active]:shadow-sm flex gap-2 py-3 px-4 transition-all duration-200"
              >
                <Clock className="w-5 h-5" />
                Diskusi
              </TabsTrigger>
            </TabsList>

            <TabsContent value="materi" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Materi Pembelajaran</CardTitle>
                  <CardDescription>Akses semua materi pembelajaran di kelas ini</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 mx-auto text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium">Materi belum tersedia</h3>
                    <p className="mt-2 text-muted-foreground">
                      Materi pembelajaran akan segera tersedia. Silakan periksa kembali nanti.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="jadwal" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Jadwal Kelas</CardTitle>
                  <CardDescription>Jadwal pertemuan untuk kelas ini</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 mx-auto text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium">Jadwal belum tersedia</h3>
                    <p className="mt-2 text-muted-foreground">
                      Jadwal pertemuan akan segera diumumkan. Silakan periksa kembali nanti.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="diskusi" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Forum Diskusi</CardTitle>
                  <CardDescription>Diskusikan materi dengan mentor dan peserta lain</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 mx-auto text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium">Forum diskusi belum tersedia</h3>
                    <p className="mt-2 text-muted-foreground">
                      Forum diskusi akan segera dibuka. Silakan periksa kembali nanti.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <Card className="overflow-hidden rounded-xl shadow-lg border-0 transition-all duration-300 hover:shadow-xl">
              <div className="relative">
                <Image
                  src={transaction.courses.thumbnail || "/placeholder.svg?height=200&width=400"}
                  alt={transaction.courses.title}
                  width={400}
                  height={200}
                  className="w-full h-48 object-cover"
                />
              </div>

              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-[#5596DF]/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-[#5596DF]" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <p className="font-medium text-green-600">Aktif</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-[#5596DF]/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-[#5596DF]" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Tanggal Pembelian</p>
                      <p className="font-medium">
                        {new Date(transaction.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="w-full" asChild>
                  <Link href="https://wa.me/6281234567890" target="_blank">
                    Hubungi Admin
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

