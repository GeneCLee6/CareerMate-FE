import { LIMITS } from "./limits";

/**
 * Client-side mirrors of the backend's zod auth schemas
 * (CareerMate-BE/src/auth/auth.validation.js). Keeping them in step means the
 * user sees the design's inline message instead of a round-trip 400.
 */

/** The wording comes straight from the Zeplin error state. */
export const PASSWORD_RULE_MESSAGE =
    "At least 8 characters, include letters and numbers.";

export function validateEmail(email: string): string | null {
    const value = email.trim();
    if (!value) {
        return "Email is required.";
    }
    // Mirrors zod's email check closely enough for a pre-submit hint.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return "Invalid email format.";
    }
    if (value.length > LIMITS.EMAIL) {
        return "Email address is too long.";
    }
    return null;
}

export function validatePassword(password: string): string | null {
    if (!password) {
        return "Password is required.";
    }
    if (
        password.length < 8 ||
        !/[a-zA-Z]/.test(password) ||
        !/[0-9]/.test(password)
    ) {
        return PASSWORD_RULE_MESSAGE;
    }
    return null;
}

export function validateFullName(fullName: string): string | null {
    const value = fullName.trim();
    if (!value) {
        return "Full name is required.";
    }
    if (value.length > LIMITS.FULL_NAME) {
        return `Full name must be ${LIMITS.FULL_NAME} characters or fewer.`;
    }
    return null;
}

/** Optional, so only the length is checked. */
export function validateDisplayName(displayName: string): string | null {
    if (displayName.trim().length > LIMITS.DISPLAY_NAME) {
        return `Display name must be ${LIMITS.DISPLAY_NAME} characters or fewer.`;
    }
    return null;
}

/** Optional, and also the length of this field in the AI system prompt. */
export function validateGoal(goal: string): string | null {
    if (goal.trim().length > LIMITS.GOAL) {
        return `Goal must be ${LIMITS.GOAL} characters or fewer.`;
    }
    return null;
}

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export interface RegisterFormValues {
    fullName: string;
    email: string;
    password: string;
}

export function validateRegisterForm(
    values: RegisterFormValues
): FieldErrors<RegisterFormValues> {
    const errors: FieldErrors<RegisterFormValues> = {};

    const fullName = validateFullName(values.fullName);
    if (fullName) errors.fullName = fullName;

    const email = validateEmail(values.email);
    if (email) errors.email = email;

    const password = validatePassword(values.password);
    if (password) errors.password = password;

    return errors;
}

export interface LoginFormValues {
    email: string;
    password: string;
}

export function validateLoginForm(
    values: LoginFormValues
): FieldErrors<LoginFormValues> {
    const errors: FieldErrors<LoginFormValues> = {};

    const email = validateEmail(values.email);
    if (email) errors.email = email;

    if (!values.password) {
        errors.password = "Password is required.";
    }

    return errors;
}

/** Turns `adeline@gmail.com` into `adel*******@gmail.com` as the design shows. */
export function maskEmail(email: string): string {
    const [name, domain] = email.split("@");
    if (!domain) return email;
    const visible = name.slice(0, 4);
    return `${visible}${"*".repeat(Math.max(name.length - 4, 3))}@${domain}`;
}
