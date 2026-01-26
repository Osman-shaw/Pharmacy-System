import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cookies } from "next/headers"
import { getProfile } from "@/lib/dashboardApi"
import { getSale } from "@/lib/salesApi"

export default async function SaleDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  if (!token) {
    redirect("/auth/login")
  }

  let profile = null
  try {
    const profileResponse = await getProfile(token)
    profile = profileResponse.data
  } catch {
    redirect("/auth/login")
  }

  let sale = null
  try {
    const saleData = await getSale(params.id, token)
    sale = saleData.data
  } catch (error) {
    console.error("Error fetching sale:", error)
  }

  if (!sale) {
    redirect("/dashboard/sales")
  }

  return (
    <DashboardLayout userRole={profile?.role} userName={profile?.fullName}>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Invoice {sale.invoiceNumber || sale._id.substring(0, 8).toUpperCase()}</h2>
          <p className="text-muted-foreground">Sale Transaction Details</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {sale.customerName ? (
                <>
                  <p className="font-medium">{sale.customerName}</p>
                  <p className="text-sm text-muted-foreground">Walk-in Customer</p>
                </>
              ) : sale.customer ? (
                <>
                  <p className="font-medium">{sale.customer.name}</p>
                  <p className="text-sm text-muted-foreground">{sale.customer.phone || "-"}</p>
                </>
              ) : (
                <p className="text-muted-foreground">Walk-in Customer</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold">Le {(sale.totalAmount || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Method</p>
                <Badge variant="outline" className="capitalize">{sale.paymentMethod || "Cash"}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transaction Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Cashier</p>
                <p className="font-medium">{sale.cashier?.fullName || "System"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date & Time</p>
                <p className="font-medium">{new Date(sale.date || sale.createdAt).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Items Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medicine</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sale.items && sale.items.length > 0 ? (
                  sale.items.map((item: any, idx: number) => (
                    <TableRow key={item._id || idx}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-right">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right">Le {(item.price || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-right font-bold">Le {(item.subtotal || 0).toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No items found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <div className="mt-4 flex justify-end border-t pt-4">
              <div className="space-y-2 text-right">
                <div className="flex gap-8">
                  <span className="font-medium">Grand Total:</span>
                  <span className="text-2xl font-bold">Le {(sale.totalAmount || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
