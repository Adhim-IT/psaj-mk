'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getListClasses } from '@/lib/list-kelas';
import { Clock, BookOpen, ChevronRight } from 'lucide-react';

// Types
type MentorData = {
  id: string;
  name: string;
  profile_picture?: string;
  specialization?: string;
};

type CourseData = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  level: string;
  meetings: number;
  slug: string;
  is_popular: boolean;
  mentor: MentorData;
};

// Helper functions
const truncateText = (text: string, limit: number) => {
  return text.split(' ').length > limit ? text.split(' ').slice(0, limit).join(' ') + '...' : text;
};

const getDefaultMentorImage = (profilePicture?: string) => {
  if (!profilePicture || typeof profilePicture !== 'string') return '/images/mentor.png';
  return profilePicture.startsWith('http') ? profilePicture : '/images/mentor.png';
};

// Components
const CourseCard = ({ course }: { course: CourseData }) => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 group h-full flex flex-col">
    <div className="relative h-52 overflow-hidden">
      {course.is_popular && <div className="absolute top-3 left-0 bg-gradient-to-r from-amber-500 to-yellow-400 text-white text-xs font-bold px-4 py-1 rounded-r-full z-10">POPULER</div>}
      <Image
        src={typeof course.thumbnail === 'string' && course.thumbnail ? course.thumbnail : '/placeholder.svg?height=200&width=400'}
        alt={`Gambar kursus ${course.title}`}
        width={400}
        height={200}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        onError={(e) => {
          console.error('Error loading course thumbnail:', course.thumbnail);
          (e.target as HTMLImageElement).src = '/placeholder.svg?height=200&width=400';
        }}
        unoptimized={true}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
        <span className="text-white font-medium">Lihat Detail</span>
        <ChevronRight className="text-white h-5 w-5" />
      </div>
    </div>

    <div className="p-5 flex flex-col flex-grow">
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${course.level === 'Beginner' ? 'bg-green-100 text-green-700' : course.level === 'Intermediate' ? 'bg-[#e6f0fc] text-[#5596DF]' : 'bg-purple-100 text-purple-700'}`}>
          {course.level}
        </span>
      </div>

      <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">{course.title}</h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{truncateText(course.description, 15)}</p>

      <div className="mt-auto space-y-4">
        <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
            <Image
              src={typeof course.mentor.profile_picture === 'string' && course.mentor.profile_picture ? course.mentor.profile_picture : '/images/mentor.png'}
              alt={`Mentor ${course.mentor.name}`}
              width={40}
              height={40}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('Error loading mentor image:', course.mentor.profile_picture);
                (e.target as HTMLImageElement).src = '/images/mentor.png';
              }}
              unoptimized={true}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-800">{course.mentor.name}</span>
            {course.mentor.specialization && <span className="text-xs text-gray-500">{course.mentor.specialization}</span>}
          </div>
        </div>

        <div className="flex justify-between items-center text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-[#5596DF]" />
            <span>{course.meetings} Pertemuan</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4 text-[#5596DF]" />
            <span>Online</span>
          </div>
        </div>

        <Link href={`/kelas/${course.slug}`} className="mt-2 inline-flex w-full items-center justify-center bg-[#5596DF] text-white px-4 py-2.5 rounded-lg font-medium hover:bg-[#4785cc] transition-colors">
          Daftar Sekarang
        </Link>
      </div>
    </div>
  </div>
);

// Main component - Removed PageHeader and display count div
export default function CourseList({ maxCourses, courses: initialCourses, title }: { maxCourses?: number; courses?: CourseData[]; title?: string }) {
  const [courses, setCourses] = useState<CourseData[]>(initialCourses || []);
  const [loading, setLoading] = useState(!initialCourses);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialCourses) {
      setCourses(initialCourses);
      setLoading(false);
      return;
    }
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const { listClasses, error } = await getListClasses();

        if (error) {
          setError(error);
          return;
        }

        const coursesData = (listClasses || [])
          .filter((course) => course.is_active)
          .map((course) => ({
            id: course.id,
            title: course.title,
            description: course.description,
            thumbnail: course.thumbnail,
            level: course.level,
            meetings: course.meetings,
            slug: course.slug,
            is_popular: course.is_popular,
            mentor: {
              id: course.mentors?.id || '',
              name: course.mentors?.name || 'Mentor',
              profile_picture: course.mentors?.profile_picture ?? '/images/mentor.png',
              specialization: course.mentors?.specialization,
            },
          }));

        setCourses(coursesData);
      } catch (err) {
        setError('Failed to fetch courses');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [initialCourses]);

  // Apply maxCourses limit if provided
  const displayedCourses = maxCourses ? courses.slice(0, maxCourses) : courses;

  // Loading state
  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#5596DF] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4 text-gray-600">Memuat kelas...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="py-24 text-center">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <>
      {displayedCourses.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Tidak ada kursus yang tersedia saat ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {displayedCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </>
  );
}
