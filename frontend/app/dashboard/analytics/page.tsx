import React from "react"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { getProfile } from "@/lib/dashboardApi"
import {
    getHeatmap, getVelocity, getTopSellers, getMargins,
    getStockVelocity, getBasketAnalysis, getPerformance, getCustomerBehavior
} from "@/lib/analyticsApi"
import { AnalyticsView } from "@/components/analytics-view"

export default async function AnalyticsPage() {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
        redirect("/auth/login")
    }

    let profile
    try {
        const profileData = await getProfile(token)
        profile = profileData.user || profileData.data
    } catch {
        redirect("/auth/login")
    }

    // Parallel fetch all analytics data
    const [
        heatmap, velocity, topSellers, margins,
        stocks, basket, performance, customers
    ] = await Promise.all([
        getHeatmap(token).catch(() => []),
        getVelocity(token).catch(() => []),
        getTopSellers(token, 30).catch(() => []),
        getMargins(token).catch(() => []),
        getStockVelocity(token).catch(() => []),
        getBasketAnalysis(token).catch(() => []),
        getPerformance(token).catch(() => []),
        getCustomerBehavior(token).catch(() => [])
    ])

    return (
        <AnalyticsView
            heatmap={heatmap}
            velocity={velocity}
            topSellers={topSellers}
            margins={margins}
            stocks={stocks}
            basket={basket}
            performance={performance}
            customers={customers}
            userRole={profile?.role}
            userName={profile?.fullName || profile?.username}
        />
    )
}
