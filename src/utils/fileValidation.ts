/**
 * Client-side mirrors of the backend's upload rules
 * (CareerMate-BE/src/upload/upload.validation.js), so a file that cannot
 * possibly be accepted is rejected before it is uploaded.
 */

export const MAX_RESUME_BYTES = 10 * 1024 * 1024;
export const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

const RESUME_TYPES = ["application/pdf"];
const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * File-dialog filters. Both the media type and the extension are listed on
 * purpose: Windows filters far faster on the extension, and a machine with no
 * registered handler for a type reports an empty `file.type`, which would
 * otherwise hide perfectly valid files.
 */
export const RESUME_ACCEPT = "application/pdf,.pdf";
export const AVATAR_ACCEPT =
    "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";

function formatMb(bytes: number): string {
    return `${Math.round(bytes / (1024 * 1024))} MB`;
}

function hasExtension(name: string, extensions: string[]): boolean {
    const lower = name.toLowerCase();
    return extensions.some((ext) => lower.endsWith(ext));
}

/**
 * Returns a message to show the user, or null when the file is fine.
 *
 * An empty `file.type` is treated as unknown rather than wrong: some systems
 * report nothing for a PDF, so the extension decides.
 */
export function validateResumeFile(file: File): string | null {
    const typeOk = file.type
        ? RESUME_TYPES.includes(file.type)
        : hasExtension(file.name, [".pdf"]);

    if (!typeOk) {
        return "Please choose a PDF file.";
    }
    if (file.size === 0) {
        return "That file is empty.";
    }
    if (file.size > MAX_RESUME_BYTES) {
        return `That file is ${formatMb(file.size)}. The limit is ${formatMb(
            MAX_RESUME_BYTES
        )}.`;
    }
    return null;
}

export function validateAvatarFile(file: File): string | null {
    const typeOk = file.type
        ? AVATAR_TYPES.includes(file.type)
        : hasExtension(file.name, [".jpg", ".jpeg", ".png", ".webp"]);

    if (!typeOk) {
        return "Please choose a JPG, PNG or WebP image.";
    }
    if (file.size === 0) {
        return "That file is empty.";
    }
    if (file.size > MAX_AVATAR_BYTES) {
        return `That image is ${formatMb(file.size)}. The limit is ${formatMb(
            MAX_AVATAR_BYTES
        )}.`;
    }
    return null;
}
