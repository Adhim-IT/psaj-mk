import { Suspense } from "react"
import { notFound } from "next/navigation"
import { Loader2 } from "lucide-react"
import DetailCourse from "@/components/user/kelas/detail-course"
import { getListClasses, getListClassById } from "@/lib/list-kelas"
import { getMentorById } from "@/lib/mentor"
import { getToolsById } from "@/lib/tools"
import { getCourseTypesByCourseId } from "@/lib/course-types"
import type { ListClass, Mentor, Tool } from "@/types"

interface PageProps {
  params: {
    slug: string
  }
}

async function CourseDetailContent({ slug }: { slug: string }) {
  try {
    // Get all courses to find the one with matching slug
    const { listClasses, error: classesError } = await getListClasses()

    if (classesError || !listClasses) {
      throw new Error(classesError || "Failed to fetch courses")
    }

    // Find the course with the matching slug
    const course = listClasses.find((course) => course.slug === slug)

    if (!course) {
      notFound()
    }

    // Get detailed course information
    const { listClass, error: detailError } = await getListClassById(course.id)

    if (detailError || !listClass) {
      throw new Error(detailError || "Failed to fetch course details")
    }

    // Get mentor information
    let mentor: Mentor | undefined

    // If the course has a mentor_id, fetch the mentor details
    if (listClass.mentor_id) {
      try {
        const mentorResult = await getMentorById(listClass.mentor_id)

        if (mentorResult.mentor) {
          mentor = mentorResult.mentor
        }
      } catch (mentorError) {
        console.error("Error fetching mentor:", mentorError)
        // Continue without mentor data if there's an error
      }
    }

    // Fallback to using mentor data from the course if available
    if (!mentor && course.mentors) {
      mentor = {
        id: course.mentors.id || listClass.mentor_id,
        name: course.mentors.name || "Mentor",
        profile_picture: course.mentors.profile_picture || null,
        specialization: course.mentors.specialization || undefined,
      }
    }

    // Get complete tool information if tools exist
    let completeTools: Tool[] = []

    if (listClass.tools && listClass.tools.length > 0) {
      try {
        // Get the tool IDs from the course
        const toolIds = listClass.tools.map((tool) => tool.id)

        // Fetch complete tool information
        const { tools } = await getToolsById(toolIds)

        if (tools && tools.length > 0) {
          completeTools = tools
        }
      } catch (toolError) {
        console.error("Error fetching tools:", toolError)
        // Continue with basic tool data if there's an error
      }
    }

    // Fetch course types for this course
    let courseTypes = []
    try {
      const { courseTypes: types, error: typesError } = await getCourseTypesByCourseId(course.id)

      if (!typesError && types && types.length > 0) {
        courseTypes = types
      }
    } catch (courseTypesError) {
      console.error("Error fetching course types:", courseTypesError)
      // Continue without course types if there's an error
    }

    // Create a transformed course object with complete tool data
    const transformedCourse: ListClass = {
      ...listClass,
      tools: completeTools.length > 0 ? completeTools : listClass.tools,
    }

    return <DetailCourse course={transformedCourse} mentor={mentor} courseTypes={courseTypes} />
  } catch (error) {
    console.error("Error in CourseDetailContent:", error)
    throw error
  }
}

export default function CourseDetailPage({ params }: PageProps) {
  const { slug } = params

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
  )
}

// Generate static params for all courses
export async function generateStaticParams() {
  const { listClasses } = await getListClasses()

  if (!listClasses) return []

  return listClasses
    .filter((course) => course.is_active)
    .map((course) => ({
      slug: course.slug,
    }))
}

