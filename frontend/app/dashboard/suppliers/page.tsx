import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Plus, Download, Truck } from "lucide-react"
import Link from "next/link"
import { cookies } from "next/headers"
import { getProfile } from "@/lib/inventoryApi"
import { getSuppliers } from "@/lib/suppliersApi"
import { SuppliersTable } from "@/components/suppliers-table"

export default async function SuppliersPage() {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
        redirect("/auth/login")
    }

    let profile
    let suppliers = []

    try {
        const profileData = await getProfile(token)
        profile = profileData.user || profileData.data

        const suppliersData = await getSuppliers(token)
        suppliers = suppliersData.data || []
    } catch (error) {
        console.error("Fetch failed", error)
    }

    return (
        <DashboardLayout userRole={profile?.role} userName={profile?.fullName || profile?.username}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Truck className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Suppliers</h2>
                            <p className="text-muted-foreground">Manage medicine distributors and manufacturers</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="bg-white">
                            <Download className="mr-2 h-4 w-4" /> Export
                        </Button>
                        <Link href="/dashboard/suppliers/new">
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="mr-2 h-4 w-4" /> Add Supplier
                            </Button>
                        </Link>
                    </div>
                </div>

                <SuppliersTable suppliers={suppliers} userRole={profile?.role} token={token} />
            </div>
        </DashboardLayout>
    )
}
