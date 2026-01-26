import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Landmark, ArrowLeft, ShieldAlert } from "lucide-react"
import Link from "next/link"
import { cookies } from "next/headers"
import { getProfile } from "@/lib/inventoryApi"
import { getPnLReport, getPnLTrends } from "@/lib/plApi"
import { PnLDashboard } from "@/components/pnl-dashboard"

export default async function PnLPage() {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
        redirect("/auth/login")
    }

    let profile
    let initialReport = null
    let initialTrends = []

    try {
        const profileData = await getProfile(token)
        profile = profileData.user || profileData.data

        if (profile.role !== 'admin') {
            return (
                <DashboardLayout userRole={profile.role} userName={profile.fullName || profile.username}>
                    <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                        <ShieldAlert className="h-16 w-16 text-rose-500" />
                        <div className="text-center">
                            <h2 className="text-2xl font-bold">Access Restricted</h2>
                            <p className="text-muted-foreground">The Profit & Loss statement is only accessible by administrators.</p>
                        </div>
                        <Link href="/dashboard">
                            <Button>Return to Dashboard</Button>
                        </Link>
                    </div>
                </DashboardLayout>
            )
        }

        const now = new Date()
        const [reportRes, trendsRes] = await Promise.all([
            getPnLReport(now.getMonth() + 1, now.getFullYear(), token),
            getPnLTrends(token)
        ])

        initialReport = reportRes.data
        initialTrends = trendsRes.data || []
    } catch (error) {
        console.error("Fetch failed", error)
    }

    return (
        <DashboardLayout userRole={profile?.role} userName={profile?.fullName || profile?.username}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-900 rounded-lg">
                            <Landmark className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Profit & Loss</h2>
                            <p className="text-muted-foreground">Comprehensive financial statements and fiscal year management</p>
                        </div>
                    </div>
                    <Link href="/dashboard/finance/expenses">
                        <Button variant="outline">View Detailed Expenses</Button>
                    </Link>
                </div>

                {initialReport ? (
                    <PnLDashboard
                        initialReport={initialReport}
                        initialTrends={initialTrends}
                        token={token}
                    />
                ) : (
                    <div className="flex justify-center py-20">
                        <p>Generating financial records...</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
