// Customers API client for MongoDB backend
// Replace the baseURL with your backend API endpoint

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Fetch current user session/profile
export async function getProfile(token?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${baseURL}/auth/profile`, {
    credentials: "include",
    headers
  });
  if (!res.ok) throw new Error("Not authenticated");
  return res.json();
}

// Fetch all customers
export async function getCustomers(token?: string, search?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = search ? `${baseURL}/customers?search=${encodeURIComponent(search)}` : `${baseURL}/customers`;

  const res = await fetch(url, {
    credentials: "include",
    headers
  });
  if (!res.ok) throw new Error("Failed to fetch customers");
  return res.json();
}

// Get single customer
export async function getCustomerById(id: string, token?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${baseURL}/customers/${id}`, {
    credentials: "include",
    headers
  });
  if (!res.ok) throw new Error("Failed to fetch customer");
  return res.json();
}

// Create new customer
export async function createCustomer(data: any, token?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${baseURL}/customers`, {
    method: "POST",
    credentials: "include",
    headers,
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Failed to create customer");
  return res.json();
}

// Update existing customer
export async function updateCustomer(id: string, data: any, token?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${baseURL}/customers/${id}`, {
    method: "PUT",
    credentials: "include",
    headers,
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Failed to update customer");
  return res.json();
}

// Delete customer
export async function deleteCustomer(id: string, token?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${baseURL}/customers/${id}`, {
    method: "DELETE",
    credentials: "include",
    headers
  });
  if (!res.ok) throw new Error("Failed to delete customer");
  return res.json();
}
