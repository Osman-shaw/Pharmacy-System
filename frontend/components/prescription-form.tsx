"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import * as z from "zod"
import { CalendarIcon, Loader2, Plus, Trash2, Mic, Save } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { toast } from "sonner"
import { AudioAssistant } from "./audio-assistant"
import { createPrescription, updatePrescription, type Prescription } from "@/lib/prescriptionsApi"
import { createCustomer } from "@/lib/customersApi"
import { getInventory } from "@/lib/inventoryApi"
import { cn } from "@/lib/utils"

const prescriptionSchema = z.object({
  patient: z.string().optional(), // Store ID if available (Edit Mode)
  patientName: z.string().min(1, "Patient name is required"),
  patientPhone: z.string().optional(),
  writtenDate: z.date({
    required_error: "Written date is required",
  }),
  doctor: z.object({
    name: z.string().min(1, "Doctor name is required"),
    license: z.string().min(1, "License number is required"),
    contact: z.string().optional(),
    facility: z.string().optional(),
  }),
  status: z.enum(['Pending', 'Filled', 'Cancelled', 'Expired']),
  notes: z.string().optional(),
  audioNotes: z.object({
    krioText: z.string().optional(),
    englishText: z.string().optional(),
  }).optional(),
  medications: z.array(z.object({
    medicine: z.string().optional(), // Product ID
    medicineName: z.string().min(1, "Medicine name is required"),
    dosage: z.string().min(1, "Dosage is required (e.g. 500mg)"),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
    instructions: z.string().min(1, "Instructions are required"),
    duration: z.string().optional(),
  })).min(1, "At least one medication is required"),
})

type PrescriptionFormValues = z.infer<typeof prescriptionSchema>

interface PrescriptionFormProps {
  initialData?: Prescription
  token: string
}

export function PrescriptionForm({ initialData, token }: PrescriptionFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [medicines, setMedicines] = useState<any[]>([])
  const [showAudioAssistant, setShowAudioAssistant] = useState(false)

  const form = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: initialData ? {
      ...initialData,
      writtenDate: new Date(initialData.writtenDate),
      patient: initialData.patient._id,
      patientName: initialData.patientName || initialData.patient.name, // Ensure populate from relation if needed
      patientPhone: initialData.patient.phone,
      medications: initialData.medications.map(m => ({
        ...m,
        medicine: m.medicine?._id
      }))
    } : {
      patientName: "",
      patientPhone: "",
      writtenDate: new Date(),
      status: 'Pending',
      notes: "",
      medications: [{ medicineName: "", dosage: "", quantity: 1, instructions: "" }],
      doctor: { name: "", license: "", contact: "", facility: "" },
      audioNotes: { krioText: "", englishText: "" }
    },
  })

  const { fields, append, remove } = useFieldArray({
    name: "medications",
    control: form.control,
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const inventoryData = await getInventory(token, 1, 100)
        setMedicines(inventoryData.data || [])
      } catch (error) {
        console.error("Failed to load medicines", error)
        toast.error("Failed to load medicines")
      }
    }
    loadData()
  }, [token])

  const handleMedicineSelect = (index: number, value: string) => {
    const medicine = medicines.find(m => m._id === value)
    if (medicine) {
      form.setValue(`medications.${index}.medicine`, value)
      form.setValue(`medications.${index}.medicineName`, medicine.name)
      // Auto-fill dosage if available in medicine data
      if (medicine.dosageForm || medicine.strength) {
        form.setValue(`medications.${index}.dosage`, `${medicine.strength || ''} ${medicine.dosageForm || ''}`.trim())
      }
    }
  }

  const handleAudioTranscription = (krio: string, english: string) => {
    form.setValue("audioNotes", { krioText: krio, englishText: english })
    form.setValue("notes", english) // Auto-populate main notes with English translation
    setShowAudioAssistant(false)
  }

  async function onSubmit(data: PrescriptionFormValues) {
    setIsLoading(true)
    try {
      // 1. Handle Patient (Find or Create)
      let patientId = initialData?.patient?._id

      // If we don't have an ID or if we are creating new
      if (!patientId || !initialData) {
        // Simplistic logic: If phone provided, try to find. Else create.
        // For now, we'll just create a new customer if it's a new prescription to match logical flow "Direct Entry"
        // In a real app we might want to search first.

        // Let's create/upsert the customer
        // Backend requires fullName and phone. Phone must be unique.
        const customerData = {
          fullName: data.patientName,
          phone: (data as any).patientPhone || `N/A-${Date.now()}`, // Fallback to avoid unique constraint error if missing
          type: "individual",
          storeId: "main"
        }

        try {
          // Use imported createCustomer
          const res = await createCustomer(customerData, token)
          if (res.success || res.customer || res.data) {
            patientId = res.data?._id || res.customer?._id || res.data?.id
          } else {
            console.error("Failed to create customer", res)
          }
        } catch (err) {
          console.warn("Could not auto-create customer, proceeding might fail if backend requires ID", err)
        }
      }

      // Ensure patientId exists
      if (!patientId) {
        throw new Error("Could not identify or create patient. Please check patient details.")
      }

      // Need to format date to string for API and ensure types match
      const apiData: any = {
        ...data,
        patient: patientId,
        writtenDate: data.writtenDate.toISOString(),
        audioNotes: data.audioNotes?.krioText || data.audioNotes?.englishText ? {
          krioText: data.audioNotes.krioText || "",
          englishText: data.audioNotes.englishText || ""
        } : undefined
      }

      if (initialData) {
        await updatePrescription(token, initialData._id, apiData)
        toast.success("Prescription updated successfully")
      } else {
        await createPrescription(token, apiData)
        toast.success("Prescription created successfully")
      }
      router.push("/dashboard/prescriptions")
      router.refresh()
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Prescription Details</CardTitle>
              <CardDescription>Patient and doctor information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="patientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter patient name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="patientPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient Phone (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="writtenDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Written Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="doctor.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Doctor Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Dr. Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="doctor.license"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>License No.</FormLabel>
                      <FormControl>
                        <Input placeholder="LIC-12345" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Filled">Filled</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle>Notes & Instructions</CardTitle>
                <CardDescription>Notes with Krio assistance</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setShowAudioAssistant(!showAudioAssistant)}
                className="gap-2"
              >
                <Mic className="h-4 w-4" />
                {showAudioAssistant ? "Hide Assistant" : "AI Audio Assistant"}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {showAudioAssistant && (
                <AudioAssistant
                  onTranscriptionComplete={handleAudioTranscription}
                  initialKrio={form.getValues("audioNotes.krioText")}
                  initialEnglish={form.getValues("audioNotes.englishText")}
                />
              )}

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prescription Notes (English)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional notes, diagnosis, or patient instructions..."
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Medications</CardTitle>
              <CardDescription>List of prescribed drugs</CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ medicineName: "", dosage: "", quantity: 1, instructions: "" })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Medication
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {fields.map((field, index) => (
              <div key={field.id} className="grid md:grid-cols-12 gap-4 items-start border-b pb-6 last:border-0 last:pb-0">
                <div className="md:col-span-11 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name={`medications.${index}.medicine`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medicine (Inventory)</FormLabel>
                        <Select
                          onValueChange={(val) => handleMedicineSelect(index, val)}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select medicine" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {medicines.map((m) => (
                              <SelectItem key={m._id} value={m._id}>
                                {m.name} ({m.stock} in stock)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`medications.${index}.medicineName`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medicine Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Drug name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`medications.${index}.dosage`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dosage</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 500mg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`medications.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`medications.${index}.instructions`}
                    render={({ field }) => (
                      <FormItem className="md:col-span-2 lg:col-span-4">
                        <FormLabel>Instructions</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Take 1 tablet twice daily after meals" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="md:col-span-1 pt-8">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Save Prescription
          </Button>
        </div>
      </form>
    </Form>
  )
}
