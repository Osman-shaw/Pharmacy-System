"use client"

import React from "react"
import { helpCategories, getArticlesByCategory, type HelpArticle } from "@/lib/helpData"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Truck,
    Users,
    DollarSign,
    UserCheck,
    Settings
} from "lucide-react"

const iconMap: Record<string, any> = {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Truck,
    Users,
    DollarSign,
    UserCheck,
    Settings,
}

const categoryColors: Record<string, string> = {
    dashboard: "text-blue-600",
    inventory: "text-green-600",
    sales: "text-purple-600",
    purchases: "text-orange-600",
    hr: "text-pink-600",
    finance: "text-emerald-600",
    customers: "text-cyan-600",
    settings: "text-gray-600",
}

interface HelpSidebarProps {
    selectedArticle: HelpArticle | null
    onSelectArticle: (article: HelpArticle) => void
}

export function HelpSidebar({ selectedArticle, onSelectArticle }: HelpSidebarProps) {
    return (
        <div className="w-64 border-r bg-muted/20">
            <ScrollArea className="h-[calc(100vh-12rem)]">
                <div className="space-y-4 p-4">
                    {helpCategories.map((category) => {
                        const Icon = iconMap[category.icon]
                        const articles = getArticlesByCategory(category.id)
                        const colorClass = categoryColors[category.id] || "text-gray-600"

                        return (
                            <div key={category.id}>
                                <div className={`mb-2 flex items-center gap-2 px-2 text-sm font-semibold ${colorClass}`}>
                                    <Icon className="h-4 w-4" />
                                    <span>{category.name}</span>
                                    <Badge variant="outline" className="ml-auto text-xs">
                                        {articles.length}
                                    </Badge>
                                </div>
                                <div className="space-y-1">
                                    {articles.map((article) => (
                                        <Button
                                            key={article.id}
                                            variant={selectedArticle?.id === article.id ? "secondary" : "ghost"}
                                            className="w-full justify-start text-sm font-normal"
                                            onClick={() => onSelectArticle(article)}
                                        >
                                            {article.title}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </ScrollArea>
        </div>
    )
}
