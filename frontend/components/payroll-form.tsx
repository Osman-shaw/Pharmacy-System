"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import * as z from "zod"
import { CalendarIcon, Plus, Trash2, Loader2 } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getEmployees, createPayroll, getEmployee } from "@/lib/hrApi"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"

const payrollItemSchema = z.object({
    type: z.enum(['basic', 'allowance', 'bonus', 'overtime', 'deduction', 'tax', 'other']),
    name: z.string().min(1, "Name is required"),
    amount: z.coerce.number().min(0, "Amount must be positive"),
    isDeduction: z.boolean().default(false),
})

const formSchema = z.object({
    employee: z.string().min(1, "Employee is required"),
    payPeriod: z.object({
        startDate: z.date({ required_error: "Start date is required" }),
        endDate: z.date({ required_error: "End date is required" }),
    }),
    paymentDate: z.date({ required_error: "Payment date is required" }),
    paymentMethod: z.enum(['cash', 'bank_transfer', 'check', 'orange_money', 'afrimoney', 'other']),
    paymentDetails: z.object({
        phoneNumber: z.string().optional()
    }).optional(),
    items: z.array(payrollItemSchema).min(1, "At least one payroll item is required"),
    notes: z.string().optional(),
})

interface PayrollFormProps {
    token: string
}

export function PayrollForm({ token }: PayrollFormProps) {
    const router = useRouter()
    const [employees, setEmployees] = useState<any[]>([])
    const [loadingEmployees, setLoadingEmployees] = useState(true)
    const [calculating, setCalculating] = useState(false)
    const [totals, setTotals] = useState({ earnings: 0, deductions: 0, net: 0 })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            paymentMethod: "bank_transfer",
            items: [
                { type: "basic", name: "Basic Salary", amount: 0, isDeduction: false }
            ],
            paymentDate: new Date(),
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    })

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const data = await getEmployees(token, { status: "active" })
                setEmployees(data)
            } catch (error) {
                toast.error("Failed to load employees")
            } finally {
                setLoadingEmployees(false)
            }
        }
        fetchEmployees()
    }, [token])

    // Watch items to calculate totals
    const items = form.watch("items")
    useEffect(() => {
        const earnings = items
            .filter(item => !item.isDeduction)
            .reduce((sum, item) => sum + (Number(item.amount) || 0), 0)

        const deductions = items
            .filter(item => item.isDeduction)
            .reduce((sum, item) => sum + (Number(item.amount) || 0), 0)

        setTotals({
            earnings,
            deductions,
            net: earnings - deductions
        })
    }, [items])

    const onEmployeeChange = async (employeeId: string) => {
        form.setValue("employee", employeeId)
        try {
            const employee = await getEmployee(employeeId, token)
            // Auto-update basic salary if it's the first item and hasn't been modified (or logic to find it)
            // For simplicity, we just find the 'basic' item and update it
            const currentItems = form.getValues("items")
            const basicIndex = currentItems.findIndex(i => i.type === 'basic')

            if (basicIndex !== -1 && employee.salary) {
                form.setValue(`items.${basicIndex}.amount`, employee.salary)
            } else if (employee.salary) {
                append({ type: "basic", name: "Basic Salary", amount: employee.salary, isDeduction: false })
            }
        } catch (error) {
            console.error(error)
        }
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            if ((values.paymentMethod === 'orange_money' || values.paymentMethod === 'afrimoney') && !values.paymentDetails?.phoneNumber) {
                toast.error("Phone number is required for mobile money payment")
                return
            }

            await createPayroll({
                ...values,
                status: "processed", // Default status
            }, token)
            toast.success("Payroll processed successfully")
            router.push("/dashboard/payroll")
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || "Failed to process payroll")
        }
    }

    const itemTypes = [
        { value: 'basic', label: 'Basic Salary', isDeduction: false },
        { value: 'allowance', label: 'Allowance', isDeduction: false },
        { value: 'bonus', label: 'Bonus', isDeduction: false },
        { value: 'overtime', label: 'Overtime', isDeduction: false },
        { value: 'deduction', label: 'Deduction', isDeduction: true },
        { value: 'tax', label: 'Tax', isDeduction: true },
        { value: 'other', label: 'Other', isDeduction: false }, // Can be either, defaulting false
    ]

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Payroll Details</CardTitle>
                            <CardDescription>Select employee and pay period</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="employee"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Employee</FormLabel>
                                        <Select onValueChange={onEmployeeChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select employee" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {employees.map((emp) => (
                                                    <SelectItem key={emp._id} value={emp._id}>
                                                        {emp.firstName} {emp.lastName} ({emp.employeeId})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                        {loadingEmployees && <p className="text-xs text-muted-foreground">Loading employees...</p>}
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="payPeriod.startDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Start Date</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                                                        >
                                                            {field.value ? format(field.value, "MMM d, yyyy") : <span>Pick a date</span>}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="payPeriod.endDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>End Date</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                                                        >
                                                            {field.value ? format(field.value, "MMM d, yyyy") : <span>Pick a date</span>}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        disabled={(date) => date < new Date("1900-01-01")}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="paymentDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Payment Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                                                    >
                                                        {field.value ? format(field.value, "MMM d, yyyy") : <span>Pick a date</span>}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="paymentMethod"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Payment Method</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select method" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                                <SelectItem value="cash">Cash</SelectItem>
                                                <SelectItem value="check">Check</SelectItem>
                                                <SelectItem value="orange_money">Orange Money</SelectItem>
                                                <SelectItem value="afrimoney">Afrimoney</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {(form.watch("paymentMethod") === "orange_money" || form.watch("paymentMethod") === "afrimoney") && (
                                <FormField
                                    control={form.control}
                                    name="paymentDetails.phoneNumber" // Use nested path matching backend expectation
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mobile Money Number</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="e.g. +232..." />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div>
                                <CardTitle>Salary structure</CardTitle>
                                <CardDescription>Earnings and Deductions</CardDescription>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={() => append({ type: "allowance", name: "", amount: 0, isDeduction: false })}>
                                <Plus className="mr-2 h-4 w-4" /> Add Item
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex gap-4 items-end">
                                    <FormField
                                        control={form.control}
                                        name={`items.${index}.type`}
                                        render={({ field }) => (
                                            <FormItem className="w-[140px]">
                                                {index === 0 && <FormLabel>Type</FormLabel>}
                                                <Select
                                                    onValueChange={(val) => {
                                                        field.onChange(val)
                                                        const typeObj = itemTypes.find(t => t.value === val)
                                                        if (typeObj && (typeObj.isDeduction !== form.getValues(`items.${index}.isDeduction`))) {
                                                            form.setValue(`items.${index}.isDeduction`, typeObj.isDeduction)
                                                        }
                                                    }}
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {itemTypes.map(t => (
                                                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`items.${index}.name`}
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                {index === 0 && <FormLabel>Description</FormLabel>}
                                                <FormControl>
                                                    <Input {...field} placeholder="e.g. Housing Allowance" />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`items.${index}.amount`}
                                        render={({ field }) => (
                                            <FormItem className="w-[120px]">
                                                {index === 0 && <FormLabel>Amount</FormLabel>}
                                                <FormControl>
                                                    <Input {...field} type="number" min="0" step="0.01" />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="mb-1 text-red-500 hover:text-red-700"
                                        onClick={() => remove(index)}
                                        disabled={items.length === 1}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}

                            <Separator className="my-4" />

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Total Earnings</span>
                                    <span>Le {totals.earnings.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Total Deductions</span>
                                    <span className="text-red-500">- Le {totals.deductions.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                    <span>Net Pay</span>
                                    <span>Le {totals.net.toLocaleString()}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-end">
                    <Button type="button" variant="ghost" onClick={() => router.back()} className="mr-4">
                        Cancel
                    </Button>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Process Payroll
                    </Button>
                </div>
            </form>
        </Form>
    )
}
