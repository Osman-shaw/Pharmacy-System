"use client"

import React, { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    LineChart, Line
} from "recharts"
import { ShoppingBasket, Truck } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Define interfaces to match API
interface HeatmapData { _id: { day: number; hour: number }; count: number; }
interface VelocityData { _id: number; salesCount: number; }
interface TopSellerData { name: string; totalQuantity: number; totalRevenue?: number; totalProfit?: number; }
interface MarginData { name: string; revenue: number; margin: number; }
interface StockData { id: string; name: string; stock: number; lastSale: string | null; status: 'active' | 'slow' | 'dead'; }
interface BasketData { pair: string; count: number; }
interface PerformanceData { _id: string; name: string; revenue: number; transactionCount: number; avgValuePerSale: number; }
interface CustomerData { _id: string; totalSpent: number; transactionCount: number; avgBasketSize: number; }

interface AnalyticsViewProps {
    heatmap: HeatmapData[]
    velocity: VelocityData[]
    topSellers: TopSellerData[]
    margins: MarginData[]
    stocks: StockData[]
    basket: BasketData[]
    performance: PerformanceData[]
    customers: CustomerData[]
    userRole?: string
    userName?: string
}

export function AnalyticsView({
    heatmap, velocity, topSellers, margins, stocks, basket, performance, customers, userRole, userName
}: AnalyticsViewProps) {
    const days = ["None", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    return (
        <DashboardLayout userRole={userRole} userName={userName}>
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Advanced Sales Analytics</h2>
                    <p className="text-muted-foreground">Deep insights into pharmacy performance and customer behavior</p>
                </div>

                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="overview">Market Overview</TabsTrigger>
                        <TabsTrigger value="temporal">Heatmap & Velocity</TabsTrigger>
                        <TabsTrigger value="stocks">Stock Intelligence</TabsTrigger>
                        <TabsTrigger value="behavior">Customer Behavior</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                            <Card className="col-span-4">
                                <CardHeader>
                                    <CardTitle>Top 20 Sellers by Quantity</CardTitle>
                                </CardHeader>
                                <CardContent className="pl-2">
                                    <ResponsiveContainer width="100%" height={350}>
                                        <BarChart data={topSellers.slice(0, 20)}>
                                            <XAxis dataKey="name" fontSize={10} interval={0} angle={-45} textAnchor="end" height={60} />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="totalQuantity" fill="#10b981" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card className="col-span-3">
                                <CardHeader>
                                    <CardTitle>Profit Margin Analysis</CardTitle>
                                    <CardDescription>Top margins by product</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {margins.slice(0, 6).map((item) => (
                                            <div key={item.name} className="flex items-center">
                                                <div className="ml-4 space-y-1 flex-1">
                                                    <p className="text-sm font-medium leading-none">{item.name}</p>
                                                    <p className="text-xs text-muted-foreground">Rev: Le {item.revenue?.toLocaleString()}</p>
                                                </div>
                                                <div className="ml-auto font-medium text-emerald-600">
                                                    {item.margin?.toFixed(1)}%
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Product Performance Scorecard</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="relative w-full overflow-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left py-2">Item</th>
                                                    <th className="text-right py-2">Revenue</th>
                                                    <th className="text-right py-2">Sales</th>
                                                    <th className="text-right py-2">Avg Order</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {performance.slice(0, 10).map((p) => (
                                                    <tr key={p._id} className="border-b last:border-0">
                                                        <td className="py-2 font-medium">{p.name}</td>
                                                        <td className="text-right py-2">Le {p.revenue?.toLocaleString()}</td>
                                                        <td className="text-right py-2">{p.transactionCount}</td>
                                                        <td className="text-right py-2">Le {p.avgValuePerSale?.toFixed(0)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Basket Analysis (Common Pairs)</CardTitle>
                                    <CardDescription>Products frequently bought together</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {basket.slice(0, 8).map((b) => (
                                            <div key={b.pair} className="flex items-center justify-between border-b pb-2 last:border-0">
                                                <div className="flex items-center gap-2">
                                                    <ShoppingBasket className="h-4 w-4 text-emerald-500" />
                                                    <span className="text-sm font-medium">{b.pair}</span>
                                                </div>
                                                <Badge variant="secondary">{b.count} times</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="temporal" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>24-Hour Sales Velocity</CardTitle>
                                    <CardDescription>Transaction volume per hour</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={velocity}>
                                            <XAxis dataKey="_id" label={{ value: 'Hour', position: 'insideBottom', offset: -5 }} />
                                            <YAxis />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="salesCount" stroke="#10b981" strokeWidth={2} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Peak Sales Heatmap</CardTitle>
                                    <CardDescription>Sales distribution across the week</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-8 gap-1 text-[10px]">
                                        <div></div>
                                        {Array.from({ length: 24 }).map((_, i) => (
                                            <div key={i} className="text-center">{i}</div>
                                        ))}
                                        {[1, 2, 3, 4, 5, 6, 7].map(day => (
                                            <React.Fragment key={day}>
                                                <div className="font-bold">{days[day]}</div>
                                                {Array.from({ length: 24 }).map((_, hour) => {
                                                    const score = heatmap.find((h) => h._id.day === day && h._id.hour === hour)?.count || 0;
                                                    const opacity = Math.min(score / 5, 1);
                                                    return (
                                                        <div
                                                            key={hour}
                                                            style={{ backgroundColor: `rgba(16, 185, 129, ${opacity})` }}
                                                            className="h-4 w-full rounded-sm border border-gray-50"
                                                            title={`${days[day]} ${hour}:00 - ${score} sales`}
                                                        />
                                                    )
                                                })}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="stocks" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card className="col-span-2">
                                <CardHeader>
                                    <CardTitle>Slow & Dead Stock Analysis</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="relative w-full overflow-auto h-[400px]">
                                        <table className="w-full text-sm">
                                            <thead className="sticky top-0 bg-white">
                                                <tr className="border-b">
                                                    <th className="text-left py-2">Product</th>
                                                    <th className="text-right py-2">Stock</th>
                                                    <th className="text-right py-2">Last Sale</th>
                                                    <th className="text-right py-2">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {stocks.filter((s) => s.status !== 'active').map((s) => (
                                                    <tr key={s.id} className="border-b">
                                                        <td className="py-2 font-medium">{s.name}</td>
                                                        <td className="text-right py-2">{s.stock}</td>
                                                        <td className="text-right py-2">{s.lastSale ? new Date(s.lastSale).toLocaleDateString() : 'Never'}</td>
                                                        <td className="text-right py-2">
                                                            <Badge variant={s.status === 'dead' ? 'destructive' : 'secondary'}>
                                                                {s.status}
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Sales to Purchase Ratio</CardTitle>
                                    <CardDescription>Spending vs Revenue monthly</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={topSellers.slice(0, 5)}>
                                            <Tooltip />
                                            <Bar dataKey="totalRevenue" fill="#10b981" />
                                            <Bar dataKey="totalProfit" fill="#3b82f6" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="behavior" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Customer Spending Patterns</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                    {customers.slice(0, 8).map((c) => (
                                        <div key={c._id} className="p-4 rounded-lg border bg-card">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700">
                                                    {c._id?.charAt(0) || '?'}
                                                </div>
                                                <span className="font-medium text-sm truncate">{c._id || 'Guest'}</span>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs text-muted-foreground">Total: Le {c.totalSpent?.toLocaleString()}</p>
                                                <p className="text-xs text-muted-foreground">Orders: {c.transactionCount}</p>
                                                <p className="text-xs text-muted-foreground">Avg Items: {c.avgBasketSize?.toFixed(1)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    )
}
