import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-6 xl:px-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <Link href="/" className="inline-block mb-6">
              <Image
                src="/images/logo/logo-teencode.png"
                alt="TeenCode Logo"
                width={120}
                height={120}
                className="bg-white p-2 rounded-lg"
              />
            </Link>
            <p className="text-gray-400 mb-6">
              Platform belajar IT #1 di Indonesia untuk remaja dan pemula. Belajar coding jadi mudah dan menyenangkan!
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="bg-gray-800 p-2 rounded-full hover:bg-[#4A90E2] transition-colors">
                <Facebook size={18} />
              </Link>
              <Link href="#" className="bg-gray-800 p-2 rounded-full hover:bg-[#4A90E2] transition-colors">
                <Instagram size={18} />
              </Link>
              <Link href="#" className="bg-gray-800 p-2 rounded-full hover:bg-[#4A90E2] transition-colors">
                <Twitter size={18} />
              </Link>
              <Link href="#" className="bg-gray-800 p-2 rounded-full hover:bg-[#4A90E2] transition-colors">
                <Youtube size={18} />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6">Program</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/program/online-bootcamp" className="text-gray-400 hover:text-white transition-colors">
                  Online Bootcamp Intensive
                </Link>
              </li>
              <li>
                <Link href="/program/batch-bootcamp" className="text-gray-400 hover:text-white transition-colors">
                  Online Bootcamp Batch
                </Link>
              </li>
              <li>
                <Link href="/program/short-class" className="text-gray-400 hover:text-white transition-colors">
                  Online Short Class
                </Link>
              </li>
              <li>
                <Link href="/program/private-mentoring" className="text-gray-400 hover:text-white transition-colors">
                  Private Mentoring
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6">Perusahaan</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/tentang-kami" className="text-gray-400 hover:text-white transition-colors">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link href="/karir" className="text-gray-400 hover:text-white transition-colors">
                  Karir
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6">Kontak</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <Mail size={18} className="text-[#4A90E2] mt-1 flex-shrink-0" />
                <span className="text-gray-400">info@teencode.id</span>
              </li>
              <li className="flex items-start space-x-3">
                <Phone size={18} className="text-[#4A90E2] mt-1 flex-shrink-0" />
                <span className="text-gray-400">+62 812 3456 7890</span>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin size={18} className="text-[#4A90E2] mt-1 flex-shrink-0" />
                <span className="text-gray-400">Jl. Teknologi No. 123, Jakarta Selatan, Indonesia</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} TeenCode. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="/kebijakan-privasi" className="text-gray-500 text-sm hover:text-white transition-colors">
                Kebijakan Privasi
              </Link>
              <Link href="/syarat-ketentuan" className="text-gray-500 text-sm hover:text-white transition-colors">
                Syarat & Ketentuan
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

