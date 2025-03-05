import { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Image from "next/image";
import { CheckCircle } from "lucide-react";

export default function AboutSection() {
  const controls = useAnimation();
  const { ref, inView } = useInView({ triggerOnce: false, threshold: 0.2 });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    } else {
      controls.start("hidden");
    }
  }, [controls, inView]);

  return (
    <section id="about" className="py-24 xl:py-32 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-6 xl:px-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-16 xl:gap-24">
          
          {/* Gambar dengan animasi scroll */}
          <motion.div 
            ref={ref}
            initial="hidden"
            animate={controls}
            variants={{
              hidden: { opacity: 0, scale: 0.9, y: 30 },
              visible: { opacity: 1, scale: 1, y: 0 }
            }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="order-2 lg:order-1"
          >
            <div className="rounded-3xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-500 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-70 -z-10 transform -rotate-3"></div>
              <Image
                src="/images/about-img.png"
                width={600}
                height={450}
                alt="Students learning"
                className="w-full h-auto object-cover"
              />
            </div>
          </motion.div>

          {/* Konten teks dengan animasi scroll */}
          <motion.div 
            ref={ref}
            initial="hidden"
            animate={controls}
            variants={{
              hidden: { opacity: 0, x: -50 },
              visible: { opacity: 1, x: 0 }
            }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="order-1 lg:order-2 space-y-10"
          >
            <div>
              <span className="text-[#4A90E2] font-semibold text-lg">Tentang TeenCode</span>
              <h2 className="text-3xl md:text-4xl xl:text-5xl font-bold mt-2 leading-tight">
                Ayo! Segera Menjadi <br className="hidden md:block" />
                <span className="text-[#4A90E2]">Bagian Dari Kami!</span>
              </h2>
            </div>

            {/* List dengan animasi scroll */}
            <motion.ul className="space-y-6">
              {[
                { title: "Latihan Soal Adaptif", description: "Sistem kami menyesuaikan tingkat kesulitan berdasarkan kemampuanmu" },
                { title: "Konsultasi Dengan Mentor", description: "Tanya jawab langsung dengan mentor berpengalaman" },
                { title: "Lingkungan Belajar Yang Nyaman", description: "Platform yang user-friendly dan komunitas yang supportif" },
                { title: "Mendapatkan Sertifikat Resmi", description: "Sertifikat diakui oleh industri teknologi terkemuka" }
              ].map((feature, index) => (
                <motion.li 
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all group"
                  initial="hidden"
                  animate={controls}
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0 }
                  }}
                  transition={{ duration: 0.7, delay: index * 0.2 }}
                >
                  <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-[#4A90E2] group-hover:text-white transition-colors">
                    <CheckCircle className="h-6 w-6 text-[#4A90E2] group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-lg xl:text-xl font-semibold">{feature.title}</h3>
                    <p className="text-gray-600 mt-1">{feature.description}</p>
                  </div>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
