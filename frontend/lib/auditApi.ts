const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function getAuditLogs(token: string, filters: any = {}) {
    const query = new URLSearchParams(filters).toString();
    const res = await fetch(`${baseURL}/audit?${query}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!res.ok) throw new Error("Failed to fetch audit logs");
    return res.json();
}
