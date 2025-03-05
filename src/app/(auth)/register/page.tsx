"use client"

import RegisterForm from "@/components/auth/form-register"
import { Rocket } from "lucide-react"

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Left side - Content and imagery */}
      <div className="w-full md:w-1/2 bg-[#3182CE] text-white p-8 flex flex-col justify-center">
        <div className="max-w-md mx-auto space-y-6">
          <div className="inline-block bg-white/20 rounded-full px-4 py-1 text-sm backdrop-blur-sm">
            Platform Belajar IT #1 di Indonesia
          </div>

          <h1 className="text-4xl md:text-5xl font-bold">
            Belajar IT Jadi <span className="text-[#FACC15]">Mudah & Seru!</span>
          </h1>

          <div className="flex items-center space-x-2">
            <Rocket className="h-8 w-8 text-[#FACC15]" />
            <p className="text-xl">Bergabung sekarang dan mulai perjalanan IT Anda</p>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-8">
            <div className="text-center">
              <div className="text-[#FACC15] text-2xl font-bold">10,000+</div>
              <div className="text-sm">Pelajar Aktif</div>
            </div>
            <div className="text-center">
              <div className="text-[#FACC15] text-2xl font-bold">50+</div>
              <div className="text-sm">Kursus Tersedia</div>
            </div>
            <div className="text-center">
              <div className="text-[#FACC15] text-2xl font-bold">95%</div>
              <div className="text-sm">Tingkat Kelulusan</div>
            </div>
          </div>

          <div className="pt-6">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-ujdNj88Q9KYwQL2K4XytPUDvN7P9VW.png"
              alt="TeenCode Learning Platform"
              className="rounded-lg shadow-lg max-w-full h-auto object-cover opacity-90"
            />
          </div>
        </div>
      </div>

      {/* Right side - Registration form */}
      <div className="w-full md:w-1/2 bg-gray-50 p-6 md:p-12 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8 border border-gray-100">
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}

