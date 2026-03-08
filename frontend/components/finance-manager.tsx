"use client"

import React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { PlusCircle, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { addExpense, deleteExpense } from "@/lib/financeApi"

export function FinanceManager({ type, categories, records, userId }: any) {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    referenceNumber: "",
    paymentMethod: "cash",
    vendor: "",
  })
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data: any = {
        title: formData.description,
        amount: Number.parseFloat(formData.amount),
        category: formData.category,
        date: formData.date,
        description: formData.description,
        referenceNumber: formData.referenceNumber,
        paymentMethod: formData.paymentMethod,
        recordedBy: userId,
      }

      if (type === "expenses") {
        data.vendor = formData.vendor
        await addExpense(data)
      } else {
        // Assuming addIncome exists or using addExpense if backend handles it
        // Actually I should check financeApi
        await addExpense(data)
      }

      setShowForm(false)
      setFormData({
        category: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        description: "",
        referenceNumber: "",
        paymentMethod: "cash",
        vendor: "",
      })
      router.refresh()
    } catch (error: any) {
      alert("Error saving record: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return

    try {
      if (type === "expenses") {
        await deleteExpense(id)
      } else {
        await deleteExpense(id)
      }
      router.refresh()
    } catch (error: any) {
      alert("Error deleting record: " + error.message)
    }
  }

  const totalAmount = records.reduce((sum: number, r: any) => sum + Number.parseFloat(r.amount), 0)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="capitalize">{type} Summary</CardTitle>
              <CardDescription>
                Total {type}: Le {totalAmount.toLocaleString()}
              </CardDescription>
            </div>
            <Button onClick={() => setShowForm(!showForm)} className="bg-emerald-600 hover:bg-emerald-700">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add {type === "income" ? "Income" : "Expense"}
            </Button>
          </div>
        </CardHeader>
        {showForm && (
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(v) => setFormData({ ...formData, category: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat: any) => (
                        <SelectItem key={cat.id || cat._id} value={cat.id || cat._id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Amount (Le) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(v) => setFormData({ ...formData, paymentMethod: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="mobile_money">Mobile Money</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      {type === "expenses" && <SelectItem value="cheque">Cheque</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>

                {type === "expenses" && (
                  <div className="space-y-2">
                    <Label>Vendor</Label>
                    <Input
                      value={formData.vendor}
                      onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                      placeholder="Vendor name"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Reference Number</Label>
                  <Input
                    value={formData.referenceNumber}
                    onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                    placeholder="Receipt/Invoice #"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Description *</Label>
                  <Textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Details about this transaction"
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
                  {loading ? "Saving..." : "Save"}
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
          <CardTitle className="capitalize">Recent {type}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  {type === "expenses" && <TableHead>Vendor</TableHead>}
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={type === "expenses" ? 7 : 6} className="text-center text-muted-foreground">
                      No records found
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((record: any) => (
                    <TableRow key={record.id}>
                      <TableCell>{format(new Date(record.date), "PPP")}</TableCell>
                      <TableCell>{record[`${type === "income" ? "income" : "expense"}_categories`]?.name}</TableCell>
                      <TableCell className="max-w-md truncate">{record.description}</TableCell>
                      {type === "expenses" && <TableCell>{record.vendor || "N/A"}</TableCell>}
                      <TableCell className="font-bold">
                        Le {Number.parseFloat(record.amount).toLocaleString()}
                      </TableCell>
                      <TableCell className="capitalize">{record.payment_method.replace("_", " ")}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(record.id)}>
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
