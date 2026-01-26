import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { getProfile } from "@/lib/dashboardApi"
import { getEmployees, getDesignations } from "@/lib/hrApi"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmployeesTable } from "@/components/employees-table"
import { DesignationsTable } from "@/components/designations-table"
import { Users, Briefcase } from "lucide-react"
import Link from "next/link"

export default async function HRPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  let profile = null
  try {
    const profileData = await getProfile(token)
    profile = profileData.data
  } catch {
    redirect("/auth/login")
  }

  // Fetch employees and designations using the API client
  const [employees, designations] = await Promise.all([
    getEmployees(token).catch(() => []),
    getDesignations(token).catch(() => [])
  ])

  // Calculate stats
  const activeEmployees = employees?.filter((emp: any) => emp.status === "active").length || 0
  const totalDesignations = designations?.length || 0

  return (
    <DashboardLayout
      userRole={profile?.role || 'admin'}
      userName={profile?.fullName || profile?.full_name || 'Admin'}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Human Resources</h2>
            <p className="text-muted-foreground">Manage employees and designations</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeEmployees}</div>
            <p className="text-xs text-muted-foreground">Currently employed staff</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Designations</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDesignations}</div>
            <p className="text-xs text-muted-foreground">Job positions defined</p>
          </CardContent>
        </Card>

        <Tabs defaultValue="employees" className="space-y-4">
          <TabsList>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="designations">Designations</TabsTrigger>
          </TabsList>

          <TabsContent value="employees" className="space-y-4">
            <div className="flex justify-end">
              <Link href="/dashboard/hr/employees/new">
                <Button className="bg-emerald-600 hover:bg-emerald-700">Add Employee</Button>
              </Link>
            </div>
            <EmployeesTable employees={employees || []} />
          </TabsContent>

          <TabsContent value="designations" className="space-y-4">
            <div className="flex justify-end">
              <Link href="/dashboard/hr/designations/new">
                <Button className="bg-emerald-600 hover:bg-emerald-700">Add Designation</Button>
              </Link>
            </div>
            {/* Designations from Mongo might be empty initially */}
            <DesignationsTable designations={designations || []} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
