"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Loader2, CheckCircle, AlertCircle, CreditCard, Tag, ShoppingCart } from "lucide-react"
import Swal from "sweetalert2"
import { initiateCheckout } from "@/lib/checkout"
import { getCourseTypeBySlug } from "@/lib/course-types"
import { validatePromoCode } from "@/lib/promo-code"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import type { CourseTypeTransaction } from "@/types"
import { useSession } from "next-auth/react"
import Script from "next/script"
import Navbar from "@/components/user/Navbar"
import Footer from "@/components/user/Footer"
import { cn } from "@/lib/utils"

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
  const [promoDiscountType, setPromoDiscountType] = useState<"percentage" | "fixed" | null>(null)
  const [validatingPromo, setValidatingPromo] = useState(false)
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

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      Swal.fire({
        title: "Kode promo kosong",
        text: "Silakan masukkan kode promo",
        icon: "error",
        confirmButtonColor: "#4A90E2",
      })
      return
    }

    setValidatingPromo(true)

    try {
      // Validate promo code from database
      const result = await validatePromoCode(promoCode.trim())

      if (!result.success || !result.data) {
        Swal.fire({
          title: "Kode promo tidak valid",
          text: result.error || "Kode promo tidak ditemukan atau sudah tidak berlaku",
          icon: "error",
          confirmButtonColor: "#4A90E2",
        })
        return
      }

      // Set promo details from database
      const promoData = result.data
      setPromoDiscountType(promoData.discount_type)
      setPromoDiscount(promoData.discount)
      setPromoApplied(true)

      // Show success message
      const discountText =
        promoData.discount_type === "percentage"
          ? `${promoData.discount}%`
          : `Rp ${promoData.discount.toLocaleString("id-ID")}`

      Swal.fire({
        title: "Kode promo berhasil diterapkan",
        text: `Diskon ${discountText} telah ditambahkan`,
        icon: "success",
        confirmButtonColor: "#4A90E2",
      })
    } catch (err) {
      console.error("Error validating promo code:", err)
      Swal.fire({
        title: "Gagal memvalidasi kode promo",
        text: "Terjadi kesalahan saat memvalidasi kode promo",
        icon: "error",
        confirmButtonColor: "#4A90E2",
      })
    } finally {
      setValidatingPromo(false)
    }
  }

  const handleCheckout = async () => {
    if (!courseType) return;
  
    if (status === "unauthenticated") {
      Swal.fire({
        title: "Checkout gagal",
        text: "Anda harus login terlebih dahulu",
        icon: "error",
        confirmButtonColor: "#4A90E2",
      });
      router.push(`/login?redirect=/checkout?course=${courseTypeSlug}`);
      return;
    }
  
    if (!window.snap) {
      Swal.fire({
        title: "Checkout gagal",
        text: "Sistem pembayaran belum siap. Silakan coba lagi.",
        icon: "error",
        confirmButtonColor: "#4A90E2",
      });
      return;
    }
  
    setProcessingPayment(true);
    setError(null);
  
    try {
      // STEP 1: Minta token Midtrans dari server
      const response = await fetch("/api/midtrans/create-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseType,
          promoCode: promoApplied ? promoCode : undefined,
          promoDiscountType,
          promoDiscount,
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok || data.error) {
        throw new Error(data.error || "Gagal mendapatkan token pembayaran");
      }
  
      // STEP 2: Tampilkan Midtrans Snap
      window.snap.pay(data.token, {
        onSuccess: async (result: any) => {
          console.log("✅ Payment success:", result);
  
          // STEP 3: Simpan transaksi ke database setelah sukses
          const saveResponse = await initiateCheckout({
            courseType,
            promoCode: promoApplied ? promoCode : undefined,
            promoDiscountType,
            promoDiscount,
          });
  
          if (saveResponse.error) {
            throw new Error(saveResponse.error);
          }
  
          // Redirect ke halaman sukses
          router.push(`/checkout/success?id=${saveResponse.transactionId}`);
        },
        onPending: (result: any) => {
          console.log("⏳ Payment pending:", result);
          router.push(`/checkout/payment?id=${result.order_id}`);
        },
        onError: (result: any) => {
          console.error("❌ Payment error:", result);
          Swal.fire({
            title: "Pembayaran gagal",
            text: "Terjadi kesalahan saat memproses pembayaran",
            icon: "error",
            confirmButtonColor: "#4A90E2",
          });
        },
        onClose: () => {
          console.log("⚠️ Customer closed the popup");
          Swal.fire({
            title: "Pembayaran dibatalkan",
            text: "Anda menutup halaman pembayaran sebelum menyelesaikan transaksi",
            icon: "warning",
            confirmButtonColor: "#4A90E2",
          });
        },
      });
    } catch (err) {
      console.error("Checkout error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Terjadi kesalahan saat memproses pembayaran";
      setError(errorMessage);
      Swal.fire({
        title: "Checkout gagal",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#4A90E2",
      });
    } finally {
      setProcessingPayment(false);
    }
  };
  

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="bg-white p-8 rounded-xl shadow-md flex flex-col items-center max-w-md mx-auto">
            <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
            <p className="mt-6 text-xl text-gray-700 font-medium">Memuat data checkout...</p>
            <p className="text-gray-500 mt-2">Mohon tunggu sebentar</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !courseType) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="bg-white p-8 rounded-xl shadow-md flex flex-col items-center max-w-md mx-auto">
            <div className="bg-red-100 p-3 rounded-full">
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
            <p className="mt-6 text-xl text-gray-800 font-semibold text-center">{error || "Kelas tidak ditemukan"}</p>
            <p className="text-gray-500 mt-2 text-center mb-6">
              Silakan kembali ke halaman kelas untuk memilih kelas lainnya
            </p>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
              onClick={() => router.push("/kelas")}
            >
              Kembali ke Daftar Kelas
            </Button>
          </div>
        </div>
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

  // Calculate promo discount amount
  let promoDiscountAmount = 0
  if (promoApplied && promoDiscount) {
    if (promoDiscountType === "percentage") {
      promoDiscountAmount = (courseType.normal_price * promoDiscount) / 100
    } else {
      promoDiscountAmount = promoDiscount
    }
  }

  // Calculate final price
  const finalPrice = Math.max(courseType.normal_price - discountAmount - promoDiscountAmount, 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Load Midtrans Snap JavaScript */}
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        onLoad={() => setMidtransLoaded(true)}
      />

      <Navbar />

      <div className="max-w-5xl mx-auto py-12 px-4 md:px-6 mt-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-800">Checkout</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Selesaikan pembayaran untuk mulai belajar</p>
        </div>

        {/* Checkout Steps */}
        <div className="mb-10">
          <div className="flex justify-center items-center max-w-md mx-auto">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <span className="text-sm mt-2 font-medium text-blue-600">Keranjang</span>
            </div>
            <div className="h-0.5 w-16 md:w-24 bg-blue-600"></div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white">
                <CreditCard className="h-5 w-5" />
              </div>
              <span className="text-sm mt-2 font-medium text-blue-600">Pembayaran</span>
            </div>
            <div className="h-0.5 w-16 md:w-24 bg-gray-300"></div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                <CheckCircle className="h-5 w-5" />
              </div>
              <span className="text-sm mt-2 font-medium text-gray-500">Selesai</span>
            </div>
          </div>
        </div>

        {/* Tampilkan peringatan jika tidak ada session */}
        {status === "unauthenticated" && authChecked && (
          <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg shadow-sm">
            <p className="text-amber-700 flex items-center text-sm md:text-base">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>
                Anda belum login. Silakan{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto text-blue-600 font-semibold"
                  onClick={() => router.push(`/login?redirect=/checkout?course=${courseTypeSlug}`)}
                >
                  login terlebih dahulu
                </Button>{" "}
                untuk melanjutkan checkout.
              </span>
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="overflow-hidden border-0 shadow-lg">
              <CardHeader className="bg-blue-600 text-white">
                <CardTitle className="flex items-center">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Ringkasan Pesanan
                </CardTitle>
                <CardDescription className="text-blue-100">Detail kelas yang akan Anda beli</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col gap-6">
                  <div className="relative w-full h-48 rounded-lg overflow-hidden shadow-md">
                    <Image
                      src={courseType.course_thumbnail || "/placeholder.svg?height=200&width=400"}
                      alt={courseType.course_title || "Course"}
                      fill
                      className="object-cover"
                    />
                    {courseType.is_discount && courseType.discount && (
                      <div className="absolute top-0 right-0 bg-red-500 text-white px-2 py-1 text-xs font-bold">
                        {courseType.discount_type === "percentage" ? `${courseType.discount}% OFF` : "DISKON"}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{courseType.course_title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {courseType.course_description || "Tidak ada deskripsi"}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                        {courseType.type === "batch" ? "Batch" : courseType.type === "private" ? "Private" : "Group"}
                      </Badge>
                      {courseType.batch_number && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200">
                          Batch {courseType.batch_number}
                        </Badge>
                      )}
                    </div>

                    <div className="mt-4 flex items-center">
                      <span className="text-gray-500 text-sm mr-2">Harga:</span>
                      {courseType.is_discount && courseType.discount ? (
                        <div className="flex items-center">
                          <span className="text-gray-400 line-through text-sm mr-2">
                            Rp {courseType.normal_price.toLocaleString("id-ID")}
                          </span>
                          <span className="text-lg font-bold text-blue-600">
                            Rp {(courseType.normal_price - discountAmount).toLocaleString("id-ID")}
                          </span>
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-blue-600">
                          Rp {courseType.normal_price.toLocaleString("id-ID")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Promo Code - Only show if is_voucher is true */}
            {courseType.is_voucher && (
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-purple-600 text-white">
                  <CardTitle className="flex items-center">
                    <Tag className="mr-2 h-5 w-5" />
                    Kode Promo
                  </CardTitle>
                  <CardDescription className="text-purple-100">
                    Masukkan kode promo jika Anda memilikinya
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Masukkan kode promo"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        disabled={promoApplied || validatingPromo}
                        className={cn(
                          "border-2 focus-visible:ring-blue-500",
                          promoApplied ? "border-green-500 bg-green-50" : "border-gray-200",
                        )}
                      />
                    </div>
                    <Button
                      variant={promoApplied ? "outline" : "default"}
                      onClick={handleApplyPromo}
                      disabled={promoApplied || validatingPromo || !promoCode.trim()}
                      className={
                        promoApplied ? "border-2 border-green-500 text-green-600" : "bg-purple-600 hover:bg-purple-700"
                      }
                    >
                      {validatingPromo ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memvalidasi
                        </>
                      ) : promoApplied ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" /> Diterapkan
                        </>
                      ) : (
                        "Terapkan"
                      )}
                    </Button>
                  </div>
                  {promoApplied && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm flex items-start">
                      <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Kode promo berhasil diterapkan!</p>
                        <p className="mt-1">
                          Anda mendapatkan diskon{" "}
                          {promoDiscountType === "percentage"
                            ? `${promoDiscount}%`
                            : `Rp ${promoDiscount.toLocaleString("id-ID")}`}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Payment Summary */}
          <div>
            <Card className="border-0 shadow-lg sticky top-24">
              <CardHeader className="bg-gray-800 text-white">
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Ringkasan Pembayaran
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Harga Kelas</span>
                    <span className="font-medium">Rp {courseType.normal_price.toLocaleString("id-ID")}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span className="flex items-center">
                        <Tag className="h-4 w-4 mr-1" /> Diskon Kelas
                      </span>
                      <span className="font-medium">- Rp {discountAmount.toLocaleString("id-ID")}</span>
                    </div>
                  )}

                  {promoApplied && promoDiscountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span className="flex items-center">
                        <Tag className="h-4 w-4 mr-1" /> Diskon Promo{" "}
                        {promoDiscountType === "percentage" ? `(${promoDiscount}%)` : ""}
                      </span>
                      <span className="font-medium">- Rp {promoDiscountAmount.toLocaleString("id-ID")}</span>
                    </div>
                  )}

                  <Separator className="my-2" />

                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-blue-600">Rp {finalPrice.toLocaleString("id-ID")}</span>
                  </div>
                </div>

                <div className="mt-8">
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    size="lg"
                    onClick={handleCheckout}
                    disabled={processingPayment || status === "unauthenticated" || !midtransLoaded}
                  >
                    {processingPayment ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Memproses
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-5 w-5" /> Bayar Sekarang
                      </>
                    )}
                  </Button>

                  {status === "unauthenticated" && (
                    <p className="text-amber-600 text-sm mt-2 text-center">Anda perlu login terlebih dahulu</p>
                  )}

                  {!midtransLoaded && (
                    <p className="text-amber-600 text-sm mt-2 text-center">Memuat sistem pembayaran...</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 px-6 py-4">
                <div className="text-sm text-gray-600 space-y-2">
                  <div className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Pembayaran aman & terenkripsi</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Akses kelas setelah pembayaran berhasil</span>
                  </div>
                </div>
              </CardFooter>
            </Card>

            <div className="mt-6 text-sm text-gray-600 bg-white p-4 rounded-lg shadow border-0">
              <p className="text-center">
                Dengan melakukan pembayaran, Anda menyetujui{" "}
                <a href="#" className="text-blue-600 hover:underline font-medium">
                  Syarat dan Ketentuan
                </a>{" "}
                serta{" "}
                <a href="#" className="text-blue-600 hover:underline font-medium">
                  Kebijakan Privasi
                </a>{" "}
                kami.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

