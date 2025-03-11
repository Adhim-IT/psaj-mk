import { Metadata } from "next"
import { Home } from 'lucide-react'
import { getCourseTransactions } from "@/lib/course-transaksi-admin"
import { TransactionTable } from "@/components/admin/transaksi/kelas/transaction-table"
import { courseTransactionFilterSchema } from "@/lib/zod"
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb"

export const metadata: Metadata = {
  title: "Transaksi Kelas - Admin",
  description: "Kelola transaksi kelas di platform Anda",
}

interface PageProps {
  searchParams: {
    status?: string
    course_id?: string
    student_id?: string
    search?: string
    page?: string
    limit?: string
  }
}

export default async function TransaksiKelasPage({ searchParams }: PageProps) {
  // Parse and validate search params
  const filters = courseTransactionFilterSchema.parse({
    status: searchParams.status,
    course_id: searchParams.course_id,
    student_id: searchParams.student_id,
    search: searchParams.search,
    page: searchParams.page ? parseInt(searchParams.page) : 1,
    limit: searchParams.limit ? parseInt(searchParams.limit) : 10,
  })

  const { data: transactions, meta } = await getCourseTransactions(filters)

  return (
    <div className="container py-10">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">
              <Home className="h-4 w-4 mr-1" />
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/transaksi">Transaksi</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>Kelas</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Transaksi Kelas</h1>
        <p className="text-muted-foreground">
          Kelola semua transaksi kelas di platform Anda
        </p>
      </div>

      <TransactionTable transactions={transactions} meta={meta} />
    </div>
  )
}
