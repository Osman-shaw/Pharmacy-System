import React from "react"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { SupplierForm } from "@/components/supplier-form"
import { cookies } from "next/headers"
import { getProfile } from "@/lib/inventoryApi"
import { getSupplierById } from "@/lib/suppliersApi"

export default async function EditSupplierPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
        redirect("/auth/login")
    }

    let profile
    let supplier
    try {
        const profileData = await getProfile(token)
        profile = profileData.user || profileData.data

        const supplierData = await getSupplierById(params.id, token)
        supplier = supplierData.data
    } catch (error) {
        redirect("/dashboard/suppliers")
    }

    if (!supplier) {
        redirect("/dashboard/suppliers")
    }

    return (
        <DashboardLayout userRole={profile?.role} userName={profile?.fullName || profile?.username}>
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Edit Supplier</h2>
                    <p className="text-muted-foreground">Currently editing: {supplier.legalName}</p>
                </div>

                <SupplierForm supplier={supplier} />
            </div>
        </DashboardLayout>
    )
}
