// POS API client for MongoDB backend
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

// Fetch medicines with available stock
export async function getAvailableMedicines(token?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${baseURL}/inventory/available`, {
    credentials: "include",
    headers
  });
  if (!res.ok) throw new Error("Failed to fetch medicines");
  return res.json();
}

// Fetch all customers
export async function getCustomers(token?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${baseURL}/customers`, {
    credentials: "include",
    headers
  });
  if (!res.ok) throw new Error("Failed to fetch customers");
  return res.json();
}
