"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Edit, Trash2, Search, ArrowUpDown } from "lucide-react"
import Link from "next/link"
import { deleteProduct } from "@/lib/inventoryApi"
import { useRouter } from "next/navigation"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"

interface Medicine {
  _id: string
  id?: string // Handle both if transition happening
  name: string
  genericName?: string // Changed from generic_name
  category: string
  manufacturer?: string
  dosageForm?: string // Changed from dosage_form
  strength?: string
  packSize?: string
  manufacturingDate?: string
  expiryDate?: string
  unit: string
  lowStockThreshold?: number
  stock: number // query returns 'stock' not 'total_quantity' typically from mongoose, need to verify API response
  batchNumber?: string
  isCritical?: boolean
}

interface MedicinesTableProps {
  medicines: Medicine[]
  userRole: string
}

export function MedicinesTable({ medicines, userRole }: MedicinesTableProps) {
  const [search, setSearch] = useState("")
  const [sortConfig, setSortConfig] = useState<{ key: keyof Medicine; direction: "asc" | "desc" } | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()

  const handleSort = (key: keyof Medicine) => {
    let direction: "asc" | "desc" = "asc"
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  const sortedMedicines = [...medicines].sort((a, b) => {
    if (!sortConfig) return 0
    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]

    if (aValue == null) return 1
    if (bValue == null) return -1

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1
    return 0
  })

  const filteredMedicines = sortedMedicines.filter(
    (medicine) =>
      medicine.name.toLowerCase().includes(search.toLowerCase()) ||
      medicine.genericName?.toLowerCase().includes(search.toLowerCase()) ||
      medicine.category.toLowerCase().includes(search.toLowerCase()) ||
      medicine.batchNumber?.toLowerCase().includes(search.toLowerCase()),
  )

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return

    try {
      setDeletingId(id)
      await deleteProduct(id)
      toast.success("Medicine deleted successfully!")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to delete medicine")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, category, or batch no..."
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
              <TableHead onClick={() => handleSort("name")} className="cursor-pointer hover:bg-gray-50">
                Medicine Name <ArrowUpDown className="ml-1 h-3 w-3 inline" />
              </TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Form</TableHead>
              <TableHead>Strength</TableHead>
              <TableHead>Pack Size</TableHead>
              <TableHead>Batch No</TableHead>
              <TableHead>Mfg Date</TableHead>
              <TableHead>Exp Date</TableHead>
              <TableHead onClick={() => handleSort("stock")} className="cursor-pointer hover:bg-gray-50">
                Stock <ArrowUpDown className="ml-1 h-3 w-3 inline" />
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMedicines.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center text-muted-foreground">
                  No medicines found
                </TableCell>
              </TableRow>
            ) : (
              filteredMedicines.map((medicine) => {
                const id = medicine._id || medicine.id || ""
                const isLowStock = medicine.stock <= (medicine.lowStockThreshold || 10)
                const isVeryLow = medicine.stock <= (medicine.lowStockThreshold || 10) / 2

                return (
                  <TableRow key={id}>
                    <TableCell className="font-medium text-gray-900 border-l-4 border-transparent data-[critical=true]:border-red-500" data-critical={medicine.isCritical}>
                      <div className="flex items-center gap-2">
                        {medicine.name}
                        {medicine.isCritical && (
                          <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200 text-[10px] py-0 px-1">
                            CRITICAL
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground font-normal">{medicine.genericName}</div>
                    </TableCell>
                    <TableCell>{medicine.category}</TableCell>
                    <TableCell>{medicine.dosageForm || "-"}</TableCell>
                    <TableCell>{medicine.strength || "-"}</TableCell>
                    <TableCell>{medicine.packSize || "-"}</TableCell>
                    <TableCell>{medicine.batchNumber || "-"}</TableCell>
                    <TableCell>{medicine.manufacturingDate ? new Date(medicine.manufacturingDate).toLocaleDateString() : "-"}</TableCell>
                    <TableCell>{medicine.expiryDate ? new Date(medicine.expiryDate).toLocaleDateString() : "-"}</TableCell>
                    <TableCell>
                      {medicine.stock} {medicine.unit}
                    </TableCell>
                    <TableCell>
                      {medicine.stock === 0 ? (
                        <Badge variant="destructive">Out of Stock</Badge>
                      ) : isLowStock ? (
                        <Badge variant="destructive">Low Stock</Badge>
                      ) : (
                        <Badge variant="outline" className="border-green-500 text-green-600">
                          In Stock
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/dashboard/medicines/${id}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        {userRole === "admin" && (
                          <>
                            <Link href={`/dashboard/medicines/${id}/edit`}>
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(id, medicine.name)}
                              className="text-red-600 hover:text-red-700 disabled:opacity-50"
                              disabled={deletingId === id}
                            >
                              {deletingId === id ? (
                                <Spinner className="h-4 w-4 text-red-600" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
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
