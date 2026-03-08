import React from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { InventoryForm } from "@/components/inventory-form"
import { getProfile } from "@/lib/dashboardApi"
import { getInventory } from "@/lib/inventoryApi"

export default async function NewInventoryPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  if (!token) {
    redirect("/auth/login")
  }

  let profile = null
  try {
    const profileData = await getProfile(token)
    profile = profileData?.data || profileData?.user

    if (!profile) {
      throw new Error("No user profile found")
    }
  } catch (error) {
    console.error("Auth error:", error)
    // Clear invalid token to enable login
    cookieStore.delete("token")
    redirect("/auth/login")
  }

  let medicines = []
  try {
    const inventoryData = await getInventory(token)
    medicines = inventoryData.data || inventoryData
  } catch (error) {
    console.error("Error fetching medicines:", error)
  }

  return (
    <DashboardLayout userRole={profile?.role} userName={profile?.full_name}>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Add Stock</h2>
          <p className="text-muted-foreground">Add new inventory batch for a medicine</p>
        </div>

        <InventoryForm userId={profile._id || profile.id} medicines={medicines || []} />
      </div>
    </DashboardLayout>
  )
}
