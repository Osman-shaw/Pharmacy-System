"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    TrendingUp, TrendingDown,
    Lock, Unlock,
    BarChart3, PieChart as PieChartIcon,
    Calendar, AlertTriangle, CheckCircle2,
    FileDown, ArrowLeftRight
} from "lucide-react"
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend, Cell, PieChart, Pie
} from "recharts"
import { getPnLReport, lockPnLPeriod, getPnLTrends } from "@/lib/plApi"
import { formatCurrency } from "@/lib/utils"

interface PnLDashboardProps {
    initialReport: any
    initialTrends: any[]
    token: string
}

export function PnLDashboard({ initialReport, initialTrends, token }: PnLDashboardProps) {
    const [report, setReport] = useState(initialReport)
    const [trends, setTrends] = useState(initialTrends)
    const [loading, setLoading] = useState(false)

    const now = new Date()
    const [month, setMonth] = useState((now.getMonth() + 1).toString())
    const [year, setYear] = useState(now.getFullYear().toString())

    const fetchReport = async () => {
        setLoading(true)
        try {
            const res = await getPnLReport(parseInt(month), parseInt(year), token)
            setReport(res.data)
        } catch (error) {
            console.error("Failed to fetch P&L", error)
        } finally {
            setLoading(false)
        }
    }

    const handleLock = async () => {
        if (!confirm("Are you sure you want to 'Hard Close' this period? This will lock the financial data for audit and tax preparation.")) return
        try {
            const res = await lockPnLPeriod(report.period, report, token)
            setReport(res.data)
            // refresh trends
            const trendsRes = await getPnLTrends(token)
            setTrends(trendsRes.data)
        } catch (error) {
            alert("Failed to lock period")
        }
    }

    const revenueData = [
        { name: 'Rx (Prescription)', value: report.revenue?.rx || 0 },
        { name: 'OTC (Retail)', value: report.revenue?.otc || 0 },
        { name: 'Services', value: report.revenue?.service || 0 },
    ]

    const COLORS = ['#2563eb', '#7c3aed', '#10b981']

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <Select value={month} onValueChange={setMonth}>
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Month" />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.from({ length: 12 }, (_, i) => (
                                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                                        {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Select value={year} onValueChange={setYear}>
                        <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                            {[2023, 2024, 2025, 2026].map(y => (
                                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={fetchReport} disabled={loading} variant="secondary">
                        {loading ? "Loading..." : "Generate Report"}
                    </Button>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-9">
                        <FileDown className="mr-2 h-4 w-4" /> Export P&L
                    </Button>
                    {!report.isLocked ? (
                        <Button onClick={handleLock} size="sm" className="h-9 bg-rose-600 hover:bg-rose-700">
                            <Lock className="mr-2 h-4 w-4" /> Hard Close Period
                        </Button>
                    ) : (
                        <Badge className="h-9 px-3 bg-emerald-100 text-emerald-700 border-emerald-200">
                            <CheckCircle2 className="mr-2 h-4 w-4" /> Period Locked
                        </Badge>
                    )}
                </div>
            </div>

            {/* Top Level Metrics */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="border-blue-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(report.revenue?.total || 0)}</div>
                        <div className="flex items-center gap-1 text-[10px] text-emerald-600 mt-1">
                            <TrendingUp className="h-3 w-3" />
                            <span>12% from prev month</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-rose-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">COGS</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(report.cogs?.total || 0)}</div>
                        <div className="text-[10px] text-muted-foreground mt-1">
                            {((report.cogs?.total / report.revenue?.total) * 100 || 0).toFixed(1)}% of revenue
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-purple-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">OpEx</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(report.opex?.total || 0)}</div>
                        <div className="text-[10px] text-muted-foreground mt-1">
                            {report.opex?.hr ? formatCurrency(report.opex.hr) : '0'} HR Costs
                        </div>
                    </CardContent>
                </Card>
                <Card className={report.netIncome >= 0 ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100"}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-semibold uppercase text-gray-600">Net Income</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${report.netIncome >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                            {formatCurrency(report.netIncome || 0)}
                        </div>
                        <div className="text-[10px] font-semibold mt-1">
                            Overall Margin: {report.margins?.overall?.toFixed(1) || 0}%
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Trend Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-blue-600" />
                            Performance Trends
                        </CardTitle>
                        <CardDescription>Monthly Net Income (Past 24 months)</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trends.slice().reverse()}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="period" fontSize={10} />
                                <YAxis fontSize={10} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                    formatter={(val: number) => [formatCurrency(val), 'Net Profit']}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="netIncome"
                                    stroke="#2563eb"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#2563eb' }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Revenue Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <PieChartIcon className="h-5 w-5 text-purple-600" />
                            Revenue Channels
                        </CardTitle>
                        <CardDescription>Profit sharing by department</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center">
                        <div className="w-full h-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={revenueData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {revenueData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(val: number) => formatCurrency(val)} />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed P&L Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Sierra Leone Pharmacy P&L Statement</CardTitle>
                    <CardDescription>Statement for period {report.period}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50/50">
                                    <TableHead className="w-[300px]">Account / Item</TableHead>
                                    <TableHead className="text-right">Amount (Le)</TableHead>
                                    <TableHead className="text-right">Notes</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow className="font-bold bg-gray-50/30">
                                    <TableCell>REVENUE & INFLOW</TableCell>
                                    <TableCell className="text-right">{formatCurrency(report.revenue?.total || 0)}</TableCell>
                                    <TableCell className="text-right text-xs text-muted-foreground italic">Total Sales & Services</TableCell>
                                </TableRow>
                                <TableRow className="text-sm">
                                    <TableCell className="pl-6 text-muted-foreground">- Rx Sales (Prescription)</TableCell>
                                    <TableCell className="text-right">{formatCurrency(report.revenue?.rx || 0)}</TableCell>
                                    <TableCell className="text-right">-</TableCell>
                                </TableRow>
                                <TableRow className="text-sm">
                                    <TableCell className="pl-6 text-muted-foreground">- OTC & Front-End (Retail)</TableCell>
                                    <TableCell className="text-right">{formatCurrency(report.revenue?.otc || 0)}</TableCell>
                                    <TableCell className="text-right">-</TableCell>
                                </TableRow>
                                <TableRow className="text-sm border-b-2">
                                    <TableCell className="pl-6 text-muted-foreground">- Clinical Service Revenue</TableCell>
                                    <TableCell className="text-right">{formatCurrency(report.revenue?.service || 0)}</TableCell>
                                    <TableCell className="text-right">Testing/Consults</TableCell>
                                </TableRow>

                                <TableRow className="font-bold bg-rose-50/30">
                                    <TableCell>COST OF GOODS SOLD (COGS)</TableCell>
                                    <TableCell className="text-right text-rose-600">({formatCurrency(report.cogs?.total || 0)})</TableCell>
                                    <TableCell className="text-right text-xs text-muted-foreground italic">Wholesale Costs</TableCell>
                                </TableRow>
                                <TableRow className="text-sm">
                                    <TableCell className="pl-6 text-muted-foreground">- Inventory Purchases</TableCell>
                                    <TableCell className="text-right">{formatCurrency(report.cogs?.purchaseCost || 0)}</TableCell>
                                    <TableCell className="text-right">Wholesale Sync</TableCell>
                                </TableRow>
                                <TableRow className="text-sm border-b-2">
                                    <TableCell className="pl-6 text-emerald-600 font-medium">+ Manufacturer Rebates</TableCell>
                                    <TableCell className="text-right text-emerald-600">+{formatCurrency(report.cogs?.rebates || 0)}</TableCell>
                                    <TableCell className="text-right">Cash-back</TableCell>
                                </TableRow>

                                <TableRow className="font-bold bg-blue-50/50">
                                    <TableCell>GROSS PROFIT</TableCell>
                                    <TableCell className="text-right font-black">{formatCurrency(report.grossProfit || 0)}</TableCell>
                                    <TableCell className="text-right text-xs font-bold text-blue-700">Margin: {report.margins?.overall?.toFixed(1)}%</TableCell>
                                </TableRow>

                                <TableRow className="font-bold mt-4 bg-gray-50/30">
                                    <TableCell>OPERATING EXPENSES (OpEx)</TableCell>
                                    <TableCell className="text-right text-rose-600">({formatCurrency(report.opex?.total || 0)})</TableCell>
                                    <TableCell className="text-right text-xs text-muted-foreground italic">Business Overheads</TableCell>
                                </TableRow>
                                <TableRow className="text-sm">
                                    <TableCell className="pl-6 text-muted-foreground">- Labor Costs (HR/Benefits)</TableCell>
                                    <TableCell className="text-right">{formatCurrency(report.opex?.hr || 0)}</TableCell>
                                    <TableCell className="text-right">Inc. NASSIT</TableCell>
                                </TableRow>
                                <TableRow className="text-sm">
                                    <TableCell className="pl-6 text-muted-foreground">- Energy & Utilities</TableCell>
                                    <TableCell className="text-right">{formatCurrency(report.opex?.energy || 0)}</TableCell>
                                    <TableCell className="text-right">Fuel/EDSA</TableCell>
                                </TableRow>
                                <TableRow className="text-sm">
                                    <TableCell className="pl-6 text-muted-foreground">- Regulatory & Compliance</TableCell>
                                    <TableCell className="text-right">{formatCurrency(report.opex?.regulatory || 0)}</TableCell>
                                    <TableCell className="text-right">Licenses/Board</TableCell>
                                </TableRow>
                                <TableRow className="text-sm border-b-2">
                                    <TableCell className="pl-6 text-muted-foreground">- Facility & Admin</TableCell>
                                    <TableCell className="text-right">{formatCurrency(report.opex?.facility || 0)}</TableCell>
                                    <TableCell className="text-right">Rent/Cloud</TableCell>
                                </TableRow>

                                <TableRow className="font-bold bg-amber-50/30">
                                    <TableCell>THE "PHARMACY GAP" ADJUSTMENTS</TableCell>
                                    <TableCell className="text-right text-rose-600">({formatCurrency(report.adjustments?.total || 0)})</TableCell>
                                    <TableCell className="text-right text-xs text-muted-foreground italic">Inventory logic</TableCell>
                                </TableRow>
                                <TableRow className="text-sm border-b-4">
                                    <TableCell className="pl-6 text-muted-foreground">- DIR Fee Provision / Clawbacks</TableCell>
                                    <TableCell className="text-right">{formatCurrency(report.adjustments?.dirFees || 0)}</TableCell>
                                    <TableCell className="text-right">Est. 5% Rx</TableCell>
                                </TableRow>

                                <TableRow className="bg-slate-900 text-white font-black text-lg">
                                    <TableCell>NET INCOME</TableCell>
                                    <TableCell className="text-right">{formatCurrency(report.netIncome || 0)}</TableCell>
                                    <TableCell className="text-right text-xs font-normal">Final Profitability</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                    {report.isLocked && (
                        <div className="mt-4 p-4 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center gap-3">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                            <div className="text-xs text-emerald-800">
                                This report was locked on <strong>{new Date(report.lockedAt).toLocaleString()}</strong> by <strong>{report.lockedBy?.fullName || "Admin"}</strong>.
                                Data is archived and compliant for tax preparation.
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Risk Alert */}
            {!report.isLocked && report.netIncome < 0 && (
                <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 flex items-start gap-4">
                    <AlertTriangle className="h-6 w-6 text-rose-600 mt-1" />
                    <div>
                        <h4 className="font-bold text-rose-800">Financial Performance Alert</h4>
                        <p className="text-sm text-rose-700">
                            Net Income for this period is negative. This may be due to high OpEx or the DIR fee provisions.
                            Review your <strong>Gross Margin ({report.margins?.overall?.toFixed(1)}%)</strong> and inventory wastage to identify leakages.
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
