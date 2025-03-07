"use server"

import { prisma } from "@/lib/prisma"

export async function getDashboardStats() {
  try {
    // Get counts from database
    const [mentorCount, studentCount, writerCount, articleCount] = await Promise.all([
      prisma.user.count({
        where: {
          role: {
            name: "Mentor",
          },
        },
      }),
      prisma.students.count(),
      prisma.user.count({
        where: {
          role: {
            name: "Writer",
          },
        },
      }),
      prisma.articles ? prisma.articles.count() : 0, // Check if article table exists
    ])

    return {
      mentorCount,
      studentCount,
      writerCount,
      articleCount,
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return {
      mentorCount: 0,
      studentCount: 0,
      writerCount: 0,
      articleCount: 0,
    }
  }
}

export async function getRecentActivity(limit = 5) {
  try {
    // Get recent users
    const recentUsers = await prisma.user.findMany({
      take: limit,
      orderBy: {
        created_at: "desc",
      },
      include: {
        role: true,
      },
    })

    // Transform to activity format
    return recentUsers.map((user) => ({
      userName: user.name || "Unknown User",
      userAvatar: user.image || "/placeholder.svg",
      action: `Joined as ${user.role?.name || "User"}`,
      time: formatTimeAgo(user.created_at),
    }))
  } catch (error) {
    console.error("Error fetching recent activity:", error)
    return []
  }
}

// Helper function to format time ago
function formatTimeAgo(date: Date | null) {
  if (!date) return "Unknown"

  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000)

  if (diffInSeconds < 60) return `${diffInSeconds}s`
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
  return `${Math.floor(diffInSeconds / 86400)}d`
}

export async function getRegistrationData() {
  try {
    // Get registration counts by month for current year
    const currentYear = new Date().getFullYear()

    // Get all users created this year
    const users = await prisma.user.findMany({
      where: {
        created_at: {
          gte: new Date(`${currentYear}-01-01`),
          lt: new Date(`${currentYear + 1}-01-01`),
        },
      },
      select: {
        created_at: true,
      },
    })

    // Group by month
    const monthlyData = Array(12).fill(0)

    users.forEach((user) => {
      if (user.created_at) {
        const month = new Date(user.created_at).getMonth()
        monthlyData[month]++
      }
    })

    // Format for chart
    return monthlyData.map((count, index) => ({
      name: new Date(currentYear, index).toLocaleString("default", { month: "short" }),
      pendaftar: count,
      year: currentYear,
    }))
  } catch (error) {
    console.error("Error fetching registration data:", error)
    return [
      { name: "Jan", pendaftar: 0, year: new Date().getFullYear() },
      { name: "Feb", pendaftar: 0, year: new Date().getFullYear() },
      // Default empty data for all months
    ]
  }
}

// Update getRegistrationDataByYear to include year in each data point
export async function getRegistrationDataByYear(year: number) {
  try {
    const startDate = new Date(`${year}-01-01T00:00:00Z`)
    const endDate = new Date(`${year}-12-31T23:59:59Z`)

    // Get all users registered in the specified year
    const users = await prisma.user.findMany({
        where: {
          created_at: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          created_at: true,
        },
      })

    // Initialize counts for each month
    const monthCounts = Array(12).fill(0)

    // Count registrations for each month
    users.forEach((user) => {
        const month = user.created_at?.getMonth() ?? 0; // 0-11
        monthCounts[month]++;
      })

    // Map to the expected format
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const data = monthNames.map((name, index) => ({
      name,
      pendaftar: monthCounts[index],
      year,
    }))

    return data
  } catch (error) {
    console.error("Error fetching registration data by year:", error)
    return []
  }
}

