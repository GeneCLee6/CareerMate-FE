import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Dictation through the browser's own speech recognition.
 *
 * The Web Speech API rather than a service: it needs no key, costs nothing,
 * and the audio never reaches our servers — the browser does the recognition
 * and hands back text. The cost is support. Chrome and Edge have it; Firefox
 * does not. `supported` exists so the button can be hidden rather than
 * offered and then doing nothing when pressed.
 *
 * Text arrives in the input, not in the conversation. Recognition mishears
 * things, and sending automatically would send the mistakes too.
 */

/** The parts of the spec this hook uses. It is not in TypeScript's lib yet. */
interface SpeechRecognitionLike {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    start(): void;
    stop(): void;
    abort(): void;
    onresult: ((event: SpeechRecognitionEventLike) => void) | null;
    onerror: ((event: { error: string }) => void) | null;
    onend: (() => void) | null;
}

interface SpeechRecognitionEventLike {
    resultIndex: number;
    results: ArrayLike<
        ArrayLike<{ transcript: string }> & { isFinal: boolean }
    >;
}

type RecognitionConstructor = new () => SpeechRecognitionLike;

function getConstructor(): RecognitionConstructor | null {
    if (typeof window === "undefined") return null;
    const w = window as unknown as {
        SpeechRecognition?: RecognitionConstructor;
        webkitSpeechRecognition?: RecognitionConstructor;
    };
    // Chrome and Edge still only expose the prefixed name.
    return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export interface UseSpeechRecognition {
    /** False in browsers without the API — hide the control rather than fail. */
    supported: boolean;
    listening: boolean;
    /** Set when recognition fails in a way worth telling the user about. */
    error: string | null;
    start: () => void;
    stop: () => void;
}

export function useSpeechRecognition(
    onTranscript: (text: string) => void
): UseSpeechRecognition {
    const [supported] = useState(() => getConstructor() !== null);
    const [listening, setListening] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

    // Held in a ref so restarting recognition is not needed every time the
    // caller re-renders with a new closure.
    const onTranscriptRef = useRef(onTranscript);
    useEffect(() => {
        onTranscriptRef.current = onTranscript;
    }, [onTranscript]);

    const stop = useCallback(() => {
        recognitionRef.current?.stop();
        setListening(false);
    }, []);

    const start = useCallback(() => {
        const Recognition = getConstructor();
        if (!Recognition) return;

        setError(null);
        const recognition = new Recognition();
        recognition.lang = navigator.language || "en-AU";
        // One utterance at a time, finalised: interim results would rewrite
        // the input on every syllable while the user watches.
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = (event) => {
            let text = "";
            for (let i = event.resultIndex; i < event.results.length; i += 1) {
                const result = event.results[i];
                if (result.isFinal) {
                    text += result[0].transcript;
                }
            }
            if (text.trim()) {
                onTranscriptRef.current(text.trim());
            }
        };

        recognition.onerror = (event) => {
            // "aborted" and "no-speech" are ordinary — the user stopped, or
            // said nothing. Neither deserves an error message.
            if (event.error === "aborted" || event.error === "no-speech") {
                setListening(false);
                return;
            }
            setError(
                event.error === "not-allowed"
                    ? "Microphone access was blocked. Allow it in your browser settings to dictate."
                    : "Could not hear you. Please try again."
            );
            setListening(false);
        };

        recognition.onend = () => setListening(false);

        recognitionRef.current = recognition;
        try {
            recognition.start();
            setListening(true);
        } catch {
            // start() throws if called while already running.
            setListening(false);
        }
    }, []);

    // Leaving the page mid-sentence should not leave the microphone open.
    useEffect(() => () => recognitionRef.current?.abort(), []);

    return { supported, listening, error, start, stop };
}
