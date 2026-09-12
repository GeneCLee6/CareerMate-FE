import {
    MAX_ATTACHMENT_BYTES,
    mediaTypeOf,
    toBase64,
    validateAttachment,
} from "./attachments";

/** A File of a given size without allocating the bytes twice. */
function fileOf(name: string, type: string, size = 1024): File {
    const file = new File(["x"], name, { type });
    Object.defineProperty(file, "size", { value: size });
    return file;
}

describe("mediaTypeOf", () => {
    it("uses the type the browser reports", () => {
        expect(mediaTypeOf(fileOf("a.png", "image/png"))).toBe("image/png");
    });

    it("falls back to the extension when there is no type", () => {
        // Some systems report an empty type for a perfectly valid file.
        expect(mediaTypeOf(fileOf("cv.pdf", ""))).toBe("application/pdf");
        expect(mediaTypeOf(fileOf("shot.JPEG", ""))).toBe("image/jpeg");
    });

    it("gives nothing for an unknown extension", () => {
        expect(mediaTypeOf(fileOf("notes.xyz", ""))).toBe("");
    });
});

describe("validateAttachment", () => {
    it("accepts the supported image types", () => {
        for (const type of ["image/png", "image/jpeg", "image/webp", "image/gif"]) {
            expect(validateAttachment(fileOf("a", type))).toBeNull();
        }
    });

    it("accepts a PDF", () => {
        expect(validateAttachment(fileOf("cv.pdf", "application/pdf"))).toBeNull();
    });

    it("refuses anything else, naming the file", () => {
        const problem = validateAttachment(fileOf("code.zip", "application/zip"));
        expect(problem).toContain("code.zip");
        expect(problem).toContain("not a supported type");
    });

    it("refuses a file over the size limit", () => {
        const problem = validateAttachment(
            fileOf("big.png", "image/png", MAX_ATTACHMENT_BYTES + 1)
        );
        expect(problem).toContain("big.png");
        expect(problem).toContain("larger than 5MB");
    });

    it("accepts a file exactly at the limit", () => {
        expect(
            validateAttachment(fileOf("edge.png", "image/png", MAX_ATTACHMENT_BYTES))
        ).toBeNull();
    });

    it("still accepts a PDF whose type the browser did not report", () => {
        expect(validateAttachment(fileOf("cv.pdf", ""))).toBeNull();
    });
});

describe("toBase64", () => {
    it("strips the data: prefix the API does not want", async () => {
        const file = new File(["hello"], "a.txt", { type: "text/plain" });
        const encoded = await toBase64(file);

        expect(encoded).not.toContain("data:");
        expect(encoded).not.toContain(",");
        expect(Buffer.from(encoded, "base64").toString()).toBe("hello");
    });
});
