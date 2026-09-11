import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { AuthSession, User } from "../api/auth";
import { setAuthToken, setSessionExpiredHandler } from "../api/client";
import { getMe } from "../api/users";
import { useToast } from "../components/Toast";

const STORAGE_KEY = "careermate.session";

interface AuthContextValue {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    /** `remember` decides whether the session survives closing the tab. */
    signIn: (session: AuthSession, remember?: boolean) => void;
    signOut: () => void;
    /** Replaces the stored user after a profile update. */
    updateUser: (user: User) => void;
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

/** Writes to whichever store already holds the session, defaulting to `remember`. */
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

function persistedIn(): Storage | null {
    for (const store of [localStorage, sessionStorage]) {
        try {
            if (store.getItem(STORAGE_KEY)) return store;
        } catch {
            // Ignore and try the next one.
        }
    }
    return null;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    /**
     * Restored lazily rather than at module scope, so the token reaches the API
     * client before the first child renders without the provider depending on
     * whatever storage held at import time.
     */
    const [session, setSession] = useState<AuthSession | null>(() => {
        const restored = readStoredSession();
        setAuthToken(restored?.accessToken ?? null);
        return restored;
    });
    const showToast = useToast();
    // Read inside callbacks without making them depend on the current session.
    const hasSession = useRef(session !== null);
    hasSession.current = session !== null;

    const signIn = useCallback((next: AuthSession, remember = false) => {
        clearStoredSession();
        writeStoredSession(next, remember);
        setAuthToken(next.accessToken);
        setSession(next);
    }, []);

    const signOut = useCallback(() => {
        clearStoredSession();
        setAuthToken(null);
        setSession(null);
    }, []);

    const updateUser = useCallback((user: User) => {
        setSession((prev) => {
            if (!prev) return prev;
            const next = { ...prev, user };
            // Keep it in whichever store the session already lives in.
            const store = persistedIn();
            if (store) {
                try {
                    store.setItem(STORAGE_KEY, JSON.stringify(next));
                } catch {
                    // Non-fatal; the in-memory session is still correct.
                }
            }
            return next;
        });
    }, []);

    const updateUserRef = useRef(updateUser);
    updateUserRef.current = updateUser;

    /**
     * The API client calls this when a request carrying a token is rejected,
     * which means the token has expired or been revoked. Dropping the session
     * lets ProtectedRoute bounce the user to login.
     */
    useEffect(() => {
        setSessionExpiredHandler(() => {
            if (!hasSession.current) return;
            clearStoredSession();
            setAuthToken(null);
            setSession(null);
            showToast("Your session has expired. Please log in again.");
        });
        return () => setSessionExpiredHandler(null);
    }, [showToast]);

    /**
     * Re-read the user once on load: it confirms the stored token still works
     * and picks up anything changed on another device. A 401 is already
     * handled above; anything else (the API being down) leaves the stored
     * session alone.
     */
    useEffect(() => {
        if (!hasSession.current) return;
        let cancelled = false;
        getMe()
            .then((user) => {
                if (!cancelled) updateUserRef.current(user);
            })
            .catch(() => {
                // Offline or a server error shouldn't log anyone out.
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const value = useMemo<AuthContextValue>(
        () => ({
            user: session?.user ?? null,
            accessToken: session?.accessToken ?? null,
            isAuthenticated: session !== null,
            signIn,
            signOut,
            updateUser,
        }),
        [session, signIn, signOut, updateUser]
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
