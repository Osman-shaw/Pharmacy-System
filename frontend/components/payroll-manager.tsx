"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

export function PayrollManager({ employees, payrolls }: any) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Recent Payroll Records</CardTitle>
          <CardDescription>Latest salary payments and processing history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Pay Period</TableHead>
                  <TableHead>Total Earnings</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Net Pay</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrolls.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      No payroll records found
                    </TableCell>
                  </TableRow>
                ) : (
                  payrolls.map((payroll: any) => (
                    <TableRow key={payroll._id || payroll.id}>
                      <TableCell className="font-medium">
                        {payroll.employee?.firstName} {payroll.employee?.lastName}
                        <div className="text-xs text-muted-foreground">{payroll.employee?.employeeId}</div>
                      </TableCell>
                      <TableCell>
                        {payroll.payPeriod?.startDate ? format(new Date(payroll.payPeriod.startDate), "MMM d") : "N/A"} -{" "}
                        {payroll.payPeriod?.endDate ? format(new Date(payroll.payPeriod.endDate), "MMM d, yyyy") : "N/A"}
                      </TableCell>
                      <TableCell>Le {Number.parseFloat(payroll.totalEarnings || 0).toLocaleString()}</TableCell>
                      <TableCell>Le {Number.parseFloat(payroll.totalDeductions || 0).toLocaleString()}</TableCell>
                      <TableCell className="font-bold">
                        Le {Number.parseFloat(payroll.netPay || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {payroll.paymentDate ? format(new Date(payroll.paymentDate), "PPP") : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            payroll.status === "paid"
                              ? "default"
                              : payroll.status === "processed"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {payroll.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
