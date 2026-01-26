const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function transcribeAudio(audioBlob: Blob, token?: string) {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'prescription_note.webm');

    const headers: Record<string, string> = {};
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${baseURL}/ai/transcribe`, {
        method: "POST",
        headers,
        credentials: "include",
        body: formData
    });

    if (!res.ok) throw new Error("Transcription failed");
    return res.json();
}
