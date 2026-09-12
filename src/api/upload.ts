import { ApiError } from "./client";

/**
 * PUTs a file to storage, reporting progress as it goes.
 *
 * This is `XMLHttpRequest` rather than `fetch` for one reason: fetch cannot
 * report upload progress. A request body stream would be needed, browser
 * support for it is partial, and it requires HTTP/2 — whereas `upload.onprogress`
 * has worked everywhere for years. A progress bar that only appears on fast
 * connections is worse than none.
 *
 * The call goes to S3, not to our API, so it does not use the shared client.
 */
export function putWithProgress(
    url: string,
    file: File,
    onProgress?: (fraction: number) => void
): Promise<void> {
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open("PUT", url);
        request.setRequestHeader("Content-Type", file.type);

        request.upload.onprogress = (event) => {
            // Without a Content-Length the browser cannot say how far along we
            // are; better to leave the bar where it is than to invent a number.
            if (!event.lengthComputable) return;
            onProgress?.(event.loaded / event.total);
        };

        request.onload = () => {
            if (request.status >= 200 && request.status < 300) {
                // The bar reaches the end only when the bytes are actually
                // accepted, not when the last chunk leaves the browser.
                onProgress?.(1);
                resolve();
                return;
            }
            reject(
                new ApiError("Upload failed. Please try again.", request.status)
            );
        };

        request.onerror = () => {
            // A blocked cross-origin request and a genuinely unreachable host
            // look identical from here. Reaching this after the API happily
            // issued the URL nearly always means the bucket has no CORS rule
            // for this origin, so say where to look.
            console.error(
                "Upload to storage failed before it got a response. The API " +
                    "issued the upload URL, so the bucket most likely has no " +
                    `CORS rule allowing PUT from ${window.location.origin}.`
            );
            reject(
                new ApiError(
                    "Could not reach file storage. Please try again.",
                    0,
                    true
                )
            );
        };

        request.onabort = () =>
            reject(new ApiError("Upload cancelled.", 0, true));

        request.send(file);
    });
}
