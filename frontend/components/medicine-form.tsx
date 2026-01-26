"use client"

import type React from "react"

import { useState } from "react"
import { createMedicine, updateMedicine } from "@/lib/medicineApi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface MedicineFormProps {
  userId: string
  medicine?: any
  token?: string
}

export function MedicineForm({ userId, medicine, token }: MedicineFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: medicine?.name || "",
    genericName: medicine?.genericName || "",
    category: medicine?.category || "",
    manufacturer: medicine?.manufacturer || "",
    description: medicine?.description || "",
    dosageForm: medicine?.dosageForm || "",
    strength: medicine?.strength || "",
    packSize: medicine?.packSize || "",
    manufacturingDate: medicine?.manufacturingDate ? new Date(medicine.manufacturingDate).toISOString().split('T')[0] : "",
    expiryDate: medicine?.expiryDate ? new Date(medicine.expiryDate).toISOString().split('T')[0] : "",
    unit: medicine?.unit || "",
    stock: medicine?.stock || 0,
    price: medicine?.price || 0,
    costPrice: medicine?.costPrice || 0,
    batchNumber: medicine?.batchNumber || "",
    lowStockThreshold: medicine?.lowStockThreshold || 10,
    isCritical: medicine?.isCritical || false,
    storage_instructions: medicine?.storage_instructions || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate cost vs price
      if (Number(formData.price) < Number(formData.costPrice)) {
        toast.error("Selling price cannot be less than cost price")
        setIsLoading(false)
        return
      }

      if (medicine) {
        await updateMedicine(medicine.id || medicine._id, formData, token)
        toast.success("Medicine updated successfully!")
      } else {
        await createMedicine({
          ...formData,
          storeId: 'main'
        }, token)
        toast.success("Medicine added successfully!")
      }

      router.push("/dashboard/medicines")
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || "Failed to save medicine")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [id]: val }));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{medicine ? "Edit Medicine" : "Medicine Details"}</CardTitle>
        <CardDescription>
          {medicine ? "Update medicine information" : "Enter the details of the new medicine"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">
                Medicine Name <span className="text-red-500">*</span>
              </Label>
              <Input id="name" required value={formData.name} onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="genericName">Generic Name</Label>
              <Input id="genericName" value={formData.genericName} onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">
                Category <span className="text-red-500">*</span>
              </Label>
              <Input id="category" required value={formData.category} onChange={handleChange} placeholder="e.g., Analgesics" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input id="manufacturer" value={formData.manufacturer} onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dosageForm">Dosage Form</Label>
              <Input id="dosageForm" value={formData.dosageForm} onChange={handleChange} placeholder="e.g., Tablet" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="strength">Strength</Label>
              <Input id="strength" value={formData.strength} onChange={handleChange} placeholder="e.g., 500mg" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="packSize">Pack Size</Label>
              <Input id="packSize" value={formData.packSize} onChange={handleChange} placeholder="e.g., 10x10" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="batchNumber">Batch Number</Label>
              <Input id="batchNumber" value={formData.batchNumber} onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manufacturingDate">Manufacturing Date</Label>
              <Input id="manufacturingDate" type="date" value={formData.manufacturingDate} onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input id="expiryDate" type="date" value={formData.expiryDate} onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Quantity</Label>
              <Input id="stock" type="number" value={formData.stock} onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input id="unit" value={formData.unit} onChange={handleChange} placeholder="e.g., Box" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="costPrice">Cost Price</Label>
              <Input id="costPrice" type="number" step="0.01" value={formData.costPrice} onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Selling Price</Label>
              <Input id="price" type="number" step="0.01" value={formData.price} onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lowStockThreshold">Reorder Level</Label>
              <Input id="lowStockThreshold" type="number" value={formData.lowStockThreshold} onChange={handleChange} />
            </div>

            <div className="flex items-center space-x-2 pt-8">
              <input
                type="checkbox"
                id="isCritical"
                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                checked={formData.isCritical}
                onChange={handleChange}
              />
              <Label htmlFor="isCritical" className="font-medium text-red-600 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" /> Critical Drug
              </Label>
              <p className="text-xs text-muted-foreground ml-2">Mark for high-priority stock alerts</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={formData.description} onChange={handleChange} rows={3} />
          </div>

          <div className="flex gap-4">
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
              {isLoading ? "Saving..." : medicine ? "Update Medicine" : "Add Medicine"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
