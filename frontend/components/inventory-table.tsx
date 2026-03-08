"use client"

import React from "react"
import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2, Search, Edit, Loader2 } from "lucide-react"
import { deleteProduct } from "@/lib/inventoryApi"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"

interface InventoryItem {
  _id: string
  id?: string
  name: string
  batchNumber: string
  stock: number
  costPrice: number
  price: number
  expiryDate: string
  manufacturer?: string
  unit: string
  category: string
  image?: string
}

interface InventoryTableProps {
  inventory: InventoryItem[]
  userRole: string
}

export function InventoryTable({ inventory, userRole }: InventoryTableProps) {
  const [search, setSearch] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()

  const filteredInventory = inventory.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.batchNumber?.toLowerCase().includes(search.toLowerCase()) ||
      item.manufacturer?.toLowerCase().includes(search.toLowerCase()),
  )

  const getTokenFromCookie = () => {
    const cookies = document.cookie.split(';')
    const tokenCookie = cookies.find(c => c.trim().startsWith('token='))
    return tokenCookie ? tokenCookie.split('=')[1] : undefined
  }

  const handleDelete = async (id: string, itemName: string) => {
    if (!confirm(`Are you sure you want to delete "${itemName}"?`)) return

    setDeletingId(id)
    try {
      const token = getTokenFromCookie()
      await deleteProduct(id, token)
      toast.success(`"${itemName}" deleted successfully`)
      router.refresh()
    } catch (error: any) {
      toast.error("Error deleting inventory: " + error.message)
    } finally {
      setDeletingId(null)
    }
  }

  const getExpiryStatus = (expiryDate: string) => {
    if (!expiryDate) return { label: "N/A", variant: "outline" as const }
    const today = new Date()
    const expiry = new Date(expiryDate)
    const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilExpiry < 0) {
      return { label: "Expired", variant: "destructive" as const }
    } else if (daysUntilExpiry <= 30) {
      return { label: `${daysUntilExpiry}d left`, variant: "outline" as const }
    } else {
      return { label: "Valid", variant: "outline" as const }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search inventory..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-lg border bg-white overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Medicine</TableHead>
              <TableHead>Batch Number</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit Cost</TableHead>
              <TableHead>Selling Price</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Status</TableHead>
              {(userRole === "admin" || userRole === "pharmacist") && (
                <TableHead className="text-right">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInventory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                  No inventory items found
                </TableCell>
              </TableRow>
            ) : (
              filteredInventory.map((item) => {
                const expiryStatus = getExpiryStatus(item.expiryDate)
                const itemId = item._id || item.id
                return (
                  <TableRow key={itemId}>
                    <TableCell>
                      <div className="h-10 w-10 overflow-hidden rounded-md bg-gray-100 flex items-center justify-center">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-xs text-gray-400">No img</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.batchNumber || "N/A"}</TableCell>
                    <TableCell>
                      {item.stock} {item.unit}
                    </TableCell>
                    <TableCell>Le {item.costPrice?.toLocaleString() || 0}</TableCell>
                    <TableCell>Le {item.price?.toLocaleString() || 0}</TableCell>
                    <TableCell>{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "N/A"}</TableCell>
                    <TableCell>{item.manufacturer || "-"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={expiryStatus.variant}
                        className={
                          expiryStatus.label.includes("left")
                            ? "border-orange-500 text-orange-600"
                            : expiryStatus.label === "Valid"
                              ? "border-green-500 text-green-600"
                              : ""
                        }
                      >
                        {expiryStatus.label}
                      </Badge>
                    </TableCell>
                    {(userRole === "admin" || userRole === "pharmacist") && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/dashboard/inventory/${itemId}/edit`}>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          {userRole === "admin" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(itemId!, item.name)}
                              className="text-red-600 hover:text-red-700"
                              disabled={deletingId === itemId}
                            >
                              {deletingId === itemId ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
