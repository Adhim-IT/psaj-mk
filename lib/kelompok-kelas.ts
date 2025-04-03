"use server"

import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"
import { prisma } from "@/lib/prisma"
import type { StudentGroupFormData } from "@/types"

// Get all student groups
export async function getStudentGroups() {
  try {
    const studentGroups = await prisma.course_student_groups.findMany({
      where: {
        deleted_at: null,
      },
      include: {
        course_types: {
          select: {
            id: true,
            type: true,
            courses: {
              select: {
                title: true,
              },
            },
          },
        },
        mentors: {
          select: {
            id: true,
            name: true,
          },
        },
        course_students: {
          where: {
            deleted_at: null,
          },
          select: {
            id: true,
            student_id: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    })

    // Transform the data to match the StudentGroup interface
    const formattedGroups = studentGroups.map((group: any) => ({
      ...group,
      course_types: {
        ...group.course_types,
        title: group.course_types.courses.title,
      },
    }));

    return { studentGroups: formattedGroups }
  } catch (error) {
    console.error("Error fetching student groups:", error)
    return { error: "Failed to fetch student groups", studentGroups: [] }
  }
}

// Get a single student group by ID
export async function getStudentGroupById(id: string) {
  try {
    const studentGroup = await prisma.course_student_groups.findUnique({
      where: {
        id,
        deleted_at: null,
      },
      include: {
        course_types: {
          select: {
            id: true,
            type: true,
            courses: {
              select: {
                title: true,
              },
            },
          },
        },
        mentors: {
          select: {
            id: true,
            name: true,
          },
        },
        course_students: {
          where: {
            deleted_at: null,
          },
          select: {
            id: true,
            student_id: true,
          },
        },
      },
    })

    if (!studentGroup) {
      return { error: "Student group not found" }
    }

    // Transform the data to match the StudentGroup interface
    const formattedGroup = {
      ...studentGroup,
      course_types: {
        ...studentGroup.course_types,
        title: studentGroup.course_types.courses.title,
      },
    }

    return { studentGroup: formattedGroup }
  } catch (error) {
    console.error("Error fetching student group:", error)
    return { error: "Failed to fetch student group" }
  }
}

// Get all course types for dropdown
export async function getCourseTypesForDropdown() {
  try {
    const courseTypes = await prisma.course_types.findMany({
      where: {
        deleted_at: null,
        is_active: true,
      },
      select: {
        id: true,
        type: true,
        courses: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        courses: {
          title: "asc",
        },
      },
    })

    // Transform the data to include the course title
    const formattedCourseTypes = courseTypes.map((type: any) => ({
      id: type.id,
      type: type.type,
      title: type.courses.title,
    }));

    return { courseTypes: formattedCourseTypes }
  } catch (error) {
    console.error("Error fetching course types:", error)
    return { error: "Failed to fetch course types", courseTypes: [] }
  }
}

// Get all mentors for dropdown
export async function getMentorsForDropdown() {
  try {
    const mentors = await prisma.mentors.findMany({
      where: {
        deleted_at: null,
      },
      select: {
        id: true,
        name: true,
        specialization: true,
      },
      orderBy: {
        name: "asc",
      },
    })

    return { mentors }
  } catch (error) {
    console.error("Error fetching mentors:", error)
    return { error: "Failed to fetch mentors", mentors: [] }
  }
}

// Create a new student group
export async function createStudentGroup(data: StudentGroupFormData) {
  try {
    // Validate data
    if (!data.course_type_id || !data.mentor_id || !data.name || !data.start_date || !data.end_date) {
      return { error: "Missing required fields" }
    }

    // Check if course type exists
    const courseType = await prisma.course_types.findUnique({
      where: { id: data.course_type_id, deleted_at: null },
    })
    if (!courseType) {
      return { error: "Selected course type does not exist" }
    }

    // Check if mentor exists
    const mentor = await prisma.mentors.findUnique({
      where: { id: data.mentor_id, deleted_at: null },
    })
    if (!mentor) {
      return { error: "Selected mentor does not exist" }
    }

    // Create new student group
    const studentGroup = await prisma.course_student_groups.create({
      data: {
        id: uuidv4(),
        course_type_id: data.course_type_id,
        mentor_id: data.mentor_id,
        name: data.name,
        remarks: data.remarks,
        start_date: data.start_date,
        end_date: data.end_date,
        total_meeting: data.total_meeting,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

    revalidatePath("/admin/dashboard/kelas/group")
    return { success: true, studentGroup }
  } catch (error) {
    console.error("Error creating student group:", error)
    return { error: "Failed to create student group. Please try again later." }
  }
}

// Update an existing student group
export async function updateStudentGroup(id: string, data: StudentGroupFormData) {
  try {
    // Validate data
    if (!data.course_type_id || !data.mentor_id || !data.name || !data.start_date || !data.end_date) {
      return { error: "Missing required fields" }
    }

    // Check if the student group exists
    const existingGroup = await prisma.course_student_groups.findUnique({
      where: { id, deleted_at: null },
    })

    if (!existingGroup) {
      return { error: "Student group not found" }
    }

    // Check if course type exists
    const courseType = await prisma.course_types.findUnique({
      where: { id: data.course_type_id, deleted_at: null },
    })
    if (!courseType) {
      return { error: "Selected course type does not exist" }
    }

    // Check if mentor exists
    const mentor = await prisma.mentors.findUnique({
      where: { id: data.mentor_id, deleted_at: null },
    })
    if (!mentor) {
      return { error: "Selected mentor does not exist" }
    }

    // Update the student group
    const studentGroup = await prisma.course_student_groups.update({
      where: { id },
      data: {
        course_type_id: data.course_type_id,
        mentor_id: data.mentor_id,
        name: data.name,
        remarks: data.remarks,
        start_date: data.start_date,
        end_date: data.end_date,
        total_meeting: data.total_meeting,
        updated_at: new Date(),
      },
    })

    revalidatePath("/admin/dashboard/kelas/group")
    return { success: true, studentGroup }
  } catch (error) {
    console.error("Error updating student group:", error)
    return { error: "Failed to update student group" }
  }
}

// Soft delete a student group
export async function deleteStudentGroup(id: string) {
  try {
    // Check if the student group exists
    const existingGroup = await prisma.course_student_groups.findUnique({
      where: { id, deleted_at: null },
      include: {
        course_students: {
          where: { deleted_at: null },
        },
      },
    })

    if (!existingGroup) {
      return { error: "Student group not found" }
    }

    // Check if there are active students in the group
    if (existingGroup.course_students.length > 0) {
      return {
        error: "Cannot delete group with active students. Please remove all students first.",
        studentCount: existingGroup.course_students.length,
      }
    }

    // Soft delete the student group
    await prisma.course_student_groups.update({
      where: { id },
      data: {
        deleted_at: new Date(),
      },
    })

    revalidatePath("/admin/dashboard/kelas/group")
    return { success: true }
  } catch (error) {
    console.error("Error deleting student group:", error)
    return { error: "Failed to delete student group" }
  }
}

// Get students in a group
export async function getStudentsInGroup(groupId: string) {
  try {
    const group = await prisma.course_student_groups.findUnique({
      where: {
        id: groupId,
        deleted_at: null,
      },
      include: {
        course_students: {
          where: { deleted_at: null },
          include: {
            students: {
              select: {
                id: true,
                name: true,
                phone: true,
                profile_picture: true,
              },
            },
          },
        },
      },
    })

    if (!group) {
      return { error: "Student group not found" }
    }

    return {
      students: group.course_students.map((cs: any) => ({
        student_id: cs.student_id,
        ...cs.students,
      })),
    };
  } catch (error) {
    console.error("Error fetching students in group:", error)
    return { error: "Failed to fetch students", students: [] }
  }
}

// Add student to group
export async function addStudentToGroup(groupId: string, studentId: string) {
  try {
    // Check if group exists
    const group = await prisma.course_student_groups.findUnique({
      where: { id: groupId, deleted_at: null },
    })

    if (!group) {
      return { error: "Student group not found" }
    }

    // Check if student exists
    const student = await prisma.students.findUnique({
      where: { id: studentId, deleted_at: null },
    })

    if (!student) {
      return { error: "Student not found" }
    }

    // Check if student is already in the group
    const existingEnrollment = await prisma.course_students.findFirst({
      where: {
        student_id: studentId,
        course_student_group_id: groupId,
        deleted_at: null,
      },
    })

    if (existingEnrollment) {
      return { error: "Student is already in this group" }
    }

    // Add student to group
    await prisma.course_students.create({
      data: {
        id: uuidv4(),
        student_id: studentId,
        course_student_group_id: groupId,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

    revalidatePath(`/admin/dashboard/kelas/group/students/${groupId}`)
    return { success: true }
  } catch (error) {
    console.error("Error adding student to group:", error)
    return { error: "Failed to add student to group" }
  }
}

// Remove student from group
export async function removeStudentFromGroup(enrollmentId: string) {
  try {
    // Check if enrollment exists
    const enrollment = await prisma.course_students.findUnique({
      where: { id: enrollmentId, deleted_at: null },
    })

    if (!enrollment) {
      return { error: "Enrollment not found" }
    }

    // Soft delete the enrollment
    await prisma.course_students.update({
      where: { id: enrollmentId },
      data: { deleted_at: new Date() },
    })

    revalidatePath(`/admin/dashboard/kelas/group/students/${enrollment.course_student_group_id}`)
    return { success: true }
  } catch (error) {
    console.error("Error removing student from group:", error)
    return { error: "Failed to remove student from group" }
  }
}

// Get available students for adding to a group
export async function getAvailableStudents(groupId: string) {
  try {
    // Get all active students
    const allStudents = await prisma.students.findMany({
      where: { deleted_at: null },
      select: {
        id: true,
        name: true,
       
        phone: true,
        profile_picture: true,
      },
    })

    // Get students already in the group
    const group = await prisma.course_student_groups.findUnique({
      where: { id: groupId, deleted_at: null },
      include: {
        course_students: {
          where: { deleted_at: null },
          select: { student_id: true },
        },
      },
    })

    if (!group) {
      return { error: "Student group not found" }
    }

    // Filter out students already in the group
    const enrolledStudentIds = group.course_students.map((cs: any) => cs.student_id);
    const availableStudents = allStudents.filter((student: any) => !enrolledStudentIds.includes(student.id));

    return { students: availableStudents }
  } catch (error) {
    console.error("Error fetching available students:", error)
    return { error: "Failed to fetch available students", students: [] }
  }
}

