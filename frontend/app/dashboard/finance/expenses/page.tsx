import React from "react"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Plus, Download, WalletCards, TrendingUp, TrendingDown } from "lucide-react"
import Link from "next/link"
import { cookies } from "next/headers"
import { getProfile } from "@/lib/dashboardApi"
import { getExpenses, getFinancialReport } from "@/lib/financeApi"
import { ExpensesTable } from "@/components/expenses-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

export default async function ExpensesPage() {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
        redirect("/auth/login")
    }

    let profile = null
    let expenses = []
    let report = null

    try {
        const [profileData, expensesData, reportData] = await Promise.all([
            getProfile(token),
            getExpenses(token),
            getFinancialReport(token)
        ])

        profile = profileData
        expenses = expensesData.data || []
        report = reportData.data
    } catch (error) {
        console.error("Failed to fetch expenses data:", error)
    }

    const user = profile

    return (
        <DashboardLayout userRole={user?.role} userName={user?.fullName || user?.username || user?.full_name}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-rose-100 rounded-lg">
                            <WalletCards className="h-6 w-6 text-rose-600" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Finance & Expenses</h2>
                            <p className="text-muted-foreground">Monitor expenditures and financial health</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="bg-white">
                            <Download className="mr-2 h-4 w-4" /> Reports
                        </Button>
                        <Link href="/dashboard/finance/expenses/new">
                            <Button className="bg-rose-600 hover:bg-rose-700">
                                <Plus className="mr-2 h-4 w-4" /> Record Expense
                            </Button>
                        </Link>
                    </div>
                </div>

                {report && (
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card className="border-emerald-100 bg-emerald-50/30">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-emerald-700">Total Revenue</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="text-2xl font-bold">{formatCurrency(report.revenue)}</div>
                                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-rose-100 bg-rose-50/30">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-rose-700">Total Expenses</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="text-2xl font-bold">{formatCurrency(report.expenses)}</div>
                                    <TrendingDown className="h-5 w-5 text-rose-500" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-blue-100 bg-blue-50/30">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-blue-700">Estimated Profit</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(report.profit)}</div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <ExpensesTable expenses={expenses} userRole={profile?.role} />
            </div>
        </DashboardLayout>
    )
}
