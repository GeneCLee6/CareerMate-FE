import {
    PASSWORD_RULE_MESSAGE,
    maskEmail,
    validateEmail,
    validateFullName,
    validateLoginForm,
    validatePassword,
    validateRegisterForm,
} from "./validators";

describe("validateEmail", () => {
    it("accepts an ordinary address", () => {
        expect(validateEmail("ray@example.com")).toBeNull();
    });

    it("ignores surrounding whitespace", () => {
        expect(validateEmail("  ray@example.com  ")).toBeNull();
    });

    it.each(["", "   "])("rejects blank input (%p)", (value) => {
        expect(validateEmail(value)).toBe("Email is required.");
    });

    it.each(["ray", "ray@", "@example.com", "ray@example", "a b@c.com"])(
        "rejects %p",
        (value) => {
            expect(validateEmail(value)).toBe("Invalid email format.");
        }
    );
});

describe("validatePassword", () => {
    // The backend requires 8+ chars with at least one letter and one number.
    it("accepts a password meeting every rule", () => {
        expect(validatePassword("Passw0rd123")).toBeNull();
    });

    it("reports a missing password separately from a weak one", () => {
        expect(validatePassword("")).toBe("Password is required.");
    });

    it.each([
        ["too short", "Pass1"],
        ["no digits", "password"],
        ["no letters", "12345678"],
    ])("rejects a password with %s", (_label, value) => {
        expect(validatePassword(value)).toBe(PASSWORD_RULE_MESSAGE);
    });

    it("accepts exactly eight characters", () => {
        expect(validatePassword("abcdefg1")).toBeNull();
    });
});

describe("validateFullName", () => {
    it("accepts a name", () => {
        expect(validateFullName("Ray Zhang")).toBeNull();
    });

    it("rejects whitespace only", () => {
        expect(validateFullName("   ")).toBe("Full name is required.");
    });
});

describe("validateRegisterForm", () => {
    it("returns no errors for a valid form", () => {
        expect(
            validateRegisterForm({
                fullName: "Ray Zhang",
                email: "ray@example.com",
                password: "Passw0rd123",
            })
        ).toEqual({});
    });

    it("reports every invalid field at once", () => {
        expect(
            validateRegisterForm({
                fullName: "",
                email: "nope",
                password: "short",
            })
        ).toEqual({
            fullName: "Full name is required.",
            email: "Invalid email format.",
            password: PASSWORD_RULE_MESSAGE,
        });
    });
});

describe("validateLoginForm", () => {
    it("returns no errors for a valid form", () => {
        expect(
            validateLoginForm({
                email: "ray@example.com",
                password: "anything",
            })
        ).toEqual({});
    });

    it("does not apply the strength rules when signing in", () => {
        // An existing account may predate the current password policy.
        expect(
            validateLoginForm({ email: "ray@example.com", password: "old" })
        ).toEqual({});
    });

    it("requires a password", () => {
        expect(
            validateLoginForm({ email: "ray@example.com", password: "" })
        ).toEqual({ password: "Password is required." });
    });
});

describe("maskEmail", () => {
    it("keeps the first four characters and the domain", () => {
        expect(maskEmail("adeline@gmail.com")).toBe("adel***@gmail.com");
    });

    it("always masks with at least three stars", () => {
        expect(maskEmail("ray@example.com")).toBe("ray***@example.com");
    });

    it("returns the input unchanged when there is no domain", () => {
        expect(maskEmail("not-an-email")).toBe("not-an-email");
    });
});
