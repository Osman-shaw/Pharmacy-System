import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Package, Clock } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface InventoryReportProps {
  lowStockMedicines: any[]
  expiringMedicines: any[]
}

export function InventoryReport({ lowStockMedicines, expiringMedicines }: InventoryReportProps) {
  // Calculate critical vs warning stock levels
  const criticalStock = lowStockMedicines?.filter((med: any) => med.stock === 0) || []
  const warningStock = lowStockMedicines?.filter(
    (med: any) => med.stock > 0 && med.stock <= (med.lowStockThreshold || 10),
  ) || []

  // Calculate expired vs expiring soon
  const today = new Date()
  const expired = expiringMedicines?.filter((med: any) => {
    const expiryDate = new Date(med.expiryDate)
    return expiryDate < today
  }) || []

  const expiringSoon = expiringMedicines?.filter((med: any) => {
    const expiryDate = new Date(med.expiryDate)
    const daysUntilExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry >= 0 && daysUntilExpiry <= 30
  }) || []

  const COLORS = ["#10b981", "#f59e0b", "#ef4444"]

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalStock.length}</div>
            <p className="text-xs text-muted-foreground">Out of stock items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <Package className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{warningStock.length}</div>
            <p className="text-xs text-muted-foreground">Below reorder level</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{expiringSoon.length}</div>
            <p className="text-xs text-muted-foreground">Within 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Stock Levels Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[{ name: "Critical", value: criticalStock.length }, { name: "Warning", value: warningStock.length }]}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
              >
                <Cell fill="#ef4444" />
                <Cell fill="#f59e0b" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Expiring Medicines Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Expiring Medicines</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[{ name: "Expired", value: expired.length }, { name: "Expiring Soon", value: expiringSoon.length }]}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
              >
                <Cell fill="#ef4444" />
                <Cell fill="#f59e0b" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Low Stock Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Low Stock Medicines
          </CardTitle>
          <CardDescription>Medicines that need reordering</CardDescription>
        </CardHeader>
        <CardContent>
          {lowStockMedicines.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">All medicines are adequately stocked</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medicine</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Reorder Level</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockMedicines.map((medicine: any) => (
                  <TableRow key={medicine._id}>
                    <TableCell className="font-medium">{medicine.name}</TableCell>
                    <TableCell>{medicine.stock}</TableCell>
                    <TableCell>{medicine.lowStockThreshold || 10}</TableCell>
                    <TableCell>
                      <Badge
                        variant={medicine.stock === 0 ? "destructive" : "outline"}
                        className={medicine.stock === 0 ? "" : "border-amber-500 text-amber-600"}
                      >
                        {medicine.stock === 0 ? "Out of Stock" : "Low Stock"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Expiring Medicines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            Expiring Medicines
          </CardTitle>
          <CardDescription>Medicines nearing expiry date (60 days)</CardDescription>
        </CardHeader>
        <CardContent>
          {expiringMedicines.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No medicines expiring soon</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medicine</TableHead>
                  <TableHead>Batch Number</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Days Left</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expiringMedicines.map((medicine: any, index: number) => {
                  const today = new Date();
                  const expiryDate = new Date(medicine.expiryDate);
                  const daysUntilExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                  return (
                    <TableRow key={`${medicine._id}-${index}`}>
                      <TableCell className="font-medium">{medicine.name}</TableCell>
                      <TableCell>{medicine.batchNumber}</TableCell>
                      <TableCell>{medicine.stock}</TableCell>
                      <TableCell>{new Date(medicine.expiryDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge
                          variant={daysUntilExpiry < 0 ? "destructive" : "outline"}
                          className={
                            daysUntilExpiry < 0
                              ? ""
                              : daysUntilExpiry <= 7
                                ? "border-red-500 text-red-600"
                                : daysUntilExpiry <= 30
                                  ? "border-orange-500 text-orange-600"
                                  : "border-amber-500 text-amber-600"
                          }
                        >
                          {daysUntilExpiry < 0 ? "Expired" : `${daysUntilExpiry}d left`}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
