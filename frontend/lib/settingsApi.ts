// Settings/Profile API client for MongoDB backend
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
export async function updateProfile(data: any) {
  const res = await fetch(`${baseURL}/users/${data._id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Update failed");
  return res.json();
}
