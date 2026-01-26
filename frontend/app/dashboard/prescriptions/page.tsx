import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PrescriptionsTable } from "@/components/prescriptions-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { getProfile } from "@/lib/dashboardApi"
import { getPrescriptions } from "@/lib/prescriptionsApi"

export default async function PrescriptionsPage() {
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

  let prescriptions = []
  try {
    const prescriptionsData = await getPrescriptions(token)
    prescriptions = prescriptionsData.data || prescriptionsData
  } catch (error) {
    console.error("Error fetching prescriptions:", error)
  }

  return (
    <DashboardLayout userRole={profile?.role} userName={profile?.fullName}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Prescriptions</h2>
            <p className="text-muted-foreground">Manage and track prescriptions</p>
          </div>
          <Link href="/dashboard/prescriptions/new">
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="mr-2 h-4 w-4" />
              New Prescription
            </Button>
          </Link>
        </div>

        <PrescriptionsTable prescriptions={prescriptions || []} userRole={profile?.role || ""} token={token} />
      </div>
    </DashboardLayout>
  )
}
