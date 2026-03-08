"use client"

import React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { searchHelp, type HelpArticle } from "@/lib/helpData"

interface HelpSearchProps {
    onSelectArticle: (article: HelpArticle) => void
}

export function HelpSearch({ onSelectArticle }: HelpSearchProps) {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<HelpArticle[]>([])
    const [showResults, setShowResults] = useState(false)

    const handleSearch = (value: string) => {
        setQuery(value)
        if (value.trim().length > 2) {
            const searchResults = searchHelp(value)
            setResults(searchResults)
            setShowResults(true)
        } else {
            setResults([])
            setShowResults(false)
        }
    }

    const handleSelect = (article: HelpArticle) => {
        onSelectArticle(article)
        setQuery("")
        setShowResults(false)
    }

    return (
        <div className="relative">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search help articles..."
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => query.length > 2 && setShowResults(true)}
                    onBlur={() => setTimeout(() => setShowResults(false), 200)}
                    className="pl-9"
                />
            </div>

            {showResults && results.length > 0 && (
                <div className="absolute z-50 mt-2 w-full rounded-md border bg-popover p-2 shadow-md">
                    <div className="max-h-[300px] overflow-y-auto">
                        {results.map((article) => (
                            <button
                                key={article.id}
                                onClick={() => handleSelect(article)}
                                className="w-full rounded-sm px-3 py-2 text-left text-sm hover:bg-accent"
                            >
                                <div className="font-medium">{article.title}</div>
                                <div className="text-xs text-muted-foreground">
                                    {article.category}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {showResults && results.length === 0 && query.length > 2 && (
                <div className="absolute z-50 mt-2 w-full rounded-md border bg-popover p-4 text-center text-sm text-muted-foreground shadow-md">
                    No results found for "{query}"
                </div>
            )}
        </div>
    )
}
