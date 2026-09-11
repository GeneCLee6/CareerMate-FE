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
    if (!fullName.trim()) {
        return "Full name is required.";
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
