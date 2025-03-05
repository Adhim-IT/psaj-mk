import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const courses = [
  {
    title: "Dasar Pemrograman",
    description: "Belajar HTML, CSS, JavaScript dan framework modern",
    image: "/images/foto-kelas.png",
    level: "Pemula",
    modules: 4,
    slug: "dasar-pemrograman"
  },
  {
    title: "Mobile App Development",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos, et nemo dicta ab minima commodi eos sequi consequuntur fugit assumenda culpa similique.",
    image: "/images/foto-kelas.png",
    level: "Menengah",
    modules: 18,
    slug: "mobile-app-development"
  },
  {
    title: "UI/UX Design",
    description: "Desain antarmuka yang menarik dan user-friendly",
    image: "/images/foto-kelas.png",
    level: "Pemula",
    modules: 15,
    slug: "ui-ux-design"
  },
];

const truncateText = (text: string, limit: number) => {
  return text.split(" ").length > limit
    ? text.split(" ").slice(0, limit).join(" ") + "..."
    : text;
};

export default function AllCourse({ maxCourses }: { maxCourses?: number }) {
  const displayedCourses = maxCourses ? courses.slice(0, maxCourses) : courses;

  return (
    <section id="courses" className="py-24 bg-gray-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute left-0 top-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -left-20 top-20 w-64 h-64 bg-blue-200/30 rounded-full"></div>
        <div className="absolute right-10 bottom-10 w-80 h-80 bg-blue-200/20 rounded-full"></div>
      </div>

      <div className="container mx-auto px-6 xl:px-8 max-w-7xl relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[#4A90E2] font-semibold">Kursus Populer</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2">
            Pilih Kursus Sesuai Minatmu
          </h2>
          <p className="text-gray-600 mt-4 text-lg">
            Kami menyediakan berbagai kursus IT yang dirancang untuk pemula
            hingga tingkat lanjut
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedCourses.map((course, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={course.image || "/placeholder.svg"}
                  alt={`Gambar kursus ${course.title}`}
                  width={400}
                  height={200}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                  <span className="text-white font-medium p-4">Lihat Detail</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold">{course.title}</h3>
                <p className="text-gray-600 mt-2">
                  {truncateText(course.description, 15)}
                </p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-500">{course.level}</span>
                  <span className="text-sm text-[#4A90E2]">
                    {course.modules} Pertemuan
                  </span>
                </div>
                <Link
                  href={`/kelas/${course.slug}`}
                  className="mt-6 inline-flex w-full items-center justify-center bg-[#4A90E2] text-white px-4 py-2.5 rounded-lg font-medium hover:bg-[#3178c6] transition-colors"
                >
                  Daftar Sekarang
                </Link>

              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/kelas"
            className="inline-flex items-center text-[#4A90E2] font-medium hover:text-[#3178c6] transition-colors"
          >
            Lihat Semua Kursus
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
