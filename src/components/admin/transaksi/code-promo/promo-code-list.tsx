"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Edit, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react"
import { deletePromoCode } from "@/lib/promo-code"
import type { PromoCode } from "@/types"
import Swal from "sweetalert2"
import { Input } from "@/components/ui/input"

interface PromoCodeListProps {
  promoCodes: PromoCode[]
}

export function PromoCodeList({ promoCodes }: PromoCodeListProps) {
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [promoCodeToDelete, setPromoCodeToDelete] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const handleDelete = async () => {
    if (!promoCodeToDelete) return

    const result = await deletePromoCode(promoCodeToDelete)
    if (result.success) {
      setIsDeleteDialogOpen(false)
      setPromoCodeToDelete(null)
      router.refresh()
      Swal.fire({
        icon: "success",
        title: "Promo code deleted",
        text: "The promo code has been successfully deleted.",
      })
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to delete the promo code. Please try again.",
      })
    }
  }

  // Filter promo codes based on search query
  const filteredPromoCodes = promoCodes.filter((promoCode) =>
    promoCode.code.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search promo codes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
        <Button asChild>
          <Link href="/admin/dashboard/transaksi/promo-code/create">
            <Plus className="mr-2 h-4 w-4" /> Add New Promo Code
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Discount Type</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Valid Until</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPromoCodes.length > 0 ? (
              filteredPromoCodes.map((promoCode) => (
                <TableRow key={promoCode.id}>
                  <TableCell className="font-medium">{promoCode.code}</TableCell>
                  <TableCell>{promoCode.discount_type === "fixed" ? "Nominal" : "Persentase"}</TableCell>

                  <TableCell>
                    {promoCode.discount_type === "percentage"
                      ? `${promoCode.discount}%`
                      : `Rp ${promoCode.discount.toLocaleString("id-ID")}`}
                  </TableCell>

                  <TableCell>{new Date(promoCode.valid_until).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={promoCode.is_used ? "secondary" : "default"}>
                      {promoCode.is_used ? "Used" : "Available"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => router.push(`/admin/dashboard/transaksi/promo-code/edit/${promoCode.id}`)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setPromoCodeToDelete(promoCode.id)
                            setIsDeleteDialogOpen(true)
                          }}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No promo codes found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the promo code.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 focus:ring-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

