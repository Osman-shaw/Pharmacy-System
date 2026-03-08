import React from "react"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { PrescriptionForm } from "@/components/prescription-form"
import { getPrescriptionById } from "@/lib/prescriptionsApi"

interface EditPrescriptionPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function EditPrescriptionPage(props: EditPrescriptionPageProps) {
    const params = await props.params
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value || ""

    try {
        const response = await getPrescriptionById(token, params.id)

        return (
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Edit Prescription</h2>
                </div>
                <div className="py-4">
                    <PrescriptionForm initialData={response.data} token={token} />
                </div>
            </div>
        )
    } catch (error) {
        notFound()
    }
}
