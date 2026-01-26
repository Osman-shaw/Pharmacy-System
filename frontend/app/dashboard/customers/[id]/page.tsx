import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import Link from "next/link"
import { cookies } from "next/headers"
import { getProfile, getCustomerById } from "@/lib/customersApi"
import { getPrescriptions } from "@/lib/prescriptionsApi"
import { getSales } from "@/lib/salesApi"

export default async function CustomerDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  if (!token) {
    redirect("/auth/login")
  }

  let profile
  let customer
  let filteredPrescriptions = []
  let filteredSales = []

  try {
    const profileData = await getProfile(token)
    profile = profileData.user || profileData.data

    const customerData = await getCustomerById(params.id, token)
    customer = customerData.data

    if (!customer) {
      redirect("/dashboard/customers")
    }

    const id = customer._id || customer.id

    const prescriptionsData = await getPrescriptions(token)
    const prescriptions = prescriptionsData.data || []
    filteredPrescriptions = prescriptions.filter((p: any) =>
      (p.customer?._id || p.customer?.id || p.customer) === id
    )

    const salesData = await getSales(token)
    const sales = salesData.data || []
    filteredSales = sales.filter((s: any) =>
      (s.customer?._id || s.customer?.id || s.customer) === id
    )
  } catch (error) {
    redirect("/dashboard/customers")
  }

  if (!customer) {
    redirect("/dashboard/customers")
  }

  const id = customer._id || customer.id

  return (
    <DashboardLayout userRole={profile?.role} userName={profile?.fullName || profile?.username}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{customer.fullName || customer.name}</h2>
            <p className="text-muted-foreground">Customer Details</p>
          </div>
          <Link href={`/dashboard/customers/${id}/edit`}>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Edit className="mr-2 h-4 w-4" />
              Edit Customer
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{customer.phone || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{customer.email || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{customer.address || "-"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">
                    {customer.dob ? new Date(customer.dob).toLocaleDateString() : (customer.date_of_birth ? new Date(customer.date_of_birth).toLocaleDateString() : "-")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="font-medium capitalize">{customer.gender || "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Medical Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Allergies</p>
                <p className="font-medium text-rose-600">{customer.allergies || "None recorded"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Chronic Condition</p>
                <p className="font-medium text-amber-700">{customer.chronicCondition || customer.medical_history || "None recorded"}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Prescriptions</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredPrescriptions.length > 0 ? (
              <div className="space-y-2">
                {filteredPrescriptions.map((prescription: any) => (
                  <div key={prescription._id || prescription.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{prescription.prescriptionNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        Dr. {prescription.doctorName} - {new Date(prescription.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={prescription.status === "fulfilled" ? "outline" : "default"}>
                      {prescription.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">No prescriptions found</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Purchase History</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredSales.length > 0 ? (
              <div className="space-y-2">
                {filteredSales.map((sale: any) => (
                  <div key={sale._id || sale.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{sale.invoiceNumber || `Invoice #${sale._id?.slice(-6)}`}</p>
                      <p className="text-sm text-muted-foreground">{new Date(sale.createdAt).toLocaleDateString()}</p>
                    </div>
                    <p className="font-bold">Le {sale.totalAmount?.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">No purchase history</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

import { Badge } from "@/components/ui/badge"
