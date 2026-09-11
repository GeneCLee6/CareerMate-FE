import {
    AVATAR_ACCEPT,
    MAX_AVATAR_BYTES,
    MAX_RESUME_BYTES,
    RESUME_ACCEPT,
    validateAvatarFile,
    validateResumeFile,
} from "./fileValidation";

/** `size` is faked so the tests don't have to allocate megabytes. */
function fileOf(name: string, type: string, size = 1024): File {
    const file = new File(["x"], name, { type });
    Object.defineProperty(file, "size", { value: size });
    return file;
}

describe("accept lists", () => {
    it("offers both the media type and the extension", () => {
        // Windows filters far faster on the extension, and some machines
        // report an empty type for a PDF.
        expect(RESUME_ACCEPT).toContain("application/pdf");
        expect(RESUME_ACCEPT).toContain(".pdf");
        expect(AVATAR_ACCEPT).toContain("image/png");
        expect(AVATAR_ACCEPT).toContain(".png");
    });
});

describe("validateResumeFile", () => {
    it("accepts a PDF", () => {
        expect(validateResumeFile(fileOf("cv.pdf", "application/pdf"))).toBeNull();
    });

    it("accepts a PDF whose type the system did not report", () => {
        expect(validateResumeFile(fileOf("cv.pdf", ""))).toBeNull();
    });

    it("accepts a PDF with an upper-case extension", () => {
        expect(validateResumeFile(fileOf("CV.PDF", ""))).toBeNull();
    });

    it("rejects a Word document", () => {
        expect(
            validateResumeFile(
                fileOf(
                    "cv.docx",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                )
            )
        ).toBe("Please choose a PDF file.");
    });

    it("rejects an unknown type with the wrong extension", () => {
        expect(validateResumeFile(fileOf("cv.txt", ""))).toBe(
            "Please choose a PDF file."
        );
    });

    it("rejects an empty file", () => {
        expect(validateResumeFile(fileOf("cv.pdf", "application/pdf", 0))).toBe(
            "That file is empty."
        );
    });

    it("rejects a file over the limit and says what the limit is", () => {
        const message = validateResumeFile(
            fileOf("cv.pdf", "application/pdf", MAX_RESUME_BYTES + 1)
        );
        expect(message).toContain("10 MB");
    });

    it("accepts a file exactly on the limit", () => {
        expect(
            validateResumeFile(
                fileOf("cv.pdf", "application/pdf", MAX_RESUME_BYTES)
            )
        ).toBeNull();
    });
});

describe("validateAvatarFile", () => {
    it.each(["image/jpeg", "image/png", "image/webp"])("accepts %s", (type) => {
        expect(validateAvatarFile(fileOf("me.img", type))).toBeNull();
    });

    it("rejects a PDF", () => {
        expect(validateAvatarFile(fileOf("me.pdf", "application/pdf"))).toBe(
            "Please choose a JPG, PNG or WebP image."
        );
    });

    it("rejects an image over the smaller avatar limit", () => {
        const message = validateAvatarFile(
            fileOf("me.png", "image/png", MAX_AVATAR_BYTES + 1)
        );
        expect(message).toContain("5 MB");
    });

    it("accepts an extension when the type is unknown", () => {
        expect(validateAvatarFile(fileOf("me.webp", ""))).toBeNull();
    });
});
