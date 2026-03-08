"use client"

import React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { Bell, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Notification {
  id: string
  title: string
  message: string
  type: "out_of_stock" | "low_stock" | "expiring"
  timestamp: Date
  read: boolean
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => void
  clearNotification: (id: string) => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider")
  }
  return context
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [permissionGranted, setPermissionGranted] = useState(false)

  useEffect(() => {
    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        setPermissionGranted(permission === "granted")
      })
    } else if ("Notification" in window && Notification.permission === "granted") {
      setPermissionGranted(true)
    }

    // Check for alerts
    const checkAlerts = async () => {
      try {
        const { getNotificationData } = await import("@/lib/dashboardApi")
        const data = await getNotificationData()

        const newNotifications: Notification[] = []

        // 1. Handle Expiring (30 days and 14 days)
        data.expiring.forEach((item: any) => {
          const expiryDate = new Date(item.expiryDate)
          const today = new Date()
          const diffDays = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

          if (diffDays <= 14) {
            newNotifications.push({
              id: `exp-14-${item._id}`,
              title: "Critical Expiry",
              message: `${item.name} expires in ${diffDays} days!`,
              type: "expiring",
              timestamp: new Date(),
              read: false,
            })
          } else if (diffDays <= 30) {
            newNotifications.push({
              id: `exp-30-${item._id}`,
              title: "Expiry Warning",
              message: `${item.name} expires in ${diffDays} days.`,
              type: "expiring",
              timestamp: new Date(),
              read: false,
            })
          }
        })

        // 2. Handle Low Stock
        data.lowStock.forEach((item: any) => {
          newNotifications.push({
            id: `low-${item._id}`,
            title: "Low Stock",
            message: `${item.name} is low on stock (${item.stock} left).`,
            type: "low_stock",
            timestamp: new Date(),
            read: false,
          })
        })

        // 3. Handle Out of Stock (Critical focus)
        data.outOfStock.forEach((item: any) => {
          if (item.isCritical) {
            newNotifications.push({
              id: `oos-crit-${item._id}`,
              title: "CRITICAL OUT OF STOCK",
              message: `${item.name} (Critical Drug) is OUT OF STOCK!`,
              type: "out_of_stock",
              timestamp: new Date(),
              read: false,
            })
          }
        })

        // Update notifications, avoiding duplicates
        setNotifications(prev => {
          const existingIds = new Set(prev.map(n => n.id))
          const uniqueNew = newNotifications.filter(n => !existingIds.has(n.id))
          return [...prev, ...uniqueNew]
        })

      } catch (error) {
        console.error("Failed to check alerts", error)
      }
    }

    const interval = setInterval(checkAlerts, 10 * 60 * 1000) // Every 10 mins
    checkAlerts() // Initial check

    return () => clearInterval(interval)
  }, [])

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        clearNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, clearNotification } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center bg-red-500">
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Notification panel */}
          <Card className="absolute right-0 top-12 z-50 w-80 max-h-96 overflow-hidden shadow-lg">
            <div className="border-b p-3 flex items-center justify-between">
              <h3 className="font-semibold">Notifications</h3>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="overflow-y-auto max-h-80">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 hover:bg-gray-50 cursor-pointer ${!notification.read ? "bg-blue-50/50" : ""}`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm">{notification.title}</h4>
                            {notification.type === "out_of_stock" && (
                              <Badge variant="destructive" className="text-xs">
                                Critical
                              </Badge>
                            )}
                            {notification.type === "low_stock" && (
                              <Badge variant="outline" className="text-xs text-amber-600">
                                Warning
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation()
                            clearNotification(notification.id)
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
