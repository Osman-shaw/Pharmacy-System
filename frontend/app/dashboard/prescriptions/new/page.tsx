import React from "react"
import { cookies } from "next/headers"
import { PrescriptionForm } from "@/components/prescription-form"

export default async function NewPrescriptionPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value || ""

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Create Prescription</h2>
      </div>
      <PrescriptionForm token={token} />
    </div>
  )
}
