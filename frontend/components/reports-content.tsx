"use client"

import React from "react"
import dynamic from "next/dynamic"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Recharts uses class components that fail during SSR/build — load reports only on client
const AdvancedSalesReport = dynamic(
  () => import("@/components/advanced-sales-report").then((m) => m.AdvancedSalesReport),
  { ssr: false }
)
const PurchaseReport = dynamic(
  () => import("@/components/purchase-report").then((m) => m.PurchaseReport),
  { ssr: false }
)
const InventoryReport = dynamic(
  () => import("@/components/inventory-report").then((m) => m.InventoryReport),
  { ssr: false }
)

interface ReportsContentProps {
  lowStockMedicines: any[]
  expiringMedicines: any[]
}

export function ReportsContent({ lowStockMedicines, expiringMedicines }: ReportsContentProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Reports & Analytics</h2>
        <p className="text-muted-foreground">Comprehensive business insights and analytics</p>
      </div>

      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList>
          <TabsTrigger value="sales">Sales Reports</TabsTrigger>
          <TabsTrigger value="purchase">Purchase Reports</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <AdvancedSalesReport />
        </TabsContent>

        <TabsContent value="purchase" className="space-y-4">
          <PurchaseReport />
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <InventoryReport
            lowStockMedicines={lowStockMedicines}
            expiringMedicines={expiringMedicines}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
