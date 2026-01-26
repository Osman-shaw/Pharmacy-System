import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DesignationForm } from "@/components/designation-form"
import { cookies } from "next/headers"
import { getProfile } from "@/lib/dashboardApi"

export default async function NewDesignationPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  let profile = null
  try {
    const profileResponse = await getProfile(token)
    profile = profileResponse.data
  } catch {
    redirect("/auth/login")
  }

  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <DashboardLayout userRole={profile?.role} userName={profile?.fullName || profile?.full_name}>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Add Designation</h2>
          <p className="text-muted-foreground">Create a new job designation</p>
        </div>
        <DesignationForm />
      </div>
    </DashboardLayout>
  )
}
