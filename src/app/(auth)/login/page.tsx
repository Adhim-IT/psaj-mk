

import LoginForm from "@/components/auth/form-login"
import { Rocket } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Left side - Content and imagery */}
      <div className="w-full lg:w-1/2 bg-[#3182CE] text-white p-4 sm:p-6 md:p-8 flex flex-col justify-center">
        <div className="max-w-xl mx-auto space-y-4 sm:space-y-6 px-2 sm:px-4">
          <div className="inline-block bg-white/20 rounded-full px-3 py-1 text-xs sm:text-sm backdrop-blur-sm">
            Platform Belajar IT #1 di Indonesia
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
            Selamat Datang <span className="text-[#FACC15]">Kembali!</span>
          </h1>

          <div className="flex items-center space-x-2">
            <Rocket className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-[#FACC15]" />
            <p className="text-base sm:text-lg md:text-xl">Lanjutkan perjalanan belajar IT Anda</p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 sm:pt-6">
            <div className="text-center">
              <div className="text-[#FACC15] text-lg sm:text-xl md:text-2xl font-bold">10,000+</div>
              <div className="text-xs sm:text-sm">Pelajar Aktif</div>
            </div>
            <div className="text-center">
              <div className="text-[#FACC15] text-lg sm:text-xl md:text-2xl font-bold">50+</div>
              <div className="text-xs sm:text-sm">Kursus Tersedia</div>
            </div>
            <div className="text-center">
              <div className="text-[#FACC15] text-lg sm:text-xl md:text-2xl font-bold">95%</div>
              <div className="text-xs sm:text-sm">Tingkat Kelulusan</div>
            </div>
          </div>

          {/* Hide image on small mobile, show on larger screens */}
          <div className="hidden sm:block pt-4 sm:pt-6">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-ujdNj88Q9KYwQL2K4XytPUDvN7P9VW.png"
              alt="TeenCode Learning Platform"
              className="rounded-lg shadow-lg max-w-full h-auto object-cover opacity-90"
            />
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 bg-gray-50 p-4 sm:p-6 md:p-8 lg:p-10 flex items-center justify-center">
        <div className="w-full max-w-md sm:max-w-lg bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 md:p-8">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}

