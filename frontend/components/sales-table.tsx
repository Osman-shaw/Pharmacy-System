"use client"

import React from "react"
import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Search } from "lucide-react"
import Link from "next/link"

interface Sale {
  _id: string
  id?: string
  date: string
  totalAmount: number
  paymentMethod: string
  customerName?: string
  transactionId?: string
  cashier?: { fullName?: string }
  // Legacy fallbacks
  invoice_number?: string
  total_amount?: number
  created_at?: string
  customers?: { name?: string }
  profiles?: { full_name?: string }
}

interface SalesTableProps {
  sales: Sale[]
}

export function SalesTable({ sales }: SalesTableProps) {
  const [search, setSearch] = useState("")

  const filteredSales = sales.filter(
    (sale) =>
      (sale.transactionId ?? sale.invoice_number ?? sale._id ?? "").toString().toLowerCase().includes(search.toLowerCase()) ||
      (sale.customerName ?? sale.customers?.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (sale.paymentMethod ?? sale.payment_method ?? "").toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sales..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Cashier</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No sales found
                </TableCell>
              </TableRow>
            ) : (
              filteredSales.map((sale) => (
                <TableRow key={sale._id ?? sale.id}>
                  <TableCell className="font-medium">{sale.transactionId ?? sale.invoice_number ?? sale._id?.slice(-8) ?? "—"}</TableCell>
                  <TableCell>{sale.customerName ?? sale.customers?.name ?? "Walk-in Customer"}</TableCell>
                  <TableCell className="font-bold">Le {(sale.totalAmount ?? sale.total_amount ?? 0).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{sale.paymentMethod ?? sale.payment_method ?? "—"}</Badge>
                  </TableCell>
                  <TableCell>{sale.cashier?.fullName ?? sale.profiles?.full_name ?? "—"}</TableCell>
                  <TableCell>{new Date(sale.date ?? sale.created_at ?? "").toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dashboard/sales/${sale._id ?? sale.id}`}>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
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
