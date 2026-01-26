const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function getSuppliers(token?: string, search?: string, sort?: string) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json"
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    let url = `${baseURL}/suppliers`;
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (sort) params.append('sort', sort);
    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url, {
        credentials: "include",
        headers
    });
    if (!res.ok) throw new Error("Failed to fetch suppliers");
    return res.json();
}

export async function getSupplierById(id: string, token?: string) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json"
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${baseURL}/suppliers/${id}`, {
        credentials: "include",
        headers
    });
    if (!res.ok) throw new Error("Failed to fetch supplier");
    return res.json();
}

export async function getSupplierStats(id: string, token?: string) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json"
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${baseURL}/suppliers/${id}/stats`, {
        credentials: "include",
        headers
    });
    if (!res.ok) throw new Error("Failed to fetch supplier stats");
    return res.json();
}

export async function createSupplier(data: any, token?: string) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json"
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${baseURL}/suppliers`, {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify(data)
    });

    const result = await res.json();

    if (!res.ok) {
        // Extract the actual error message from backend
        throw new Error(result.message || "Failed to create supplier");
    }

    return result;
}

export async function updateSupplier(id: string, data: any, token?: string) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json"
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${baseURL}/suppliers/${id}`, {
        method: "PUT",
        credentials: "include",
        headers,
        body: JSON.stringify(data)
    });

    const result = await res.json();

    if (!res.ok) {
        throw new Error(result.message || "Failed to update supplier");
    }

    return result;
}

export async function deleteSupplier(id: string, token?: string) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json"
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${baseURL}/suppliers/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers
    });
    if (!res.ok) throw new Error("Failed to delete supplier");
    return res.json();
}
