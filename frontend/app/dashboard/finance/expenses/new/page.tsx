import React from "react"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ExpenseForm } from "@/components/expense-form"
import { cookies } from "next/headers"
import { getProfile } from "@/lib/inventoryApi"

export default async function NewExpensePage() {
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

    return (
        <DashboardLayout userRole={profile?.role} userName={profile?.fullName || profile?.username}>
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Record Expense</h2>
                    <p className="text-muted-foreground">Document a new expenditure for financial reporting</p>
                </div>

                <ExpenseForm />
            </div>
        </DashboardLayout>
    )
}
