import { PromoCodeList } from '@/components/admin/transaksi/code-promo/promo-code-list';
import { getPromoCodes } from '@/lib/promo-code';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { HomeIcon } from 'lucide-react';
import type { PromoCode } from '@/types';

export default async function PromoCodesPage() {
  const result = await getPromoCodes();

  // Use the data from the server action result
  const promoCodes: PromoCode[] = result.success
    ? result.data.map((promo: any) => ({
        ...promo,
        id: Number(promo.id),
        valid_until: promo.valid_until,
        created_at: promo.created_at,
        updated_at: promo.updated_at,
        deleted_at: promo.deleted_at,
      }))
    : [];

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/dashboard">
              <HomeIcon className="h-4 w-4 mr-1" />
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/dashboard/transaksi">Transaksi</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>Promo Code</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="text-3xl font-bold">Promo Codes Management</h1>
      <PromoCodeList promoCodes={promoCodes} />
    </div>
  );
}
