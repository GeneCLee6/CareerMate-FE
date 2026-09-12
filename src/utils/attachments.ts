/**
 * Files a chat message may carry. Mirrors
 * `CareerMate-BE/src/chat/attachments.js` — the backend enforces these, and
 * repeating them here only moves the rejection earlier, to before a 5MB file
 * has been read and encoded.
 */

export const MAX_ATTACHMENTS = 3;
export const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const DOCUMENT_TYPES = ["application/pdf"];

/** What the file picker offers. Extensions as well as types, because some
 *  systems report an empty `file.type` and would hide valid files. */
export const ATTACHMENT_ACCEPT =
    "image/jpeg,image/png,image/webp,image/gif,application/pdf,.jpg,.jpeg,.png,.webp,.gif,.pdf";

export interface PendingAttachment {
    /** Stable within a session; used as a React key and to remove one. */
    id: string;
    file: File;
    fileName: string;
    mediaType: string;
    kind: "image" | "document";
    /** Object URL for the thumbnail; only set for images. */
    previewUrl?: string;
}

const EXTENSION_TYPES: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    pdf: "application/pdf",
};

/** Falls back to the extension, as some systems report no type at all. */
export function mediaTypeOf(file: File): string {
    if (file.type) return file.type;
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    return EXTENSION_TYPES[extension] ?? "";
}

export function validateAttachment(file: File): string | null {
    const mediaType = mediaTypeOf(file);

    if (![...IMAGE_TYPES, ...DOCUMENT_TYPES].includes(mediaType)) {
        return `${file.name} is not a supported type. Attach a PNG, JPEG, WebP, GIF, or PDF.`;
    }
    if (file.size > MAX_ATTACHMENT_BYTES) {
        return `${file.name} is larger than ${MAX_ATTACHMENT_BYTES / (1024 * 1024)}MB.`;
    }
    return null;
}

/** Reads a file as base64, without the `data:` prefix the API does not want. */
export function toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = String(reader.result);
            const comma = result.indexOf(",");
            resolve(comma >= 0 ? result.slice(comma + 1) : result);
        };
        reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
        reader.readAsDataURL(file);
    });
}
