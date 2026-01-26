"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Search, Trash2, CheckCircle, Package } from "lucide-react"
import Link from "next/link"
import { deletePurchase, receivePurchase } from "@/lib/purchasesApi"
import { useRouter } from "next/navigation"

interface PurchaseItem {
    name: string
    quantity: number
    unitPrice: number
    batchNumber: string
    boxPattern?: string
    subtotal: number
}

interface Purchase {
    _id: string
    purchaseId: string
    supplierName: string
    date: string
    items: PurchaseItem[]
    subtotal: number
    discount: number
    tax: number
    totalAmount: number
    paymentMethod: string
    status: 'pending' | 'received' | 'cancelled'
}

interface PurchasesTableProps {
    purchases: Purchase[]
}

export function PurchasesTable({ purchases: initialPurchases }: PurchasesTableProps) {
    const [search, setSearch] = useState("")
    const [purchases, setPurchases] = useState(initialPurchases)
    const [loading, setLoading] = useState<string | null>(null)
    const router = useRouter()

    const filteredPurchases = purchases.filter(
        (p) =>
            p.purchaseId.toLowerCase().includes(search.toLowerCase()) ||
            p.supplierName.toLowerCase().includes(search.toLowerCase()) ||
            p.items.some(item => item.name.toLowerCase().includes(search.toLowerCase()))
    )

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this purchase?")) return
        try {
            await deletePurchase(id)
            setPurchases(purchases.filter(p => p._id !== id))
        } catch (error: any) {
            alert("Error deleting purchase: " + error.message)
        }
    }

    const handleReceive = async (id: string) => {
        if (!confirm("Update inventory and mark this purchase as received?")) return
        setLoading(id)
        try {
            await receivePurchase(id)
            setPurchases(purchases.map(p => p._id === id ? { ...p, status: 'received' } : p))
            router.refresh()
        } catch (error: any) {
            alert("Error receiving purchase: " + error.message)
        } finally {
            setLoading(null)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by ID, supplier, or item..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>

            <div className="rounded-lg border bg-white overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50">
                            <TableHead className="font-bold">Purchase ID</TableHead>
                            <TableHead className="font-bold">Supplier</TableHead>
                            <TableHead className="font-bold">Date</TableHead>
                            <TableHead className="font-bold">Items</TableHead>
                            <TableHead className="font-bold">Total Amount</TableHead>
                            <TableHead className="font-bold">Method</TableHead>
                            <TableHead className="font-bold">Status</TableHead>
                            <TableHead className="text-right font-bold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPurchases.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                    No purchases found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredPurchases.map((purchase) => (
                                <TableRow key={purchase._id} className="hover:bg-gray-50/50 transition-colors">
                                    <TableCell className="font-medium">{purchase.purchaseId}</TableCell>
                                    <TableCell>{purchase.supplierName}</TableCell>
                                    <TableCell>{new Date(purchase.date).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            {purchase.items.slice(0, 2).map((item, idx) => (
                                                <span key={idx} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md inline-block whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                                                    {item.name} ({item.quantity})
                                                </span>
                                            ))}
                                            {purchase.items.length > 2 && (
                                                <span className="text-[10px] text-muted-foreground pl-1">+{purchase.items.length - 2} more</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-bold text-emerald-700">Le {purchase.totalAmount.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize">{purchase.paymentMethod}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            className={
                                                purchase.status === 'received'
                                                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                                                    : purchase.status === 'cancelled'
                                                        ? 'bg-rose-100 text-rose-700 hover:bg-rose-100'
                                                        : 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                                            }
                                        >
                                            {purchase.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Link href={`/dashboard/purchases/${purchase._id}`}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-blue-600">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            {purchase.status === 'pending' && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                                        onClick={() => handleReceive(purchase._id)}
                                                        disabled={loading === purchase._id}
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                                        onClick={() => handleDelete(purchase._id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
