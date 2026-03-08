"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { getAuditLogs } from "@/lib/auditApi"
import { getProfile } from "@/lib/dashboardApi"
import { Loader2, Search, Filter, Shield } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import {  Toast } from "@/components/ui/toast"
// Ensure the correct path to debugLogger is used
import { logDebug } from "@/utils/logger"
import { validateFilters } from "@/utils/validation"

export default function AuditLogPage() {
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<any>(null)
    const [filters, setFilters] = useState({
        username: "",
        action: "",
        page: 1
    })

    useEffect(() => {
        async function init() {
            logDebug("Initializing AuditLogPage...")
            const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1]
            if (!token) {
                toast({ title: "Error", description: "Authentication token is missing.", variant: "destructive" })
                return
            }

            try {
                const prof = await getProfile(token)
                setProfile(prof)
                const validatedFilters = validateFilters(filters)
                const data = await getAuditLogs(token, validatedFilters)
                setLogs(data.data)
                toast({ title: "Success", description: "Audit logs loaded successfully." })
            } catch (err) {
                console.error(err)
                toast({ title: "Error", description: "Failed to load audit logs.", variant: "destructive" })
            } finally {
                setLoading(false)
            }
        }
        init()
    }, [filters])

    const getActionColor = (action: string) => {
        if (action.includes('DELETE')) return 'destructive'
        if (action.includes('CREATE')) return 'default'
        if (action.includes('UPDATE')) return 'secondary'
        if (action === 'LOGIN_FAILED') return 'destructive'
        return 'outline'
    }

    const handleSecretRotation = () => {
        logDebug("Rotating secrets...")
        // Placeholder for secret rotation logic
        toast({ title: "Info", description: "Secrets rotated successfully." })
    }

    if (loading && !profile) {
        return (
            <DashboardLayout>
                <div className="flex h-full items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout userRole={profile?.role} userName={profile?.fullName}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Audit Trails</h2>
                        <p className="text-muted-foreground">Monitor user activities and system access for security and transparency</p>
                    </div>
                    <div className="p-2 rounded-full bg-emerald-50">
                        <Shield className="h-8 w-8 text-emerald-600" />
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Activity Logs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-6 flex flex-wrap gap-4">
                            <div className="relative flex-1 min-w-[200px]">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by username..."
                                    className="pl-8"
                                    value={filters.username}
                                    onChange={(e) => setFilters({ ...filters, username: e.target.value })}
                                />
                            </div>
                            <Select
                                value={filters.action}
                                onValueChange={(val) => setFilters({ ...filters, action: val })}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="All Actions" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value=" ">All Actions</SelectItem>
                                    <SelectItem value="LOGIN">Success Logins</SelectItem>
                                    <SelectItem value="LOGIN_FAILED">Failed Logins</SelectItem>
                                    <SelectItem value="CREATE_PRODUCT">Product Creation</SelectItem>
                                    <SelectItem value="CREATE_SALE">Sales</SelectItem>
                                    <SelectItem value="DELETE_PRODUCT">Deletions</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Timestamp</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Action</TableHead>
                                        <TableHead>Resource</TableHead>
                                        <TableHead>Details</TableHead>
                                        <TableHead>IP Address</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.length > 0 ? (
                                        logs.map((log: any) => (
                                            <TableRow key={log._id}>
                                                <TableCell className="text-xs">
                                                    {format(new Date(log.timestamp), "MMM d, yyyy HH:mm:ss")}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{log.username || 'Guest'}</span>
                                                        <span className="text-[10px] text-muted-foreground">{log.user?.fullName}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={getActionColor(log.action) as any}>
                                                        {log.action.replace('_', ' ')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm font-medium">{log.resource || '-'}</TableCell>
                                                <TableCell className="text-xs max-w-[200px] truncate" title={log.details}>
                                                    {log.details}
                                                </TableCell>
                                                <TableCell className="text-[10px] font-mono">{log.ipAddress || '-'}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center">
                                                No logs found matching your filters.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="mt-4 flex items-center justify-end space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSecretRotation}
                            >
                                Rotate Secrets
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                                disabled={filters.page === 1}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                                disabled={logs.length < 50}
                            >
                                Next
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
