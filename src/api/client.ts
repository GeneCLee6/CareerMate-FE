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

interface RequestOptions {
    /** Bearer token for the guarded routes. */
    token?: string;
    signal?: AbortSignal;
}

async function request<TResponse>(
    path: string,
    body: unknown,
    { token, signal }: RequestOptions = {}
): Promise<TResponse> {
    let response: Response;

    try {
        response = await fetch(`${BASE_URL}${path}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

    if (payload === null) {
        throw new ApiError("Unexpected empty response.", response.status);
    }

    return payload as TResponse;
}

export const apiClient = { post: request };
