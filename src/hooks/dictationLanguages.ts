export interface DictationLanguage {
    code: string;
    label: string;
}

/**
 * Which languages the dictation picker offers.
 *
 * The list was hard-coded to English and two Chinese variants, which is a
 * guess about who is using the product. The browser already knows better:
 * `navigator.languages` is the ordered list the user configured in their
 * browser or operating system, and it is the closest thing to an answer we
 * have without asking.
 *
 * So the offered list is: the languages the browser reports, in its order,
 * followed by a few common ones so somebody who speaks a second language is
 * not stuck with the setting on their machine. Duplicates are removed and the
 * browser's own choices stay first.
 *
 * Labels come from `Intl.DisplayNames`, so each language is named **in
 * itself** — 中文, Español, Tiếng Việt — rather than in English. Someone
 * looking for their own language scans for the word they would write, not the
 * English name for it.
 */

/** Offered after the browser's own, so a second language is reachable. */
const COMMON = [
    "en-AU",
    "en-US",
    "en-GB",
    "zh-TW",
    "zh-CN",
    "yue-Hant-HK",
    "ja-JP",
    "ko-KR",
    "es-ES",
    "fr-FR",
    "de-DE",
    "hi-IN",
    "vi-VN",
    "th-TH",
    "id-ID",
    "pt-BR",
    "ru-RU",
    "ar-SA",
];

/**
 * A bare "en" or "zh" is ambiguous to a recogniser, which wants a region.
 * These are the defaults for the languages where it matters most here.
 */
const REGION_FOR_BARE_TAG: Record<string, string> = {
    en: "en-AU",
    zh: "zh-TW",
    yue: "yue-Hant-HK",
    ja: "ja-JP",
    ko: "ko-KR",
    es: "es-ES",
    fr: "fr-FR",
    de: "de-DE",
    pt: "pt-BR",
    vi: "vi-VN",
    th: "th-TH",
    id: "id-ID",
    hi: "hi-IN",
    ru: "ru-RU",
    ar: "ar-SA",
};

function withRegion(tag: string): string {
    if (tag.includes("-")) return tag;
    return REGION_FOR_BARE_TAG[tag.toLowerCase()] ?? tag;
}

/** Names a language in its own language, falling back to the tag itself. */
function labelFor(code: string): string {
    try {
        const inItself = new Intl.DisplayNames([code], { type: "language" });
        const name = inItself.of(code);
        if (!name || name === code) return code;

        // Distinguish variants that share a name — "English" three times over
        // is not a choice anyone can make.
        const region = code.split("-").pop();
        const sameLanguage = COMMON.filter(
            (c) => c.split("-")[0] === code.split("-")[0]
        ).length;
        if (sameLanguage > 1 && region && region.length === 2) {
            try {
                const regionName = new Intl.DisplayNames([code], {
                    type: "region",
                }).of(region);
                if (regionName) return `${name} (${regionName})`;
            } catch {
                // Region names are optional decoration.
            }
        }
        return name;
    } catch {
        // Intl.DisplayNames is missing, or the tag is not one it knows.
        return code;
    }
}

/** What the browser says the user speaks, most preferred first. */
function browserLanguages(): string[] {
    const reported =
        typeof navigator === "undefined"
            ? []
            : [...(navigator.languages ?? []), navigator.language].filter(
                  Boolean
              );
    return reported.map(withRegion);
}

export function buildDictationLanguages(): DictationLanguage[] {
    const ordered = [...browserLanguages(), ...COMMON];

    const seen = new Set<string>();
    const languages: DictationLanguage[] = [];
    for (const code of ordered) {
        const key = code.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        languages.push({ code, label: labelFor(code) });
    }
    return languages;
}

/** The one to start on: whatever the browser prefers, else the first offered. */
export function defaultDictationLanguage(
    languages: DictationLanguage[]
): string {
    return browserLanguages()[0] ?? languages[0]?.code ?? "en-AU";
}
