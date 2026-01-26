const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function getPnLReport(month: number, year: number, token?: string) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json"
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${baseURL}/finance/pnl?month=${month}&year=${year}`, {
        credentials: "include",
        headers
    });
    if (!res.ok) throw new Error("Failed to fetch P&L report");
    return res.json();
}

export async function lockPnLPeriod(period: string, data: any, token?: string) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json"
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${baseURL}/finance/pnl/lock`, {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify({ period, data })
    });
    if (!res.ok) throw new Error("Failed to lock P&L period");
    return res.json();
}

export async function getPnLTrends(token?: string) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json"
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${baseURL}/finance/pnl/trends`, {
        credentials: "include",
        headers
    });
    if (!res.ok) throw new Error("Failed to fetch P&L trends");
    return res.json();
}
