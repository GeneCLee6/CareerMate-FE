import {
    buildDictationLanguages,
    defaultDictationLanguage,
} from "./dictationLanguages";

/** Replaces what the browser reports the user speaks. */
function setBrowserLanguages(languages: string[]) {
    Object.defineProperty(navigator, "languages", {
        value: languages,
        configurable: true,
    });
    Object.defineProperty(navigator, "language", {
        value: languages[0],
        configurable: true,
    });
}

describe("buildDictationLanguages", () => {
    it("puts the browser's own languages first, in its order", () => {
        // The whole point: the list should reflect this user, not a guess
        // made when the feature was written.
        setBrowserLanguages(["ja-JP", "ko-KR"]);
        const codes = buildDictationLanguages().map((l) => l.code);

        expect(codes[0]).toBe("ja-JP");
        expect(codes[1]).toBe("ko-KR");
    });

    it("still offers common languages after them", () => {
        setBrowserLanguages(["ja-JP"]);
        const codes = buildDictationLanguages().map((l) => l.code);

        // Someone who speaks a second language should not be stuck with
        // whatever their machine is set to.
        expect(codes).toContain("en-AU");
        expect(codes).toContain("zh-TW");
    });

    it("lists nothing twice", () => {
        setBrowserLanguages(["en-AU", "zh-TW"]);
        const codes = buildDictationLanguages().map((l) => l.code);

        expect(new Set(codes).size).toBe(codes.length);
    });

    it("gives a bare tag a region, which a recogniser needs", () => {
        // "zh" alone does not tell the engine which Chinese to expect.
        setBrowserLanguages(["zh"]);
        const codes = buildDictationLanguages().map((l) => l.code);

        expect(codes[0]).toBe("zh-TW");
        expect(codes).not.toContain("zh");
    });

    it("names each language in itself, not in English", () => {
        // Someone looking for their own language scans for the word they
        // would write.
        setBrowserLanguages(["en-AU"]);
        const languages = buildDictationLanguages();

        const chinese = languages.find((l) => l.code === "zh-TW");
        expect(chinese?.label).toMatch(/中文/);

        const japanese = languages.find((l) => l.code === "ja-JP");
        expect(japanese?.label).toMatch(/日本語/);
    });

    it("distinguishes variants that would otherwise share a name", () => {
        setBrowserLanguages(["en-AU"]);
        const languages = buildDictationLanguages();

        const english = languages.filter((l) => l.code.startsWith("en-"));
        expect(english.length).toBeGreaterThan(1);
        // Three entries all reading "English" would be an impossible choice.
        expect(new Set(english.map((l) => l.label)).size).toBe(english.length);
    });

    it("copes with a browser that reports nothing", () => {
        setBrowserLanguages([]);
        Object.defineProperty(navigator, "language", {
            value: "",
            configurable: true,
        });

        const languages = buildDictationLanguages();
        expect(languages.length).toBeGreaterThan(0);
    });
});

describe("defaultDictationLanguage", () => {
    it("starts on what the browser prefers", () => {
        setBrowserLanguages(["ko-KR", "en-AU"]);
        const languages = buildDictationLanguages();

        expect(defaultDictationLanguage(languages)).toBe("ko-KR");
    });

    it("falls back to the first offered when the browser says nothing", () => {
        setBrowserLanguages([]);
        Object.defineProperty(navigator, "language", {
            value: "",
            configurable: true,
        });
        const languages = buildDictationLanguages();

        expect(defaultDictationLanguage(languages)).toBe(languages[0].code);
    });
});
