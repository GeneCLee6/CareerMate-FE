import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import GuestOnlyRoute from "./GuestOnlyRoute";

const mockUseAuth = jest.fn();
jest.mock("../../context/AuthContext", () => ({
    useAuth: () => mockUseAuth(),
}));

function renderAt(path: string, state?: unknown) {
    return render(
        <MemoryRouter initialEntries={[{ pathname: path, state }]}>
            <Routes>
                <Route
                    path="/login"
                    element={
                        <GuestOnlyRoute>
                            <p>sign-in form</p>
                        </GuestOnlyRoute>
                    }
                />
                <Route path="/app" element={<p>assistant</p>} />
                <Route path="/settings" element={<p>settings</p>} />
            </Routes>
        </MemoryRouter>
    );
}

describe("GuestOnlyRoute", () => {
    it("shows the form to a signed-out visitor", () => {
        mockUseAuth.mockReturnValue({ isAuthenticated: false });
        renderAt("/login");

        expect(screen.getByText("sign-in form")).toBeInTheDocument();
    });

    it("sends a signed-in user to the assistant instead", () => {
        // The reported symptom: already signed in, with the avatar showing in
        // the header, and still asked to sign in again.
        mockUseAuth.mockReturnValue({ isAuthenticated: true });
        renderAt("/login");

        expect(screen.getByText("assistant")).toBeInTheDocument();
        expect(screen.queryByText("sign-in form")).not.toBeInTheDocument();
    });

    it("honours where the user was originally headed", () => {
        // Something sent them here to sign in first; if they turn out to be
        // signed in already, they should land where they meant to go.
        mockUseAuth.mockReturnValue({ isAuthenticated: true });
        renderAt("/login", { from: { pathname: "/settings" } });

        expect(screen.getByText("settings")).toBeInTheDocument();
    });
});
