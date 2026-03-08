import React from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { SuppliesManager } from "@/components/supplies-manager"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getProfile } from "@/lib/dashboardApi"
import { getPurchases } from "@/lib/purchasesApi"
import { getSuppliers } from "@/lib/suppliersApi"

export default async function SuppliesPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  if (!token) {
    redirect("/auth/login")
  }

  const profileResponse = await getProfile(token)
  const profile = profileResponse.data

  if (!profile) {
    redirect("/auth/login")
  }

  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  let suppliers = []
  let purchaseOrders = []
  try {
    const suppliersData = await getSuppliers(token)
    suppliers = suppliersData.data || suppliersData

    const poData = await getPurchases(token)
    purchaseOrders = poData.data || poData
  } catch (error) {
    console.error("Error fetching supplies data:", error)
  }

  return (
    <DashboardLayout userRole={profile?.role} userName={profile?.fullName}>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Supplies Management</h2>
          <p className="text-muted-foreground">Manage suppliers and purchase orders</p>
        </div>

        <Tabs defaultValue="purchase-orders" className="space-y-4">
          <TabsList>
            <TabsTrigger value="purchase-orders">Purchase Orders</TabsTrigger>
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          </TabsList>

          <TabsContent value="purchase-orders">
            <SuppliesManager
              type="orders"
              suppliers={suppliers || []}
              purchaseOrders={purchaseOrders || []}
              userId={profile.id || profile._id}
            />
          </TabsContent>

          <TabsContent value="suppliers">
            <SuppliesManager type="suppliers" suppliers={suppliers || []} purchaseOrders={[]} userId={profile.id || profile._id} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
