// Logout utility for stateless JWT auth
// Removes token from localStorage and optionally calls backend /logout for completeness

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function logout() {
  // Remove token from localStorage (or cookies if used)
  localStorage.removeItem('token');
  // Optionally notify backend (not required for stateless JWT)
  try {
    await fetch(`${baseURL}/auth/logout`, { method: 'POST', credentials: 'include' });
  } catch {}
}
