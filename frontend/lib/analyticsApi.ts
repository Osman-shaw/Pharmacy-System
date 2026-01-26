const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getHeaders = (token?: string) => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
}

export async function getHeatmap(token?: string) {
    const res = await fetch(`${baseURL}/analytics/heatmap`, { headers: getHeaders(token) });
    if (!res.ok) throw new Error("Failed to fetch heatmap");
    return res.json();
}

export async function getVelocity(token?: string) {
    const res = await fetch(`${baseURL}/analytics/velocity`, { headers: getHeaders(token) });
    if (!res.ok) throw new Error("Failed to fetch velocity");
    return res.json();
}

export async function getTopSellers(token?: string, limit = 50) {
    const res = await fetch(`${baseURL}/analytics/top-sellers?limit=${limit}`, { headers: getHeaders(token) });
    if (!res.ok) throw new Error("Failed to fetch top sellers");
    return res.json();
}

export async function getMargins(token?: string) {
    const res = await fetch(`${baseURL}/analytics/margins`, { headers: getHeaders(token) });
    if (!res.ok) throw new Error("Failed to fetch margins");
    return res.json();
}

export async function getStockVelocity(token?: string) {
    const res = await fetch(`${baseURL}/analytics/stock-velocity`, { headers: getHeaders(token) });
    if (!res.ok) throw new Error("Failed to fetch stock velocity");
    return res.json();
}

export async function getPurchaseSalesRatio(token?: string) {
    const res = await fetch(`${baseURL}/analytics/purchase-ratio`, { headers: getHeaders(token) });
    if (!res.ok) throw new Error("Failed to fetch ratios");
    return res.json();
}

export async function getBasketAnalysis(token?: string) {
    const res = await fetch(`${baseURL}/analytics/basket`, { headers: getHeaders(token) });
    if (!res.ok) throw new Error("Failed to fetch basket analysis");
    return res.json();
}

export async function getCustomerBehavior(token?: string) {
    const res = await fetch(`${baseURL}/analytics/customer-behavior`, { headers: getHeaders(token) });
    if (!res.ok) throw new Error("Failed to fetch behavior");
    return res.json();
}

export async function getPerformance(token?: string) {
    const res = await fetch(`${baseURL}/analytics/performance`, { headers: getHeaders(token) });
    if (!res.ok) throw new Error("Failed to fetch performance");
    return res.json();
}
