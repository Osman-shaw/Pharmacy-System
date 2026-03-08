"use client"

import React from "react"

import { logout } from "@/lib/logout"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Pill,
  Package,
  ShoppingCart,
  Users,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Receipt,
  Briefcase,
  Clock,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  BookOpen,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { NotificationProvider, NotificationBell } from "@/components/notification-provider"

interface DashboardLayoutProps {
  children: React.ReactNode
  userRole?: string
  userName?: string
  userImage?: string
  user?: {
    id: string
    username: string
    role: string
    fullName: string
  }
}

export function DashboardLayout({ children, userRole, userName, userImage }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["admin", "pharmacist"],
    },
    {
      name: "Medicines",
      href: "/dashboard/medicines",
      icon: Pill,
      roles: ["admin", "pharmacist"],
    },
    {
      name: "Inventory",
      href: "/dashboard/inventory",
      icon: Package,
      roles: ["admin", "pharmacist"],
    },
    {
      name: "Point of Sale",
      href: "/dashboard/pos",
      icon: ShoppingCart,
      roles: ["admin", "pharmacist", "cashier"],
    },
    {
      name: "Customers",
      href: "/dashboard/customers",
      icon: Users,
      roles: ["admin", "pharmacist", "cashier"],
    },
    {
      name: "Prescriptions",
      href: "/dashboard/prescriptions",
      icon: FileText,
      roles: ["admin", "pharmacist"],
    },
    {
      name: "Sales History",
      href: "/dashboard/sales",
      icon: Receipt,
      roles: ["admin", "pharmacist", "cashier"],
    },
    {
      name: "Reports",
      href: "/dashboard/reports",
      icon: BarChart3,
      roles: ["admin"],
    },
    {
      name: "Sales Analytics",
      href: "/dashboard/analytics",
      icon: TrendingUp,
      roles: ["admin"],
    },
    {
      name: "Audit Logs",
      href: "/dashboard/audit",
      icon: FileText,
      roles: ["admin"],
    },
    {
      name: "Human Resources",
      href: "/dashboard/hr",
      icon: Briefcase,
      roles: ["admin"],
    },
    {
      name: "Attendance",
      href: "/dashboard/attendance",
      icon: Clock,
      roles: ["admin"],
    },
    {
      name: "Payroll",
      href: "/dashboard/payroll",
      icon: DollarSign,
      roles: ["admin"],
    },
    {
      name: "Expenses",
      href: "/dashboard/finance/expenses",
      icon: TrendingUp,
      roles: ["admin"],
    },
    {
      name: "Profit & Loss",
      href: "/dashboard/finance/pnl",
      icon: BarChart3,
      roles: ["admin"],
    },
    {
      name: "Supplies",
      href: "/dashboard/supplies",
      icon: ShoppingBag,
      roles: ["admin"],
    },
    {
      name: "Help",
      href: "/dashboard/help",
      icon: BookOpen,
      roles: ["admin", "pharmacist"],
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
      roles: ["admin", "pharmacist"],
    },
  ]

  const handleLogout = async () => {
    await logout()
    window.location.href = "/auth/login" // Hard redirect to ensure state clear
  }

  const filteredNavigation = navigationItems.filter((item) => item.roles.includes(userRole || "pharmacist"))

  return (
    <NotificationProvider>
      <div className="flex h-screen bg-gray-50">
        {/* Mobile sidebar backdrop */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-300 lg:static lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex h-16 items-center justify-between border-b px-6">
              <Link href="/dashboard" className="cursor-pointer">
                <h1 className="text-xl font-bold text-emerald-700">ShawCare</h1>
                <p className="text-xs text-muted-foreground">Pharmacy System</p>
              </Link>
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* User info */}
            <div className="border-b p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 overflow-hidden items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  {userImage ? (
                    <img src={userImage} alt={userName} className="h-full w-full object-cover" />
                  ) : (
                    userName?.charAt(0).toUpperCase() || "U"
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{userName || "User"}</p>
                  <p className="text-xs capitalize text-muted-foreground">{userRole || "pharmacist"}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 overflow-y-auto p-4">
              {filteredNavigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${isActive ? "bg-emerald-50 text-emerald-700 font-medium" : "text-gray-700 hover:bg-gray-50"
                      }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            {/* Logout */}
            <div className="border-t p-4">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
                Logout
              </Button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <header className="flex h-16 items-center justify-between border-b bg-white px-6">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden">
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-4">
              <NotificationBell />
              <div className="text-sm">
                <span className="text-muted-foreground">Welcome back, </span>
                <span className="font-medium">{userName || "User"}</span>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </NotificationProvider>
  )
}
