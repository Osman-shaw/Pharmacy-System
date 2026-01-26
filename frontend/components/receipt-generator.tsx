"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Printer, Mail, Download } from "lucide-react"
import { useState } from "react"

interface ReceiptData {
  sale: {
    id: string
    invoice_number: string
    sale_date: string
    subtotal: number
    discount: number
    total_amount: number
    payment_method: string
  }
  items: Array<{
    medicine_name: string
    quantity: number
    unit_price: number
    subtotal: number
  }>
  customer?: {
    name: string
    email: string
    phone: string
  }
}

interface ReceiptGeneratorProps {
  receiptData: ReceiptData
  open: boolean
  onClose: () => void
}

export function ReceiptGenerator({ receiptData, open, onClose }: ReceiptGeneratorProps) {
  const receiptRef = useRef<HTMLDivElement>(null)
  const [email, setEmail] = useState(receiptData.customer?.email || "")
  const [sending, setSending] = useState(false)

  const printReceipt = () => {
    if (receiptRef.current) {
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Receipt - ${receiptData.sale.invoice_number}</title>
              <style>
                body { font-family: 'Courier New', monospace; padding: 20px; max-width: 400px; }
                .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
                .item { display: flex; justify-content: space-between; margin: 5px 0; }
                .total { border-top: 2px solid #000; padding-top: 10px; margin-top: 10px; }
                .footer { text-align: center; border-top: 2px dashed #000; padding-top: 10px; margin-top: 10px; }
              </style>
            </head>
            <body>
              ${receiptRef.current.innerHTML}
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
      }
    }
  }

  const downloadReceipt = () => {
    if (receiptRef.current) {
      const element = receiptRef.current.cloneNode(true) as HTMLElement
      const blob = new Blob([element.innerHTML], { type: "text/html" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `receipt-${receiptData.sale.invoice_number}.html`
      a.click()
      window.URL.revokeObjectURL(url)
    }
  }

  const sendEmail = async () => {
    if (!email) {
      alert("Please enter an email address")
      return
    }

    setSending(true)

    try {
      // Call edge function to send email
      const response = await fetch("/api/send-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          receiptData,
        }),
      })

      if (response.ok) {
        alert("Receipt sent successfully!")
      } else {
        alert("Failed to send receipt")
      }
    } catch (error) {
      console.error("[v0] Error sending receipt:", error)
      alert("Error sending receipt")
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Receipt</DialogTitle>
          <DialogDescription>Print, download or email this receipt to customer</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Receipt Preview */}
          <Card>
            <CardContent className="p-6">
              <div ref={receiptRef} className="font-mono text-sm">
                <div className="header mb-4 border-b-2 border-dashed border-gray-400 pb-4 text-center">
                  <h1 className="text-2xl font-bold">ShawCare Pharmacy</h1>
                  <p className="text-xs">Freetown, Sierra Leone</p>
                  <p className="text-xs">Phone: +232 XXX XXXX</p>
                  <p className="text-xs">Email: info@shawcare.sl</p>
                </div>

                <div className="mb-4 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Invoice:</span>
                    <span className="font-bold">{receiptData.sale.invoice_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{new Date(receiptData.sale.sale_date).toLocaleString()}</span>
                  </div>
                  {receiptData.customer && (
                    <>
                      <div className="flex justify-between">
                        <span>Customer:</span>
                        <span>{receiptData.customer.name}</span>
                      </div>
                      {receiptData.customer.phone && (
                        <div className="flex justify-between">
                          <span>Phone:</span>
                          <span>{receiptData.customer.phone}</span>
                        </div>
                      )}
                    </>
                  )}
                  <div className="flex justify-between">
                    <span>Payment:</span>
                    <span className="capitalize">{receiptData.sale.payment_method.replace("_", " ")}</span>
                  </div>
                </div>

                <div className="mb-4 border-t border-dashed border-gray-400 pt-2">
                  <div className="mb-2 flex justify-between text-xs font-bold">
                    <span>Item</span>
                    <span>Qty</span>
                    <span>Price</span>
                    <span>Total</span>
                  </div>
                  {receiptData.items.map((item, index) => (
                    <div key={index} className="mb-2 space-y-1">
                      <div className="text-xs font-medium">{item.medicine_name}</div>
                      <div className="flex justify-between text-xs">
                        <span></span>
                        <span>{item.quantity}</span>
                        <span>Le {item.unit_price.toFixed(2)}</span>
                        <span>Le {item.subtotal.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="total border-t-2 border-gray-800 pt-2 text-xs">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>Le {receiptData.sale.subtotal.toFixed(2)}</span>
                  </div>
                  {receiptData.sale.discount > 0 && (
                    <div className="flex justify-between">
                      <span>Discount:</span>
                      <span>- Le {receiptData.sale.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="mt-2 flex justify-between text-base font-bold">
                    <span>TOTAL:</span>
                    <span>Le {receiptData.sale.total_amount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="footer mt-4 border-t-2 border-dashed border-gray-400 pt-4 text-center text-xs">
                  <p className="font-bold">Thank you for your business!</p>
                  <p className="mt-2">For queries, contact us at info@shawcare.sl</p>
                  <p className="mt-1">Visit us: www.shawcare.sl</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Section */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-medium">Send via Email</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="email" className="text-xs">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="customer@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <Button onClick={sendEmail} disabled={sending} className="mt-auto">
                  <Mail className="mr-2 h-4 w-4" />
                  {sending ? "Sending..." : "Send"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={printReceipt} variant="outline" className="flex-1 bg-transparent">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button onClick={downloadReceipt} variant="outline" className="flex-1 bg-transparent">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button onClick={onClose} variant="secondary" className="flex-1">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
