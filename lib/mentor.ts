"use server"
import type { Mentor } from "@/types"
import prisma from "./prisma"

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

export async function getMentorByUsername(username: string): Promise<{ mentor?: Mentor }> {
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

  return { mentor: mentor ?? undefined }
}

