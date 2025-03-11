import { notFound } from "next/navigation"
import { PromoCodeForm } from "@/components/admin/transaksi/code-promo/promo-code-form"
import { getPromoCodeById } from "@/lib/promo-code"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb"
import { HomeIcon } from "lucide-react"

export default async function EditPromoCodePage({ params }: { params: { id: string } }) {
  const result = await getPromoCodeById(Number(params.id))

  if (!result.success || !result.data) {
    notFound()
  }

  const { id, code, discount_type, discount, valid_until, is_used } = result.data

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbItem>
          <BreadcrumbLink href="/admin/dashboard">
            <HomeIcon className="h-4 w-4 mr-1" />
            Dashboard
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="/admin/dashboard/transaksi">Transaksi</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="/admin/dashboard/transaksi/promo-code">Promo Code</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink>Edit</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      <h1 className="text-3xl font-bold">Edit Promo Code</h1>
      <PromoCodeForm
        isEditing={true}
        initialData={{
          id: Number(id),
          code,
          discount_type,
          discount,
          valid_until: new Date(valid_until).toISOString().slice(0, 16),
          is_used,
        }}
      />
    </div>
  )
}

