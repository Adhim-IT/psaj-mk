import Link from 'next/link';
import { Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white text-gray-800 py-12 border-t">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Logo and Address Section */}
          <div className="flex flex-col space-y-5">
            <div className="flex items-center">
              <img src="/images/logo/logo-teencode.png" alt="Logo" width={140} height={140} className="h-auto" />
            </div>
            <div className="text-base font-medium">Teen Code Academy</div>
            <p className="text-sm text-gray-600 leading-relaxed">
              JL. KALIBENER, PURWANEGARA,
              <br />
              PURWOKERTO TIMUR KAB.
              <br />
              BANYUMAS JAWA TENGAH.
            </p>
            <div className="mt-3">
              <Link
                href="https://www.instagram.com/teen.codee?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                aria-label="Instagram"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 text-white hover:shadow-lg transition-all duration-300"
              >
                <Instagram size={20} />
              </Link>
            </div>
          </div>

          {/* Tautan Section */}
          <div>
            <h3 className="text-lg font-semibold mb-5 relative after:content-[''] after:absolute after:w-10 after:h-1 after:bg-blue-500 after:left-0 after:bottom-0 after:-mb-2">Tautan</h3>
            <ul className="space-y-3 mt-6">
              {['Home', 'Kelas', 'Artikel', 'Mentor', 'Event'].map((item) => (
                <li key={item}>
                  <Link href={`/${item === 'Home' ? '' : item.toLowerCase()}`} className="text-gray-600 hover:text-blue-500 transition-colors duration-300 flex items-center">
                    <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 opacity-0 transform -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"></span>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Program Section */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-5 relative after:content-[''] after:absolute after:w-10 after:h-1 after:bg-blue-500 after:left-0 after:bottom-0 after:-mb-2">Program</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
              <div className="bg-gray-50 p-4 rounded-lg hover:shadow-md transition-all duration-300">
                <Link href="/program/online-bootcamp" className="text-gray-700 hover:text-blue-500 transition-colors font-medium block">
                  Online Private
                </Link>
                <p className="text-xs text-gray-500 mt-1">Belajar secara private dengan mentor</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg hover:shadow-md transition-all duration-300">
                <Link href="/program/batch-bootcamp" className="text-gray-700 hover:text-blue-500 transition-colors font-medium block">
                  Online Batch
                </Link>
                <p className="text-xs text-gray-500 mt-1">Belajar dalam batch dengan jadwal tertentu</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg hover:shadow-md transition-all duration-300">
                <Link href="/program/group-class" className="text-gray-700 hover:text-blue-500 transition-colors font-medium block">
                  Online Group
                </Link>
                <p className="text-xs text-gray-500 mt-1">Belajar dalam kelompok kecil</p>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-gray-200 pt-6 text-center">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} Dilesin, All Rights Reserved. Design By{' '}
            <Link href="https://teencode.id" className="text-blue-500 hover:text-blue-700 transition-colors font-medium">
              TeenCode
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
