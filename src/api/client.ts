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

type Method = "GET" | "POST" | "PUT" | "DELETE";

interface RequestOptions {
    body?: unknown;
    /** Overrides the stored token; mainly useful in tests. */
    token?: string | null;
    signal?: AbortSignal;
}

async function request<TResponse>(
    method: Method,
    path: string,
    { body, token, signal }: RequestOptions = {}
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
