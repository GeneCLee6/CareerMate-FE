import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * The mirror of `ProtectedRoute`: for screens that only make sense signed out.
 *
 * Without it, a signed-in user who lands on /login — from a bookmark, the back
 * button, or a link that did not know better — is shown a form asking them to
 * sign in again, while the header beside it shows their avatar. Two parts of
 * the same page disagreeing about whether they are signed in reads as the
 * product being broken, which is exactly how it was reported.
 *
 * `replace` matters: without it, going "back" from the assistant lands on the
 * login page, which bounces forward again and traps the back button.
 */
const GuestOnlyRoute = ({ children }: { children: ReactNode }) => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (isAuthenticated) {
        // Honour wherever they were originally headed, if something sent them
        // here to sign in first.
        const intended = (
            location.state as { from?: { pathname?: string } } | null
        )?.from?.pathname;
        return <Navigate to={intended ?? "/app"} replace />;
    }

    return <>{children}</>;
};

export default GuestOnlyRoute;
