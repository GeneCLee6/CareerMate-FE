import {
    PASSWORD_RULE_MESSAGE,
    maskEmail,
    validateDisplayName,
    validateEmail,
    validateFullName,
    validateGoal,
    validateLoginForm,
    validatePassword,
    validateRegisterForm,
} from "./validators";
import { LIMITS } from "./limits";

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

describe("length limits mirror the backend", () => {
    // The backend enforces these; the frontend repeats them so the user is
    // told while typing instead of by a 400 after pressing submit.
    it("accepts a full name at exactly the limit", () => {
        expect(validateFullName("x".repeat(LIMITS.FULL_NAME))).toBeNull();
    });

    it("rejects a full name one character over", () => {
        expect(validateFullName("x".repeat(LIMITS.FULL_NAME + 1))).toBe(
            `Full name must be ${LIMITS.FULL_NAME} characters or fewer.`
        );
    });

    it("measures after trimming, as the backend does", () => {
        const padded = "  " + "x".repeat(LIMITS.FULL_NAME) + "  ";
        expect(validateFullName(padded)).toBeNull();
    });

    it("rejects an over-long email", () => {
        const local = "a".repeat(LIMITS.EMAIL);
        expect(validateEmail(`${local}@example.com`)).toBe(
            "Email address is too long."
        );
    });

    it("still reports a malformed email before its length", () => {
        // Format first: "too long" is unhelpful when the value is not an
        // address at all.
        expect(validateEmail("x".repeat(LIMITS.EMAIL + 10))).toBe(
            "Invalid email format."
        );
    });

    describe("display name", () => {
        it("allows an empty value, since the field is optional", () => {
            expect(validateDisplayName("")).toBeNull();
        });

        it("rejects one that is too long", () => {
            expect(
                validateDisplayName("x".repeat(LIMITS.DISPLAY_NAME + 1))
            ).toBe(
                `Display name must be ${LIMITS.DISPLAY_NAME} characters or fewer.`
            );
        });
    });

    describe("goal", () => {
        it("allows an empty value", () => {
            expect(validateGoal("")).toBeNull();
        });

        it("rejects one past the limit", () => {
            // This field is interpolated into the AI system prompt, so its
            // length is paid for on every turn of every conversation.
            expect(validateGoal("x".repeat(LIMITS.GOAL + 1))).toBe(
                `Goal must be ${LIMITS.GOAL} characters or fewer.`
            );
        });
    });
});
