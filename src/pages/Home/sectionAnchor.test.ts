import { sectionAnchor } from "./sectionAnchor";

describe("sectionAnchor", () => {
    it("stays a plain fragment on the landing page", () => {
        // Same-page jump; no navigation needed.
        expect(sectionAnchor("/", "features")).toBe("#features");
    });

    it("carries the path from anywhere else", () => {
        // "#features" on /privacy points at a section that is not on the
        // page — a dead link of exactly the kind those pages were added to
        // remove.
        expect(sectionAnchor("/privacy", "features")).toBe("/#features");
        expect(sectionAnchor("/terms", "contact")).toBe("/#contact");
    });
});
