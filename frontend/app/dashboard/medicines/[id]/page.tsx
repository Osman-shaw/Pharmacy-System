import React from "react"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import Link from "next/link"
import { cookies } from "next/headers"
import { getProfile, getProductById } from "@/lib/inventoryApi"

export default async function MedicineDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  if (!token) {
    redirect("/auth/login")
  }

  let profile
  let medicine
  try {
    const profileData = await getProfile(token)
    profile = profileData.user || profileData.data

    const medicineData = await getProductById(params.id, token)
    medicine = medicineData.data
  } catch (error) {
    redirect("/dashboard/medicines")
  }

  if (!medicine) {
    redirect("/dashboard/medicines")
  }

  const id = medicine._id || medicine.id
  const isLowStock = medicine.stock <= (medicine.lowStockThreshold || 10)

  return (
    <DashboardLayout userRole={profile?.role} userName={profile?.fullName || profile?.username}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{medicine.name}</h2>
            <p className="text-muted-foreground">{medicine.genericName || "No generic name"}</p>
          </div>
          {profile?.role === "admin" && (
            <Link href={`/dashboard/medicines/${id}/edit`}>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Edit className="mr-2 h-4 w-4" />
                Edit Medicine
              </Button>
            </Link>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Medicine Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="font-medium">{medicine.category}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dosage Form</p>
                <p className="font-medium">{medicine.dosageForm || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Strength</p>
                <p className="font-medium">{medicine.strength || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pack Size</p>
                <p className="font-medium">{medicine.packSize || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Manufacturer</p>
                <p className="font-medium">{medicine.manufacturer || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Batch Number</p>
                <p className="font-medium">{medicine.batchNumber || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Manufacturing Date</p>
                <p className="font-medium">{medicine.manufacturingDate ? new Date(medicine.manufacturingDate).toLocaleDateString() : "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expiry Date</p>
                <p className="font-medium">{medicine.expiryDate ? new Date(medicine.expiryDate).toLocaleDateString() : "-"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stock Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Current Quantity</p>
                <p className="text-2xl font-bold">
                  {medicine.stock} {medicine.unit}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reorder Level (Threshold)</p>
                <p className="font-medium">
                  {medicine.lowStockThreshold || 10} {medicine.unit}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Selling Price</p>
                  <p className="font-bold text-lg">Le {medicine.price?.toLocaleString() || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cost Price</p>
                  <p className="font-medium">Le {medicine.costPrice?.toLocaleString() || 0}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                {medicine.stock === 0 ? (
                  <Badge variant="destructive">Out of Stock</Badge>
                ) : isLowStock ? (
                  <Badge variant="destructive">Low Stock</Badge>
                ) : (
                  <Badge variant="outline" className="border-green-500 text-green-600">
                    In Stock
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {(medicine.description) && (
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{medicine.description || "No description provided."}</p>
            </CardContent>
          </Card>
        )}

      </div>
    </DashboardLayout>
  )
}
