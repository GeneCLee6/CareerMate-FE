import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";
import { AuthSession, User } from "../api/auth";

const STORAGE_KEY = "careermate.session";

interface AuthContextValue {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    /** `remember` decides whether the session survives closing the tab. */
    signIn: (session: AuthSession, remember?: boolean) => void;
    signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Reads a previously stored session. localStorage holds "Remember Me"
 * sessions, sessionStorage the rest; both are wrapped because a browser set to
 * block site data throws on access.
 */
function readStoredSession(): AuthSession | null {
    for (const store of [localStorage, sessionStorage]) {
        try {
            const raw = store.getItem(STORAGE_KEY);
            if (raw) {
                return JSON.parse(raw) as AuthSession;
            }
        } catch {
            // Ignore unreadable or malformed storage and fall through.
        }
    }
    return null;
}

function writeStoredSession(session: AuthSession, remember: boolean) {
    const store = remember ? localStorage : sessionStorage;
    try {
        store.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
        // A session that cannot be persisted still works for this page view.
    }
}

function clearStoredSession() {
    for (const store of [localStorage, sessionStorage]) {
        try {
            store.removeItem(STORAGE_KEY);
        } catch {
            // Nothing to do if storage is unavailable.
        }
    }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [session, setSession] = useState<AuthSession | null>(
        readStoredSession
    );

    const signIn = useCallback((next: AuthSession, remember = false) => {
        clearStoredSession();
        writeStoredSession(next, remember);
        setSession(next);
    }, []);

    const signOut = useCallback(() => {
        clearStoredSession();
        setSession(null);
    }, []);

    const value = useMemo<AuthContextValue>(
        () => ({
            user: session?.user ?? null,
            accessToken: session?.accessToken ?? null,
            isAuthenticated: session !== null,
            signIn,
            signOut,
        }),
        [session, signIn, signOut]
    );

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used inside an AuthProvider");
    }
    return context;
}
