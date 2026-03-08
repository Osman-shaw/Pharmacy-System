"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { createSale } from "@/lib/salesApi"
import { createCheckoutSession, createUssdCode } from "@/lib/paymentApi"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Trash2, ShoppingCart } from "lucide-react"
import { useRouter } from "next/navigation"

interface CartItem {
  product: string
  name: string
  quantity: number
  price: number
  subtotal: number
  batchNumber?: string
  expiryDate?: string
}

interface POSInterfaceProps {
  medicines: any[]
  customers: any[]
  prescriptions?: any[]
  user?: { id?: string; _id?: string; role?: string; pharmacistLicense?: string } | null
}

export function POSInterface({ medicines, customers, prescriptions = [], user }: POSInterfaceProps) {
  const userId = user?.id ?? user?._id ?? ""
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerId, setCustomerId] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [saleType, setSaleType] = useState("OTC")
  const [prescriptionId, setPrescriptionId] = useState("")
  const [discount, setDiscount] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ussdResult, setUssdResult] = useState<{ ussdCode: string; instructions: string; saleId: string } | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    const success = searchParams.get("monime_success")
    const ref = searchParams.get("ref")
    if (success === "1" && ref) {
      setCart([])
      setCustomerId("")
      setPrescriptionId("")
      setDiscount(0)
      setUssdResult(null)
      router.replace("/dashboard/pos", { scroll: false })
    }
  }, [searchParams, router])

  const filteredMedicines = medicines.filter((medicine) =>
    medicine.name.toLowerCase().includes(search.toLowerCase()) ||
    medicine.genericName?.toLowerCase().includes(search.toLowerCase())
  )

  const isExpired = (expiryDate: string | Date | undefined) => {
    if (!expiryDate) return false
    const exp = new Date(expiryDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    exp.setHours(0, 0, 0, 0)
    return exp <= today
  }

  const addToCart = (medicine: any) => {
    if (isExpired(medicine.expiryDate)) {
      alert("This product has expired and cannot be sold. Safety policy blocks sale of expired medication.")
      return
    }
    const existing = cart.find((item) => item.product === medicine._id)

    if (existing) {
      if (existing.quantity >= (medicine.stock || 0)) {
        alert("Not enough stock available")
        return
      }
      setCart(
        cart.map((item) =>
          item.product === medicine._id
            ? {
              ...item,
              quantity: item.quantity + 1,
              subtotal: (item.quantity + 1) * item.price,
            }
            : item,
        ),
      )
    } else {
      if (!medicine.stock || medicine.stock <= 0) {
        alert("Out of stock")
        return
      }
      setCart([
        ...cart,
        {
          product: medicine._id,
          name: medicine.name,
          quantity: 1,
          price: medicine.price,
          subtotal: medicine.price,
          batchNumber: medicine.batchNumber,
          expiryDate: medicine.expiryDate,
        },
      ])
    }
  }

  const updateQuantity = (product: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(product)
      return
    }

    const medicine = medicines.find(m => m._id === product)
    if (medicine && newQuantity > medicine.stock) {
      alert("Not enough stock")
      return
    }

    setCart(
      cart.map((item) =>
        item.product === product
          ? {
            ...item,
            quantity: newQuantity,
            subtotal: newQuantity * item.price,
          }
          : item,
      ),
    )
  }

  const removeFromCart = (product: string) => {
    setCart(cart.filter((item) => item.product !== product))
  }

  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0)
  const total = subtotal - discount

  const buildSalePayload = () => {
    const payload: Record<string, unknown> = {
      items: cart,
      totalAmount: total,
      paymentMethod,
      type: saleType,
      customerName: customers.find((c: any) => c._id === customerId)?.fullName || "Walk-in",
      cashierId: userId,
    }
    if (saleType === "Rx") {
      payload.prescriptionId = prescriptionId
      payload.pharmacistLicense = user?.pharmacistLicense
    }
    return payload
  }

  const processSale = async () => {
    if (cart.length === 0) {
      alert("Cart is empty")
      return
    }
    if (saleType === "Rx") {
      if (!prescriptionId) {
        alert("Prescription (Rx) sales require selecting a prescription.")
        return
      }
      if (!user?.pharmacistLicense) {
        alert("Prescription (Rx) sales require the dispensing pharmacist's license. Please set your license in your profile.")
        return
      }
    }

    setIsProcessing(true)
    setError(null)
    setUssdResult(null)

    try {
      const salePayload = buildSalePayload()

      if (paymentMethod === "cash") {
        const res = await createSale(salePayload)
        if (res.success) {
          alert("Sale completed successfully!")
          setCart([])
          setCustomerId("")
          setPrescriptionId("")
          setDiscount(0)
          router.refresh()
        }
        return
      }

      // Monime: Card, Mobile Money, Bank – redirect to secure checkout
      const res = await createCheckoutSession(salePayload as any)
      if (res.success && res.data?.redirectUrl) {
        window.location.href = res.data.redirectUrl
        return
      }
      throw new Error("No redirect URL received")
    } catch (err: any) {
      setError(err.message)
      alert("Error: " + err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePayViaUssd = async () => {
    if (cart.length === 0) {
      alert("Cart is empty")
      return
    }
    if (saleType === "Rx" && (!prescriptionId || !user?.pharmacistLicense)) {
      alert("Prescription and pharmacist license required for Rx.")
      return
    }
    setIsProcessing(true)
    setError(null)
    setUssdResult(null)
    try {
      const salePayload = buildSalePayload()
      const res = await createUssdCode(salePayload as any)
      if (res.success && res.data) {
        setUssdResult({
          ussdCode: res.data.ussdCode,
          instructions: res.data.instructions || `Dial ${res.data.ussdCode} to pay Le ${res.data.amount?.toLocaleString()}`,
          saleId: res.data.saleId,
        })
      } else {
        throw new Error("Failed to create USSD code")
      }
    } catch (err: any) {
      setError(err.message)
      alert("Error: " + err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Medicine Selection */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Medicines</CardTitle>
              <CardDescription>Search and add medicines to cart</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search medicines..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>

              <div className="max-h-96 space-y-2 overflow-y-auto">
                {filteredMedicines.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">No medicines found</p>
                ) : (
                  filteredMedicines.map((medicine) => (
                    <div key={medicine._id} className="rounded-lg border p-3 hover:bg-gray-50 transition-colors">
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <p className="font-bold text-slate-900">{medicine.name}</p>
                          <p className="text-xs text-muted-foreground italic">
                            {medicine.genericName} | {medicine.dosageForm} {medicine.strength}
                          </p>
                        </div>
                        <Badge variant={medicine.stock > 10 ? "secondary" : "destructive"} className="text-[10px]">
                          {medicine.stock} in stock
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Unit Price</span>
                          <span className="font-bold text-emerald-700">Le {medicine.price?.toLocaleString()}</span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => addToCart(medicine)}
                          disabled={medicine.stock <= 0}
                          className="bg-emerald-600 hover:bg-emerald-700 h-8"
                        >
                          {medicine.stock > 0 ? "Add to Cart" : "Out of Stock"}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cart and Checkout */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Cart ({cart.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {cart.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">Cart is empty</p>
                ) : (
                  cart.map((item) => (
                    <div key={item.product} className="rounded-lg border p-2 text-sm bg-gray-50/50">
                      <div className="mb-1 flex items-start justify-between">
                        <div>
                          <p className="font-bold text-slate-900">{item.name}</p>
                          {(item.batchNumber || item.expiryDate) && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {item.batchNumber && `Batch: ${item.batchNumber}`}
                              {item.batchNumber && item.expiryDate && " · "}
                              {item.expiryDate && `Exp: ${new Date(item.expiryDate).toLocaleDateString()}`}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          onClick={() => removeFromCart(item.product)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 bg-white"
                            onClick={() => updateQuantity(item.product, item.quantity - 1)}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center font-bold">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 bg-white"
                            onClick={() => updateQuantity(item.product, item.quantity + 1)}
                          >
                            +
                          </Button>
                        </div>
                        <span className="font-bold text-emerald-700">Le {item.subtotal.toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>Le {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Discount</span>
                  <Input
                    type="number"
                    min="0"
                    max={subtotal}
                    value={discount}
                    onChange={(e) => setDiscount(Number.parseFloat(e.target.value) || 0)}
                    className="h-8 w-24 text-right"
                  />
                </div>
                <div className="flex justify-between border-t pt-2 text-lg font-bold">
                  <span>Total</span>
                  <span>Le {total.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Checkout</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Customer (Optional)</Label>
                <Select value={customerId} onValueChange={setCustomerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Walk-in customer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="walk-in">Walk-in customer</SelectItem>
                    {customers.map((customer) => (
                      <SelectItem key={customer._id} value={customer._id}>
                        {customer.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="revenue-type">Revenue Type (for P&L)</Label>
                <Select value={saleType} onValueChange={(v) => { setSaleType(v); if (v !== "Rx") setPrescriptionId("") }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OTC">OTC (Over the Counter)</SelectItem>
                    <SelectItem value="Rx">Prescription (Rx)</SelectItem>
                    <SelectItem value="Service">Clinical Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {saleType === "Rx" && (
                <div className="space-y-2">
                  <Label htmlFor="prescription">Prescription (required for Rx)</Label>
                  <Select value={prescriptionId} onValueChange={setPrescriptionId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select prescription" />
                    </SelectTrigger>
                    <SelectContent>
                      {prescriptions.length === 0 ? (
                        <SelectItem value="" disabled>No pending prescriptions</SelectItem>
                      ) : (
                        prescriptions.map((rx: any) => (
                          <SelectItem key={rx._id} value={rx._id}>
                            {rx.patientName} – Dr. {rx.doctor?.name} ({rx.status})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {!user?.pharmacistLicense && (
                    <p className="text-xs text-amber-600">Pharmacist license required for Rx. Set it in your profile.</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="payment">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="orange_money">Orange Money</SelectItem>
                    <SelectItem value="afrimoney">Afrimoney</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

              {paymentMethod !== "cash" && (
                <p className="text-xs text-muted-foreground">
                  Pay securely via Monime (card, mobile money, bank). You will be redirected to complete payment.
                </p>
              )}

              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                onClick={processSale}
                disabled={cart.length === 0 || isProcessing}
              >
                {paymentMethod === "cash"
                  ? (isProcessing ? "Processing..." : "Complete Sale")
                  : (isProcessing ? "Redirecting..." : "Pay with Card / Mobile Money / Bank")}
              </Button>

              {paymentMethod !== "cash" && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handlePayViaUssd}
                  disabled={cart.length === 0 || isProcessing}
                >
                  Get USSD code (pay via phone)
                </Button>
              )}

              {ussdResult && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 text-sm">
                  <p className="font-semibold text-emerald-800">Pay via USSD</p>
                  <p className="mt-1 font-mono text-lg font-bold text-emerald-700">{ussdResult.ussdCode}</p>
                  <p className="mt-2 text-muted-foreground">{ussdResult.instructions}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

    </>
  )
}
