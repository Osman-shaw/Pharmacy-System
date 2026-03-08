"use client"

import React from "react"
import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { deleteDesignation } from "@/lib/hrApi"

export function DesignationsTable({ designations }: { designations: any[] }) {
  const [search, setSearch] = useState("")
  const router = useRouter()

  const filtered = designations.filter((des) => des.name?.toLowerCase().includes(search.toLowerCase()))

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this designation?")) return

    try {
      await deleteDesignation(id)
      router.refresh()
    } catch (error: any) {
      alert("Error deleting designation: " + (error.message || "Unknown error"))
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search designations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              {/* Mongo model doesn't explicitly guarantee base_salary unless added, assuming description or other fields */}
              <TableHead>Department</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No designations found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((designation) => (
                <TableRow key={designation._id}>
                  <TableCell className="font-medium">{designation.name}</TableCell>
                  <TableCell>{designation.description || "N/A"}</TableCell>
                  <TableCell>{designation.department || "N/A"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/dashboard/hr/designations/${designation._id}/edit`}>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(designation._id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
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
