import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Dictation through the browser's own speech recognition.
 *
 * The Web Speech API rather than a service: it needs no key, costs nothing,
 * and the audio never reaches our servers. In Chrome and Edge the recognition
 * itself runs on Google's servers — the same class of engine behind the voice
 * input in a messaging app — so accuracy is mostly a question of **telling it
 * the right language** and letting the speaker see what it is hearing.
 *
 * Firefox has no implementation at all, which is what `supported` is for.
 */

/** The parts of the spec this hook uses. It is not in TypeScript's lib yet. */
interface SpeechRecognitionLike {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    maxAlternatives: number;
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

export interface DictationLanguage {
    code: string;
    label: string;
}

/**
 * Offered languages.
 *
 * Recognition is not multilingual: the engine is told one language and hears
 * everything as that language. Speaking Mandarin to an engine set to English
 * does not produce poor Chinese, it produces confident nonsense — which is
 * what made this feel broken.
 */
export const DICTATION_LANGUAGES: DictationLanguage[] = [
    { code: "en-AU", label: "English (AU)" },
    { code: "zh-TW", label: "中文（繁體）" },
    { code: "zh-CN", label: "中文（简体）" },
];

const STORAGE_KEY = "careermate.dictationLanguage";

function getConstructor(): RecognitionConstructor | null {
    if (typeof window === "undefined") return null;
    const w = window as unknown as {
        SpeechRecognition?: RecognitionConstructor;
        webkitSpeechRecognition?: RecognitionConstructor;
    };
    // Chrome and Edge still only expose the prefixed name.
    return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** Last choice, or the closest offered match for the browser's own language. */
function initialLanguage(): string {
    try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved && DICTATION_LANGUAGES.some((l) => l.code === saved)) {
            return saved;
        }
    } catch {
        // A browser set to block site data throws on access.
    }

    const browser = (navigator.language || "").toLowerCase();
    const match = DICTATION_LANGUAGES.find((l) =>
        browser.startsWith(l.code.slice(0, 2).toLowerCase())
    );
    return match?.code ?? DICTATION_LANGUAGES[0].code;
}

export interface UseSpeechRecognition {
    /** False in browsers without the API — hide the control rather than fail. */
    supported: boolean;
    listening: boolean;
    /** Set when recognition fails in a way worth telling the user about. */
    error: string | null;
    /** What is being heard right now, before it is finalised. */
    interim: string;
    language: string;
    setLanguage: (code: string) => void;
    start: () => void;
    stop: () => void;
}

export function useSpeechRecognition(
    onTranscript: (text: string) => void
): UseSpeechRecognition {
    const [supported] = useState(() => getConstructor() !== null);
    const [listening, setListening] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [interim, setInterim] = useState("");
    const [language, setLanguageState] = useState(initialLanguage);

    const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
    // Kept in refs so changing either does not mean restarting recognition
    // mid-sentence.
    const onTranscriptRef = useRef(onTranscript);
    const languageRef = useRef(language);

    useEffect(() => {
        onTranscriptRef.current = onTranscript;
    }, [onTranscript]);

    const setLanguage = useCallback((code: string) => {
        languageRef.current = code;
        setLanguageState(code);
        try {
            window.localStorage.setItem(STORAGE_KEY, code);
        } catch {
            // Not being able to remember the choice is not worth failing over.
        }
    }, []);

    const stop = useCallback(() => {
        recognitionRef.current?.stop();
        setListening(false);
        setInterim("");
    }, []);

    const start = useCallback(() => {
        const Recognition = getConstructor();
        if (!Recognition) return;

        setError(null);
        setInterim("");

        const recognition = new Recognition();
        recognition.lang = languageRef.current;
        // Keep listening until stopped. Ending after one phrase meant a pause
        // for breath cut the sentence off, which reads as the feature being
        // broken rather than as the microphone doing what it was told.
        recognition.continuous = true;
        // Show words as they are heard. Without this the speaker talks into
        // silence and only finds out at the end whether it understood — and a
        // wrong language looks identical to a broken microphone.
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event) => {
            let finalText = "";
            let pending = "";

            for (let i = event.resultIndex; i < event.results.length; i += 1) {
                const result = event.results[i];
                const transcript = result[0].transcript;
                if (result.isFinal) {
                    finalText += transcript;
                } else {
                    pending += transcript;
                }
            }

            setInterim(pending);
            if (finalText.trim()) {
                onTranscriptRef.current(finalText.trim());
            }
        };

        recognition.onerror = (event) => {
            // "aborted" and "no-speech" are ordinary — the user stopped, or
            // said nothing. Neither deserves an error message.
            if (event.error === "aborted" || event.error === "no-speech") {
                setListening(false);
                setInterim("");
                return;
            }
            setError(
                event.error === "not-allowed"
                    ? "Microphone access was blocked. Allow it in your browser settings to dictate."
                    : "Could not hear you. Please try again."
            );
            setListening(false);
            setInterim("");
        };

        recognition.onend = () => {
            setListening(false);
            setInterim("");
        };

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

    return {
        supported,
        listening,
        error,
        interim,
        language,
        setLanguage,
        start,
        stop,
    };
}
