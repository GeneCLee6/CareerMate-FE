import { putWithProgress } from "./upload";
import { ApiError } from "./client";

/** A stand-in for XMLHttpRequest that the test drives by hand. */
class FakeXhr {
    static last: FakeXhr;

    status = 200;
    method = "";
    url = "";
    headers: Record<string, string> = {};
    sent: unknown = null;

    upload = { onprogress: null as ((e: ProgressEvent) => void) | null };
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    onabort: (() => void) | null = null;

    constructor() {
        FakeXhr.last = this;
    }

    open(method: string, url: string) {
        this.method = method;
        this.url = url;
    }

    setRequestHeader(key: string, value: string) {
        this.headers[key] = value;
    }

    send(body: unknown) {
        this.sent = body;
    }

    /** Fires a progress event as the browser would. */
    progress(loaded: number, total: number, lengthComputable = true) {
        this.upload.onprogress?.({
            loaded,
            total,
            lengthComputable,
        } as ProgressEvent);
    }

    finish(status: number) {
        this.status = status;
        this.onload?.();
    }
}

const file = new File(["hello"], "cv.pdf", { type: "application/pdf" });

beforeEach(() => {
    (global as unknown as { XMLHttpRequest: unknown }).XMLHttpRequest = FakeXhr;
    jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
    jest.restoreAllMocks();
});

describe("putWithProgress", () => {
    it("PUTs the file with its content type", async () => {
        const promise = putWithProgress("https://s3.example/put", file);
        FakeXhr.last.finish(200);
        await promise;

        expect(FakeXhr.last.method).toBe("PUT");
        expect(FakeXhr.last.url).toBe("https://s3.example/put");
        expect(FakeXhr.last.headers["Content-Type"]).toBe("application/pdf");
        expect(FakeXhr.last.sent).toBe(file);
    });

    it("reports progress as a fraction", async () => {
        const seen: number[] = [];
        const promise = putWithProgress("https://s3.example/put", file, (f) =>
            seen.push(f)
        );

        FakeXhr.last.progress(25, 100);
        FakeXhr.last.progress(50, 100);
        FakeXhr.last.finish(200);
        await promise;

        // 1 comes from onload, not from the last chunk leaving the browser:
        // the bar should fill only once the bytes are actually accepted.
        expect(seen).toEqual([0.25, 0.5, 1]);
    });

    it("ignores progress events that cannot be measured", async () => {
        const seen: number[] = [];
        const promise = putWithProgress("https://s3.example/put", file, (f) =>
            seen.push(f)
        );

        // Without a Content-Length, inventing a number is worse than leaving
        // the bar where it is.
        FakeXhr.last.progress(10, 0, false);
        FakeXhr.last.finish(200);
        await promise;

        expect(seen).toEqual([1]);
    });

    it("rejects on a failure status, carrying it through", async () => {
        const promise = putWithProgress("https://s3.example/put", file);
        FakeXhr.last.finish(403);

        await expect(promise).rejects.toMatchObject({ status: 403 });
        await expect(promise).rejects.toBeInstanceOf(ApiError);
    });

    it("treats a transport error as a network error, and says where to look", async () => {
        const promise = putWithProgress("https://s3.example/put", file);
        FakeXhr.last.onerror?.();

        await expect(promise).rejects.toMatchObject({
            isNetworkError: true,
            message: "Could not reach file storage. Please try again.",
        });
        // A blocked cross-origin request looks exactly like an unreachable
        // host from here, so the console gets the actionable hint.
        expect(console.error).toHaveBeenCalledWith(
            expect.stringContaining("CORS")
        );
    });

    it("rejects when the upload is aborted", async () => {
        const promise = putWithProgress("https://s3.example/put", file);
        FakeXhr.last.onabort?.();
        await expect(promise).rejects.toMatchObject({ message: "Upload cancelled." });
    });
});
