"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { getTransactionById } from "@/lib/checkout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Navbar from "@/components/user/Navbar"
import Footer from "@/components/user/Footer"

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const transactionId = searchParams.get("id")

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

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <Loader2 className="h-12 w-12 animate-spin text-[#4A90E2]" />
          <p className="mt-4 text-lg text-gray-600">Memuat data transaksi...</p>
        </div>
      )
    }

    if (error || !transaction) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <p className="mt-4 text-lg text-gray-800 font-medium">{error || "Transaksi tidak ditemukan"}</p>
          <Button className="mt-6" onClick={() => router.push("/kelas")}>
            Kembali ke Daftar Kelas
          </Button>
        </div>
      )
    }

    const isPaid = transaction.status === "paid"

    return (
      <Card className="border-2 border-green-100 w-full max-w-3xl mx-auto mt-24">
        <CardHeader className="bg-green-50 text-center">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Pembayaran {isPaid ? "Berhasil" : "Diproses"}</CardTitle>
            <CardDescription>Kode Transaksi: {transaction.code}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Detail Pesanan</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Kelas</span>
                  <span className="font-medium">{transaction.courses.title}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Nama</span>
                  <span className="font-medium">{transaction.students.name}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Status</span>
                  <span className={`font-medium ${isPaid ? "text-green-600" : "text-amber-600"}`}>
                    {isPaid ? "Pembayaran Berhasil" : "Menunggu Pembayaran"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Pembayaran</span>
                  <span className="font-bold text-lg">
                    Rp {Number(transaction.final_price).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Informasi Kelas</h3>
              <div className="bg-gray-50 p-4 rounded-lg flex gap-4">
                <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={transaction.courses.thumbnail || "/placeholder.svg?height=100&width=100"}
                    alt={transaction.courses.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-medium">{transaction.courses.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Tipe:{" "}
                    {transaction.type === "batch" ? "Batch" : transaction.type === "private" ? "Private" : "Group"}
                    {transaction.batch_number && ` (Batch ${transaction.batch_number})`}
                  </p>
                  {isPaid && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Akses Kelas Aktif
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-muted-foreground text-center">
            {isPaid
              ? "Terima kasih atas pembayaran Anda. Anda sekarang dapat mengakses kelas ini di dashboard."
              : "Harap selesaikan pembayaran Anda untuk mendapatkan akses ke kelas ini."}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Button className="flex-1" onClick={() => router.push("/dashboard/courses")}>
              Lihat Kelas Saya
            </Button>
            <Button className="flex-1" variant="outline" onClick={() => router.push("/kelas")}>
              Jelajahi Kelas Lainnya
            </Button>
          </div>
        </CardFooter>
      </Card>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center py-12 px-4">{renderContent()}</main>
      <Footer />
    </>
  )
}

