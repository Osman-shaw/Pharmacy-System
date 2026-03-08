import React from "react"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Plus, Download } from "lucide-react"
import Link from "next/link"
import { cookies } from "next/headers"
import { getProfile } from "@/lib/inventoryApi"
import { getPurchases } from "@/lib/purchasesApi"
import { PurchasesTable } from "@/components/purchases-table"

export default async function PurchasesPage() {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
        redirect("/auth/login")
    }

    let profile
    let purchases = []

    try {
        const profileData = await getProfile(token)
        profile = profileData.user || profileData.data

        const purchasesData = await getPurchases(token)
        purchases = purchasesData.data || []
    } catch (error) {
        console.error("Dashboard data fetch failed", error)
        // redirect("/auth/login")
    }

    return (
        <DashboardLayout userRole={profile?.role} userName={profile?.fullName || profile?.username}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Purchase Management</h2>
                        <p className="text-muted-foreground">Manage inventory purchases and suppliers</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="bg-white">
                            <Download className="mr-2 h-4 w-4" /> Export
                        </Button>
                        <Link href="/dashboard/purchases/new">
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="mr-2 h-4 w-4" /> Add Purchase
                            </Button>
                        </Link>
                    </div>
                </div>

                <PurchasesTable purchases={purchases} />
            </div>
        </DashboardLayout>
    )
}
