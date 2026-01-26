"use client"

import { useState } from "react"
import { HelpSidebar } from "@/components/help/help-sidebar"
import { HelpContent } from "@/components/help/help-content"
import { HelpSearch } from "@/components/help/help-search"
import { Card } from "@/components/ui/card"
import { BookOpen } from "lucide-react"
import type { HelpArticle } from "@/lib/helpData"

export default function HelpPage() {
    const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null)

    return (
        <div className="space-y-6 p-6">
            <div>
                <div className="flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                    <h1 className="text-3xl font-bold">Help & Documentation</h1>
                </div>
                <p className="mt-2 text-muted-foreground">
                    Learn how to use ShawCare Pharmacy Management System effectively
                </p>
            </div>

            <div className="max-w-2xl">
                <HelpSearch onSelectArticle={setSelectedArticle} />
            </div>

            <Card className="overflow-hidden">
                <div className="flex">
                    <HelpSidebar
                        selectedArticle={selectedArticle}
                        onSelectArticle={setSelectedArticle}
                    />
                    <div className="flex-1">
                        <HelpContent article={selectedArticle} />
                    </div>
                </div>
            </Card>
        </div>
    )
}
