"use client"

import React from "react"
import { useState, useEffect, useRef } from "react"
import { Mic, MicOff, Loader2, Volume2, Languages } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AudioRecorder, translateKrioToEnglish } from "@/lib/audioTranslation"
import { toast } from "sonner"

interface AudioAssistantProps {
    onTranscriptionComplete: (krio: string, english: string) => void
    initialKrio?: string
    initialEnglish?: string
}

export function AudioAssistant({ onTranscriptionComplete, initialKrio, initialEnglish }: AudioAssistantProps) {
    const [isRecording, setIsRecording] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [krioText, setKrioText] = useState(initialKrio || "")
    const [englishText, setEnglishText] = useState(initialEnglish || "")

    const recorderRef = useRef<AudioRecorder | null>(null)

    useEffect(() => {
        recorderRef.current = new AudioRecorder()
        return () => {
            if (recorderRef.current) {
                recorderRef.current.stop()
            }
        }
    }, [])

    const toggleRecording = () => {
        if (isRecording) {
            stopRecording()
        } else {
            startRecording()
        }
    }

    const startRecording = () => {
        setIsRecording(true)
        setKrioText("")
        setEnglishText("")

        recorderRef.current?.start(
            (text) => {
                setKrioText(text)
            },
            (error) => {
                console.error("Recording error:", error)
                toast.error("Error recording audio")
                stopRecording()
            }
        )
    }

    const stopRecording = async () => {
        setIsRecording(false)
        recorderRef.current?.stop()

        if (krioText.trim()) {
            await processTranslation(krioText)
        }
    }

    const processTranslation = async (text: string) => {
        setIsProcessing(true)
        try {
            const translated = await translateKrioToEnglish(text)
            setEnglishText(translated)
            onTranscriptionComplete(text, translated)
            toast.success("Transcription complete")
        } catch (error) {
            console.error("Translation error:", error)
            toast.error("Failed to translate text")
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <Card className="bg-slate-50 border-slate-200">
            <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-full ${isRecording ? 'bg-red-100 animate-pulse' : 'bg-blue-100'}`}>
                            {isRecording ? (
                                <Mic className="h-5 w-5 text-red-600" />
                            ) : (
                                <MicOff className="h-5 w-5 text-blue-600" />
                            )}
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm">AI Audio Assistant</h3>
                            <p className="text-xs text-muted-foreground">
                                {isRecording ? "Listening (Speaking Krio)..." : "Click mic to record notes"}
                            </p>
                        </div>
                    </div>

                    <Button
                        variant={isRecording ? "destructive" : "default"}
                        size="sm"
                        onClick={toggleRecording}
                        className="gap-2"
                        type="button" // Important preventing form submission
                    >
                        {isRecording ? "Stop Recording" : "Start Recording"}
                    </Button>
                </div>

                {(krioText || englishText) && (
                    <div className="grid gap-3 md:grid-cols-2 pt-2">
                        <div className="bg-white p-3 rounded-md border text-sm">
                            <div className="flex items-center gap-2 mb-1 text-xs font-medium text-slate-500">
                                <Volume2 className="h-3 w-3" />
                                <span>Krio Transcript</span>
                            </div>
                            <p className="text-slate-800 italic">{krioText || "Waiting for speech..."}</p>
                        </div>

                        <div className="bg-emerald-50 p-3 rounded-md border border-emerald-100 text-sm">
                            <div className="flex items-center gap-2 mb-1 text-xs font-medium text-emerald-600">
                                <Languages className="h-3 w-3" />
                                <span>English Translation</span>
                            </div>
                            {isProcessing ? (
                                <div className="flex items-center gap-2 text-emerald-700">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    <span>Translating...</span>
                                </div>
                            ) : (
                                <p className="text-emerald-900">{englishText || "Translation will appear here"}</p>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
