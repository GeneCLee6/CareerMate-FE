import {
    ApiError,
    apiClient,
    setAuthToken,
    setSessionExpiredHandler,
} from "./client";

const fetchMock = jest.fn();

function jsonResponse(body: unknown, status = 200) {
    return {
        ok: status >= 200 && status < 300,
        status,
        json: async () => body,
    } as Response;
}

/** A 204 has no body, so json() rejects. */
function emptyResponse(status = 204) {
    return {
        ok: true,
        status,
        json: async () => {
            throw new SyntaxError("Unexpected end of JSON input");
        },
    } as unknown as Response;
}

beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
    setAuthToken(null);
    setSessionExpiredHandler(null);
});

describe("request handling", () => {
    it("returns the parsed body on success", async () => {
        fetchMock.mockResolvedValue(jsonResponse({ success: true, data: 1 }));
        await expect(apiClient.get("/thing")).resolves.toEqual({
            success: true,
            data: 1,
        });
    });

    it("sends the stored token as a bearer header", async () => {
        setAuthToken("tok-123");
        fetchMock.mockResolvedValue(jsonResponse({ success: true }));

        await apiClient.get("/users/me");

        const [, init] = fetchMock.mock.calls[0];
        expect(init.headers.Authorization).toBe("Bearer tok-123");
    });

    it("omits the auth header when there is no token", async () => {
        fetchMock.mockResolvedValue(jsonResponse({ success: true }));

        await apiClient.get("/public");

        const [, init] = fetchMock.mock.calls[0];
        expect(init.headers.Authorization).toBeUndefined();
    });

    it("only sets a content type when there is a body", async () => {
        fetchMock.mockResolvedValue(jsonResponse({ success: true }));

        await apiClient.get("/thing");
        expect(fetchMock.mock.calls[0][1].headers["Content-Type"]).toBeUndefined();

        await apiClient.post("/thing", { a: 1 });
        expect(fetchMock.mock.calls[1][1].headers["Content-Type"]).toBe(
            "application/json"
        );
    });

    it("treats a 204 as success rather than a malformed response", async () => {
        fetchMock.mockResolvedValue(emptyResponse());
        await expect(apiClient.delete("/resumes/abc")).resolves.toBeUndefined();
    });
});

describe("error handling", () => {
    it("surfaces the backend's error message", async () => {
        fetchMock.mockResolvedValue(
            jsonResponse(
                { success: false, error: { message: "Email already exists!" } },
                409
            )
        );

        await expect(apiClient.post("/auth/register")).rejects.toMatchObject({
            message: "Email already exists!",
            status: 409,
            isNetworkError: false,
        });
    });

    it("falls back to a generic message when the body has none", async () => {
        fetchMock.mockResolvedValue(jsonResponse({ success: false }, 500));
        await expect(apiClient.get("/thing")).rejects.toThrow(
            "Something went wrong. Please try again."
        );
    });

    it("reports an unreachable server as a network error", async () => {
        fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

        const request = apiClient.get("/thing");

        await expect(request).rejects.toBeInstanceOf(ApiError);
        await expect(request).rejects.toMatchObject({
            isNetworkError: true,
            status: 0,
        });
    });

    it("lets an aborted request through untouched", async () => {
        fetchMock.mockRejectedValue(
            new DOMException("aborted", "AbortError")
        );
        await expect(apiClient.get("/thing")).rejects.toHaveProperty(
            "name",
            "AbortError"
        );
    });
});

describe("session expiry", () => {
    const unauthorized = () =>
        jsonResponse(
            { success: false, error: { message: "Invalid or expired token" } },
            401
        );

    it("signals expiry when a request carrying a token is rejected", async () => {
        const onExpired = jest.fn();
        setSessionExpiredHandler(onExpired);
        setAuthToken("tok-123");
        fetchMock.mockResolvedValue(unauthorized());

        await apiClient.get("/users/me").catch(() => {});

        expect(onExpired).toHaveBeenCalledTimes(1);
    });

    it("stays quiet for a 401 on a request with no token", async () => {
        // A rejected sign-in must not look like an expired session.
        const onExpired = jest.fn();
        setSessionExpiredHandler(onExpired);
        fetchMock.mockResolvedValue(unauthorized());

        await apiClient.post("/auth/login", {}).catch(() => {});

        expect(onExpired).not.toHaveBeenCalled();
    });

    it("stays quiet when the caller handles its own 401", async () => {
        // Settings rejecting a wrong current password, for instance.
        const onExpired = jest.fn();
        setSessionExpiredHandler(onExpired);
        setAuthToken("tok-123");
        fetchMock.mockResolvedValue(unauthorized());

        await apiClient
            .put("/users/me/password", {}, { handlesUnauthorized: true })
            .catch(() => {});

        expect(onExpired).not.toHaveBeenCalled();
    });

    it("does not fire for other error statuses", async () => {
        const onExpired = jest.fn();
        setSessionExpiredHandler(onExpired);
        setAuthToken("tok-123");
        fetchMock.mockResolvedValue(jsonResponse({ success: false }, 403));

        await apiClient.get("/thing").catch(() => {});

        expect(onExpired).not.toHaveBeenCalled();
    });
});
