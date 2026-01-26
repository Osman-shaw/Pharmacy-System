// HR API client for MongoDB backend
const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Fetch all employees
export async function getEmployees(token?: string, query?: any) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json"
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    let url = `${baseURL}/hr/employees`;
    if (query) {
        const params = new URLSearchParams(query);
        url += `?${params.toString()}`;
    }

    const res = await fetch(url, {
        credentials: "include",
        headers
    });
    if (!res.ok) throw new Error("Failed to fetch employees");
    return res.json();
}

// Fetch a single employee by ID
export async function getEmployee(id: string, token?: string) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json"
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${baseURL}/hr/employees/${id}`, {
        credentials: "include",
        headers
    });
    if (!res.ok) throw new Error("Failed to fetch employee");
    return res.json();
}

// Fetch a single designation by ID
export async function getDesignation(id: string, token?: string) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json"
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${baseURL}/hr/designations/${id}`, {
        credentials: "include",
        headers
    });
    if (!res.ok) throw new Error("Failed to fetch designation");
    return res.json();
}

// Fetch all designations
export async function getDesignations(token?: string) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json"
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${baseURL}/hr/designations`, {
        credentials: "include",
        headers
    });
    if (!res.ok) throw new Error("Failed to fetch designations");
    return res.json();
}

// Fetch attendance
export async function getAttendance(token?: string, query?: any) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json"
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    let url = `${baseURL}/hr/attendance`;
    if (query) {
        const params = new URLSearchParams(query);
        url += `?${params.toString()}`;
    }

    const res = await fetch(url, {
        credentials: "include",
        headers
    });
    if (!res.ok) throw new Error("Failed to fetch attendance");
    return res.json();
}

// Check in
export async function checkIn(data: { employee?: string; date?: string }, token?: string) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json"
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${baseURL}/hr/attendance/check-in`, {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to check in");
    return res.json();
}

// Check out
export async function checkOut(data: { employee?: string; date?: string; breakDuration?: number }, token?: string) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json"
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${baseURL}/hr/attendance/check-out`, {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to check out");
    return res.json();
}

// Fetch all payrolls
export async function getPayrolls(token?: string, query?: any) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json"
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    let url = `${baseURL}/hr/payroll`;
    if (query) {
        const params = new URLSearchParams(query);
        url += `?${params.toString()}`;
    }

    const res = await fetch(url, {
        credentials: "include",
        headers
    });
    if (!res.ok) throw new Error("Failed to fetch payrolls");
    return res.json();
}

// Create payroll
export async function createPayroll(data: any, token?: string) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json"
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${baseURL}/hr/payroll`, {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to create payroll");
    return res.json();
}

// Create employee
export async function createEmployee(data: any, token?: string) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json"
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${baseURL}/hr/employees`, {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to create employee");
    return res.json();
}

// Update employee
export async function updateEmployee(id: string, data: any, token?: string) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json"
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${baseURL}/hr/employees/${id}`, {
        method: "PUT",
        credentials: "include",
        headers,
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to update employee");
    return res.json();
}

// Delete employee
export async function deleteEmployee(id: string, token?: string) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json"
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${baseURL}/hr/employees/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers
    });
    if (!res.ok) throw new Error("Failed to delete employee");
    return res.json();
}

// Create designation
export async function createDesignation(data: any, token?: string) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json"
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${baseURL}/hr/designations`, {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to create designation");
    return res.json();
}

// Update designation
export async function updateDesignation(id: string, data: any, token?: string) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json"
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${baseURL}/hr/designations/${id}`, {
        method: "PUT",
        credentials: "include",
        headers,
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to update designation");
    return res.json();
}

// Delete designation
export async function deleteDesignation(id: string, token?: string) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json"
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${baseURL}/hr/designations/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers
    });
    if (!res.ok) throw new Error("Failed to delete designation");
    return res.json();
}
