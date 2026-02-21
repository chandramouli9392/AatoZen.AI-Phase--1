export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ProgressEvent {
    status: string;
    progress: number;
    filename?: string;
    detail?: string;
}

export async function processVideo(
    clips: File[],
    prompt: string,
    onProgress: (event: ProgressEvent) => void,
    musicPrompt?: string,
    musicFile?: File
): Promise<Blob> {
    const formData = new FormData();
    clips.forEach((clip) => formData.append("clips", clip));
    formData.append("prompt", prompt);

    if (musicPrompt) {
        formData.append("music_prompt", musicPrompt);
    } else if (musicFile) {
        formData.append("music_file", musicFile);
    }

    const response = await fetch(`${API_BASE_URL}/process`, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        throw new Error("Connection failed");
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No reader available");

    const decoder = new TextDecoder();
    let blob: Blob | null = null;

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
            if (line.trim().startsWith("data: ")) {
                try {
                    const data: ProgressEvent = JSON.parse(line.replace("data: ", "").trim());
                    onProgress(data);

                    if (data.status === "Complete" && data.filename) {
                        const fileResponse = await fetch(`${API_BASE_URL}/download/${data.filename}`);
                        blob = await fileResponse.blob();
                    } else if (data.status === "Error") {
                        throw new Error(data.detail || "Processing failed");
                    }
                } catch (e) {
                    console.error("Error parsing progress event", e);
                }
            }
        }
    }

    if (!blob) throw new Error("Final video not received");
    return blob;
}
