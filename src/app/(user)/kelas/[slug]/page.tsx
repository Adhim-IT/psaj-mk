import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import DetailCourse from '@/components/user/kelas/detail-course';
import { getListClasses, getListClassById } from '@/lib/list-kelas';
import { getMentorById } from '@/lib/mentor-userpage';
import { getToolsById } from '@/lib/tools';
import { getCourseTypesByCourseId } from '@/lib/course-types';
import type { ListClass, Mentor, Tool } from '@/types';

// Force dynamic rendering to always fetch fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

async function CourseDetailContent({ slug }: { slug: string }) {
  try {
    console.log(`Fetching course data for slug: ${slug}`);

    // Ambil semua kelas untuk mencari yang sesuai dengan slug
    const { listClasses, error: classesError } = await getListClasses();

    if (classesError || !listClasses) {
      console.error('Error fetching list classes:', classesError);
      throw new Error(classesError || 'Gagal mengambil data kelas');
    }

    // Temukan kelas berdasarkan slug
    const course = listClasses.find((course: any) => course.slug === slug);

    if (!course) {
      console.error(`Course with slug ${slug} not found`);
      return notFound();
    }

    console.log(`Found course with ID: ${course.id}`);

    // Ambil detail kelas berdasarkan ID
    const { listClass, error: detailError } = await getListClassById(course.id);

    if (detailError || !listClass) {
      console.error('Error fetching course details:', detailError);
      throw new Error(detailError || 'Gagal mengambil detail kelas');
    }

    // Ambil data mentor
    let mentor: Mentor | undefined;

    if (listClass.mentor_id) {
      try {
        console.log(`Fetching mentor data for ID: ${listClass.mentor_id}`);
        const mentorResult = await getMentorById(listClass.mentor_id);
        if (mentorResult.mentor) {
          mentor = mentorResult.mentor;
          console.log('Mentor data fetched successfully');
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
        specialization: course.mentors.specialization || '',
      };
      console.log('Using fallback mentor data from course');
    }

    // Ambil data tools
    let completeTools: Tool[] = [];

    if (listClass.tools && listClass.tools.length > 0) {
      try {
        console.log(`Fetching tools data for course: ${course.id}`);
        const toolIds = listClass.tools.map((tool: any) => tool.id);
        const { tools } = await getToolsById(toolIds);
        if (tools && tools.length > 0) {
          completeTools = tools;
          console.log(`Fetched ${tools.length} tools successfully`);
        }
      } catch (toolError) {
        console.error('Error mengambil data tools:', toolError);
      }
    }

    // Ambil tipe kursus berdasarkan course ID
    let courseTypes = [];
    try {
      console.log(`Fetching course types for course ID: ${course.id}`);
      const { courseTypes: types, error: typesError } = await getCourseTypesByCourseId(course.id);

      if (typesError) {
        console.error('Error fetching course types:', typesError);
      }

      if (!typesError && types && types.length > 0) {
        courseTypes = types;
        console.log(`Fetched ${types.length} course types successfully`);
        console.log(
          'Course types data:',
          JSON.stringify(
            types.map((t: any) => ({
              id: t.id,
              type: t.type,
              batch_number: t.batch_number,
              normal_price: t.normal_price,
              is_active: t.is_active,
            }))
          )
        );
      } else {
        console.log('No course types found or empty result');
      }
    } catch (courseTypesError) {
      console.error('Error mengambil tipe kursus:', courseTypesError);
    }

    // Buat objek kursus dengan data lengkap
    const transformedCourse: ListClass = {
      ...listClass,
      tools: completeTools.length > 0 ? completeTools : listClass.tools,
    };

    console.log('Course data prepared successfully, rendering DetailCourse component');

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

// Disable static generation to ensure fresh data
export const generateStaticParams = () => {
  return [];
};
