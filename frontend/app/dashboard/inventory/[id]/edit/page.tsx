import React from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { InventoryForm } from "@/components/inventory-form"
import { getProfile } from "@/lib/dashboardApi"
import { getProductById, getInventory } from "@/lib/inventoryApi"

export default async function EditInventoryPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
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
    cookieStore.delete("token")
    redirect("/auth/login")
  }

  if (profile?.role !== "admin" && profile?.role !== "pharmacist") {
    redirect("/dashboard")
  }

  let inventoryItem = null
  let medicines = []

  try {
    const itemData = await getProductById(params.id, token)
    inventoryItem = itemData.data || itemData

    const medicinesData = await getInventory(token)
    medicines = medicinesData.data || medicinesData
  } catch (error) {
    console.error("Error fetching inventory data:", error)
    redirect("/dashboard/inventory")
  }

  if (!inventoryItem) {
    redirect("/dashboard/inventory")
  }

  return (
    <DashboardLayout userRole={profile?.role} userName={profile?.full_name}>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit Inventory</h2>
          <p className="text-muted-foreground">Update inventory batch information</p>
        </div>

        <InventoryForm userId={profile._id || profile.id} medicines={medicines || []} inventoryItem={inventoryItem} />
      </div>
    </DashboardLayout>
  )
}
