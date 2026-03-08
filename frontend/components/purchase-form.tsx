"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Save, X, Search } from "lucide-react"
import { createPurchase, updatePurchase } from "@/lib/purchasesApi"
import { getInventory } from "@/lib/inventoryApi"
import Link from "next/link"

interface PurchaseItem {
    product: string
    name: string
    batchNumber: string
    quantity: number
    unitPrice: number
    boxPattern: string
    subtotal: number
}

interface PurchaseFormProps {
    purchase?: any
}

export function PurchaseForm({ purchase }: PurchaseFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [medicines, setMedicines] = useState<any[]>([])

    const [formData, setFormData] = useState({
        purchaseId: purchase?.purchaseId || `PUR-${Date.now().toString().slice(-6)}`,
        supplierName: purchase?.supplierName || "",
        date: purchase?.date ? new Date(purchase?.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        items: purchase?.items || [] as PurchaseItem[],
        subtotal: purchase?.subtotal || 0,
        discount: purchase?.discount || 0,
        tax: purchase?.tax || 0,
        totalAmount: purchase?.totalAmount || 0,
        paymentMethod: purchase?.paymentMethod || "cash",
        notes: purchase?.notes || ""
    })

    useEffect(() => {
        const fetchMedicines = async () => {
            try {
                const data = await getInventory()
                setMedicines(data.data || [])
            } catch (error) {
                console.error("Failed to fetch medicines", error)
            }
        }
        fetchMedicines()
    }, [])

    const calculateTotals = (items: PurchaseItem[], discount: number, tax: number) => {
        const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
        const totalAmount = subtotal - discount + tax
        return { subtotal, totalAmount }
    }

    const addItem = () => {
        const newItem: PurchaseItem = {
            product: "",
            name: "",
            batchNumber: "",
            quantity: 1,
            unitPrice: 0,
            boxPattern: "",
            subtotal: 0
        }
        const newItems = [...formData.items, newItem]
        const { subtotal, totalAmount } = calculateTotals(newItems, formData.discount, formData.tax)
        setFormData({ ...formData, items: newItems, subtotal, totalAmount })
    }

    const removeItem = (index: number) => {
        const newItems = formData.items.filter((_: any, i: number) => i !== index)
        const { subtotal, totalAmount } = calculateTotals(newItems, formData.discount, formData.tax)
        setFormData({ ...formData, items: newItems, subtotal, totalAmount })
    }

    const updateItem = (index: number, field: keyof PurchaseItem, value: any) => {
        const newItems = [...formData.items]
        const item = { ...newItems[index], [field]: value }

        if (field === 'product') {
            const product = medicines.find(m => m._id === value)
            if (product) {
                item.name = product.name
                item.unitPrice = product.costPrice || 0
            }
        }

        if (field === 'quantity' || field === 'unitPrice') {
            item.subtotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)
        }

        newItems[index] = item
        const { subtotal, totalAmount } = calculateTotals(newItems, formData.discount, formData.tax)
        setFormData({ ...formData, items: newItems, subtotal, totalAmount })
    }

    const handleExtraUpdate = (field: 'discount' | 'tax', value: number) => {
        const numValue = Number(value) || 0
        const { subtotal, totalAmount } = calculateTotals(
            formData.items,
            field === 'discount' ? numValue : formData.discount,
            field === 'tax' ? numValue : formData.tax
        )
        setFormData({ ...formData, [field]: numValue, subtotal, totalAmount })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (formData.items.length === 0) {
            alert("Please add at least one item")
            return
        }
        setLoading(true)

        try {
            if (purchase) {
                await updatePurchase(purchase._id, formData)
            } else {
                await createPurchase(formData)
            }
            router.push("/dashboard/purchases")
            router.refresh()
        } catch (error: any) {
            alert(`Error ${purchase ? "updating" : "adding"} purchase: ` + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="purchaseId">Purchase ID</Label>
                                <Input
                                    id="purchaseId"
                                    value={formData.purchaseId}
                                    onChange={(e) => setFormData({ ...formData, purchaseId: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date">Purchase Date</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="supplierName">Supplier Name</Label>
                            <Input
                                id="supplierName"
                                placeholder="Enter supplier name"
                                value={formData.supplierName}
                                onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="paymentMethod">Payment Method</Label>
                                <Select
                                    value={formData.paymentMethod}
                                    onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                                >
                                    <SelectTrigger id="paymentMethod">
                                        <SelectValue placeholder="Select method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                        <SelectItem value="mobile_money">Mobile Money</SelectItem>
                                        <SelectItem value="credit">Credit</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Input
                                    id="notes"
                                    placeholder="Optional notes"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Financial Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Subtotal</Label>
                            <div className="text-2xl font-bold text-gray-900">Le {formData.subtotal.toLocaleString()}</div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="discount">Discount</Label>
                                <Input
                                    id="discount"
                                    type="number"
                                    min="0"
                                    value={formData.discount}
                                    onChange={(e) => handleExtraUpdate('discount', Number(e.target.value))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tax">Tax</Label>
                                <Input
                                    id="tax"
                                    type="number"
                                    min="0"
                                    value={formData.tax}
                                    onChange={(e) => handleExtraUpdate('tax', Number(e.target.value))}
                                />
                            </div>
                        </div>
                        <div className="pt-4 border-t">
                            <Label className="text-muted-foreground">Total Amount</Label>
                            <div className="text-3xl font-extrabold text-emerald-600">Le {formData.totalAmount.toLocaleString()}</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Purchase Items</CardTitle>
                    <Button type="button" onClick={addItem} size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4" /> Add Item
                    </Button>
                </CardHeader>
                <CardContent>
                    {formData.items.length === 0 ? (
                        <div className="py-8 text-center border-2 border-dashed rounded-lg text-muted-foreground">
                            No items added yet. Click "Add Item" to start.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {formData.items.map((item: PurchaseItem, index: number) => (
                                <div key={index} className="grid gap-4 p-4 border rounded-lg bg-gray-50/50 md:grid-cols-12 md:items-end">
                                    <div className="md:col-span-3 space-y-2">
                                        <Label>Product</Label>
                                        <Select value={item.product} onValueChange={(val) => updateItem(index, 'product', val)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select medicine" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {medicines.map((m) => (
                                                    <SelectItem key={m._id} value={m._id}>{m.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <Label>Batch Number</Label>
                                        <Input
                                            placeholder="BATCH-001"
                                            value={item.batchNumber}
                                            onChange={(e) => updateItem(index, 'batchNumber', e.target.value)}
                                        />
                                    </div>
                                    <div className="md:col-span-1 space-y-2">
                                        <Label>Qty</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <Label>Cost Price</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            value={item.unitPrice}
                                            onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <Label>Subtotal</Label>
                                        <div className="h-10 px-3 py-2 bg-white border rounded-md font-medium text-emerald-700">
                                            Le {item.subtotal.toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="md:col-span-1 flex justify-end">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                            onClick={() => removeItem(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-between border-t py-4">
                    <Link href="/dashboard/purchases">
                        <Button type="button" variant="outline">
                            <X className="mr-2 h-4 w-4" /> Cancel
                        </Button>
                    </Link>
                    <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 min-w-[120px]">
                        {loading ? "Saving..." : (
                            <>
                                <Save className="mr-2 h-4 w-4" /> {purchase ? "Update" : "Save"} Purchase
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    )
}
