"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import type { HelpArticle } from "@/lib/helpData"
import ReactMarkdown from "react-markdown"
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Truck,
    Users,
    DollarSign,
    UserCheck,
    Settings,
    Info,
    CheckCircle2,
    Lightbulb
} from "lucide-react"

const categoryIcons: Record<string, any> = {
    dashboard: LayoutDashboard,
    inventory: Package,
    sales: ShoppingCart,
    purchases: Truck,
    hr: Users,
    finance: DollarSign,
    customers: UserCheck,
    settings: Settings,
}

const categoryColors: Record<string, string> = {
    dashboard: "bg-blue-100 text-blue-700 border-blue-200",
    inventory: "bg-green-100 text-green-700 border-green-200",
    sales: "bg-purple-100 text-purple-700 border-purple-200",
    purchases: "bg-orange-100 text-orange-700 border-orange-200",
    hr: "bg-pink-100 text-pink-700 border-pink-200",
    finance: "bg-emerald-100 text-emerald-700 border-emerald-200",
    customers: "bg-cyan-100 text-cyan-700 border-cyan-200",
    settings: "bg-gray-100 text-gray-700 border-gray-200",
}

interface HelpContentProps {
    article: HelpArticle | null
}

export function HelpContent({ article }: HelpContentProps) {
    if (!article) {
        return (
            <div className="flex h-full items-center justify-center p-8">
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
                        <Info className="h-10 w-10 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-muted-foreground">Welcome to ShawCare Help</h2>
                    <p className="mt-2 text-muted-foreground">
                        Select a topic from the sidebar or use the search bar to find help articles
                    </p>
                </div>
            </div>
        )
    }

    const CategoryIcon = categoryIcons[article.category] || Info
    const categoryColor = categoryColors[article.category] || "bg-gray-100 text-gray-700"

    return (
        <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="p-8">
                <Card>
                    <CardHeader>
                        <div className="flex items-start gap-4">
                            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border-2 ${categoryColor}`}>
                                <CategoryIcon className="h-7 w-7" />
                            </div>
                            <div className="flex-1">
                                <CardTitle className="text-3xl">{article.title}</CardTitle>
                                <p className="mt-1 text-sm text-muted-foreground capitalize">{article.category}</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {article.keywords.slice(0, 5).map((keyword) => (
                                        <Badge key={keyword} variant="outline" className="text-xs">
                                            {keyword}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                            <ReactMarkdown
                                components={{
                                    h1: ({ ...props }) => <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />,
                                    h2: ({ children, ...props }) => (
                                        <h2 className="text-xl font-semibold mt-5 mb-3 text-blue-700 flex items-center gap-2" {...props}>
                                            <CheckCircle2 className="h-5 w-5" />
                                            {children}
                                        </h2>
                                    ),
                                    h3: ({ children, ...props }) => (
                                        <h3 className="text-lg font-semibold mt-4 mb-2 text-emerald-700 flex items-center gap-2" {...props}>
                                            <Lightbulb className="h-4 w-4" />
                                            {children}
                                        </h3>
                                    ),
                                    p: ({ ...props }) => <p className="mb-4 leading-7" {...props} />,
                                    ul: ({ ...props }) => <ul className="my-4 ml-6 list-disc space-y-2" {...props} />,
                                    ol: ({ ...props }) => <ol className="my-4 ml-6 list-decimal space-y-2" {...props} />,
                                    li: ({ ...props }) => <li className="leading-7" {...props} />,
                                    strong: ({ ...props }) => <strong className="font-semibold text-foreground" {...props} />,
                                    code: ({ ...props }) => (
                                        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm" {...props} />
                                    ),
                                    blockquote: ({ ...props }) => (
                                        <blockquote className="border-l-4 border-blue-500 bg-blue-50 p-4 my-4 italic" {...props} />
                                    ),
                                }}
                            >
                                {article.content}
                            </ReactMarkdown>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ScrollArea>
    )
}
