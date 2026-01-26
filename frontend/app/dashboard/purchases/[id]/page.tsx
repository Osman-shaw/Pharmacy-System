import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Printer, CheckCircle, Package } from "lucide-react"
import Link from "next/link"
import { cookies } from "next/headers"
import { getProfile } from "@/lib/inventoryApi"
import { getPurchaseById } from "@/lib/purchasesApi"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default async function PurchaseDetailPage(props: { params: Promise<{ id: string }> }) {
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
        console.error("Fetch failed", error)
        redirect("/dashboard/purchases")
    }

    if (!purchase) {
        redirect("/dashboard/purchases")
    }

    return (
        <DashboardLayout userRole={profile?.role} userName={profile?.fullName || profile?.username}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/purchases">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">{purchase.purchaseId}</h2>
                            <p className="text-muted-foreground">Supplier: {purchase.supplierName}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Printer className="mr-2 h-4 w-4" /> Print
                        </Button>
                        {purchase.status === 'pending' && (
                            <Link href={`/dashboard/purchases/${purchase._id}/edit`}>
                                <Button className="bg-blue-600 hover:bg-blue-700">Edit</Button>
                            </Link>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-xs text-muted-foreground">Date</p>
                                    <p className="font-medium">{new Date(purchase.date).toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Payment Method</p>
                                    <p className="font-medium capitalize">{purchase.paymentMethod}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Status</p>
                                    <Badge
                                        className={
                                            purchase.status === 'received'
                                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                                                : 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                                        }
                                    >
                                        {purchase.status}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Financial Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Subtotal</span>
                                    <span>Le {purchase.subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Discount</span>
                                    <span className="text-rose-600">-Le {purchase.discount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Tax</span>
                                    <span>Le {purchase.tax.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t font-bold text-lg text-emerald-700">
                                    <span>Total</span>
                                    <span>Le {purchase.totalAmount.toLocaleString()}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{purchase.notes || "No notes provided"}</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Purchase Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Medicine</TableHead>
                                    <TableHead>Batch No</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Cost Price</TableHead>
                                    <TableHead className="text-right">Subtotal</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {purchase.items.map((item: any, idx: number) => (
                                    <TableRow key={idx}>
                                        <TableCell className="font-medium">{item.name}</TableCell>
                                        <TableCell>{item.batchNumber}</TableCell>
                                        <TableCell>{item.quantity}</TableCell>
                                        <TableCell>Le {item.unitPrice.toLocaleString()}</TableCell>
                                        <TableCell className="text-right font-bold">Le {item.subtotal.toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                    {purchase.status === 'received' && (
                        <CardFooter className="bg-emerald-50 text-emerald-800 py-3 rounded-b-lg flex items-center gap-2 text-sm justify-center">
                            <CheckCircle className="h-4 w-4" /> This purchase has been received and stock has been updated.
                        </CardFooter>
                    )}
                </Card>
            </div>
        </DashboardLayout>
    )
}
