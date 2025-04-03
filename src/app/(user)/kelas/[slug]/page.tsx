import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import DetailCourse from '@/components/user/kelas/detail-course';
import { getListClasses, getListClassById } from '@/lib/list-kelas';
import { getMentorById } from '@/lib/mentor-userpage';
import { getToolsById } from '@/lib/tools';
import { getCourseTypesByCourseId } from '@/lib/course-types';
import type { ListClass, Mentor, Tool } from '@/types';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

async function CourseDetailContent({ slug }: { slug: string }) {
  try {
    // Ambil semua kelas untuk mencari yang sesuai dengan slug
    const { listClasses, error: classesError } = await getListClasses();

    if (classesError || !listClasses) {
      throw new Error(classesError || 'Gagal mengambil data kelas');
    }

    // Temukan kelas berdasarkan slug
    const course = listClasses.find((course: any) => course.slug === slug);

    if (!course) {
      return notFound();
    }

    // Ambil detail kelas berdasarkan ID
    const { listClass, error: detailError } = await getListClassById(course.id);

    if (detailError || !listClass) {
      throw new Error(detailError || 'Gagal mengambil detail kelas');
    }

    // Ambil data mentor
    let mentor: Mentor | undefined;

    if (listClass.mentor_id) {
      try {
        const mentorResult = await getMentorById(listClass.mentor_id);
        if (mentorResult.mentor) {
          mentor = mentorResult.mentor;
        }
      } catch (mentorError) {
        console.error('Error mengambil data mentor:', mentorError);
      }
    }

    // Gunakan data mentor dari course jika tidak ditemukan
    if (!mentor && course.mentors) {
      mentor = {
        id: course.mentors.id || listClass.mentor_id,
        name: course.mentors.name || 'Mentor',
        profile_picture: course.mentors.profile_picture || null,
        specialization: course.mentors.specialization || "",
      };
    }

    // Ambil data tools
    let completeTools: Tool[] = [];

    if (listClass.tools && listClass.tools.length > 0) {
      try {
        const toolIds = listClass.tools.map((tool: any) => tool.id);
        const { tools } = await getToolsById(toolIds);
        if (tools && tools.length > 0) {
          completeTools = tools;
        }
      } catch (toolError) {
        console.error('Error mengambil data tools:', toolError);
      }
    }

    // Ambil tipe kursus berdasarkan course ID
    let courseTypes = [];
    try {
      const { courseTypes: types, error: typesError } = await getCourseTypesByCourseId(course.id);
      if (!typesError && types && types.length > 0) {
        courseTypes = types;
      }
    } catch (courseTypesError) {
      console.error('Error mengambil tipe kursus:', courseTypesError);
    }

    // Buat objek kursus dengan data lengkap
    const transformedCourse: ListClass = {
      ...listClass,
      tools: completeTools.length > 0 ? completeTools : listClass.tools,
    };

    return <DetailCourse course={transformedCourse} mentor={mentor} courseTypes={courseTypes} />;
  } catch (error) {
    console.error('Error di CourseDetailContent:', error);
    throw error;
  }
}

export default async function CourseDetailPage({ params }: PageProps) {
  // ✅ Await params sebelum mengakses propertinya
  const { slug } = await params;

  if (!slug) {
    return notFound();
  }

  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="h-12 w-12 animate-spin text-[#4A90E2]" />
          <p className="mt-4 text-lg text-gray-600">Memuat detail kelas...</p>
        </div>
      }
    >
      <CourseDetailContent slug={slug} />
    </Suspense>
  );
}

export async function generateStaticParams() {
  const { listClasses } = await getListClasses();

  if (!listClasses) return [];

  return listClasses
    .filter((course: any) => course.is_active)
    .map((course: any) => ({
      slug: course.slug,
    }));
}
