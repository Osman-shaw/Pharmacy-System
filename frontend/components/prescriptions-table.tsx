"use client"

import React from "react"
import { useState } from "react"
import Link from "next/link"
import { Eye, Pencil, Trash2, FileText, CheckCircle, Clock, XCircle, AlertCircle, Plus } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { deletePrescription, type Prescription } from "@/lib/prescriptionsApi"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"

interface PrescriptionsTableProps {
  prescriptions: Prescription[]
  userRole?: string
  token: string
}

export function PrescriptionsTable({ prescriptions: initialData, userRole, token }: PrescriptionsTableProps) {
  // ... existing code ...

  // ... inside return ...

  const [prescriptions, setPrescriptions] = useState<Prescription[]>(initialData)
  const router = useRouter()

  const handleDelete = async (id: string) => {
    try {
      await deletePrescription(token, id)
      setPrescriptions(prescriptions.filter((p) => p._id !== id))
      toast.success("Prescription deleted successfully")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to delete prescription")
    }
  }

  // Better implementation: Pass token from page.tsx. 
  // I will write this file assuming `token` will be passed, 
  // and then I will update `page.tsx` to pass it.

  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Doctor</TableHead>
            <TableHead>Medications</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prescriptions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No prescriptions found.
              </TableCell>
            </TableRow>
          ) : (
            prescriptions.map((prescription) => (
              <TableRow key={prescription._id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {format(new Date(prescription.writtenDate), "MMM d, yyyy")}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(prescription.createdAt), "h:mm a")}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{prescription.patientName}</div>
                  <div className="text-xs text-muted-foreground">
                    {prescription.patient?.phone || 'No phone'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{prescription.doctor?.name}</div>
                  <div className="text-xs text-muted-foreground">{prescription.doctor?.license}</div>
                </TableCell>
                <TableCell>
                  <div className="max-w-[200px] truncate text-sm">
                    {prescription.medications?.map(m => m.medicineName).join(", ")}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {prescription.medications?.length} items
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={
                    prescription.status === 'Filled' ? 'default' :
                      prescription.status === 'Cancelled' ? 'destructive' :
                        'secondary'
                  }>
                    {prescription.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/dashboard/prescriptions/${prescription._id}/edit`}>
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    {userRole === 'admin' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the prescription record.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => handleDelete(prescription._id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
