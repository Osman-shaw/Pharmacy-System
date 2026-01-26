const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const API_URL = `${baseURL}/prescriptions`;

export interface Prescription {
    _id: string;
    patient: {
        _id: string;
        name: string;
        phone?: string;
        email?: string;
    };
    patientName: string;
    writtenDate: string;
    issuedDate?: string;
    doctor: {
        name: string;
        license: string;
        contact?: string;
        facility?: string;
    };
    status: 'Pending' | 'Filled' | 'Cancelled' | 'Expired';
    notes?: string;
    audioNotes?: {
        krioText: string;
        englishText: string;
        audioUrl?: string;
    };
    medications: {
        medicine?: {
            _id: string;
            name: string;
            price: number;
            stock: number;
        };
        medicineName: string;
        dosage: string;
        quantity: number;
        instructions: string;
        duration?: string;
    }[];
    createdBy?: {
        username: string;
    };
    createdAt: string;
}

export interface CreatePrescriptionData {
    patient: string; // Customer ID
    patientName: string;
    doctor: {
        name: string;
        license: string;
        contact?: string;
        facility?: string;
    };
    writtenDate: string;
    notes?: string;
    audioNotes?: {
        krioText: string;
        englishText: string;
    };
    medications: {
        medicine?: string; // Product ID
        medicineName: string;
        dosage: string;
        quantity: number;
        instructions: string;
        duration?: string;
    }[];
    status?: string;
}

export async function getPrescriptions(token: string, page = 1, status?: string) {
    let url = `${API_URL}?page=${page}`;
    if (status) url += `&status=${status}`;

    const res = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) throw new Error("Failed to fetch prescriptions");
    return res.json();
}

export async function getPrescriptionById(token: string, id: string) {
    const res = await fetch(`${API_URL}/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) throw new Error("Failed to fetch prescription");
    return res.json();
}

export async function createPrescription(token: string, data: CreatePrescriptionData) {
    const res = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create prescription");
    }
    return res.json();
}

export async function updatePrescription(token: string, id: string, data: Partial<CreatePrescriptionData>) {
    const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update prescription");
    }
    return res.json();
}

export async function deletePrescription(token: string, id: string) {
    const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) throw new Error("Failed to delete prescription");
    return res.json();
}
