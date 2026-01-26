import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { CustomerForm } from "@/components/customer-form"
import { cookies } from "next/headers"
import { getProfile, getCustomerById } from "@/lib/customersApi"

export default async function EditCustomerPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  if (!token) {
    redirect("/auth/login")
  }

  let profile
  let customer
  try {
    const profileData = await getProfile(token)
    profile = profileData.user || profileData.data

    const customerData = await getCustomerById(params.id, token)
    customer = customerData.data
  } catch (error) {
    redirect("/dashboard/customers")
  }

  if (!customer) {
    redirect("/dashboard/customers")
  }

  return (
    <DashboardLayout userRole={profile?.role} userName={profile?.fullName || profile?.username}>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit Customer</h2>
          <p className="text-muted-foreground">Update customer information</p>
        </div>

        <CustomerForm customer={customer} />
      </div>
    </DashboardLayout>
  )
}
