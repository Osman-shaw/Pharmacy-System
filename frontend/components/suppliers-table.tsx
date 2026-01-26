"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Edit, Trash2, Search, Phone, Mail, MapPin } from "lucide-react"
import Link from "next/link"
import { deleteSupplier } from "@/lib/suppliersApi"
import { useRouter } from "next/navigation"

interface Supplier {
    _id: string
    id?: string
    legalName: string
    contact: string
    email?: string
    address: string
    country: string
    tin?: string
    status: 'active' | 'inactive'
}

interface SuppliersTableProps {
    suppliers: Supplier[]
    userRole: string
    token: string
}

export function SuppliersTable({ suppliers: initialSuppliers, userRole, token }: SuppliersTableProps) {
    const [search, setSearch] = useState("")
    const [suppliers, setSuppliers] = useState(initialSuppliers)
    const router = useRouter()

    const filteredSuppliers = suppliers.filter(
        (s) =>
            s.legalName.toLowerCase().includes(search.toLowerCase()) ||
            s.contact.toLowerCase().includes(search.toLowerCase()) ||
            s.tin?.toLowerCase().includes(search.toLowerCase())
    )

    const handleDelete = async (id: string, name: string) => {
        if (!id || id === 'undefined') {
            console.error("Cannot delete: Supplier ID is invalid")
            return
        }
        if (!confirm(`Are you sure you want to delete supplier "${name}"?`)) return
        try {
            await deleteSupplier(id, token)
            setSuppliers(suppliers.filter(s => s._id !== id))
            router.refresh()
        } catch (error: any) {
            alert("Error deleting supplier: " + error.message)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, contact, or TIN..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>

            <div className="rounded-lg border bg-white overflow-hidden shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50">
                            <TableHead className="font-bold">Legal Name</TableHead>
                            <TableHead className="font-bold">Contact Info</TableHead>
                            <TableHead className="font-bold">Address</TableHead>
                            <TableHead className="font-bold">TIN</TableHead>
                            <TableHead className="font-bold">Status</TableHead>
                            <TableHead className="text-right font-bold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredSuppliers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                    No suppliers found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredSuppliers.map((supplier) => (
                                <TableRow key={supplier._id || supplier.id} className="hover:bg-gray-50/50 transition-colors">
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900">{supplier.legalName}</span>
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <MapPin className="h-3 w-3" /> {supplier.country}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Phone className="h-3 w-3 text-blue-500" />
                                                <span>{supplier.contact}</span>
                                            </div>
                                            {supplier.email && (
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Mail className="h-3 w-3" />
                                                    <span>{supplier.email}</span>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-[200px] text-sm text-gray-600 truncate">
                                        {supplier.address}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs uppercase bg-gray-50 px-2 py-1 rounded inline-block">
                                        {supplier.tin || "N/A"}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={supplier.status === 'active' ? 'secondary' : 'outline'}
                                            className={supplier.status === 'active' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : ''}
                                        >
                                            {supplier.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Link href={`/dashboard/suppliers/${supplier._id || supplier.id}`}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-blue-600">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Link href={`/dashboard/suppliers/${supplier._id || supplier.id}/edit`}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-amber-600">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            {userRole === 'admin' && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                                    onClick={() => {
                                                        const validId = supplier._id || supplier.id;
                                                        if (validId) handleDelete(validId, supplier.legalName);
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
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
