import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, receiptData } = await request.json()

    // Generate HTML email content
    const emailHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; border: 1px solid #e5e7eb; }
            .item-row { display: flex; justify-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
            .total { font-size: 18px; font-weight: bold; padding: 15px 0; border-top: 2px solid #10b981; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>ShawCare Pharmacy</h1>
            <p>Receipt for Invoice: ${receiptData.sale.invoice_number}</p>
          </div>
          <div class="content">
            <p><strong>Date:</strong> ${new Date(receiptData.sale.sale_date).toLocaleString()}</p>
            ${
              receiptData.customer
                ? `
              <p><strong>Customer:</strong> ${receiptData.customer.name}</p>
              ${receiptData.customer.phone ? `<p><strong>Phone:</strong> ${receiptData.customer.phone}</p>` : ""}
            `
                : ""
            }
            <p><strong>Payment Method:</strong> ${receiptData.sale.payment_method.replace("_", " ")}</p>
            
            <h3>Items Purchased:</h3>
            ${receiptData.items
              .map(
                (item: any) => `
              <div class="item-row">
                <span>${item.medicine_name}</span>
                <span>${item.quantity} x Le ${item.unit_price.toFixed(2)} = Le ${item.subtotal.toFixed(2)}</span>
              </div>
            `,
              )
              .join("")}
            
            <div class="total">
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span>Subtotal:</span>
                <span>Le ${receiptData.sale.subtotal.toFixed(2)}</span>
              </div>
              ${
                receiptData.sale.discount > 0
                  ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                  <span>Discount:</span>
                  <span>- Le ${receiptData.sale.discount.toFixed(2)}</span>
                </div>
              `
                  : ""
              }
              <div style="display: flex; justify-content: space-between; font-size: 20px;">
                <span>Total:</span>
                <span>Le ${receiptData.sale.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div class="footer">
            <p>Thank you for choosing ShawCare Pharmacy!</p>
            <p>Freetown, Sierra Leone | Phone: +232 XXX XXXX</p>
            <p>Email: info@shawcare.sl | Website: www.shawcare.sl</p>
          </div>
        </body>
      </html>
    `

    // In a real implementation, you would use a service like Resend, SendGrid, or AWS SES
    // For now, we'll simulate the email sending
    console.log(" Sending receipt to:", email)
    console.log("Email Receipt data:", receiptData)

    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return NextResponse.json({ success: true, message: "Receipt sent successfully" })
  } catch (error: any) {
    console.error(" Error sending receipt:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
