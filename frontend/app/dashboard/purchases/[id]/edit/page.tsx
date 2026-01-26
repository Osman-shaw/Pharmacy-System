import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PurchaseForm } from "@/components/purchase-form"
import { cookies } from "next/headers"
import { getProfile } from "@/lib/inventoryApi"
import { getPurchaseById } from "@/lib/purchasesApi"

export default async function EditPurchasePage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
        redirect("/auth/login")
    }

    let profile
    let purchase
    try {
        const profileData = await getProfile(token)
        profile = profileData.user || profileData.data

        const purchaseData = await getPurchaseById(params.id, token)
        purchase = purchaseData.data
    } catch (error) {
        redirect("/dashboard/purchases")
    }

    if (!purchase || purchase.status !== 'pending') {
        redirect("/dashboard/purchases")
    }

    return (
        <DashboardLayout userRole={profile?.role} userName={profile?.fullName || profile?.username}>
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Edit Purchase</h2>
                    <p className="text-muted-foreground">Modify pending purchase order</p>
                </div>

                <PurchaseForm purchase={purchase} />
            </div>
        </DashboardLayout>
    )
}
