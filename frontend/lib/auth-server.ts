import { cookies } from "next/headers"

/**
 * Interface for the decoded User object from JWT
 */
export interface User {
    id: string
    username: string
    role: string
    fullName: string
}

/**
 * Retrieves the current user from the 'token' cookie.
 * This function handles the server-side logic of reading cookies
 * and validating the JWT (simplified as presence check + decode for now,
 * usually you'd verify signature if you shared the secret or called an API).
 * 
 * For this implementation, we will trust the cookie presence or 
 * call an API endpoint to validate if needed. 
 * To keep it simple and performant, we'll assume the token is valid if present
 * and we will decode it if we had a library, OR we simply return a user object
 * if we can validate it against the backend.
 * 
 * BETTER APPROACH: Call the backend's /api/auth/profile endpoint heavily,
 * or decode the JWT if we have the secret here.
 * Since we don't want to duplicate the secret, calling the API is safer.
 */
export async function getCurrentUser(): Promise<User | null> {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
        return null
    }

    try {
        // Validate token with backend
        const res = await fetch("http://localhost:5000/api/auth/profile", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store", // Don't cache auth checks
        })

        if (!res.ok) {
            return null
        }

        const data = await res.json()
        if (data.success && data.data) {
            return data.data as User;
        }
        return null
    } catch (error) {
        console.error("Auth check failed:", error)
        return null
    }
}
