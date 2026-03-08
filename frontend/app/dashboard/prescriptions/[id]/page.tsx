import React from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getProfile } from "@/lib/dashboardApi"
import { getPrescriptionById } from "@/lib/prescriptionsApi"

export default async function PrescriptionDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  if (!token) {
    redirect("/auth/login")
  }

  const profileResponse = await getProfile(token)
  const profile = profileResponse.data

  if (!profile) {
    redirect("/auth/login")
  }

  let prescription = null
  try {
    const prescriptionData = await getPrescriptionById(token, params.id)

    prescription = prescriptionData.data || prescriptionData
  } catch (error) {
    console.error("Error fetching prescription:", error)
  }

  if (!prescription) {
    redirect("/dashboard/prescriptions")
  }

  return (
    <DashboardLayout userRole={profile?.role} userName={profile?.fullName}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{prescription.prescription_number || "Prescription"}</h2>
            <p className="text-muted-foreground">Prescription Details</p>
          </div>
          <Badge
            variant={prescription.status === "processed" || prescription.status === "filled" ? "outline" : "default"}
            className={prescription.status === "processed" || prescription.status === "filled" ? "border-green-500 text-green-600" : ""}
          >
            {prescription.status}
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{prescription.customer?.name || prescription.customers?.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{prescription.customers.phone || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{prescription.customers.email || "-"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prescription Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Doctor/Prescriber</p>
                <p className="font-medium">{prescription.doctorName || prescription.prescriberName || prescription.doctor_name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Issue Date</p>
                <p className="font-medium">{new Date(prescription.issue_date || prescription.writtenDate || prescription.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">{new Date(prescription.createdAt || prescription.created_at).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {prescription.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Prescription Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-muted-foreground">{prescription.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
