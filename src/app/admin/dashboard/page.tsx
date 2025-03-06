import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/admin/dashboard/overview"
import { RecentActivity } from "@/components/admin/dashboard/recent-activity"
import { ArrowUp, BookOpen, FileText, Users } from "lucide-react"

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                <div className="flex items-center gap-2">
                    <select className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                        <option>Hari Ini</option>
                        <option>Minggu Ini</option>
                        <option>Bulan Ini</option>
                        <option>Tahun Ini</option>
                    </select>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="overflow-hidden bg-white shadow-sm border border-gray-100">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Mentor</CardTitle>
                        <div className="rounded-full bg-blue-50 p-2 text-blue-600">
                            <Users className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900">1</div>
                        <div className="mt-1 text-sm text-gray-500">Aktif bulan ini</div>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden border-none shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Student</CardTitle>
                        <div className="rounded-full bg-green-100 p-2 text-green-600">
                            <Users className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">11</div>
                        <div className="mt-1 flex items-center text-xs text-green-600 font-medium">
                            <ArrowUp className="mr-1 h-3 w-3" /> +9 Today
                        </div>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden border-none shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Writer</CardTitle>
                        <div className="rounded-full bg-purple-100 p-2 text-purple-600">
                            <FileText className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">1</div>
                        <div className="mt-1 text-xs text-gray-500">Aktif bulan ini</div>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden border-none shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Artikel</CardTitle>
                        <div className="rounded-full bg-amber-100 p-2 text-amber-600">
                            <BookOpen className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">10</div>
                        <div className="mt-1 flex items-center text-xs text-amber-600 font-medium">
                            <ArrowUp className="mr-1 h-3 w-3" /> +0 Today
                        </div>
                    </CardContent>
                </Card>
            </div>


            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Overview className="col-span-4 border-none shadow-md" />
                <RecentActivity className="col-span-3 border-none shadow-md" />
            </div>
        </div>
    )
}

