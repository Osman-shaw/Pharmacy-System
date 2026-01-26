const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Fetch a single sale by ID
export async function getSale(id: string, token?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${baseURL}/sales/${id}`, {
    credentials: "include",
    headers
  });
  if (!res.ok) throw new Error("Failed to fetch sale");
  return res.json();
}

// Fetch all sales with customer and user info
export async function getSales(token?: string, page: number = 1, limit: number = 20) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${baseURL}/sales?include=customer,user&page=${page}&limit=${limit}`, {
    credentials: "include",
    headers
  });
  if (!res.ok) throw new Error("Failed to fetch sales");
  return res.json();
}

// Create a new sale
export async function createSale(data: any, token?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${baseURL}/sales`, {
    method: "POST",
    credentials: "include",
    headers,
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Failed to create sale");
  return res.json();
}
