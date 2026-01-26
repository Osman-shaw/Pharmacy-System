// Finance API client for MongoDB backend
const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function getExpenses(token?: string) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json"
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${baseURL}/finance/expenses`, {
        credentials: "include",
        headers
    });
    if (!res.ok) throw new Error("Failed to fetch expenses");
    return res.json();
}

export async function addExpense(data: any, token?: string) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json"
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${baseURL}/finance/expenses`, {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to add expense");
    return res.json();
}

export async function deleteExpense(id: string, token?: string) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json"
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${baseURL}/finance/expenses/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers
    });
    if (!res.ok) throw new Error("Failed to delete expense");
    return res.json();
}

export async function getPnLReport(token?: string) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json"
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${baseURL}/finance/pnl`, {
        credentials: "include",
        headers
    });
    if (!res.ok) throw new Error("Failed to fetch PnL report");
    return res.json();
}

export async function getFinancialReport(token?: string) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json"
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${baseURL}/finance/report`, {
        credentials: "include",
        headers
    });
    if (!res.ok) throw new Error("Failed to fetch financial report");
    return res.json();
}
