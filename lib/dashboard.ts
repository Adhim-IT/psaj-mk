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
      prisma.articles ? prisma.articles.count() : 0,
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
    return recentUsers.map((user: any) => ({
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

    users.forEach((user: any) => {
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
    users.forEach((user: any) => {
      const month = user.created_at?.getMonth() ?? 0 // 0-11
      monthCounts[month]++
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

// Add these new functions at the end of the file

export async function getRevenueStats() {
  try {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    // Start of current month
    const startOfMonth = new Date(currentYear, currentMonth, 1)
    // Start of current year
    const startOfYear = new Date(currentYear, 0, 1)

    // Get course transactions for current month
    const courseTransactionsMonth = await prisma.course_transactions.findMany({
      where: {
        status: "paid",
        created_at: {
          gte: startOfMonth,
        },
      },
      select: {
        final_price: true,
      },
    })

    // Get course transactions for current year
    const courseTransactionsYear = await prisma.course_transactions.findMany({
      where: {
        status: "paid",
        created_at: {
          gte: startOfYear,
        },
      },
      select: {
        final_price: true,
      },
    })

    // Get event registrations with payments for current month
    const eventRegistrationsMonth = await prisma.event_registrants.findMany({
      where: {
        status: "paid",
        created_at: {
          gte: startOfMonth,
        },
      },
      include: {
        events: {
          select: {
            price: true,
          },
        },
      },
    })

    // Get event registrations with payments for current year
    const eventRegistrationsYear = await prisma.event_registrants.findMany({
      where: {
        status: "paid",
        created_at: {
          gte: startOfYear,
        },
      },
      include: {
        events: {
          select: {
            price: true,
          },
        },
      },
    })

    // Calculate total revenue for current month
    const courseRevenueMonth = courseTransactionsMonth.reduce(
      (total : any, transaction : any) => total + Number(transaction.final_price),
      0,
    )

    const eventRevenueMonth = eventRegistrationsMonth.reduce((total: any, registration: any) => total + Number(registration.events.price || 0), 0);

    // Calculate total revenue for current year
    const courseRevenueYear = courseTransactionsYear.reduce((total: any, transaction: any) => total + Number(transaction.final_price), 0);

    const eventRevenueYear = eventRegistrationsYear.reduce((total: any, registration: any) => total + Number(registration.events.price || 0), 0);

    // Get counts
    const paidCourseCount = await prisma.course_transactions.count({
      where: {
        status: "paid",
      },
    })

    const paidEventCount = await prisma.event_registrants.count({
      where: {
        status: "paid",
      },
    })

    return {
      totalRevenueMonth: courseRevenueMonth + eventRevenueMonth,
      totalRevenueYear: courseRevenueYear + eventRevenueYear,
      paidCourseCount,
      paidEventCount,
      courseRevenueMonth,
      eventRevenueMonth,
      courseRevenueYear,
      eventRevenueYear,
    }
  } catch (error) {
    console.error("Error fetching revenue stats:", error)
    return {
      totalRevenueMonth: 0,
      totalRevenueYear: 0,
      paidCourseCount: 0,
      paidEventCount: 0,
      courseRevenueMonth: 0,
      eventRevenueMonth: 0,
      courseRevenueYear: 0,
      eventRevenueYear: 0,
    }
  }
}

// Helper function to format currency


// Get monthly revenue data for the chart
export async function getMonthlyRevenueData(year: number) {
  try {
    const startDate = new Date(`${year}-01-01T00:00:00Z`)
    const endDate = new Date(`${year}-12-31T23:59:59Z`)

    // Initialize monthly data arrays
    const monthlyData = Array(12)
      .fill(0)
      .map(() => ({
        courseRevenue: 0,
        eventRevenue: 0,
      }))

    // Get all course transactions for the year
    const courseTransactions = await prisma.course_transactions.findMany({
      where: {
        status: "paid",
        created_at: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        final_price: true,
        created_at: true,
      },
    })

    // Get all event registrations for the year
    const eventRegistrations = await prisma.event_registrants.findMany({
      where: {
        status: "paid",
        created_at: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        events: {
          select: {
            price: true,
          },
        },
        
      },
    })

    // Aggregate course revenue by month
    courseTransactions.forEach((transaction: any) => {
      if (transaction.created_at) {
        const month = new Date(transaction.created_at).getMonth();
        monthlyData[month].courseRevenue += Number(transaction.final_price);
      }
    });

    // Aggregate event revenue by month
    eventRegistrations.forEach((registration: any) => {
      if (registration.created_at) {
        const month = new Date(registration.created_at).getMonth();
        monthlyData[month].eventRevenue += Number(registration.events.price || 0);
      }
    });

    // Format for chart
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return monthNames.map((name, index) => ({
      name,
      kelas: monthlyData[index].courseRevenue,
      event: monthlyData[index].eventRevenue,
      total: monthlyData[index].courseRevenue + monthlyData[index].eventRevenue,
      year,
    }))
  } catch (error) {
    console.error("Error fetching monthly revenue data:", error)
    return Array(12)
      .fill(0)
      .map((_, index) => ({
        name: new Date(year, index).toLocaleString("default", { month: "short" }),
        kelas: 0,
        event: 0,
        total: 0,
        year,
      }))
  }
}

