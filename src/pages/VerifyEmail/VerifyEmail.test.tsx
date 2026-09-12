import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import VerifyEmail, { VerifyEmailState } from "./VerifyEmail";
import * as authApi from "../../api/auth";
import { ApiError } from "../../api/client";
import type { AuthSession } from "../../api/auth";

jest.mock("../../api/auth");

const mockSignIn = jest.fn();
jest.mock("../../context/AuthContext", () => ({
    useAuth: () => ({ signIn: mockSignIn }),
}));

const verifyEmail = authApi.verifyEmail as jest.MockedFunction<
    typeof authApi.verifyEmail
>;
const resendVerification = authApi.resendVerification as jest.MockedFunction<
    typeof authApi.resendVerification
>;

const SESSION: AuthSession = {
    accessToken: "token-123",
    user: {
        id: "u1",
        email: "ray@example.com",
        fullName: "Ray",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
    },
};

/** Renders the page at /verify-email with the state the caller would pass. */
function renderPage(state: VerifyEmailState) {
    return render(
        <MemoryRouter initialEntries={[{ pathname: "/verify-email", state }]}>
            <Routes>
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/register" element={<p>register screen</p>} />
                <Route path="/onboarding" element={<p>onboarding screen</p>} />
            </Routes>
        </MemoryRouter>
    );
}

const typeCode = async (user: ReturnType<typeof userEvent.setup>, code: string) => {
    const boxes = screen.getAllByRole("textbox");
    await user.click(boxes[0]);
    await user.keyboard(code);
};

beforeEach(() => {
    jest.clearAllMocks();
});

describe("VerifyEmail", () => {
    it("shows the masked address the code was sent to", () => {
        renderPage({ email: "raymond@example.com", codeSent: true });
        expect(screen.getByText(/raym\*+@example\.com/)).toBeInTheDocument();
    });

    it("sends the user back to register when the address is missing", () => {
        // A refresh drops the router state, and the code went somewhere we can
        // no longer name.
        renderPage({});
        expect(screen.getByText("register screen")).toBeInTheDocument();
    });

    it("verifies the code, signs in, and moves on to onboarding", async () => {
        jest.useFakeTimers();
        const user = userEvent.setup({
            advanceTimers: jest.advanceTimersByTime,
        });
        verifyEmail.mockResolvedValue(SESSION);

        renderPage({ email: "ray@example.com", codeSent: true });
        await typeCode(user, "424242");
        await user.click(screen.getByRole("button", { name: "Verify" }));

        await waitFor(() =>
            expect(verifyEmail).toHaveBeenCalledWith("ray@example.com", "424242")
        );

        // The page waits a beat before signing in and moving on.
        act(() => {
            jest.runOnlyPendingTimers();
        });
        expect(mockSignIn).toHaveBeenCalledWith(SESSION, true);
        await waitFor(() =>
            expect(screen.getByText("onboarding screen")).toBeInTheDocument()
        );
        jest.useRealTimers();
    });

    it("reports a rejected code and clears the boxes to retry", async () => {
        const user = userEvent.setup();
        verifyEmail.mockRejectedValue(
            new ApiError("Invalid or expired verification code", 401)
        );

        renderPage({ email: "ray@example.com", codeSent: true });
        await typeCode(user, "000000");
        await user.click(screen.getByRole("button", { name: "Verify" }));

        expect(
            await screen.findByText("Invalid or expired verification code")
        ).toBeInTheDocument();
        const boxes = screen.getAllByRole("textbox") as HTMLInputElement[];
        expect(boxes.every((b) => b.value === "")).toBe(true);
        expect(mockSignIn).not.toHaveBeenCalled();
    });

    it("refuses a short code without calling the API", async () => {
        const user = userEvent.setup();

        renderPage({ email: "ray@example.com", codeSent: true });
        await typeCode(user, "424");
        await user.click(screen.getByRole("button", { name: "Verify" }));

        expect(
            await screen.findByText("Please enter the 6-digit code.")
        ).toBeInTheDocument();
        expect(verifyEmail).not.toHaveBeenCalled();
    });

    it("holds the resend button while a code has just been sent", () => {
        renderPage({ email: "ray@example.com", codeSent: true });
        expect(screen.getByRole("button", { name: /Resend in \d+s/ })).toBeDisabled();
    });

    it("offers an immediate resend when arriving from a refused login", async () => {
        const user = userEvent.setup();
        resendVerification.mockResolvedValue("Check your email");

        // Login does not trigger a send, so that user has no fresh code.
        renderPage({
            email: "ray@example.com",
            notice: "Please verify your email before logging in",
        });

        expect(
            screen.getByText("Please verify your email before logging in")
        ).toBeInTheDocument();

        const resend = screen.getByRole("button", { name: "Resend code" });
        expect(resend).toBeEnabled();

        await user.click(resend);
        await waitFor(() =>
            expect(resendVerification).toHaveBeenCalledWith("ray@example.com")
        );
        expect(
            await screen.findByText("A new code is on its way.")
        ).toBeInTheDocument();
    });

    it("passes the backend's cooldown message through", async () => {
        const user = userEvent.setup();
        resendVerification.mockRejectedValue(
            new ApiError("Please wait before requesting another code", 429)
        );

        renderPage({ email: "ray@example.com" });
        await user.click(screen.getByRole("button", { name: "Resend code" }));

        expect(
            await screen.findByText("Please wait before requesting another code")
        ).toBeInTheDocument();
    });
});
