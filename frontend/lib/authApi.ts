// Authentication API client for MongoDB backend
// Replace the baseURL with your backend API endpoint

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function login(email: string, password: string) {
  const res = await fetch(`${baseURL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: email, password })
  });
  if (!res.ok) throw new Error("Invalid credentials");
  return res.json();
}

export async function signup(email: string, password: string, fullName: string, role: string = 'pharmacist', image?: string) {
  const res = await fetch(`${baseURL}/auth/register`, { // Endpoint is register, not signup based on auth.routes.js? verification needed
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: email, email: email, password, fullName, role, image })
  });
  if (!res.ok) throw new Error("Signup failed");
  return res.json();
}

export async function forgotPassword(email: string) {
  const res = await fetch(`${baseURL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to send reset email");
  }
  return res.json();
}

export async function resetPassword(token: string, password: string) {
  const res = await fetch(`${baseURL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to reset password");
  }
  return res.json();
}
