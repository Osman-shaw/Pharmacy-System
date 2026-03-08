"use client"

import React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getSales } from "@/lib/salesApi"
import { Calendar, DollarSign, ShoppingCart, TrendingUp, Download } from "lucide-react"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface SaleItem {
  product?: string
  medicineId?: string
  medicine_id?: string
  name?: string
  medicineName?: string
  medicine?: { name: string }
  medicines?: { name: string }
  quantity?: number
  subtotal?: number | string
  price?: number
}

interface Sale {
  _id?: string
  id?: string
  date?: string
  createdAt?: string
  sale_date?: string
  totalAmount?: number | string
  total_amount?: number | string
  items?: SaleItem[]
  sale_items?: SaleItem[]
  paymentMethod?: string
  payment_method?: string
}

type ReportPeriod = "daily" | "weekly" | "monthly" | "yearly" | "custom"

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"]

export function AdvancedSalesReport() {
  const [period, setPeriod] = useState<ReportPeriod>("monthly")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [salesData, setSalesData] = useState<{ period: string; revenue: number; transactions: number }[]>([])
  const [summary, setSummary] = useState<{
    totalRevenue: number
    totalTransactions: number
    totalItems: number
    averageTransactionValue: number
  }>({ totalRevenue: 0, totalTransactions: 0, totalItems: 0, averageTransactionValue: 0 })
  const [topMedicines, setTopMedicines] = useState<{ name: string; quantity: number; revenue: number }[]>([])
  const [paymentBreakdown, setPaymentBreakdown] = useState<{ name: string; value: number; count: number }[]>([])

  useEffect(() => {
    loadReportData()
  }, [period])

  const getDateRange = () => {
    const end = new Date()
    const start = new Date()

    switch (period) {
      case "daily":
        start.setHours(0, 0, 0, 0)
        break
      case "weekly":
        start.setDate(end.getDate() - 7)
        break
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

  const loadReportData = async () => {
    setLoading(true)
    const { start, end } = getDateRange()

    try {
      const response = await getSales()
      const sales = response.data || []

      if (sales) {
        // Filter by date range on client side for now
        const filteredSales = sales.filter((sale: Sale) => {
          const saleDate = new Date(sale.date || sale.createdAt || sale.sale_date || "")
          return saleDate >= start && saleDate <= end
        })

        // Calculate summary
        const totalRevenue = filteredSales.reduce((sum: number, sale: Sale) => sum + Number.parseFloat((sale.totalAmount || sale.total_amount || 0).toString()), 0)
        const totalTransactions = filteredSales.length
        const totalItems = filteredSales.reduce(
          (sum: number, sale: Sale) => sum + (sale.items || sale.sale_items || []).reduce((s: number, item: any) => s + (item.quantity || 0), 0),
          0,
        )

        setSummary({
          totalRevenue,
          totalTransactions,
          totalItems,
          averageTransactionValue: totalTransactions > 0 ? totalRevenue / totalTransactions : 0,
        })

        // Group by period for chart
        const grouped = groupSalesByPeriod(filteredSales, period)
        setSalesData(grouped)

        // Top medicines
        const medicineStats: Record<string, { name: string; quantity: number; revenue: number }> = {}
        filteredSales.forEach((sale: Sale) => {
          (sale.items || sale.sale_items || []).forEach((item: SaleItem) => {
            const medId = item.product || item.medicineId || item.medicine_id
            const medName = item.name || item.medicineName || (item.medicine || item.medicines)?.name || "Unknown"
            if (medId && !medicineStats[medId]) {
              medicineStats[medId] = {
                name: medName,
                quantity: 0,
                revenue: 0,
              }
            }
            if (medId) {
              medicineStats[medId].quantity += (item.quantity || 0)
              medicineStats[medId].revenue += Number.parseFloat((item.subtotal || 0).toString())
            }
          })
        })

        const topMeds = Object.values(medicineStats)
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 10)
        setTopMedicines(topMeds)

        // Payment method breakdown
        const paymentStats: Record<string, { name: string; value: number; count: number }> = {}
        filteredSales.forEach((sale: Sale) => {
          const method = (sale.paymentMethod || sale.payment_method || "cash").replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
          if (!paymentStats[method]) {
            paymentStats[method] = { name: method, value: 0, count: 0 }
          }
          paymentStats[method].value += Number.parseFloat((sale.totalAmount || sale.total_amount || 0).toString())
          paymentStats[method].count += 1
        })

        setPaymentBreakdown(Object.values(paymentStats))
      }
    } catch (error) {
      console.error("Error loading report data:", error)
    }


    setLoading(false)
  }

  const groupSalesByPeriod = (sales: Sale[], periodType: ReportPeriod) => {
    const grouped: Record<string, { period: string; revenue: number; transactions: number }> = {}

    sales.forEach((sale) => {
      const date = new Date(sale.date || sale.createdAt || sale.sale_date || "")
      let key = ""

      switch (periodType) {
        case "daily":
          key = date.toLocaleDateString()
          break
        case "weekly":
          const weekStart = new Date(date)
          weekStart.setDate(date.getDate() - date.getDay())
          key = weekStart.toLocaleDateString()
          break
        case "monthly":
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
          break
        case "yearly":
          key = date.getFullYear().toString()
          break
        default:
          key = date.toLocaleDateString()
      }

      if (!grouped[key]) {
        grouped[key] = { period: key, revenue: 0, transactions: 0 }
      }
      grouped[key].revenue += Number.parseFloat((sale.totalAmount || sale.total_amount || 0).toString())
      grouped[key].transactions += 1
    })

    return Object.values(grouped)
  }

  const exportToCSV = () => {
    const headers = ["Period", "Revenue", "Transactions"]
    const rows = salesData.map((d) => [d.period, d.revenue.toFixed(2), d.transactions])

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sales-report-${period}-${new Date().toISOString()}.csv`
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Report Period</CardTitle>
          <CardDescription>Select the time period for your sales report</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <Label>Period Type</Label>
              <Select value={period} onValueChange={(v) => setPeriod(v as ReportPeriod)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Today</SelectItem>
                  <SelectItem value="weekly">Last 7 Days</SelectItem>
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

            <Button onClick={loadReportData} disabled={loading}>
              {loading ? "Loading..." : "Generate Report"}
            </Button>
            <Button variant="outline" onClick={exportToCSV} disabled={salesData.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Le {summary.totalRevenue?.toFixed(2) || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalTransactions || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalItems || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Le {summary.averageTransactionValue?.toFixed(2) || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue and Transactions Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue and Transactions Trend</CardTitle>
          <CardDescription>Sales revenue and transactions over the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#10b981" />
              <Bar dataKey="transactions" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Payment Breakdown Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Breakdown</CardTitle>
          <CardDescription>Revenue by payment method</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={paymentBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                {paymentBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Selling Medicines */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Medicines</CardTitle>
            <CardDescription>By revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topMedicines}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
