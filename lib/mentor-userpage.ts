
"use server"
import type { Mentor } from "@/types"
import prisma from "./prisma"

// Define additional types needed for the mentor detail page
export type Course = {
  id: string
  title: string
  slug: string
  thumbnail: string
  description: string
  level: string
  meetings: number
  is_popular: boolean
  is_active: boolean
}

export type CourseStudentGroup = {
  id: string
  name: string
  start_date: Date
  end_date: Date
  total_meeting: number
  remarks?: string | null
  course_types: {
    id: string
    type: "group" | "private" | "batch"
    courses: {
      title: string
      slug: string
      thumbnail: string
    }
  }
}

export type Event = {
  id: string
  title: string
  slug: string
  thumbnail: string
  description: string
  start_date: Date
  end_date: Date
  price?: any // Using any for Decimal type compatibility
}

export async function getMentorById(id: string): Promise<{ mentor?: Mentor }> {
  const mentor = await prisma.mentors.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      specialization: true,
      profile_picture: true,
      bio: true,
      city: true,
      gender: true,
      phone: true,
      username: true,
    },
  })

  return { mentor: mentor ?? undefined }
}

export async function getAllMentors(): Promise<{ mentors: Mentor[] }> {
  const mentors = await prisma.mentors.findMany({
    where: {
      deleted_at: null,
    },
    select: {
      id: true,
      name: true,
      specialization: true,
      profile_picture: true,
      bio: true,
      city: true,
      username: true,
    },
    orderBy: {
      name: "asc",
    },
  })

  return { mentors }
}

export async function getMentorByUsername(username: string): Promise<{
  mentor?: Mentor
  courses?: Course[]
  courseGroups?: CourseStudentGroup[]
  events?: Event[]
}> {
  const mentor = await prisma.mentors.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      specialization: true,
      profile_picture: true,
      bio: true,
      city: true,
      gender: true,
      phone: true,
      username: true,
    },
  })

  if (!mentor) {
    return { mentor: undefined }
  }

  // Get courses taught by this mentor
  const courses = await prisma.courses.findMany({
    where: {
      mentor_id: mentor.id,
      deleted_at: null,
      is_active: true,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      thumbnail: true,
      description: true,
      level: true,
      meetings: true,
      is_popular: true,
      is_active: true,
    },
    orderBy: {
      created_at: "desc",
    },
  })

  // Get course groups taught by this mentor
  const courseGroups = await prisma.course_student_groups.findMany({
    where: {
      mentor_id: mentor.id,
      deleted_at: null,
    },
    select: {
      id: true,
      name: true,
      start_date: true,
      end_date: true,
      total_meeting: true,
      remarks: true,
      course_types: {
        select: {
          id: true,
          type: true,
          courses: {
            select: {
              title: true,
              slug: true,
              thumbnail: true,
            },
          },
        },
      },
    },
    orderBy: {
      start_date: "desc",
    },
  })

  // Get events hosted by this mentor
  const events = await prisma.events.findMany({
    where: {
      mentor_id: mentor.id,
      deleted_at: null,
      is_active: true,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      thumbnail: true,
      description: true,
      start_date: true,
      end_date: true,
      price: true,
    },
    orderBy: {
      start_date: "desc",
    },
  })

  return {
    mentor,
    courses,
    courseGroups,
    events,
  }
}

// Get popular mentors (those with the most courses or highest rated courses)
export async function getPopularMentors(limit = 4): Promise<{ mentors: Mentor[] }> {
  // Get mentors with the most active courses
  const mentorsWithCourseCount = await prisma.mentors.findMany({
    where: {
      deleted_at: null,
      courses: {
        some: {
          is_active: true,
          deleted_at: null,
        },
      },
    },
    select: {
      id: true,
      name: true,
      specialization: true,
      profile_picture: true,
      bio: true,
      city: true,
      username: true,
      _count: {
        select: {
          courses: {
            where: {
              is_active: true,
              deleted_at: null,
            },
          },
        },
      },
    },
    orderBy: [
      {
        courses: {
          _count: "desc",
        },
      },
      {
        name: "asc",
      },
    ],
    take: limit,
  })

  // Transform the result to match the Mentor type
  const mentors = mentorsWithCourseCount.map(({ _count, ...mentor }) => mentor)

  return { mentors }
}

// Get mentors by specialization
export async function getMentorsBySpecialization(specialization: string): Promise<{ mentors: Mentor[] }> {
  const mentors = await prisma.mentors.findMany({
    where: {
      deleted_at: null,
      specialization: {
        contains: specialization,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      name: true,
      specialization: true,
      profile_picture: true,
      bio: true,
      city: true,
      username: true,
    },
    orderBy: {
      name: "asc",
    },
  })

  return { mentors }
}

// Get all unique specializations
export async function getAllSpecializations(): Promise<{ specializations: string[] }> {
  const result = await prisma.mentors.findMany({
    where: {
      deleted_at: null,
    },
    select: {
      specialization: true,
    },
    distinct: ["specialization"],
  })

  const specializations = result
    .map((item) => item.specialization)
    .filter(Boolean)
    .sort()

  return { specializations }
}

// Search mentors by name or specialization
export async function searchMentors(query: string): Promise<{ mentors: Mentor[] }> {
  const mentors = await prisma.mentors.findMany({
    where: {
      deleted_at: null,
      OR: [
        {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          specialization: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          bio: {
            contains: query,
            mode: "insensitive",
          },
        },
      ],
    },
    select: {
      id: true,
      name: true,
      specialization: true,
      profile_picture: true,
      bio: true,
      city: true,
      username: true,
    },
    orderBy: {
      name: "asc",
    },
  })

  return { mentors }
}

