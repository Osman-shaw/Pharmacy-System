import React from "react"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { MedicinesTable } from "@/components/medicines-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { cookies } from "next/headers"
import { getMedicines } from "@/lib/medicineApi"
import { getProfile } from "@/lib/dashboardApi"

export default async function MedicinesPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  if (!token) {
    redirect("/auth/login")
  }

  let profile
  let medicines = []

  try {
    const profileData = await getProfile(token)
    // Profile endpoint in backend auth.controller returns: res.json({ success: true, user: user }); 
    // Need to verify backend response structure for profile.
    // previous view of auth.controller.js showed: res.status(200).json({ success: true, data: { id, username, role... } }) ?
    // Step 928 view_file auth.controller.js showed: res.status(200).json({ success: true, user: { ... } })
    // Let's assume user object is directly in data or user property.

    profile = profileData.user || profileData.data

    const medicinesData = await getMedicines(token)
    medicines = medicinesData.data || []
  } catch (error) {
    console.error("Error fetching data", error)
    // if error is 401, redirect to login?
    // For now, let's just allow rendering with empty data or error state
  }

  return (
    <DashboardLayout userRole={profile?.role} userName={profile?.fullName || profile?.username}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Medicines</h2>
            <p className="text-muted-foreground">Manage your medicine catalog</p>
          </div>
          {profile?.role === "admin" && (
            <Link href="/dashboard/medicines/new">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="mr-2 h-4 w-4" />
                Add Medicine
              </Button>
            </Link>
          )}
        </div>

        <MedicinesTable medicines={medicines} userRole={profile?.role || "pharmacist"} />
      </div>
    </DashboardLayout>
  )
}
