// Dashboard API client for MongoDB backend
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

// Fetch dashboard statistics (returns { medicineCount, customerCount, todaySalesCount, todayRevenue })
export async function getDashboardStats(token?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${baseURL}/dashboard/stats`, {
    credentials: "include",
    headers
  });
  if (!res.ok) throw new Error("Failed to fetch stats");
  const json = await res.json();
  return json.success ? json.data : {};
}

// Fetch low stock medicines
export async function getLowStockMedicines(token?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${baseURL}/inventory/low-stock`, {
    credentials: "include",
    headers
  });
  if (!res.ok) throw new Error("Failed to fetch low stock medicines");
  const data = await res.json();
  return data.success ? data.data : [];
}

// Fetch expiring medicines
export async function getExpiringMedicines(days = 30, token?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${baseURL}/inventory/notifications`, {
    credentials: "include",
    headers
  });
  if (!res.ok) throw new Error("Failed to fetch notifications");
  const data = await res.json();
  return data.success ? data.data.expiring : [];
}

// Fetch notification data (all types)
export async function getNotificationData(token?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${baseURL}/inventory/notifications`, {
      credentials: "include",
      headers
    });
    if (!res.ok) throw new Error("Failed to fetch notification data");
    const data = await res.json();
    return data.success ? data.data : { expiring: [], lowStock: [], outOfStock: [] };
  } catch (error) {
    console.error("Error fetching notification data:", error);
    return { expiring: [], lowStock: [], outOfStock: [] };
  }
}

// Fetch pending prescriptions (returns array of prescriptions)
export async function getPendingPrescriptions(token?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${baseURL}/prescriptions?status=Pending&limit=5`, {
    credentials: "include",
    headers
  });
  if (!res.ok) throw new Error("Failed to fetch pending prescriptions");
  const json = await res.json();
  return json.success && Array.isArray(json.data) ? json.data : [];
}
