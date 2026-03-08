import React from "react"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PayrollForm } from "@/components/payroll-form"
import { getProfile } from "@/lib/dashboardApi"

export default async function NewPayrollPage() {
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

    if (profile?.role !== 'admin') {
        redirect("/dashboard")
    }

    return (
        <DashboardLayout userRole={profile?.role} userName={profile?.fullName || profile?.full_name}>
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Process Payroll</h2>
                    <p className="text-muted-foreground">Calculate and record employee salary payment</p>
                </div>
                <div className="max-w-5xl">
                    <PayrollForm token={token} />
                </div>
            </div>
        </DashboardLayout>
    )
}
