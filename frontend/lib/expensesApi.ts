const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function getExpenses(token?: string, filters?: any) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json"
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const url = params.toString() ? `${baseURL}/finance/expenses?${params.toString()}` : `${baseURL}/finance/expenses`;

    const res = await fetch(url, {
        credentials: "include",
        headers
    });
    if (!res.ok) throw new Error("Failed to fetch expenses");
    return res.json();
}

export async function getExpenseById(id: string, token?: string) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json"
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${baseURL}/finance/expenses/${id}`, {
        credentials: "include",
        headers
    });
    if (!res.ok) throw new Error("Failed to fetch expense");
    return res.json();
}

export async function createExpense(data: any, token?: string) {
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
    if (!res.ok) throw new Error("Failed to create expense");
    return res.json();
}

export async function updateExpense(id: string, data: any, token?: string) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json"
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${baseURL}/finance/expenses/${id}`, {
        method: "PUT",
        credentials: "include",
        headers,
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to update expense");
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
