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

// Fetch inventory with medicine details
export async function getInventory(token?: string, page: number = 1, limit: number = 50) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${baseURL}/inventory?page=${page}&limit=${limit}`, {
    credentials: "include",
    headers
  });
  if (!res.ok) throw new Error("Failed to fetch inventory");
  return res.json();
}

// Delete inventory item
export async function deleteProduct(id: string, token?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${baseURL}/inventory/${id}`, {
    method: "DELETE",
    credentials: "include",
    headers
  });
  if (!res.ok) throw new Error("Failed to delete product");
  return res.json();
}

// Create new product/medicine
export async function createProduct(data: any, token?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${baseURL}/inventory`, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Failed to create product");
  return res.json();
}

// Update product/medicine
export async function updateProduct(id: string, data: any, token?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${baseURL}/inventory/${id}`, {
    method: "PUT",
    headers,
    credentials: "include",
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Failed to update product");
  return res.json();
}

// Get single product/medicine
export async function getProductById(id: string, token?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${baseURL}/inventory/${id}`, {
    credentials: "include",
    headers
  });
  if (!res.ok) throw new Error("Failed to fetch product");
  return res.json();
}
