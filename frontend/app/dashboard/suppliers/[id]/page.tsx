import React from "react"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, BarChart3, Truck, Calendar } from "lucide-react"
import Link from "next/link"
import { cookies } from "next/headers"
import { getProfile } from "@/lib/inventoryApi"
import { getSupplierById, getSupplierStats } from "@/lib/suppliersApi"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default async function SupplierDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
        redirect("/auth/login")
    }

    let profile
    let supplier
    let stats

    try {
        const profileData = await getProfile(token)
        profile = profileData.user || profileData.data

        const [supplierData, statsData] = await Promise.all([
            getSupplierById(params.id, token),
            getSupplierStats(params.id, token)
        ])
        supplier = supplierData.data
        stats = statsData.data
    } catch (error) {
        console.error("Fetch failed", error)
        redirect("/dashboard/suppliers")
    }

    if (!supplier) {
        redirect("/dashboard/suppliers")
    }

    return (
        <DashboardLayout userRole={profile?.role} userName={profile?.fullName || profile?.username}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/suppliers">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">{supplier.legalName}</h2>
                            <p className="text-muted-foreground">Supplier ID: {supplier._id.slice(-6).toUpperCase()}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/dashboard/suppliers/${supplier._id}/edit`}>
                            <Button variant="outline">
                                <Edit className="mr-2 h-4 w-4" /> Edit
                            </Button>
                        </Link>
                        <Button className="bg-blue-600 hover:bg-blue-700">New Purchase</Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Contact & Identity</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-2">
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground uppercase font-semibold">Address</p>
                                <p className="text-sm font-medium">{supplier.address}, {supplier.country}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground uppercase font-semibold">Phone / Email</p>
                                <p className="text-sm font-medium">{supplier.contact}</p>
                                <p className="text-sm text-blue-600">{supplier.email || "No email provided"}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground uppercase font-semibold">TIN / REG</p>
                                <p className="text-sm font-medium">TIN: {supplier.tin || "N/A"}</p>
                                <p className="text-xs font-medium text-gray-500">{supplier.pharmacyBoardReg || "No Reg No"}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-blue-50/50 border-blue-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-blue-700">Supply Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-2">
                            <div className="flex justify-between items-center bg-white p-3 rounded-lg border">
                                <div className="flex items-center gap-2">
                                    <BarChart3 className="h-4 w-4 text-blue-600" />
                                    <span className="text-xs">Total Supplied</span>
                                </div>
                                <span className="font-bold text-lg text-emerald-700">Le {stats.totalAmount.toLocaleString()}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-white p-3 rounded-lg border text-center">
                                    <p className="text-[10px] text-muted-foreground uppercase">Orders</p>
                                    <p className="text-xl font-bold text-gray-900">{stats.purchaseCount}</p>
                                </div>
                                <div className="bg-white p-3 rounded-lg border text-center">
                                    <p className="text-[10px] text-muted-foreground uppercase">Items</p>
                                    <p className="text-xl font-bold text-gray-900">{stats.totalItems}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Account Status</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Status</span>
                                    <Badge className={supplier.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100'}>
                                        {supplier.status}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1 cursor-help" title="Registration date">
                                        <Calendar className="h-3 w-3" /> Joined
                                    </span>
                                    <span>{new Date(supplier.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Truck className="h-5 w-5 text-gray-500" />
                            Purchase History
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50/50">
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Items</TableHead>
                                    <TableHead>Total Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stats.history.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground italic">
                                            No purchases recorded and linked yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    stats.history.map((purchase: any) => (
                                        <TableRow key={purchase._id}>
                                            <TableCell className="font-medium text-blue-600">{purchase.purchaseId}</TableCell>
                                            <TableCell>{new Date(purchase.date).toLocaleDateString()}</TableCell>
                                            <TableCell>{purchase.items.length} Medicines</TableCell>
                                            <TableCell className="font-bold">Le {purchase.totalAmount.toLocaleString()}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">{purchase.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link href={`/dashboard/purchases/${purchase._id}`}>
                                                    <Button variant="ghost" size="sm">View Order</Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
