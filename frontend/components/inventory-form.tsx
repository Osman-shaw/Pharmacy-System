"use client"

import React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import { createProduct, updateProduct } from "@/lib/inventoryApi"
import { toast } from "sonner"
import { CalendarIcon, Loader2, Camera, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface InventoryFormProps {
  userId: string
  // medicines prop might be used for autocomplete or other purposes, keeping it optional or as is
  medicines?: Array<{ _id?: string; id?: string; name: string; unit: string }>
  inventoryItem?: any
}

export function InventoryForm({ userId, inventoryItem }: InventoryFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    costPrice: "",
    stock: "",
    lowStockThreshold: "10",
    unit: "pcs",
    batchNumber: "",
    expiryDate: undefined as Date | undefined,
    manufacturingDate: undefined as Date | undefined,
    genericName: "",
    dosageForm: "",
    strength: "",
    packSize: "",
    manufacturer: "",
    isCritical: false,
    image: "",
    storeId: "main",
    sync: false,
  })

  // Pre-fill form if editing
  useEffect(() => {
    if (inventoryItem) {
      setFormData({
        name: inventoryItem.name || "",
        category: inventoryItem.category || "",
        description: inventoryItem.description || "",
        price: inventoryItem.price?.toString() || "",
        costPrice: inventoryItem.costPrice?.toString() || "",
        stock: inventoryItem.stock?.toString() || "",
        lowStockThreshold: inventoryItem.lowStockThreshold?.toString() || "10",
        unit: inventoryItem.unit || "pcs",
        batchNumber: inventoryItem.batchNumber || "",
        expiryDate: inventoryItem.expiryDate ? new Date(inventoryItem.expiryDate) : undefined,
        manufacturingDate: inventoryItem.manufacturingDate ? new Date(inventoryItem.manufacturingDate) : undefined,
        genericName: inventoryItem.genericName || "",
        dosageForm: inventoryItem.dosageForm || "",
        strength: inventoryItem.strength || "",
        packSize: inventoryItem.packSize || "",
        manufacturer: inventoryItem.manufacturer || "",
        isCritical: inventoryItem.isCritical || false,
        image: inventoryItem.image || "",
        storeId: inventoryItem.storeId || "main",
        sync: inventoryItem.sync || false,
      })
    }
  }, [inventoryItem])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === 'number') {
      // Prevent negative numbers for specific fields if needed, or just allow raw input
      setFormData(prev => ({ ...prev, [name]: value }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isCritical: checked }))
  }

  const handleDateChange = (name: string, date: Date | undefined) => {
    setFormData(prev => ({ ...prev, [name]: date }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: "" }))
  }

  const getTokenFromCookie = () => {
    const cookies = document.cookie.split(';')
    const tokenCookie = cookies.find(c => c.trim().startsWith('token='))
    return tokenCookie ? tokenCookie.split('=')[1] : undefined
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Basic validation
      if (!formData.name || !formData.category || !formData.price || !formData.costPrice || !formData.stock) {
        toast.error("Please fill in all required fields (Name, Category, Prices, Stock)")
        setIsLoading(false)
        return
      }

      const token = getTokenFromCookie()

      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        costPrice: parseFloat(formData.costPrice),
        stock: parseInt(formData.stock),
        lowStockThreshold: parseInt(formData.lowStockThreshold),
      }

      if (inventoryItem) {
        await updateProduct(inventoryItem._id || inventoryItem.id, payload, token)
        toast.success("Inventory item updated successfully")
      } else {
        await createProduct(payload, token)
        toast.success("Inventory item added successfully")
      }

      router.push("/dashboard/inventory")
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || "Failed to save inventory item")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{inventoryItem ? "Edit Inventory Item" : "Add New Inventory Item"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>

            <div className="flex flex-col items-center gap-4 sm:flex-row pb-4">
              <div className="relative h-24 w-24 overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
                {formData.image ? (
                  <>
                    <img src={formData.image} alt="Preview" className="h-full w-full object-cover" />
                    <button type="button" onClick={removeImage} className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full m-1 hover:bg-red-600">
                      <X className="h-3 w-3" />
                    </button>
                  </>
                ) : (
                  <div className="text-center p-2">
                    <Camera className="h-6 w-6 text-gray-400 mx-auto" />
                    <span className="text-[10px] text-gray-500">Add Photo</span>
                  </div>
                )}
                <label className="absolute inset-0 cursor-pointer opacity-0">
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
              </div>
              <div>
                <h3 className="font-medium text-sm text-foreground">Product Image</h3>
                <p className="text-xs text-muted-foreground">Upload a clear image of the product (PNG, JPG).</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product/Medicine Name <span className="text-red-500">*</span></Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Paracetamol" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="genericName">Generic Name</Label>
                <Input id="genericName" name="genericName" value={formData.genericName} onChange={handleChange} placeholder="e.g. Acetaminophen" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
                <Select onValueChange={(val) => handleSelectChange("category", val)} value={formData.category}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Medicine">Medicine</SelectItem>
                    <SelectItem value="Equipment">Equipment</SelectItem>
                    <SelectItem value="Consumable">Consumable</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input id="manufacturer" name="manufacturer" value={formData.manufacturer} onChange={handleChange} placeholder="e.g. Pfizer" />
              </div>

              <div className="col-span-1 md:col-span-2 space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Product description..." />
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-200" />

          {/* Section 2: Medicine Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Medicine Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dosageForm">Dosage Form</Label>
                <Select onValueChange={(val) => handleSelectChange("dosageForm", val)} value={formData.dosageForm}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tablet">Tablet</SelectItem>
                    <SelectItem value="Capsule">Capsule</SelectItem>
                    <SelectItem value="Syrup">Syrup</SelectItem>
                    <SelectItem value="Injection">Injection</SelectItem>
                    <SelectItem value="Cream">Cream</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="strength">Strength</Label>
                <Input id="strength" name="strength" value={formData.strength} onChange={handleChange} placeholder="e.g. 500mg" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="packSize">Pack Size</Label>
                <Input id="packSize" name="packSize" value={formData.packSize} onChange={handleChange} placeholder="e.g. 10x10" />
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-200" />

          {/* Section 3: Pricing & Stock */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Pricing & Inventory</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="costPrice">Cost Price <span className="text-red-500">*</span></Label>
                <Input type="number" id="costPrice" name="costPrice" value={formData.costPrice} onChange={handleChange} placeholder="0.00" min="0" step="0.01" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Selling Price <span className="text-red-500">*</span></Label>
                <Input type="number" id="price" name="price" value={formData.price} onChange={handleChange} placeholder="0.00" min="0" step="0.01" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input id="unit" name="unit" value={formData.unit} onChange={handleChange} placeholder="e.g. pcs, box" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Current Stock <span className="text-red-500">*</span></Label>
                <Input type="number" id="stock" name="stock" value={formData.stock} onChange={handleChange} placeholder="0" min="0" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lowStockThreshold">Low Stock Alert Level</Label>
                <Input type="number" id="lowStockThreshold" name="lowStockThreshold" value={formData.lowStockThreshold} onChange={handleChange} placeholder="10" min="0" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="batchNumber">Batch Number</Label>
                <Input id="batchNumber" name="batchNumber" value={formData.batchNumber} onChange={handleChange} placeholder="Batch #..." />
              </div>

              <div className="space-y-2 flex flex-col">
                <Label>Manufacturing Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !formData.manufacturingDate && "text-muted-foreground")}>
                      {formData.manufacturingDate ? format(formData.manufacturingDate, "PPP") : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={formData.manufacturingDate} onSelect={(date) => handleDateChange("manufacturingDate", date)} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2 flex flex-col">
                <Label>Expiry Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !formData.expiryDate && "text-muted-foreground")}>
                      {formData.expiryDate ? format(formData.expiryDate, "PPP") : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={formData.expiryDate} onSelect={(date) => handleDateChange("expiryDate", date)} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox id="isCritical" checked={formData.isCritical} onCheckedChange={handleCheckboxChange} />
              <Label htmlFor="isCritical" className="font-medium cursor-pointer">Critical Item (Mark as priority for restocking)</Label>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading
                ? `${inventoryItem ? "Updating" : "Adding"}...`
                : inventoryItem
                  ? "Update Inventory"
                  : "Add to Inventory"}
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
