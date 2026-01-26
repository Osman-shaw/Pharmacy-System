import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AttendanceManager } from "@/components/attendance-manager"
import { cookies } from "next/headers"
import { getProfile } from "@/lib/dashboardApi"
import { getEmployees, getAttendance } from "@/lib/hrApi"

export default async function AttendancePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  let profile = null
  try {
    const profileData = await getProfile(token)
    profile = profileData.data
  } catch {
    redirect("/auth/login")
  }

  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  const employees = await getEmployees(token, { status: "active" })

  const today = new Date().toISOString().split("T")[0]
  const todayAttendance = await getAttendance(token, { date: today })

  return (
    <DashboardLayout userRole={profile?.role} userName={profile?.fullName || profile?.full_name}>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Attendance Management</h2>
          <p className="text-muted-foreground">Track employee attendance</p>
        </div>
        <AttendanceManager employees={employees || []} todayAttendance={todayAttendance || []} userId={profile?._id || profile?.id} />
      </div>
    </DashboardLayout>
  )
}
