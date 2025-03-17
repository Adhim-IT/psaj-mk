"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"
import Swal from "sweetalert2"
import { initiateCheckout } from "@/lib/checkout"
import { getCourseTypeBySlug } from "@/lib/course-types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import type { CourseTypeTransaction } from "@/types"
import { useSession } from "next-auth/react"
import Script from "next/script"

// Deklarasi tipe untuk Midtrans Snap
declare global {
  interface Window {
    snap?: {
      pay: (token: string, options: any) => void
    }
  }
}

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const courseTypeSlug = searchParams.get("course")
  const { data: session, status } = useSession()

  const [courseType, setCourseType] = useState<CourseTypeTransaction | null>(null)
  const [loading, setLoading] = useState(true)
  const [promoCode, setPromoCode] = useState("")
  const [promoApplied, setPromoApplied] = useState(false)
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [midtransLoaded, setMidtransLoaded] = useState(false)

  // Cek session dari client-side
  useEffect(() => {
    if (status === "loading") return

    setAuthChecked(true)

    if (status === "unauthenticated") {
      console.log("User is not authenticated")
    } else if (status === "authenticated" && session) {
      console.log("User is authenticated:", session.user)
    }
  }, [session, status])

  useEffect(() => {
    async function loadCourseType() {
      if (!courseTypeSlug) {
        setError("Kelas tidak ditemukan")
        setLoading(false)
        return
      }

      try {
        const courseTypeData = await getCourseTypeBySlug(courseTypeSlug)
        if (!courseTypeData) {
          setError("Kelas tidak ditemukan")
          setLoading(false)
          return
        }

        setCourseType(courseTypeData)
      } catch (err) {
        console.error("Error loading course type:", err)
        setError("Gagal memuat data kelas")
      } finally {
        setLoading(false)
      }
    }

    loadCourseType()
  }, [courseTypeSlug])

  const handleApplyPromo = () => {
    if (!promoCode.trim()) {
      Swal.fire({
        title: "Kode promo kosong",
        text: "Silakan masukkan kode promo",
        icon: "error",
        confirmButtonColor: "#4A90E2",
      })
      return
    }

    // Simulate promo code application
    // In a real app, you would validate this against your backend
    setPromoApplied(true)
    setPromoDiscount(50000) // Example discount amount
    Swal.fire({
      title: "Kode promo berhasil diterapkan",
      text: "Diskon Rp 50.000 telah ditambahkan",
      icon: "success",
      confirmButtonColor: "#4A90E2",
    })
  }

  const handleCheckout = async () => {
    if (!courseType) return

    // Cek session terlebih dahulu
    if (status === "unauthenticated") {
      Swal.fire({
        title: "Checkout gagal",
        text: "Anda harus login terlebih dahulu",
        icon: "error",
        confirmButtonColor: "#4A90E2",
      })
      router.push(`/login?redirect=/checkout?course=${courseTypeSlug}`)
      return
    }

    // Cek apakah Midtrans sudah dimuat
    if (!window.snap) {
      Swal.fire({
        title: "Checkout gagal",
        text: "Sistem pembayaran belum siap. Silakan coba lagi.",
        icon: "error",
        confirmButtonColor: "#4A90E2",
      })
      return
    }

    setProcessingPayment(true)
    setError(null) // Reset error state

    try {
      console.log("Initiating checkout with:", {
        courseType: {
          id: courseType.id,
          course_id: courseType.course_id,
          type: courseType.type,
          normal_price: courseType.normal_price,
        },
        promoCode: promoApplied ? promoCode : undefined,
      })

      // Dapatkan token Midtrans dari server
      const response = await fetch("/api/midtrans/create-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseType,
          promoCode: promoApplied ? promoCode : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        throw new Error(data.error || "Gagal memproses pembayaran")
      }

      // Simpan transaksi ke database
      const result = await initiateCheckout({
        courseType,
        promoCode: promoApplied ? promoCode : undefined,
      })

      if (result.error) {
        throw new Error(result.error)
      }

      // Tampilkan popup Midtrans Snap
      window.snap.pay(data.token, {
        onSuccess: (result: any) => {
          console.log("Payment success:", result)
          router.push(`/checkout/success?id=${result.transactionId || result.order_id}`)
        },
        onPending: (result: any) => {
          console.log("Payment pending:", result)
          router.push(`/checkout/payment?id=${result.transactionId || result.order_id}`)
        },
        onError: (result: any) => {
          console.error("Payment error:", result)
          Swal.fire({
            title: "Pembayaran gagal",
            text: "Terjadi kesalahan saat memproses pembayaran",
            icon: "error",
            confirmButtonColor: "#4A90E2",
          })
        },
        onClose: () => {
          console.log("Customer closed the popup without finishing the payment")
          Swal.fire({
            title: "Pembayaran dibatalkan",
            text: "Anda menutup halaman pembayaran sebelum menyelesaikan transaksi",
            icon: "warning",
            confirmButtonColor: "#4A90E2",
          })
        },
      })
    } catch (err) {
      console.error("Checkout error:", err)
      const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan saat memproses pembayaran"
      setError(errorMessage)
      Swal.fire({
        title: "Checkout gagal",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#4A90E2",
      })
    } finally {
      setProcessingPayment(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="h-12 w-12 animate-spin text-[#4A90E2]" />
        <p className="mt-4 text-lg text-gray-600">Memuat data checkout...</p>
      </div>
    )
  }

  if (error || !courseType) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="mt-4 text-lg text-gray-800 font-medium">{error || "Kelas tidak ditemukan"}</p>
        <Button className="mt-6" onClick={() => router.push("/kelas")}>
          Kembali ke Daftar Kelas
        </Button>
      </div>
    )
  }

  // Calculate discount amount if applicable
  let discountAmount = 0
  if (courseType.is_discount && courseType.discount && courseType.discount_type) {
    if (courseType.discount_type === "percentage") {
      discountAmount = (courseType.normal_price * courseType.discount) / 100
    } else {
      discountAmount = courseType.discount
    }
  }

  // Calculate final price
  const finalPrice = Math.max(courseType.normal_price - discountAmount - (promoApplied ? promoDiscount : 0), 0)

  return (
    <>
      {/* Load Midtrans Snap JavaScript */}
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        onLoad={() => setMidtransLoaded(true)}
      />

      <div className="container max-w-6xl py-12 px-4 md:px-6 mt-16">
        <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>

        {/* Tampilkan peringatan jika tidak ada session */}
        {status === "unauthenticated" && authChecked && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-700 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Anda belum login. Silakan{" "}
              <Button
                variant="link"
                className="p-0 h-auto text-blue-600"
                onClick={() => router.push(`/login?redirect=/checkout?course=${courseTypeSlug}`)}
              >
                login terlebih dahulu
              </Button>{" "}
              untuk melanjutkan checkout.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Pesanan</CardTitle>
                <CardDescription>Detail kelas yang akan Anda beli</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="relative w-full md:w-48 h-32 rounded-lg overflow-hidden">
                    <Image
                      src={courseType.course_thumbnail || "/placeholder.svg?height=200&width=400"}
                      alt={courseType.course_title || "Course"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{courseType.course_title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {courseType.course_description || "Tidak ada deskripsi"}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                        {courseType.type === "batch" ? "Batch" : courseType.type === "private" ? "Private" : "Group"}
                      </div>
                      {courseType.batch_number && (
                        <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                          Batch {courseType.batch_number}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Promo Code */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Kode Promo</CardTitle>
                <CardDescription>Masukkan kode promo jika Anda memilikinya</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Masukkan kode promo"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      disabled={promoApplied}
                    />
                  </div>
                  <Button
                    variant={promoApplied ? "outline" : "default"}
                    onClick={handleApplyPromo}
                    disabled={promoApplied || !promoCode.trim()}
                  >
                    {promoApplied ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" /> Diterapkan
                      </>
                    ) : (
                      "Terapkan"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Pembayaran</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Harga Kelas</span>
                    <span>Rp {courseType.normal_price.toLocaleString("id-ID")}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Diskon Kelas</span>
                      <span>- Rp {discountAmount.toLocaleString("id-ID")}</span>
                    </div>
                  )}

                  {promoApplied && (
                    <div className="flex justify-between text-green-600">
                      <span>Diskon Promo</span>
                      <span>- Rp {promoDiscount.toLocaleString("id-ID")}</span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>Rp {finalPrice.toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-[#4A90E2] hover:bg-[#3A7BC8]"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={processingPayment || status === "unauthenticated" || !midtransLoaded}
                >
                  {processingPayment ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses
                    </>
                  ) : (
                    "Bayar Sekarang"
                  )}
                </Button>
              </CardFooter>
            </Card>

            <div className="mt-6 text-sm text-muted-foreground">
              <p>
                Dengan melakukan pembayaran, Anda menyetujui{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  Syarat dan Ketentuan
                </a>{" "}
                serta{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  Kebijakan Privasi
                </a>{" "}
                kami.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

