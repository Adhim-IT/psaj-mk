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
      },
    })
  
    return { mentor: mentor ?? undefined } 
  }
  