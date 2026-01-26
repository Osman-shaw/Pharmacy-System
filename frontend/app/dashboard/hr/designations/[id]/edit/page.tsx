import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DesignationForm } from "@/components/designation-form"
import { cookies } from "next/headers"
import { getProfile } from "@/lib/dashboardApi"
import { getDesignation } from "@/lib/hrApi"

export default async function EditDesignationPage(props: { params: Promise<{ id: string }> }) {
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

    const designation = await getDesignation(params.id, token)

    if (!designation) {
        redirect("/dashboard/hr")
    }

    return (
        <DashboardLayout userRole={profile?.role} userName={profile?.fullName}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Edit Designation</h2>
                    <p className="text-muted-foreground">Update job designation details</p>
                </div>
                <DesignationForm designation={designation} />
            </div>
        </DashboardLayout>
    )
}
