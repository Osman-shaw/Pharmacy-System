/**
 * Monime Sierra Leone payment gateway – frontend API.
 * Card, Mobile Money, Bank Transfer, USSD via https://monime.io
 */

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function headers(token?: string): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}

export async function getPaymentConfig(token?: string) {
  const res = await fetch(`${baseURL}/payment/config`, {
    credentials: "include",
    headers: headers(token),
  });
  if (!res.ok) throw new Error("Failed to get payment config");
  return res.json();
}

/**
 * Create Monime checkout session (card, mobile money, bank, wallet).
 * Returns redirectUrl – redirect the customer to complete payment securely.
 */
export async function createCheckoutSession(
  payload: {
    items: { product: string; name: string; quantity: number; price: number; subtotal: number }[];
    totalAmount: number;
    paymentMethod: string;
    customerName?: string;
    type?: string;
    prescriptionId?: string;
    pharmacistLicense?: string;
    cashierId?: string;
  },
  token?: string
) {
  const res = await fetch(`${baseURL}/payment/checkout-session`, {
    method: "POST",
    credentials: "include",
    headers: headers(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to create payment session");
  }
  return res.json();
}

/**
 * Create USSD payment code. Customer dials the returned code to pay via mobile money.
 */
export async function createUssdCode(
  payload: {
    items: { product: string; name: string; quantity: number; price: number; subtotal: number }[];
    totalAmount: number;
    paymentMethod?: string;
    customerName?: string;
    type?: string;
    prescriptionId?: string;
    pharmacistLicense?: string;
    cashierId?: string;
  },
  token?: string
) {
  const res = await fetch(`${baseURL}/payment/ussd-code`, {
    method: "POST",
    credentials: "include",
    headers: headers(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to create USSD code");
  }
  return res.json();
}

export async function verifyPayment(transactionId: string, token?: string) {
  const res = await fetch(`${baseURL}/payment/verify/${encodeURIComponent(transactionId)}`, {
    credentials: "include",
    headers: headers(token),
  });
  if (!res.ok) throw new Error("Failed to verify payment");
  return res.json();
}
