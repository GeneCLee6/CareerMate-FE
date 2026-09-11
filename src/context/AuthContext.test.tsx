import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "./AuthContext";
import { ToastProvider } from "../components/Toast";
import { AuthSession } from "../api/auth";

const STORAGE_KEY = "careermate.session";

const fetchMock = jest.fn();

const session = (): AuthSession => ({
    accessToken: "tok-123",
    user: {
        id: "652f1a2b3c4d5e6f70819203",
        email: "ray@example.com",
        fullName: "Ray Zhang",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
    },
});

const Probe = ({ remember = false }: { remember?: boolean }) => {
    const { user, isAuthenticated, signIn, signOut } = useAuth();
    return (
        <>
            <span data-testid="state">
                {isAuthenticated ? `in:${user?.fullName}` : "out"}
            </span>
            <button onClick={() => signIn(session(), remember)}>sign in</button>
            <button onClick={signOut}>sign out</button>
        </>
    );
};

const renderProbe = (remember = false) =>
    render(
        <ToastProvider>
            <AuthProvider>
                <Probe remember={remember} />
            </AuthProvider>
        </ToastProvider>
    );

const state = () => screen.getByTestId("state").textContent;

beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    fetchMock.mockReset();
    // Nothing under test needs a real response; default to a quiet failure.
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    global.fetch = fetchMock as unknown as typeof fetch;
});

describe("session persistence", () => {
    it("starts signed out with empty storage", () => {
        renderProbe();
        expect(state()).toBe("out");
    });

    it('keeps a "remember me" session in localStorage', async () => {
        renderProbe(true);
        await userEvent.click(screen.getByText("sign in"));

        expect(state()).toBe("in:Ray Zhang");
        expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
        expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it("keeps an ordinary session in sessionStorage only", async () => {
        renderProbe(false);
        await userEvent.click(screen.getByText("sign in"));

        expect(sessionStorage.getItem(STORAGE_KEY)).not.toBeNull();
        expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it("clears both stores on sign out", async () => {
        renderProbe(true);
        await userEvent.click(screen.getByText("sign in"));
        await userEvent.click(screen.getByText("sign out"));

        expect(state()).toBe("out");
        expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
        expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it("restores a stored session on load", () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session()));
        renderProbe();
        expect(state()).toBe("in:Ray Zhang");
    });

    it("ignores malformed stored JSON instead of crashing", () => {
        localStorage.setItem(STORAGE_KEY, "{not json");
        expect(() => renderProbe()).not.toThrow();
        expect(state()).toBe("out");
    });
});

describe("session expiry", () => {
    it("signs the user out when the API rejects a stored token", async () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session()));
        // The mount-time getMe call answers 401.
        fetchMock.mockResolvedValue({
            ok: false,
            status: 401,
            json: async () => ({
                success: false,
                error: { message: "Invalid or expired token" },
            }),
        } as Response);

        renderProbe();
        expect(state()).toBe("in:Ray Zhang");

        await waitFor(() => expect(state()).toBe("out"));
        expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
        await screen.findByText(/session has expired/i);
    });

    it("keeps the session when the API is merely unreachable", async () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session()));
        fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

        renderProbe();

        // Give the mount-time refresh a chance to resolve.
        await act(async () => {
            await Promise.resolve();
        });

        expect(state()).toBe("in:Ray Zhang");
        expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
    });

    it("refreshes the stored user from the API on load", async () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session()));
        fetchMock.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({
                success: true,
                data: { ...session().user, fullName: "Ray Z." },
            }),
        } as Response);

        renderProbe();

        await waitFor(() => expect(state()).toBe("in:Ray Z."));
        // The refreshed user is written back to the store it came from.
        expect(
            JSON.parse(localStorage.getItem(STORAGE_KEY) as string).user.fullName
        ).toBe("Ray Z.");
    });
});
