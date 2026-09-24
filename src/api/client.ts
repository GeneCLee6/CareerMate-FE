const BASE_URL = (
    process.env.REACT_APP_API_BASE_URL ?? "http://localhost:3000/v1"
).replace(/\/$/, "");

/**
 * An error the API answered with. `status` is the HTTP status; `isNetworkError`
 * marks the case where the request never reached the server, which the design
 * shows with its own "Network error" banner.
 */
export class ApiError extends Error {
    readonly status: number;
    readonly isNetworkError: boolean;

    constructor(message: string, status: number, isNetworkError = false) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.isNetworkError = isNetworkError;
    }
}

/** Shape the backend's error middleware returns. */
interface ErrorBody {
    success: false;
    error?: { message?: string };
}

/**
 * The bearer token for the guarded routes. AuthContext owns the session and
 * pushes it here so callers don't have to thread it through every request.
 */
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
    authToken = token;
}

/**
 * Called when a request that carried a token is rejected with 401, meaning the
 * session is no longer good. AuthContext registers the handler that clears it.
 */
let onSessionExpired: (() => void) | null = null;

export function setSessionExpiredHandler(handler: (() => void) | null) {
    onSessionExpired = handler;
}

type Method = "GET" | "POST" | "PUT" | "DELETE";

interface RequestOptions {
    body?: unknown;
    /** Overrides the stored token; mainly useful in tests. */
    token?: string | null;
    signal?: AbortSignal;
    /**
     * Set by callers whose endpoint answers 401 for its own reasons rather
     * than because the session died — login rejecting credentials, settings
     * rejecting the current password, a mistyped reset code. Without it those
     * would sign the user out mid-flow.
     */
    handlesUnauthorized?: boolean;
}

async function request<TResponse>(
    method: Method,
    path: string,
    { body, token, signal, handlesUnauthorized }: RequestOptions = {}
): Promise<TResponse> {
    const bearer = token === undefined ? authToken : token;
    let response: Response;

    try {
        response = await fetch(`${BASE_URL}${path}`, {
            method,
            headers: {
                ...(body === undefined
                    ? {}
                    : { "Content-Type": "application/json" }),
                ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
            },
            body: body === undefined ? undefined : JSON.stringify(body),
            signal,
        });
    } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
            throw err;
        }
        throw new ApiError("Network error, please try again later.", 0, true);
    }

    const payload = (await response.json().catch(() => null)) as
        | TResponse
        | ErrorBody
        | null;

    if (!response.ok) {
        // Only a request that actually presented a token can have an expired
        // one; a 401 without one is just a rejected sign-in.
        if (response.status === 401 && bearer && !handlesUnauthorized) {
            onSessionExpired?.();
        }
        const message =
            (payload as ErrorBody | null)?.error?.message ??
            "Something went wrong. Please try again.";
        throw new ApiError(message, response.status);
    }

    // Some endpoints answer 204 with no body (deleting a resume, for one).
    if (payload === null) {
        if (response.status === 204) {
            return undefined as TResponse;
        }
        throw new ApiError("Unexpected empty response.", response.status);
    }

    return payload as TResponse;
}

/**
 * Opens a streamed POST and returns the response with its body unread, for a
 * caller that reads it as it arrives.
 *
 * Failures that happen before the stream opens are handled exactly as
 * `request` handles them — a network error, a JSON error body, and a 401 that
 * ends the session — because the server checks everything it can before it
 * starts streaming, and answers those checks with ordinary HTTP errors.
 */
export async function openStream(
    path: string,
    body: unknown,
    signal?: AbortSignal
): Promise<Response> {
    const bearer = authToken;
    let response: Response;

    try {
        response = await fetch(`${BASE_URL}${path}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "text/event-stream",
                ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
            },
            body: JSON.stringify(body),
            signal,
        });
    } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
            throw err;
        }
        throw new ApiError("Network error, please try again later.", 0, true);
    }

    if (!response.ok) {
        if (response.status === 401 && bearer) {
            onSessionExpired?.();
        }
        const payload = (await response.json().catch(() => null)) as ErrorBody | null;
        throw new ApiError(
            payload?.error?.message ?? "Something went wrong. Please try again.",
            response.status
        );
    }

    return response;
}

export const apiClient = {
    get: <T>(path: string, options?: RequestOptions) =>
        request<T>("GET", path, options),
    post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
        request<T>("POST", path, { ...options, body }),
    put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
        request<T>("PUT", path, { ...options, body }),
    delete: <T>(path: string, options?: RequestOptions) =>
        request<T>("DELETE", path, options),
};

/** Envelope the backend wraps successful payloads in. */
export interface SuccessData<T> {
    success: true;
    data: T;
}

export interface SuccessMessage {
    success: true;
    message: string;
}
