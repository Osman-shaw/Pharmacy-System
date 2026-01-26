import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { MedicineForm } from "@/components/medicine-form"
import { cookies } from "next/headers"
import { getProfile } from "@/lib/inventoryApi"

export default async function NewMedicinePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  if (!token) {
    redirect("/auth/login")
  }

  let profile
  try {
    const profileData = await getProfile(token)
    profile = profileData.user || profileData.data
  } catch (error) {
    redirect("/auth/login")
  }

  if (profile?.role !== "admin") {
    redirect("/dashboard/medicines")
  }

  return (
    <DashboardLayout userRole={profile?.role} userName={profile?.fullName || profile?.username}>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Add New Medicine</h2>
          <p className="text-muted-foreground">Add a new medicine to the catalog</p>
        </div>

        <MedicineForm userId={profile?.id || profile?.id} token={token} />
      </div>
    </DashboardLayout>
  )
}
