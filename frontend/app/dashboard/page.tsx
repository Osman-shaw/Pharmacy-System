import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, DollarSign, ShoppingCart, AlertTriangle, TrendingUp, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { OutOfStockBanner } from "@/components/out-of-stock-banner"
import { getProfile, getDashboardStats, getLowStockMedicines, getExpiringMedicines, getPendingPrescriptions } from "@/lib/dashboardApi"
import { cookies } from "next/headers"


// Dashboard page using backend API (MongoDB)
export default async function DashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  // 1. Check user session/profile
  let profile = null
  try {
    const profileResponse = await getProfile(token)
    profile = profileResponse.data
  } catch {
    // Not authenticated, redirect to login
    redirect("/auth/login")
  }

  // 2. Fetch dashboard statistics
  const stats = await getDashboardStats(token)
  // stats: { medicineCount, customerCount, todaySalesCount, todayRevenue }

  // 3. Fetch low stock medicines
  const lowStockMedicines = await getLowStockMedicines(token)

  // 4. Fetch expiring medicines (next 30 days)
  const expiringMedicines = await getExpiringMedicines(30, token)

  // 5. Fetch pending prescriptions
  const pendingPrescriptions = await getPendingPrescriptions(token)

  return (
    <DashboardLayout userRole={profile?.role} userName={profile?.fullName}>
      <div className="space-y-6">
        <OutOfStockBanner />

        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Overview of your pharmacy operations</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Dashboard statistics from backend */}
          <StatCard
            title="Today's Revenue"
            value={`Le ${stats.todayRevenue?.toLocaleString() || 0}`}
            icon={DollarSign}
            description={`${stats.todaySalesCount || 0} sales today`}
          />
          <StatCard title="Total Medicines" value={stats.medicineCount || 0} icon={Package} description="In catalog" />
          <StatCard title="Today's Sales" value={stats.todaySalesCount || 0} icon={ShoppingCart} description="Transactions" />
          <StatCard title="Customers" value={stats.customerCount || 0} icon={Users} description="Total registered" />
        </div>

        {/* Alerts and Recent Activity */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Low Stock Alert */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Low Stock Alert
              </CardTitle>
              <CardDescription>Medicines below reorder level</CardDescription>
            </CardHeader>
            <CardContent>
              {lowStockMedicines && lowStockMedicines.length > 0 ? (
                <div className="space-y-3">
                  {lowStockMedicines.slice(0, 5).map((medicine: any) => (
                    <div
                      key={medicine._id || medicine.medicine_id}
                      className="flex items-center justify-between border-b pb-2 last:border-0"
                    >
                      <div>
                        <p className="font-medium text-sm">{medicine.name || medicine.medicine_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Current: {medicine.total_quantity} | Reorder: {medicine.reorder_level}
                        </p>
                      </div>
                      <Badge variant="destructive">Low</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">All medicines are adequately stocked</p>
              )}
            </CardContent>
          </Card>

          {/* Expiring Soon */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-orange-500" />
                Expiring Soon
              </CardTitle>
              <CardDescription>Medicines expiring in 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              {expiringMedicines && expiringMedicines.length > 0 ? (
                <div className="space-y-3">
                  {expiringMedicines.slice(0, 5).map((medicine: any) => (
                    <div
                      key={`${medicine._id || medicine.medicine_id}-${medicine.batch_number}`}
                      className="flex items-center justify-between border-b pb-2 last:border-0"
                    >
                      <div>
                        <p className="font-medium text-sm">{medicine.name || medicine.medicine_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Batch: {medicine.batch_number} | Qty: {medicine.quantity}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-orange-600">
                        {medicine.days_until_expiry}d
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No medicines expiring soon</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pending Prescriptions */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Prescriptions</CardTitle>
            <CardDescription>Prescriptions awaiting fulfillment</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingPrescriptions && pendingPrescriptions.length > 0 ? (
              <div className="space-y-3">
                {pendingPrescriptions.map((prescription: any) => (
                  <div key={prescription._id || prescription.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div>
                      <p className="font-medium">{prescription.prescription_number}</p>
                      <p className="text-sm text-muted-foreground">
                        Patient: {prescription.patient_name || prescription.customers?.name} | Doctor: {prescription.doctor_name}
                      </p>
                    </div>
                    <Badge>Pending</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No pending prescriptions</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
