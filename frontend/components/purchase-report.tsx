"use client"

import React from "react"
import { useState, useEffect } from "react"
import { getPurchases } from "@/lib/purchasesApi"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Package, TrendingUp, DollarSign } from "lucide-react"
import type { ReactNode } from "react"

interface PurchaseItem {
  quantity: number
  price: number
  [key: string]: any
}

interface PurchaseOrder {
  id?: string
  _id?: string
  date?: string
  createdAt?: string
  order_date?: string
  totalAmount?: number
  total_amount?: number
  items?: PurchaseItem[]
  purchase_order_items?: PurchaseItem[]
  supplierName?: string
  suppliers?: {
    name: string
  }
}

export function PurchaseReport() {
  const [period, setPeriod] = useState<"monthly" | "yearly" | "custom">("monthly")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [purchaseData, setPurchaseData] = useState<any[]>([])
  const [summary, setSummary] = useState({
    totalSpent: 0,
    totalOrders: 0,
    totalItems: 0,
  })
  const [topSuppliers, setTopSuppliers] = useState<any[]>([])

  useEffect(() => {
    loadPurchaseData()
  }, [period])

  const getDateRange = () => {
    const end = new Date()
    const start = new Date()

    switch (period) {
      case "monthly":
        start.setMonth(end.getMonth() - 1)
        break
      case "yearly":
        start.setFullYear(end.getFullYear() - 1)
        break
      case "custom":
        if (startDate && endDate) {
          return { start: new Date(startDate), end: new Date(endDate) }
        }
        return { start, end }
    }

    return { start, end }
  }

  const loadPurchaseData = async () => {
    setLoading(true)
    const { start, end } = getDateRange()

    try {
      const response = await getPurchases()
      const purchases = response.data || []

      if (purchases) {
        const filteredPurchases = purchases.filter((po: PurchaseOrder) => {
          const poDate = new Date(po.date || po.createdAt || po.order_date || "")
          return poDate >= start && poDate <= end
        })

        const totalSpent = filteredPurchases.reduce(
          (sum: number, po: PurchaseOrder) => sum + Number.parseFloat((po.totalAmount || po.total_amount || 0).toString()),
          0,
        )
        const totalOrders = filteredPurchases.length
        const totalItems = filteredPurchases.reduce(
          (sum: number, po: PurchaseOrder) =>
            sum +
            (po.items || po.purchase_order_items || []).reduce(
              (s: number, item: PurchaseItem) => s + (item.quantity || 0),
              0,
            ),
          0,
        )

        setSummary({ totalSpent, totalOrders, totalItems })

        // Group by month
        const grouped: Record<string, { month: string; spent: number; orders: number }> = {}
        filteredPurchases.forEach((po: PurchaseOrder) => {
          const date = new Date(po.date || po.createdAt || po.order_date || "")
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
          if (!grouped[key]) {
            grouped[key] = { month: key, spent: 0, orders: 0 }
          }
          grouped[key].spent += Number.parseFloat((po.totalAmount || po.total_amount || 0).toString())
          grouped[key].orders += 1
        })
        setPurchaseData(Object.values(grouped))

        // Top suppliers
        const supplierStats: Record<string, { name: string; spent: number; orders: number }> = {}
        filteredPurchases.forEach((po: PurchaseOrder) => {
          const supplier = po.supplierName || po.suppliers?.name || "Unknown"
          if (!supplierStats[supplier]) {
            supplierStats[supplier] = { name: supplier, spent: 0, orders: 0 }
          }
          supplierStats[supplier].spent += Number.parseFloat((po.totalAmount || po.total_amount || 0).toString())
          supplierStats[supplier].orders += 1
        })
        setTopSuppliers(
          Object.values(supplierStats)
            .sort((a: any, b: any) => b.spent - a.spent)
            .slice(0, 10),
        )
      }
    } catch (error) {
      console.error("Error loading purchase report:", error)
    }

    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Report Period</CardTitle>
          <CardDescription>Select the time period for purchase analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <Label>Period Type</Label>
              <Select value={period} onValueChange={(v: any) => setPeriod(v)}>
                <SelectTrigger aria-label="Report period type">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Last 30 Days</SelectItem>
                  <SelectItem value="yearly">Last Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {period === "custom" && (
              <>
                <div className="flex-1 min-w-[200px]">
                  <Label>Start Date</Label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <Label>End Date</Label>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </>
            )}

            <Button onClick={loadPurchaseData} disabled={loading}>
              {loading ? "Loading..." : "Generate Report"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Le {summary.totalSpent?.toFixed(2) || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Purchase Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalOrders || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Purchased</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalItems || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Purchase Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Trend</CardTitle>
          <CardDescription>Monthly purchase spending</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={purchaseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="spent" fill="#3b82f6" name="Amount Spent (Le)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Suppliers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Suppliers</CardTitle>
          <CardDescription>By total spending</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topSuppliers} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip />
              <Bar dataKey="spent" fill="#10b981" name="Total Spent (Le)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Total Spending Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Total Spending by Supplier</CardTitle>
          <CardDescription>Bar chart of total spending per supplier</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={purchaseData}>
              <XAxis dataKey="supplierName" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="totalAmount" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Supplier Contributions Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Supplier Contributions</CardTitle>
          <CardDescription>Bar chart of supplier contributions to total spending</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topSuppliers}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
