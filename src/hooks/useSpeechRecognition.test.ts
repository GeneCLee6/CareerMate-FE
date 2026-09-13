import { act, renderHook } from "@testing-library/react";
import {
    DICTATION_LANGUAGES,
    useSpeechRecognition,
} from "./useSpeechRecognition";

/** Stands in for the browser's SpeechRecognition, driven by the test. */
class FakeRecognition {
    static last: FakeRecognition | undefined;
    static started = 0;

    lang = "";
    continuous = false;
    interimResults = false;
    maxAlternatives = 0;
    stopped = false;
    aborted = false;

    onresult: ((event: unknown) => void) | null = null;
    onerror: ((event: { error: string }) => void) | null = null;
    onend: (() => void) | null = null;

    constructor() {
        FakeRecognition.last = this;
    }

    start() {
        FakeRecognition.started += 1;
    }
    stop() {
        this.stopped = true;
    }
    abort() {
        this.aborted = true;
    }

    /** Delivers a transcript the way the browser would. */
    say(transcript: string, isFinal = true) {
        const result = Object.assign([{ transcript }], { isFinal });
        this.onresult?.({ resultIndex: 0, results: [result] });
    }
}

const w = window as unknown as Record<string, unknown>;

beforeEach(() => {
    FakeRecognition.last = undefined;
    FakeRecognition.started = 0;
    w.SpeechRecognition = FakeRecognition;
    delete w.webkitSpeechRecognition;
});

afterEach(() => {
    delete w.SpeechRecognition;
    delete w.webkitSpeechRecognition;
});

describe("support detection", () => {
    it("reports supported when the API is present", () => {
        const { result } = renderHook(() => useSpeechRecognition(jest.fn()));
        expect(result.current.supported).toBe(true);
    });

    it("finds the prefixed name Chrome and Edge still use", () => {
        delete w.SpeechRecognition;
        w.webkitSpeechRecognition = FakeRecognition;

        const { result } = renderHook(() => useSpeechRecognition(jest.fn()));
        expect(result.current.supported).toBe(true);
    });

    it("reports unsupported when there is no API", () => {
        // Firefox. The caller hides the button rather than offering one that
        // does nothing when pressed.
        delete w.SpeechRecognition;
        const { result } = renderHook(() => useSpeechRecognition(jest.fn()));

        expect(result.current.supported).toBe(false);
    });

    it("does nothing when start is called without support", () => {
        delete w.SpeechRecognition;
        const { result } = renderHook(() => useSpeechRecognition(jest.fn()));

        act(() => result.current.start());
        expect(result.current.listening).toBe(false);
    });
});

describe("dictation", () => {
    it("hands the transcript to the caller", () => {
        const onTranscript = jest.fn();
        const { result } = renderHook(() => useSpeechRecognition(onTranscript));

        act(() => result.current.start());
        act(() => FakeRecognition.last!.say("tell me about my resume"));

        expect(onTranscript).toHaveBeenCalledWith("tell me about my resume");
    });

    it("ignores a transcript that is only whitespace", () => {
        const onTranscript = jest.fn();
        const { result } = renderHook(() => useSpeechRecognition(onTranscript));

        act(() => result.current.start());
        act(() => FakeRecognition.last!.say("   "));

        expect(onTranscript).not.toHaveBeenCalled();
    });

    it("keeps listening and shows words as they are heard", () => {
        // Both were originally off. Ending after one phrase meant a pause for
        // breath cut the sentence off, and hiding interim results meant
        // speaking into silence — together they made a working feature feel
        // broken.
        const { result } = renderHook(() => useSpeechRecognition(jest.fn()));
        act(() => result.current.start());

        expect(FakeRecognition.last!.continuous).toBe(true);
        expect(FakeRecognition.last!.interimResults).toBe(true);
    });

    it("exposes interim words without committing them", () => {
        const onTranscript = jest.fn();
        const { result } = renderHook(() => useSpeechRecognition(onTranscript));

        act(() => result.current.start());
        act(() => FakeRecognition.last!.say("how do I improve my", false));

        expect(result.current.interim).toBe("how do I improve my");
        expect(onTranscript).not.toHaveBeenCalled();
    });

    it("clears the interim text once the phrase is finalised", () => {
        const onTranscript = jest.fn();
        const { result } = renderHook(() => useSpeechRecognition(onTranscript));

        act(() => result.current.start());
        act(() => FakeRecognition.last!.say("how do I improve my", false));
        act(() => FakeRecognition.last!.say("how do I improve my resume"));

        expect(onTranscript).toHaveBeenCalledWith("how do I improve my resume");
        expect(result.current.interim).toBe("");
    });

    it("tracks whether it is listening", () => {
        const { result } = renderHook(() => useSpeechRecognition(jest.fn()));

        act(() => result.current.start());
        expect(result.current.listening).toBe(true);

        act(() => FakeRecognition.last!.onend?.());
        expect(result.current.listening).toBe(false);
    });

    it("stops when asked", () => {
        const { result } = renderHook(() => useSpeechRecognition(jest.fn()));

        act(() => result.current.start());
        act(() => result.current.stop());

        expect(FakeRecognition.last!.stopped).toBe(true);
        expect(result.current.listening).toBe(false);
    });
});

describe("errors", () => {
    it("explains a blocked microphone", () => {
        const { result } = renderHook(() => useSpeechRecognition(jest.fn()));

        act(() => result.current.start());
        act(() => FakeRecognition.last!.onerror?.({ error: "not-allowed" }));

        expect(result.current.error).toContain("Microphone access was blocked");
        expect(result.current.listening).toBe(false);
    });

    it("stays quiet when the user simply said nothing", () => {
        // "no-speech" and "aborted" are ordinary outcomes, not failures.
        const { result } = renderHook(() => useSpeechRecognition(jest.fn()));

        act(() => result.current.start());
        act(() => FakeRecognition.last!.onerror?.({ error: "no-speech" }));

        expect(result.current.error).toBeNull();
        expect(result.current.listening).toBe(false);
    });

    it("stays quiet when recognition was aborted", () => {
        const { result } = renderHook(() => useSpeechRecognition(jest.fn()));

        act(() => result.current.start());
        act(() => FakeRecognition.last!.onerror?.({ error: "aborted" }));

        expect(result.current.error).toBeNull();
    });
});

describe("cleanup", () => {
    it("closes the microphone when the component goes away", () => {
        // Leaving the page mid-sentence should not leave it listening.
        const { result, unmount } = renderHook(() =>
            useSpeechRecognition(jest.fn())
        );

        act(() => result.current.start());
        const recognition = FakeRecognition.last!;
        unmount();

        expect(recognition.aborted).toBe(true);
    });
});

describe("language", () => {
    it("tells the engine which language to expect", () => {
        // Recognition is not multilingual. Speaking Mandarin to an engine set
        // to English does not give poor Chinese, it gives confident nonsense —
        // which is what made the feature feel inaccurate.
        const { result } = renderHook(() => useSpeechRecognition(jest.fn()));

        act(() => result.current.setLanguage("zh-TW"));
        act(() => result.current.start());

        expect(FakeRecognition.last!.lang).toBe("zh-TW");
    });

    it("remembers the choice for next time", () => {
        const { result, unmount } = renderHook(() =>
            useSpeechRecognition(jest.fn())
        );
        act(() => result.current.setLanguage("zh-CN"));
        unmount();

        const { result: again } = renderHook(() =>
            useSpeechRecognition(jest.fn())
        );
        expect(again.current.language).toBe("zh-CN");
    });

    it("falls back to an offered language when storage is unreadable", () => {
        // A browser set to block site data throws on access.
        const getItem = jest
            .spyOn(Storage.prototype, "getItem")
            .mockImplementation(() => {
                throw new Error("blocked");
            });

        const { result } = renderHook(() => useSpeechRecognition(jest.fn()));
        expect(result.current.language).toBeTruthy();

        getItem.mockRestore();
    });

    it("ignores a stored value that is no longer offered", () => {
        // Asserted against the offered list rather than a fixed trio: the
        // list is now built from what the browser reports, so hard-coding
        // codes here would tie the test to one machine's settings.
        window.localStorage.setItem("careermate.dictationLanguage", "kl-GL");
        const { result } = renderHook(() => useSpeechRecognition(jest.fn()));

        const offered = DICTATION_LANGUAGES.map((l) => l.code);
        expect(offered).toContain(result.current.language);
    });
});
