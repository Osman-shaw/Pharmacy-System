"use client"

import React from "react"
import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Search, Calendar, Tag, CreditCard } from "lucide-react"
import { deleteExpense } from "@/lib/financeApi"
import { useRouter } from "next/navigation"

interface Expense {
    _id: string
    title: string
    amount: number
    category: string
    subcategory?: string
    date: string
    notes?: string
    recordedBy?: {
        fullName?: string
        username?: string
    }
}

interface ExpensesTableProps {
    expenses: Expense[]
    userRole: string
}

export function ExpensesTable({ expenses: initialExpenses, userRole }: ExpensesTableProps) {
    const [search, setSearch] = useState("")
    const [expenses, setExpenses] = useState(initialExpenses)
    const router = useRouter()

    const filteredExpenses = expenses.filter(
        (e) =>
            e.title.toLowerCase().includes(search.toLowerCase()) ||
            e.category.toLowerCase().includes(search.toLowerCase()) ||
            e.subcategory?.toLowerCase().includes(search.toLowerCase())
    )

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Are you sure you want to delete expense "${title}"?`)) return
        try {
            await deleteExpense(id)
            setExpenses(expenses.filter(e => e._id !== id))
            router.refresh()
        } catch (error: any) {
            alert("Error deleting expense: " + error.message)
        }
    }

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'Energy & Utilities': return 'bg-orange-100 text-orange-700'
            case 'Inventory & Supply Costs': return 'bg-blue-100 text-blue-700'
            case 'Regulatory & Compliance': return 'bg-purple-100 text-purple-700'
            case 'Human Resources': return 'bg-emerald-100 text-emerald-700'
            case 'Facility & Administrative': return 'bg-slate-100 text-slate-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by title, category, or subcategory..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>

            <div className="rounded-lg border bg-white overflow-hidden shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50">
                            <TableHead className="font-bold">Date</TableHead>
                            <TableHead className="font-bold">Expense Title</TableHead>
                            <TableHead className="font-bold">Category</TableHead>
                            <TableHead className="font-bold">Amount (Le)</TableHead>
                            <TableHead className="font-bold">Recorded By</TableHead>
                            <TableHead className="text-right font-bold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredExpenses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                    No expenses found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredExpenses.map((expense) => (
                                <TableRow key={expense._id} className="hover:bg-gray-50/50 transition-colors">
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Calendar className="h-4 w-4" />
                                            {new Date(expense.date).toLocaleDateString()}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900">{expense.title}</span>
                                            {expense.subcategory && (
                                                <span className="text-xs text-muted-foreground italic flex items-center gap-1">
                                                    <Tag className="h-3 w-3" /> {expense.subcategory}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`font-medium ${getCategoryColor(expense.category)}`}>
                                            {expense.category}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-bold text-rose-600">
                                        <div className="flex items-center gap-1">
                                            <CreditCard className="h-3 w-3" />
                                            {expense.amount.toLocaleString()}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {expense.recordedBy?.fullName || expense.recordedBy?.username || "System"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 hover:text-amber-600"
                                                onClick={() => router.push(`/dashboard/finance/expenses/${expense._id}/edit`)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            {userRole === 'admin' && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                                    onClick={() => handleDelete(expense._id, expense.title)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
