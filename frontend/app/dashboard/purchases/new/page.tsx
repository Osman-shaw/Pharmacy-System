import React from "react"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PurchaseForm } from "@/components/purchase-form"
import { cookies } from "next/headers"
import { getProfile } from "@/lib/inventoryApi"

export default async function NewPurchasePage() {
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
                    <h2 className="text-3xl font-bold tracking-tight">Add New Purchase</h2>
                    <p className="text-muted-foreground">Create a new purchase order for medicines</p>
                </div>

                <PurchaseForm />
            </div>
        </DashboardLayout>
    )
}
