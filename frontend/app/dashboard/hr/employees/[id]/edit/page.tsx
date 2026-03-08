import React from "react"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { EmployeeForm } from "@/components/employee-form"
import { cookies } from "next/headers"
import { getProfile } from "@/lib/dashboardApi"
import { getEmployee, getDesignations } from "@/lib/hrApi"

export default async function EditEmployeePage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
        redirect("/auth/login")
    }

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

    const employee = await getEmployee(params.id, token)
    const designations = await getDesignations(token)

    if (!employee) {
        redirect("/dashboard/hr")
    }

    return (
        <DashboardLayout userRole={profile?.role} userName={profile?.fullName}>
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Edit Employee</h2>
                    <p className="text-muted-foreground">Update employee information</p>
                </div>
                <EmployeeForm employee={employee} designations={designations || []} />
            </div>
        </DashboardLayout>
    )
}
