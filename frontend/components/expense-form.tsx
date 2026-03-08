"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, X, Receipt, Info } from "lucide-react"
import { createExpense, updateExpense } from "@/lib/expensesApi"
import Link from "next/link"

interface ExpenseFormProps {
    expense?: any
}

const CATEGORIES = [
    {
        name: 'Energy & Utilities',
        subcategories: ['Fuel', 'Generator Maintenance', 'Solar System Amortization', 'Refrigeration', 'Electricity Bill', 'Water Bill']
    },
    {
        name: 'Inventory & Supply Costs',
        subcategories: ['Cost of Goods Sold', 'Currency Fluctuation Losses', 'Wastage', 'Expired Goods', 'Damaged Goods', 'Logistics/Transport']
    },
    {
        name: 'Regulatory & Compliance',
        subcategories: ['Annual Premises License', 'Pharmacist Retention Fee', 'Technician Retention Fee', 'Product Registration Fees', 'Local Council Rates']
    },
    {
        name: 'Human Resources',
        subcategories: ['Salaries', 'Bonuses', 'Security Services', 'NASSIT Contribution']
    },
    {
        name: 'Facility & Administrative',
        subcategories: ['Rent', 'Leasehold Improvements', 'Marketing', 'Technology/Software Subscription', 'Stationery', 'Cleaning Services']
    }
]

export function ExpenseForm({ expense }: ExpenseFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState({
        title: expense?.title || "",
        amount: expense?.amount || "",
        category: expense?.category || "",
        subcategory: expense?.subcategory || "",
        date: expense?.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        notes: expense?.notes || ""
    })

    const [availableSubcategories, setAvailableSubcategories] = useState<string[]>([])

    useEffect(() => {
        const category = CATEGORIES.find(c => c.name === formData.category)
        setAvailableSubcategories(category ? category.subcategories : [])
    }, [formData.category])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const data = {
                ...formData,
                amount: Number(formData.amount)
            }

            if (expense) {
                await updateExpense(expense._id, data)
            } else {
                await createExpense(data)
            }
            router.push("/dashboard/finance/expenses")
            router.refresh()
        } catch (error: any) {
            alert(`Error saving expense: ` + error.message)
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
                            <Receipt className="h-5 w-5 text-rose-600" />
                            Expense Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Expense Title *</Label>
                            <Input
                                id="title"
                                placeholder="e.g. November Electricity Bill"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="amount">Amount (Leones) *</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    placeholder="0.00"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date">Date *</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category">Category *</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(val) => setFormData({ ...formData, category: val, subcategory: "" })}
                                required
                            >
                                <SelectTrigger id="category">
                                    <SelectValue placeholder="Select high-level category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map(cat => (
                                        <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="subcategory">Sub-category</Label>
                            <Select
                                value={formData.subcategory}
                                onValueChange={(val) => setFormData({ ...formData, subcategory: val })}
                                disabled={!formData.category}
                            >
                                <SelectTrigger id="subcategory">
                                    <SelectValue placeholder={formData.category ? "Select specific type" : "Select category first"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableSubcategories.map(sub => (
                                        <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                                    ))}
                                    <SelectItem value="Other">Other / Miscellaneous</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Info className="h-5 w-5 text-gray-500" />
                            Additional Info
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes / Description</Label>
                            <Textarea
                                id="notes"
                                placeholder="Any extra details about this expenditure..."
                                value={formData.notes}
                                onChange={handleChange}
                                rows={6}
                            />
                        </div>

                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800 leading-relaxed">
                            <p className="font-bold mb-1 underline">Sierra Leone Compliance Tip:</p>
                            Ensure all business expenses have matching physical receipts for NASSIT audits and NRA tax filings.
                            Keep track of GST where applicable for input tax credits.
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-4 border-t">
                        <Link href="/dashboard/finance/expenses">
                            <Button type="button" variant="outline">
                                <X className="mr-2 h-4 w-4" /> Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={loading} className="bg-rose-600 hover:bg-rose-700 min-w-[140px]">
                            {loading ? "Saving..." : (
                                <>
                                    <Save className="mr-2 h-4 w-4" /> {expense ? "Update Record" : "Save Expense"}
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </form>
    )
}
