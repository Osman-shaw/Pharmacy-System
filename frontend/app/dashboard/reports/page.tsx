import React from "react"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AdvancedSalesReport } from "@/components/advanced-sales-report"
import { PurchaseReport } from "@/components/purchase-report"
import { InventoryReport } from "@/components/inventory-report"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cookies } from "next/headers"
import { getProfile, getLowStockMedicines, getExpiringMedicines } from "@/lib/dashboardApi"

export default async function ReportsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  if (!token) {
    redirect("/auth/login")
  }

  let profile = null
  try {
    const profileResponse = await getProfile(token)
    profile = profileResponse.data || profileResponse.user || profileResponse
  } catch {
    redirect("/auth/login")
  }

  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  // Fetch inventory data for reports
  const lowStockMedicines = await getLowStockMedicines(token)
  const expiringMedicines = await getExpiringMedicines(60, token) // 60 days for report

  return (
    <DashboardLayout userRole={profile?.role} userName={profile?.fullName || profile?.full_name}>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reports & Analytics</h2>
          <p className="text-muted-foreground">Comprehensive business insights and analytics</p>
        </div>

        <Tabs defaultValue="sales" className="space-y-6">
          <TabsList>
            <TabsTrigger value="sales">Sales Reports</TabsTrigger>
            <TabsTrigger value="purchase">Purchase Reports</TabsTrigger>
            <TabsTrigger value="inventory">Inventory Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="space-y-4">
            <AdvancedSalesReport />
          </TabsContent>

          <TabsContent value="purchase" className="space-y-4">
            <PurchaseReport />
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4">
            <InventoryReport
              lowStockMedicines={lowStockMedicines || []}
              expiringMedicines={expiringMedicines || []}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
