import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, MessageCircle, Calendar } from 'lucide-react';
import ProgramPage from '@/src/components/user/program';

export default function BatchBootcamp() {
  return (
    <main className="min-h-screen ">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-20 md:py-32">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))] dark:bg-grid-slate-700/25 "></div>
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center ">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-[#5596DF] to-[#41C5E9] bg-clip-text text-transparent md:max-w-2xl">Online Batch</h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                Program Online Batch merupakan program TeenCode dimana peserta dalam bentuk kelompok yang terdiri maksimal 15 orang. Kelas bersifat online sehingga bisa diikuti peserta dari mana saja dan kapan saja.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="#" className="inline-flex items-center px-4 py-2 text-lg font-medium text-white bg-gradient-to-r from-[#5596DF] to-[#41C5E9] rounded-lg hover:from-[#5596DF] hover:to-[#41C5E9] gap-2">
                  Lihat Semua Kelas
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-8 w-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium">
                      {i}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">500+</span> students enrolled this month
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-blue-100 rounded-full blur-2xl opacity-80"></div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-100 rounded-full blur-2xl opacity-80"></div>

              <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <Image src="/images/program/online-batch-bootcamp.png" width={600} height={500} alt="Student learning online" className="w-full h-auto" priority />

                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                  <div className="h-3 w-3 bg-green-500 rounded-full pulse-animation"></div>
                </div>

                <div className="absolute -bottom-3 -left-3 bg-white rounded-lg shadow-lg p-3 flex items-center gap-2 border border-gray-100">
                  <MessageCircle className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium">Live Support</span>
                </div>

                <div className="absolute -bottom-3 -right-3 bg-white rounded-lg shadow-lg p-3 flex items-center gap-2 border border-gray-100">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  <span className="text-sm font-medium">Flexible Schedule</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ProgramPage />
    </main>
  );
}
