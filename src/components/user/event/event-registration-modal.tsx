"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { X } from "lucide-react"
import Swal from "sweetalert2"

interface RegistrationModalProps {
    event: {
        id: string
        title: string
        price: number | null
        whatsapp_group_link: string
    }
    isOpen: boolean
    onClose: () => void
    onSubmit: (phoneNumber: string, paymentProof: File | null) => Promise<void>
}

export function EventRegistrationModal({ event, isOpen, onClose, onSubmit }: RegistrationModalProps) {
    const [phoneNumber, setPhoneNumber] = useState("")
    const [paymentProof, setPaymentProof] = useState<File | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [fileName, setFileName] = useState("")
    const [phoneError, setPhoneError] = useState("")

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPaymentProof(e.target.files[0])
            setFileName(e.target.files[0].name)
        }
    }

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        // Only allow numbers
        if (/^\d*$/.test(value)) {
            setPhoneNumber(value)
            setPhoneError("")
        }
    }

    const validatePhone = () => {
        if (!phoneNumber) {
            setPhoneError("Nomor telepon harus diisi")
            return false
        }

        if (phoneNumber.length < 10 || phoneNumber.length > 13) {
            setPhoneError("Nomor telepon harus antara 10-13 digit")
            return false
        }

        if (!phoneNumber.startsWith("08")) {
            setPhoneError("Nomor telepon harus diawali dengan 08")
            return false
        }

        return true
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validate phone number
        if (!validatePhone()) {
            return
        }

        if (!paymentProof && event.price) {
            Swal.fire({
                title: "Error",
                text: "Bukti pembayaran harus diunggah",
                icon: "error",
                confirmButtonColor: "#4A90E2",
            })
            return
        }

        try {
            setIsSubmitting(true)
            await onSubmit(phoneNumber, paymentProof)
            Swal.fire({
                title: "Berhasil",
                text: "Pendaftaran berhasil dikirim. Menunggu konfirmasi admin.",
                icon: "success",
                confirmButtonColor: "#4A90E2",
            })
            onClose()
        } catch (error: any) {
            Swal.fire({
                title: "Error",
                text: error.message || "Terjadi kesalahan saat mendaftar. Silakan coba lagi.",
                icon: "error",
                confirmButtonColor: "#4A90E2",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md max-h-screen overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Pendaftaran {event.title}</DialogTitle>
                    <DialogDescription>Silahkan lengkapi data pendaftaran Anda</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="phone-number">Nomor WhatsApp</Label>
                        <Input
                            id="phone-number"
                            type="tel"
                            placeholder="08xxxxxxxxxx"
                            value={phoneNumber}
                            onChange={handlePhoneChange}
                            className={phoneError ? "border-red-500" : ""}
                        />
                        {phoneError && <p className="text-red-500 text-sm">{phoneError}</p>}
                        <p className="text-xs text-gray-500">Pastikan nomor WhatsApp Anda aktif untuk menerima informasi event</p>
                    </div>

                    {event.price ? (
                        <>
                            <div className="flex justify-center mb-4">
                                <div className="border p-4 rounded-lg">
                                    <Image src="/qris-payment.png" alt="QRIS Payment" width={300} height={300} className="mx-auto" />
                                </div>
                            </div>
                            <p className="text-center font-medium mb-4">Silahkan Lakukan Pembayaran, dengan scan QR diatas</p>
                            <p className="text-center mb-6">
                                Nominal yang harus ditransfer :{" "}
                                <span className="font-bold">Rp {event.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>
                            </p>

                            <div className="space-y-2">
                                <Label htmlFor="payment-proof">Bukti pembayaran</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="payment-proof"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => document.getElementById("payment-proof")?.click()}
                                        className="w-full px-4 py-2 flex items-center justify-center"
                                    >
                                        <span className="block max-w-[80%] truncate">
                                            {fileName
                                                ? fileName.split(" ").length > 9
                                                    ? fileName.split(" ").slice(0, 9).join(" ") + "..."
                                                    : fileName
                                                : "Pilih File"}
                                        </span>
                                    </Button>
                                </div>


                            </div>
                        </>
                    ) : (
                        <p className="text-center font-medium mb-4">Event ini gratis. Klik tombol daftar untuk bergabung.</p>
                    )}

                    <Button type="submit" className="w-full bg-[#4A90E2] hover:bg-[#3178c6]" disabled={isSubmitting}>
                        {isSubmitting ? "Memproses..." : "Daftar Event"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}

