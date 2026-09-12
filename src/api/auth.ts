import { apiClient, SuccessData, SuccessMessage } from "./client";

/** Mirrors the fields the backend's user model exposes through toJSON. */
export interface User {
    id: string;
    email: string;
    fullName: string;
    displayName?: string;
    role?: "Student" | "Other";
    field?: "FE" | "BE";
    goal?: string;
    avatar?: string;
    avatarUrl?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface AuthSession {
    user: User;
    accessToken: string;
}

export interface RegisterInput {
    fullName: string;
    email: string;
    password: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

/**
 * Registering no longer signs the account in: the backend creates it unverified
 * and emails a code. All that comes back is the address the code went to.
 */
export function register(input: RegisterInput): Promise<string> {
    return apiClient
        .post<SuccessData<{ email: string }>>("/auth/register", input)
        .then((res) => res.data.email);
}

/** Confirms the emailed code. On success the account is live and signed in. */
export function verifyEmail(email: string, code: string): Promise<AuthSession> {
    return apiClient
        .post<SuccessData<AuthSession>>(
            "/auth/verify-email",
            { email, code },
            // A wrong or expired code is a 401 about the code, not the session.
            { handlesUnauthorized: true }
        )
        .then((res) => res.data);
}

/** Sends a fresh code. The backend refuses with 429 inside its cooldown. */
export function resendVerification(email: string): Promise<string> {
    return apiClient
        .post<SuccessMessage>("/auth/resend-verification", { email })
        .then((res) => res.message);
}

export function login(input: LoginInput): Promise<AuthSession> {
    return apiClient
        .post<SuccessData<AuthSession>>("/auth/login", input, {
            // A rejected sign-in is a 401 about the credentials, not the session.
            handlesUnauthorized: true,
        })
        .then((res) => res.data);
}

export function forgotPassword(email: string): Promise<string> {
    return apiClient
        .post<SuccessMessage>("/auth/forgot-password", { email })
        .then((res) => res.message);
}

export function verifyCode(email: string, code: string): Promise<string> {
    return apiClient
        .post<SuccessData<{ resetToken: string }>>(
            "/auth/verify-code",
            { email, code },
            // A wrong or expired code is a 401 about the code.
            { handlesUnauthorized: true }
        )
        .then((res) => res.data.resetToken);
}

export function resetPassword(input: {
    email: string;
    resetToken: string;
    newPassword: string;
}): Promise<string> {
    return apiClient
        .post<SuccessMessage>("/auth/reset-password", input, {
            // A stale reset token is a 401 about that token.
            handlesUnauthorized: true,
        })
        .then((res) => res.message);
}
