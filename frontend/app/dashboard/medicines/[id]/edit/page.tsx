
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { MedicineForm } from "@/components/medicine-form"
import { cookies } from "next/headers"
import { getMedicineById } from "@/lib/medicineApi"
import { getProfile } from "@/lib/dashboardApi"

export default async function EditMedicinePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  if (!token) {
    redirect("/auth/login")
  }

  let profile
  let medicine
  try {
    const profileData = await getProfile(token)
    profile = profileData.user || profileData.data

    if (profile?.role !== "admin") {
      redirect("/dashboard/medicines")
    }

    const medicineData = await getMedicineById(params.id, token)
    medicine = medicineData.data || medicineData
  } catch (error) {
    redirect("/dashboard/medicines")
  }

  if (!medicine) {
    redirect("/dashboard/medicines")
  }

  return (
    <DashboardLayout userRole={profile?.role} userName={profile?.fullName || profile?.username}>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit Medicine</h2>
          <p className="text-muted-foreground">Update medicine information</p>
        </div>

        <MedicineForm medicine={{ ...medicine, id: medicine._id }} userId={profile?.id} token={token} />
      </div>
    </DashboardLayout>
  )
}
