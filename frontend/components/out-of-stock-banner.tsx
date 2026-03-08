"use client"

import React from "react"
import { useEffect, useState } from "react"
import { AlertTriangle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getLowStockMedicines } from "@/lib/dashboardApi"

export function OutOfStockBanner() {
  const [outOfStockCount, setOutOfStockCount] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const checkStock = async () => {
      try {
        const data = await getLowStockMedicines()
        const list = Array.isArray(data) ? data : (data as any)?.data
        if (Array.isArray(list)) {
          const outOfStock = list.filter((med: any) => (med.stock ?? med.total_quantity ?? med.quantity) === 0)
          setOutOfStockCount(outOfStock.length)
        }
      } catch (error) {
        console.error("Error checking stock:", error)
      }
    }

    checkStock()
    const interval = setInterval(checkStock, 5 * 60 * 1000) // Check every 5 minutes

    return () => clearInterval(interval)
  }, [])

  if (!isVisible || outOfStockCount === 0) return null

  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-800">Critical Stock Alert</h3>
            <p className="text-sm text-red-700 mt-1">
              {outOfStockCount} {outOfStockCount === 1 ? "medicine is" : "medicines are"} completely out of stock and
              need immediate restocking.
            </p>
            <Link href="/dashboard/inventory">
              <Button
                size="sm"
                variant="outline"
                className="mt-2 border-red-300 text-red-700 hover:bg-red-100 bg-transparent"
              >
                View Inventory
              </Button>
            </Link>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsVisible(false)}
          className="text-red-500 hover:text-red-700 hover:bg-red-100"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
