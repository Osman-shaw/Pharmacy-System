"use client"

import React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { createSupplier, deleteSupplier } from "@/lib/suppliersApi"
import { toast } from "sonner"

export function SuppliesManager({ type, suppliers, purchaseOrders, userId }: any) {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<any>({
    legalName: "",
    contact: "",
    email: "",
    address: "",
    status: "active",
    notes: "",
  })
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  const handleSupplierSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await createSupplier(formData)
      toast.success("Supplier added successfully!")
      setShowForm(false)
      setFormData({
        legalName: "",
        contact: "",
        email: "",
        address: "",
        status: "active",
        notes: "",
      })
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to save supplier")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSupplier = async (id: string) => {
    if (!confirm("Are you sure?")) return

    try {
      await deleteSupplier(id)
      toast.success("Supplier deleted successfully!")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to delete supplier")
    }
  }

  if (type === "suppliers") {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Suppliers</CardTitle>
                <CardDescription>Manage your supplier contacts</CardDescription>
              </div>
              <Button onClick={() => setShowForm(!showForm)} className="bg-emerald-600 hover:bg-emerald-700">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Supplier
              </Button>
            </div>
          </CardHeader>
          {showForm && (
            <CardContent>
              <form onSubmit={handleSupplierSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Supplier Name *</Label>
                    <Input
                      required
                      value={formData.legalName}
                      onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Info *</Label>
                    <Input
                      required
                      value={formData.contact}
                      onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Address</Label>
                    <Textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={2}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
                    {loading ? "Saving..." : "Save Supplier"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Suppliers List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No suppliers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    suppliers.map((supplier: any) => (
                      <TableRow key={supplier._id || supplier.id}>
                        <TableCell className="font-medium">{supplier.legalName || supplier.name}</TableCell>
                        <TableCell>{supplier.contact || "N/A"}</TableCell>
                        <TableCell>{supplier.email || "N/A"}</TableCell>
                        <TableCell>
                          <Badge variant={supplier.status === "active" ? "default" : "secondary"}>
                            {supplier.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteSupplier(supplier.id)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchase Orders</CardTitle>
        <CardDescription>Track medicine purchase orders from suppliers</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO Number</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Expected Delivery</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchaseOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No purchase orders found
                  </TableCell>
                </TableRow>
              ) : (
                purchaseOrders.map((po: any) => (
                  <TableRow key={po._id || po.id}>
                    <TableCell className="font-medium">{po.purchaseId || po.po_number}</TableCell>
                    <TableCell>{po.supplierName || po.suppliers?.name || "N/A"}</TableCell>
                    <TableCell>{format(new Date(po.date || po.order_date), "PPP")}</TableCell>
                    <TableCell>
                      {po.expectedDeliveryDate || po.expected_delivery_date ? format(new Date(po.expectedDeliveryDate || po.expected_delivery_date), "PPP") : "N/A"}
                    </TableCell>
                    <TableCell>Le {Number.parseFloat(po.totalAmount || po.total_amount).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          po.status === "received"
                            ? "default"
                            : po.status === "ordered"
                              ? "secondary"
                              : po.status === "cancelled"
                                ? "destructive"
                                : "outline"
                        }
                      >
                        {po.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
