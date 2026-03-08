"use client"

import React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, X, Building2 } from "lucide-react"
import { createSupplier, updateSupplier } from "@/lib/suppliersApi"
import Link from "next/link"
import { toast } from "sonner"

interface SupplierFormProps {
    supplier?: any
}

export function SupplierForm({ supplier }: SupplierFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState({
        legalName: supplier?.legalName || "",
        address: supplier?.address || "",
        contact: supplier?.contact || "",
        email: supplier?.email || "",
        country: supplier?.country || "Sierra Leone",
        tin: supplier?.tin || "",
        pharmacyBoardReg: supplier?.pharmacyBoardReg || "",
        status: supplier?.status || "active"
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (supplier) {
                await updateSupplier(supplier._id, formData)
                toast.success("Supplier updated successfully!")
            } else {
                await createSupplier(formData)
                toast.success("Supplier registered successfully!")
            }
            router.push("/dashboard/suppliers")
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || "Failed to save supplier")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-blue-600" />
                            General Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="legalName">Legal Name *</Label>
                            <Input
                                id="legalName"
                                placeholder="e.g. Sierra Pharmacy Wholesalers Ltd"
                                value={formData.legalName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="contact">Contact Number *</Label>
                                <Input
                                    id="contact"
                                    placeholder="+232-XX-XXXXXX"
                                    value={formData.contact}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="contact@supplier.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address">Physical Address *</Label>
                            <Textarea
                                id="address"
                                placeholder="Enter full address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                                rows={3}
                            />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="country">Country</Label>
                                <Input
                                    id="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(val) => setFormData({ ...formData, status: val })}
                                >
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Compliance & ID (Sierra Leone)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="tin">TIN (Taxpayer Identification Number)</Label>
                            <Input
                                id="tin"
                                placeholder="e.g. 1234567-8"
                                value={formData.tin}
                                onChange={handleChange}
                            />
                            <p className="text-xs text-muted-foreground italic">Required for tax reporting in Sierra Leone.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pharmacyBoardReg">Pharmacy Board Registration No.</Label>
                            <Input
                                id="pharmacyBoardReg"
                                placeholder="e.g. PBSL/WH/2023/..."
                                value={formData.pharmacyBoardReg}
                                onChange={handleChange}
                            />
                            <p className="text-xs text-muted-foreground italic">Registration number issued by Pharmacy Board of Sierra Leone.</p>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col items-start gap-4 pt-4 border-t">
                        <div className="w-full flex justify-between">
                            <Link href="/dashboard/suppliers">
                                <Button type="button" variant="outline">
                                    <X className="mr-2 h-4 w-4" /> Cancel
                                </Button>
                            </Link>
                            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 min-w-[140px]">
                                {loading ? "Saving..." : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" /> {supplier ? "Update Supplier" : "Register Supplier"}
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </form>
    )
}
