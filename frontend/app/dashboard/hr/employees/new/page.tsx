import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { EmployeeForm } from "@/components/employee-form"
import { cookies } from "next/headers"
import { getProfile } from "@/lib/dashboardApi"
import { getDesignations } from "@/lib/hrApi"

export default async function NewEmployeePage() {
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

  const designations = await getDesignations(token)

  return (
    <DashboardLayout userRole={profile?.role} userName={profile?.fullName || profile?.full_name}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Add Employee</h2>
          <p className="text-muted-foreground">Create a new employee record</p>
        </div>
        <EmployeeForm designations={designations || []} />
      </div>
    </DashboardLayout>
  )
}
