import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/admin/dashboard/overview"
import { RecentActivity } from "@/components/admin/dashboard/recent-activity"
import { RevenueChart } from "@/components/admin/dashboard/revenue-chart"
import { formatCurrency} from "@/lib/utils"
import { ArrowUp, BookOpen, FileText, Users, CreditCard, Calendar, TrendingUp } from "lucide-react"
import {
  getDashboardStats,
  getRegistrationData,
  getRecentActivity,
  getRegistrationDataByYear,
  getRevenueStats,
  
  getMonthlyRevenueData,
} from "@/lib/dashboard"
import { Suspense } from "react"
import Loading from "./loading"

export default async function DashboardPage() {
  const stats = await getDashboardStats()
  const registrationData = await getRegistrationData()
  const recentActivity = await getRecentActivity()
  const revenueStats = await getRevenueStats()
  const currentYear = new Date().getFullYear()
  const monthlyRevenueData = await getMonthlyRevenueData(currentYear)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        
      </div>

      <Suspense fallback={<Loading />}>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="overflow-hidden bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Mentor</CardTitle>
              <div className="rounded-full bg-blue-50 p-2 text-blue-600">
                <Users className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.mentorCount}</div>
              <div className="mt-1 text-sm text-gray-500">Aktif bulan ini</div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Student</CardTitle>
              <div className="rounded-full bg-green-100 p-2 text-green-600">
                <Users className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.studentCount}</div>
              <div className="mt-1 flex items-center text-xs text-green-600 font-medium">
                <ArrowUp className="mr-1 h-3 w-3" /> Aktif bulan ini
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Writer</CardTitle>
              <div className="rounded-full bg-purple-100 p-2 text-purple-600">
                <FileText className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.writerCount}</div>
              <div className="mt-1 text-xs text-gray-500">Aktif bulan ini</div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Artikel</CardTitle>
              <div className="rounded-full bg-amber-100 p-2 text-amber-600">
                <BookOpen className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.articleCount}</div>
              <div className="mt-1 flex items-center text-xs text-amber-600 font-medium">
                <ArrowUp className="mr-1 h-3 w-3" /> Aktif bulan ini
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Stats Section */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="overflow-hidden bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Kelas Terjual</CardTitle>
              <div className="rounded-full bg-indigo-50 p-2 text-indigo-600">
                <CreditCard className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{revenueStats.paidCourseCount}</div>
              <div className="mt-1 text-sm text-gray-500">Total transaksi</div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Event Terdaftar</CardTitle>
              <div className="rounded-full bg-pink-100 p-2 text-pink-600">
                <Calendar className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{revenueStats.paidEventCount}</div>
              <div className="mt-1 flex items-center text-xs text-pink-600 font-medium">
                <ArrowUp className="mr-1 h-3 w-3" /> Total pendaftaran
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pendapatan Bulan Ini</CardTitle>
              <div className="rounded-full bg-emerald-100 p-2 text-emerald-600">
                <TrendingUp className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(revenueStats.totalRevenueMonth)}</div>
              <div className="mt-1 text-xs text-emerald-600 font-medium">
                Kelas: {formatCurrency(revenueStats.courseRevenueMonth)}
              </div>
              <div className="mt-1 text-xs text-emerald-600 font-medium">
                Event: {formatCurrency(revenueStats.eventRevenueMonth)}
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pendapatan Tahun Ini</CardTitle>
              <div className="rounded-full bg-blue-100 p-2 text-blue-600">
                <TrendingUp className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(revenueStats.totalRevenueYear)}</div>
              <div className="mt-1 flex items-center text-xs text-blue-600 font-medium">
                Kelas: {formatCurrency(revenueStats.courseRevenueYear)}
              </div>
              <div className="mt-1 flex items-center text-xs text-blue-600 font-medium">
                Event: {formatCurrency(revenueStats.eventRevenueYear)}
              </div>
            </CardContent>
          </Card>
        </div>
      </Suspense>

      {/* Main Content Area - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Column - Takes 2/3 of the width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Data Pendaftar Chart */}
          <Overview
            data={registrationData}
            onYearChange={async (year) => {
              "use server"
              return await getRegistrationDataByYear(year)
            }}
            className="shadow-md"
          />

          {/* Revenue Chart */}
          <RevenueChart
            data={monthlyRevenueData}
            onYearChange={async (year) => {
              "use server"
              return await getMonthlyRevenueData(year)
            }}
            className="shadow-md"
          />
        </div>

        {/* Recent Activity Column - Takes 1/3 of the width */}
        <div className="lg:col-span-1">
          <RecentActivity className="shadow-md rounded-xl h-auto" activities={recentActivity} />
        </div>
      </div>
    </div>
  )
}

