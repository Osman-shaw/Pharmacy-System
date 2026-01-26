"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, CheckCircle, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { checkIn, checkOut } from "@/lib/hrApi"

export function AttendanceManager({ employees, todayAttendance, userId }: any) {
  const [date, setDate] = useState<Date>(new Date())
  const [loading, setLoading] = useState(false)
  const [attendance, setAttendance] = useState<any>(
    employees.reduce((acc: any, emp: any) => {
      const empId = emp._id || emp.id
      const existing = todayAttendance.find((a: any) => (a.employee?._id || a.employee_id) === empId)
      acc[empId] = {
        status: existing?.status || "present",
        checkIn: existing?.checkIn ? format(new Date(existing.checkIn), "HH:mm") : "09:00",
        checkOut: existing?.checkOut ? format(new Date(existing.checkOut), "HH:mm") : "17:00",
        notes: existing?.notes || "",
      }
      return acc
    }, {}),
  )

  const router = useRouter()

  const handleSubmit = async () => {
    setLoading(true)
    const dateStr = format(date, "yyyy-MM-dd")

    try {
      for (const emp of employees) {
        const empId = emp._id || emp.id
        const record = attendance[empId]

        if (record.status === "present" || record.status === "late" || record.status === "half-day") {
          // Send check-in/out calls. Note: In a production app, bulk API would be better.
          await checkIn({ employee: empId, date: `${dateStr}T${record.checkIn}:00` })
          if (record.checkOut) {
            await checkOut({ employee: empId, date: `${dateStr}T${record.checkOut}:00` })
          }
        }
      }

      alert("Attendance processed successfully!")
      router.refresh()
    } catch (error: any) {
      alert("Error saving attendance: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const updateAttendance = (empId: string, field: string, value: string) => {
    setAttendance({
      ...attendance,
      [empId]: { ...attendance[empId], [field]: value },
    })
  }

  const markAll = (status: string) => {
    const updated = { ...attendance }
    employees.forEach((emp: any) => {
      updated[emp._id || emp.id] = { ...updated[emp._id || emp.id], status }
    })
    setAttendance(updated)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Mark Attendance</CardTitle>
          <CardDescription>Select date and mark employee attendance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(date, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus />
              </PopoverContent>
            </Popover>

            <Button variant="outline" size="sm" onClick={() => markAll("present")}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark All Present
            </Button>
            <Button variant="outline" size="sm" onClick={() => markAll("absent")}>
              <XCircle className="mr-2 h-4 w-4" />
              Mark All Absent
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((emp: any) => {
                  const empId = emp._id || emp.id
                  return (
                    <TableRow key={empId}>
                      <TableCell className="font-medium">
                        {emp.firstName || emp.first_name} {emp.lastName || emp.last_name}
                        <div className="text-xs text-muted-foreground">{emp.employeeId || emp.employee_code}</div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={attendance[empId]?.status}
                          onValueChange={(v) => updateAttendance(empId, "status", v)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="present">Present</SelectItem>
                            <SelectItem value="absent">Absent</SelectItem>
                            <SelectItem value="late">Late</SelectItem>
                            <SelectItem value="half-day">Half Day</SelectItem>
                            <SelectItem value="leave">Leave</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="time"
                          className="w-32"
                          value={attendance[empId]?.checkIn}
                          onChange={(e) => updateAttendance(empId, "checkIn", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="time"
                          className="w-32"
                          value={attendance[empId]?.checkOut}
                          onChange={(e) => updateAttendance(empId, "checkOut", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          className="w-48"
                          placeholder="Notes..."
                          value={attendance[empId]?.notes}
                          onChange={(e) => updateAttendance(empId, "notes", e.target.value)}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          <Button onClick={handleSubmit} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
            {loading ? "Saving..." : "Save Attendance"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
