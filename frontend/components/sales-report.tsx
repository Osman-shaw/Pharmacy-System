"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, DollarSign, ShoppingCart, Calendar } from "lucide-react"

interface SalesReportProps {
  sales: any[]
  topMedicines: any[]
}

export function SalesReport({ sales, topMedicines }: SalesReportProps) {
  // Calculate statistics
  const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total), 0)
  const totalSales = sales.length
  const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0

  // Group sales by date for daily revenue
  const salesByDate = sales.reduce((acc: any, sale) => {
    const date = new Date(sale.sale_date).toLocaleDateString()
    if (!acc[date]) {
      acc[date] = { date, revenue: 0, count: 0 }
    }
    acc[date].revenue += Number(sale.total)
    acc[date].count += 1
    return acc
  }, {})

  const dailyRevenue = Object.values(salesByDate)
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7)

  // Payment method breakdown
  const paymentBreakdown = sales.reduce((acc: any, sale) => {
    acc[sale.payment_method] = (acc[sale.payment_method] || 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue (30 days)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Le {totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From {totalSales} transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSales}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Sale</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Le {averageSale.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Revenue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Daily Revenue (Last 7 Days)
          </CardTitle>
          <CardDescription>Revenue breakdown by day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(dailyRevenue as any[]).map((day: any) => (
              <div key={day.date} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div>
                  <p className="font-medium">{day.date}</p>
                  <p className="text-sm text-muted-foreground">{day.count} sales</p>
                </div>
                <p className="text-lg font-bold">Le {day.revenue.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Selling Medicines */}
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Medicines</CardTitle>
          <CardDescription>Best performing medicines by quantity sold</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Medicine</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Quantity Sold</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topMedicines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No sales data available
                  </TableCell>
                </TableRow>
              ) : (
                topMedicines.map((medicine: any, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Badge
                        variant={index < 3 ? "default" : "outline"}
                        className={
                          index === 0
                            ? "bg-amber-500"
                            : index === 1
                              ? "bg-gray-400"
                              : index === 2
                                ? "bg-orange-600"
                                : ""
                        }
                      >
                        #{index + 1}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{medicine.name}</TableCell>
                    <TableCell>{medicine.category}</TableCell>
                    <TableCell className="text-right font-medium">{medicine.totalQuantity}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Sales distribution by payment method</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(paymentBreakdown).map(([method, count]: [string, any]) => (
              <div key={method} className="flex items-center justify-between border-b pb-2 last:border-0">
                <p className="font-medium capitalize">{method.replace("_", " ")}</p>
                <div className="flex items-center gap-4">
                  <p className="text-sm text-muted-foreground">{((count / totalSales) * 100).toFixed(1)}%</p>
                  <Badge variant="outline">{count} sales</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest 10 sales transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.slice(0, 10).map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium">{sale.invoice_number}</TableCell>
                  <TableCell>{new Date(sale.sale_date).toLocaleDateString()}</TableCell>
                  <TableCell className="capitalize">{sale.payment_method.replace("_", " ")}</TableCell>
                  <TableCell className="text-right font-medium">Le {Number(sale.total).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
