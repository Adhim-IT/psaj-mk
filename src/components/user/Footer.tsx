import Link from "next/link"
import { Instagram, Youtube } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-white text-gray-800 py-8 border-t">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo and Address Section */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <img src="/images/logo/logo-teencode.png" alt="Logo" width={120} height={120} />
            </div>
            <div className="text-sm">Teen Code Academy</div>
            <p className="text-sm text-gray-600 mt-4">
              Jl. DI Panjaitan No.128
              <br />
              PURWOKERTO SELATAN KAB.
              <br />
              BANYUMAS JAWA TENGAH.
            </p>
            <div className="flex space-x-2 mt-2">
              <Link href="#" aria-label="YouTube" className="bg-red-600 text-white p-1 rounded">
                <Youtube size={16} />
              </Link>
              <Link href="#" aria-label="TikTok" className="bg-black text-white p-1 rounded">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </Link>
              <Link href="#" aria-label="Instagram" className="bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 text-white p-1 rounded">
                <Instagram size={16} />
              </Link>
              <Link href="#" aria-label="Twitter/X" className="bg-black text-white p-1 rounded">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Tautan Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Tautan</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-600 hover:text-blue-500 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/kelas" className="text-gray-600 hover:text-blue-500 transition-colors">
                  Kelas
                </Link>
              </li>
              <li>
                <Link href="/artikel" className="text-gray-600 hover:text-blue-500 transition-colors">
                  Artikel
                </Link>
              </li>
              <li>
                <Link href="/mentor" className="text-gray-600 hover:text-blue-500 transition-colors">
                  Mentor
                </Link>
              </li>
              <li>
                <Link href="/event" className="text-gray-600 hover:text-blue-500 transition-colors">
                  Event
                </Link>
              </li>
            </ul>
          </div>

          {/* Program Section */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Program</h3>
            <ul className="space-y-2 grid grid-cols-1 md:grid-cols-2 gap-2">
             
              <li>
                <Link href="/program/online-bootcamp" className="text-gray-600 hover:text-blue-500 transition-colors">
                  Online Bootcamp Intensive
                </Link>
              </li>
              <li>
                <Link href="/program/batch-bootcamp" className="text-gray-600 hover:text-blue-500 transition-colors">
                  Online Bootcamp Batch
                </Link>
              </li>
              <li>
                <Link href="/program/short-class" className="text-gray-600 hover:text-blue-500 transition-colors">
                  Online Short Class
                </Link>
              </li>
             
            </ul>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-gray-200 pt-4 text-center text-sm text-gray-600">
          <p>
            © {new Date().getFullYear()} Dilesin, All Rights Reserved. Design By{' '}
            <Link href="https://teencode.id" className="text-blue-500 hover:underline">
              TeenCode
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

