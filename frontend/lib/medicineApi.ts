const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type MedicineData = {
    name: string;
    description?: string;
    category?: string;
    price: number;
    costPrice: number;
    stock: number;
    [key: string]: any;
};

// Helper to handle API responses
async function handleResponse(res: Response) {
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || "An error occurred");
    }
    return data;
}

const getHeaders = (token?: string) => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
}

// Get all medicines
export async function getMedicines(token?: string) {
    try {
        const res = await fetch(`${baseURL}/medicines`, { headers: getHeaders(token) });
        return handleResponse(res);
    } catch (error: any) {
        throw new Error(error.message || "Failed to fetch medicines");
    }
}

// Get single medicine
export async function getMedicineById(id: string, token?: string) {
    try {
        const res = await fetch(`${baseURL}/medicines/${id}`, { headers: getHeaders(token) });
        return handleResponse(res);
    } catch (error: any) {
        throw new Error(error.message || "Failed to fetch medicine");
    }
}

// Create medicine
export async function createMedicine(data: MedicineData, token?: string) {
    try {
        const res = await fetch(`${baseURL}/medicines`, {
            method: "POST",
            headers: getHeaders(token),
            body: JSON.stringify(data)
        });
        return handleResponse(res);
    } catch (error: any) {
        const msg = error.message.includes("E11000") ? "Medicine already exists" : error.message;
        throw new Error(msg || "Failed to create medicine");
    }
}

// Update medicine
export async function updateMedicine(id: string, data: MedicineData, token?: string) {
    try {
        const res = await fetch(`${baseURL}/medicines/${id}`, {
            method: "PUT",
            headers: getHeaders(token),
            body: JSON.stringify(data)
        });
        return handleResponse(res);
    } catch (error: any) {
        throw new Error(error.message || "Failed to update medicine");
    }
}

// Delete medicine
export async function deleteMedicine(id: string, token?: string) {
    try {
        const res = await fetch(`${baseURL}/medicines/${id}`, {
            method: "DELETE",
            headers: getHeaders(token)
        });
        return handleResponse(res);
    } catch (error: any) {
        throw new Error(error.message || "Failed to delete medicine");
    }
}
