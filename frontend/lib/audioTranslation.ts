/**
 * Audio Translation Utilities
 * 
 * Handles Web Speech API integration for speech-to-text
 */

export interface TranslationResult {
    krioText: string;
    englishText: string; // For now will be same as Krio until translation API is added
    audioUrl?: string;
}

export class AudioRecorder {
    private recognition: any;
    private isRecording: boolean = false;
    private transcript: string = '';

    constructor() {
        if (typeof window !== 'undefined') {
            // @ts-ignore
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                this.recognition = new SpeechRecognition();
                this.recognition.continuous = true;
                this.recognition.interimResults = true;
                this.recognition.lang = 'en-GB'; // Closest to Krio for now, or use 'en-SL' if supported
            }
        }
    }

    start(onResult: (text: string) => void, onError: (error: any) => void) {
        if (!this.recognition) {
            onError('Speech recognition not supported in this browser');
            return;
        }

        this.isRecording = true;
        this.transcript = '';

        this.recognition.onresult = (event: any) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            this.transcript = finalTranscript || interimTranscript;
            onResult(this.transcript);
        };

        this.recognition.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            onError(event.error);
        };

        try {
            this.recognition.start();
        } catch (e) {
            console.error('Error starting recognition:', e);
        }
    }

    stop() {
        if (this.recognition && this.isRecording) {
            this.recognition.stop();
            this.isRecording = false;
        }
    }
}

// Simulated Krio to English translation (placeholder for real API)
export async function translateKrioToEnglish(text: string): Promise<string> {
    // In a real implementation, this would call Google Translate API or LibreTranslate
    // For now, we'll return the text as-is or mock a translation if needed
    return new Promise((resolve) => {
        setTimeout(() => {
            // Basic dictionary replacement for demo
            let translated = text.replace(/\bwi\b/gi, "we")
                .replace(/\bde\b/gi, "is")
                .replace(/\bna\b/gi, "is")
                .replace(/\bnoto\b/gi, "is not")
                .replace(/\bboku\b/gi, "many");
            resolve(translated);
        }, 500);
    });
}
