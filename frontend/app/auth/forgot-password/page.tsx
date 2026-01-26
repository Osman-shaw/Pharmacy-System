"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { forgotPassword } from "@/lib/authApi"
import { Loader2, ArrowLeft, MailCheck } from "lucide-react"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isSent, setIsSent] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        try {
            await forgotPassword(email)
            setIsSent(true)
        } catch (err: any) {
            setError(err.message || "Something went wrong. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    if (isSent) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-emerald-50 to-green-50 p-6">
                <Card className="w-full max-w-md border-emerald-100 text-center">
                    <CardHeader>
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                            <MailCheck className="h-6 w-6 text-emerald-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
                        <CardDescription>
                            We've sent a password reset link to <span className="font-medium text-foreground">{email}</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-6 text-sm text-muted-foreground">
                            Didn't receive the email? Check your spam folder or try again.
                        </p>
                        <Button variant="outline" className="w-full" onClick={() => setIsSent(false)}>
                            Try again
                        </Button>
                        <div className="mt-6">
                            <Link href="/auth/login" className="inline-flex items-center text-sm font-medium text-emerald-600 hover:underline">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to login
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-emerald-50 to-green-50 p-6">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-emerald-700">ShawCare</h1>
                    <p className="mt-2 text-muted-foreground">Pharmacy Management System</p>
                </div>
                <Card className="border-emerald-100">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">Forgot password?</CardTitle>
                        <CardDescription>
                            Enter your email address and we'll send you a link to reset your password.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                            {error && (
                                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                                    {error}
                                </div>
                            )}
                            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending link...
                                    </>
                                ) : (
                                    "Send reset link"
                                )}
                            </Button>
                            <div className="text-center">
                                <Link href="/auth/login" className="inline-flex items-center text-sm font-medium text-emerald-600 hover:underline">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to login
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
