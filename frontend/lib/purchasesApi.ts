const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function getPurchases(token?: string, search?: string, sort?: string, order?: string) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json"
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const queryParams = new URLSearchParams();
    if (search) queryParams.append("search", search);
    if (sort) queryParams.append("sort", sort);
    if (order) queryParams.append("order", order);

    const res = await fetch(`${baseURL}/purchases?${queryParams.toString()}`, {
        credentials: "include",
        headers
    });
    if (!res.ok) throw new Error("Failed to fetch purchases");
    return res.json();
}

export async function getPurchaseById(id: string, token?: string) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json"
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${baseURL}/purchases/${id}`, {
        credentials: "include",
        headers
    });
    if (!res.ok) throw new Error("Failed to fetch purchase");
    return res.json();
}

export async function createPurchase(data: any, token?: string) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json"
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${baseURL}/purchases`, {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to create purchase");
    return res.json();
}

export async function updatePurchase(id: string, data: any, token?: string) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json"
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${baseURL}/purchases/${id}`, {
        method: "PUT",
        credentials: "include",
        headers,
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to update purchase");
    return res.json();
}

export async function deletePurchase(id: string, token?: string) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json"
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${baseURL}/purchases/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers
    });
    if (!res.ok) throw new Error("Failed to delete purchase");
    return res.json();
}

export async function receivePurchase(id: string, token?: string) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json"
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${baseURL}/purchases/${id}/receive`, {
        method: "POST",
        credentials: "include",
        headers
    });
    if (!res.ok) throw new Error("Failed to receive purchase");
    return res.json();
}
