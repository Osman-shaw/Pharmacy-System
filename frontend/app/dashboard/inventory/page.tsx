
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { InventoryTable } from "@/components/inventory-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { OutOfStockBanner } from "@/components/out-of-stock-banner"
import { getProfile, getInventory } from "@/lib/inventoryApi"


// Inventory page using backend API (MongoDB)
// Inventory page using backend API (MongoDB)
import { cookies } from "next/headers"

export default async function InventoryPage() {
  // 1. Get token from cookies
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  // 1. Check user session/profile
  let profile = null
  try {
    const profileResponse = await getProfile(token)
    profile = profileResponse.data || profileResponse.user || profileResponse
  } catch {
    // Not authenticated, redirect to login
    redirect("/auth/login")
  }

  // 2. Fetch inventory with medicine details
  const inventoryResponse = await getInventory(token)
  const inventory = inventoryResponse.data || []

  return (
    <DashboardLayout userRole={profile?.role} userName={profile?.fullName}>
      <div className="space-y-6">
        <OutOfStockBanner />

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Inventory</h2>
            <p className="text-muted-foreground">Track medicine stock and batches</p>
          </div>
          <Link href="/dashboard/inventory/new" prefetch={false}>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Stock
            </Button>
          </Link>
        </div>

        <InventoryTable inventory={inventory} userRole={profile?.role || "pharmacist"} />
      </div>
    </DashboardLayout>
  )
}
