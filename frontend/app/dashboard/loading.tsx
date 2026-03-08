"use client"
import React from "react"
import { Spinner } from "@/components/ui/spinner"

export default function Loading() {
    return (
        <div className="flex h-[50vh] w-full items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Spinner className="h-8 w-8 text-emerald-600" />
                <p>Loading...</p>
            </div>
        </div>
    )
}
