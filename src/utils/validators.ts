export function validateLogin(email: string, password: string): string | null {
    if (!email || !password) {
        return "All fields are required";
    }
    if (!email.includes("@")) {
        return "Invalid email format";
    }
    if (password.length < 6) {
        return "Password must be at least 6 characters";
    }
    return null;
}

export function validateRegister(
    name: string,
    email: string,
    password: string,
    confirmPassword: string
): string | null {
    if (!name || !email || !password || !confirmPassword) {
        return "All fields are required";
    }
    if (!email.includes("@")) {
        return "Invalid email format";
    }
    if (password.length < 6) {
        return "Password must be at least 6 characters";
    }
    if (password !== confirmPassword) {
        return "Passwords do not match";
    }
    return null;
}
